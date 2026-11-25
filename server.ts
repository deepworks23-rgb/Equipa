import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { SEED_COLLABORATORS } from './src/data/seedCollaborators.ts';
import {
  COLLABORATOR_STATUSES,
  validateCollaboratorInput,
  type Collaborator,
  type CollaboratorInput,
  type CollaboratorStatus,
} from './src/utils/talentLogic.ts';

interface ClaimedAdminRecord {
  email: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
}

interface SessionPayload {
  sub: string;
  jti: string;
  iat: number;
  exp: number;
}

interface AuthenticatedLocals {
  adminEmail: string;
  sessionPayload: SessionPayload;
}

const PORT = Number(process.env.PORT) || 3000;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const SESSION_SECRET =
  process.env.SESSION_SECRET?.trim() || crypto.randomBytes(32).toString('hex');

const DATA_DIR = path.resolve(process.cwd(), '.data');
const ADMIN_AUTH_FILE = resolveConfinedPath(DATA_DIR, 'admin-auth.json');
const COLLABORATORS_FILE = resolveConfinedPath(DATA_DIR, 'collaborators.json');

const revokedTokenIds = new Map<string, number>();
const loginAttemptsByIp = new Map<string, { count: number; resetAt: number }>();

function resolveConfinedPath(baseDir: string, fileName: string): string {
  const resolved = path.resolve(baseDir, fileName);
  if (!resolved.startsWith(baseDir + path.sep)) {
    throw new Error('Invalid confined data file path');
  }
  return resolved;
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
  }
}

function sha256Buffer(value: string): Buffer {
  return crypto.createHash('sha256').update(value, 'utf8').digest();
}

function timingSafeEqualText(a: string, b: string): boolean {
  return crypto.timingSafeEqual(sha256Buffer(a), sha256Buffer(b));
}

function readClaimedAdminAuth(): ClaimedAdminRecord | null {
  try {
    if (!fs.existsSync(ADMIN_AUTH_FILE)) return null;
    const raw = fs.readFileSync(ADMIN_AUTH_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<ClaimedAdminRecord>;
    if (
      typeof parsed.email === 'string' &&
      typeof parsed.salt === 'string' &&
      typeof parsed.passwordHash === 'string'
    ) {
      return parsed as ClaimedAdminRecord;
    }
  } catch {
    return null;
  }
  return null;
}

function getEnvAdminConfig(): { passcode: string; email: string } {
  return {
    passcode: (process.env.ADMIN_PASSCODE ?? '').trim(),
    email: (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase(),
  };
}

function readCollaboratorsStore(): Collaborator[] {
  ensureDataDir();
  if (!fs.existsSync(COLLABORATORS_FILE)) {
    fs.writeFileSync(
      COLLABORATORS_FILE,
      JSON.stringify(SEED_COLLABORATORS, null, 2),
      'utf8',
    );
    return SEED_COLLABORATORS;
  }

  try {
    const raw = fs.readFileSync(COLLABORATORS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as Collaborator[];
    }
  } catch {
    // Fallback to seed if corrupted
  }
  return SEED_COLLABORATORS;
}

function writeCollaboratorsStore(collaborators: Collaborator[]): void {
  ensureDataDir();
  const tmpFile = resolveConfinedPath(
    DATA_DIR,
    `collaborators.${process.pid}.${Date.now()}.tmp`,
  );
  fs.writeFileSync(tmpFile, JSON.stringify(collaborators, null, 2), 'utf8');
  fs.renameSync(tmpFile, COLLABORATORS_FILE);
}

function signSessionToken(email: string): { token: string; expiresAt: number } {
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;
  const payload: SessionPayload = {
    sub: email,
    jti: crypto.randomUUID(),
    iat: now,
    exp: expiresAt,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');
  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt,
  };
}

function pruneRevokedTokens(): void {
  const now = Date.now();
  for (const [jti, exp] of revokedTokenIds.entries()) {
    if (exp <= now) {
      revokedTokenIds.delete(jti);
    }
  }
}

function verifySessionToken(token: string): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, providedSig] = parts;
  if (!encodedPayload || !providedSig) return null;

  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  const sigA = Buffer.from(providedSig, 'utf8');
  const sigB = Buffer.from(expectedSig, 'utf8');
  if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as Partial<SessionPayload>;
    if (
      typeof parsed.sub !== 'string' ||
      typeof parsed.jti !== 'string' ||
      typeof parsed.exp !== 'number' ||
      typeof parsed.iat !== 'number'
    ) {
      return null;
    }
    if (parsed.exp <= Date.now()) {
      return null;
    }
    pruneRevokedTokens();
    if (revokedTokenIds.has(parsed.jti)) {
      return null;
    }
    return parsed as SessionPayload;
  } catch {
    return null;
  }
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Autenticação administrativa necessária.' });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  const payload = verifySessionToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Sessão inválida ou expirada. Inicie sessão novamente.' });
    return;
  }

  const locals = res.locals as Partial<AuthenticatedLocals>;
  locals.adminEmail = payload.sub;
  locals.sessionPayload = payload;
  next();
}

function checkRateLimit(req: Request, res: Response): boolean {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 15;
  const entry = loginAttemptsByIp.get(clientIp);

  if (!entry || entry.resetAt <= now) {
    loginAttemptsByIp.set(clientIp, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxAttempts) {
    res.status(429).json({
      error: 'Demasiadas tentativas de acesso. Aguarde alguns minutos antes de tentar novamente.',
    });
    return false;
  }

  entry.count += 1;
  return true;
}

function normalizeCollaboratorInput(raw: unknown): CollaboratorInput | null {
  if (!raw || typeof raw !== 'object') return null;
  const body = raw as Record<string, unknown>;
  const sanitizeStringList = (val: unknown): string[] =>
    Array.isArray(val)
      ? val
          .filter((item): item is string => typeof item === 'string')
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 20)
      : [];

  return {
    nome_completo: typeof body.nome_completo === 'string' ? body.nome_completo.trim() : '',
    cargo: typeof body.cargo === 'string' ? body.cargo.trim() : '',
    telefone: typeof body.telefone === 'string' ? body.telefone.trim() : '',
    email: typeof body.email === 'string' ? body.email.trim() : '',
    ano_contratacao:
      typeof body.ano_contratacao === 'number' || typeof body.ano_contratacao === 'string'
        ? body.ano_contratacao
        : new Date().getFullYear(),
    data_contratacao:
      typeof body.data_contratacao === 'string' ? body.data_contratacao.trim() : undefined,
    status: (typeof body.status === 'string' ? body.status : 'Ativo') as CollaboratorStatus,
    foto_perfil: typeof body.foto_perfil === 'string' ? body.foto_perfil.trim() : '',
    departamento: typeof body.departamento === 'string' ? body.departamento.trim() : '',
    localizacao: typeof body.localizacao === 'string' ? body.localizacao.trim() : '',
    horario_atendimento:
      typeof body.horario_atendimento === 'string' ? body.horario_atendimento.trim() : '',
    idiomas: sanitizeStringList(body.idiomas),
    especialidades: sanitizeStringList(body.especialidades),
    bio: typeof body.bio === 'string' ? body.bio.trim() : '',
  };
}

async function startServer(): Promise<void> {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', true);
  app.use(express.json({ limit: '5mb' }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (req.path.startsWith('/admin') || req.path.startsWith('/api/admin')) {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      res.setHeader('Cache-Control', 'no-store');
    }
    next();
  });

  // --- Rotas Públicas (nunca expõem colaboradores Rescindido) ---
  app.get('/api/public/collaborators', (_req: Request, res: Response) => {
    const all = readCollaboratorsStore();
    const publicOnly = all.filter((person) => person.status !== 'Rescindido');
    res.json({ collaborators: publicOnly });
  });

  app.get('/api/public/collaborators/:id', (req: Request, res: Response) => {
    const all = readCollaboratorsStore();
    const target = all.find(
      (person) => person.id === req.params.id && person.status !== 'Rescindido',
    );
    if (!target) {
      res.status(404).json({ error: 'Colaborador não encontrado.' });
      return;
    }
    res.json({ collaborator: target });
  });

  // --- Autenticação Administrativa ---
  app.get('/api/admin/auth/status', (_req: Request, res: Response) => {
    const envCfg = getEnvAdminConfig();
    if (envCfg.passcode) {
      res.json({ configured: true, envManaged: true });
      return;
    }
    const claimed = readClaimedAdminAuth();
    res.json({ configured: Boolean(claimed), envManaged: false });
  });

  app.post('/api/admin/auth/setup', (req: Request, res: Response) => {
    if (!checkRateLimit(req, res)) return;

    const envCfg = getEnvAdminConfig();
    if (envCfg.passcode || readClaimedAdminAuth()) {
      res.status(403).json({
        error: 'O acesso administrativo já foi configurado. Utilize o formulário de início de sessão.',
      });
      return;
    }

    const body = req.body as { email?: unknown; password?: unknown };
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
      return;
    }
    if (password.length < 8 || password.length > 128) {
      res.status(400).json({
        error: 'A palavra-passe inicial deve ter entre 8 e 128 caracteres.',
      });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');
    const record: ClaimedAdminRecord = {
      email,
      salt,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    try {
      ensureDataDir();
      fs.writeFileSync(ADMIN_AUTH_FILE, JSON.stringify(record, null, 2), {
        encoding: 'utf8',
        flag: 'wx',
        mode: 0o600,
      });
    } catch {
      res.status(409).json({
        error: 'O acesso administrativo já foi configurado por outra sessão.',
      });
      return;
    }

    const { token, expiresAt } = signSessionToken(email);
    res.status(201).json({ token, email, expiresAt });
  });

  app.post('/api/admin/auth/login', (req: Request, res: Response) => {
    if (!checkRateLimit(req, res)) return;

    const body = req.body as { email?: unknown; password?: unknown };
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      res.status(400).json({ error: 'Preencha o e-mail e a palavra-passe para aceder ao painel.' });
      return;
    }

    const envCfg = getEnvAdminConfig();
    if (envCfg.passcode) {
      const emailValid = envCfg.email
        ? timingSafeEqualText(email, envCfg.email)
        : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const passValid = timingSafeEqualText(password, envCfg.passcode);

      if (!emailValid || !passValid) {
        res.status(401).json({ error: 'Credenciais inválidas. Verifique o e-mail e a palavra-passe.' });
        return;
      }

      const { token, expiresAt } = signSessionToken(email);
      res.json({ token, email, expiresAt });
      return;
    }

    const claimed = readClaimedAdminAuth();
    if (!claimed) {
      res.status(403).json({
        error: 'Defina primeiro a palavra-passe administrativa inicial.',
      });
      return;
    }

    const emailMatches = timingSafeEqualText(email, claimed.email.toLowerCase());
    const derived = crypto.scryptSync(password, claimed.salt, 64);
    const stored = Buffer.from(claimed.passwordHash, 'hex');
    const passMatches =
      derived.length === stored.length && crypto.timingSafeEqual(derived, stored);

    if (!emailMatches || !passMatches) {
      res.status(401).json({ error: 'Credenciais inválidas. Verifique o e-mail e a palavra-passe.' });
      return;
    }

    const { token, expiresAt } = signSessionToken(claimed.email);
    res.json({ token, email: claimed.email, expiresAt });
  });

  app.get('/api/admin/auth/verify', requireAdminAuth, (_req: Request, res: Response) => {
    const locals = res.locals as AuthenticatedLocals;
    res.json({ authenticated: true, email: locals.adminEmail });
  });

  app.post('/api/admin/auth/logout', requireAdminAuth, (_req: Request, res: Response) => {
    const locals = res.locals as AuthenticatedLocals;
    revokedTokenIds.set(locals.sessionPayload.jti, locals.sessionPayload.exp);
    res.json({ ok: true });
  });

  // --- Gestão Administrativa Protegida ---
  app.get('/api/admin/collaborators', requireAdminAuth, (_req: Request, res: Response) => {
    res.json({ collaborators: readCollaboratorsStore() });
  });

  app.post('/api/admin/collaborators', requireAdminAuth, (req: Request, res: Response) => {
    const normalized = normalizeCollaboratorInput(req.body);
    if (!normalized) {
      res.status(400).json({ error: 'Dados do colaborador inválidos.' });
      return;
    }

    const validation = validateCollaboratorInput(normalized);
    if (!validation.valid) {
      res.status(400).json({ error: 'Corrija os campos obrigatórios.', errors: validation.errors });
      return;
    }

    const hireDate =
      normalized.data_contratacao?.trim() ||
      `${Number(normalized.ano_contratacao) || new Date().getFullYear()}-01-01`;
    const parsedYear = Number(hireDate.slice(0, 4)) || new Date().getFullYear();

    const created: Collaborator = {
      id: `col-${Date.now()}`,
      nome_completo: normalized.nome_completo,
      cargo: normalized.cargo,
      telefone: normalized.telefone,
      email: normalized.email,
      ano_contratacao: parsedYear,
      data_contratacao: hireDate,
      status: normalized.status,
      foto_perfil: normalized.foto_perfil,
      departamento: normalized.departamento,
      localizacao: normalized.localizacao,
      horario_atendimento: normalized.horario_atendimento,
      idiomas: normalized.idiomas,
      especialidades: normalized.especialidades,
      bio: normalized.bio,
    };

    const current = readCollaboratorsStore();
    const updated = [created, ...current];
    writeCollaboratorsStore(updated);
    res.status(201).json({ collaborator: created, collaborators: updated });
  });

  app.put('/api/admin/collaborators/:id', requireAdminAuth, (req: Request, res: Response) => {
    const normalized = normalizeCollaboratorInput(req.body);
    if (!normalized) {
      res.status(400).json({ error: 'Dados do colaborador inválidos.' });
      return;
    }

    const validation = validateCollaboratorInput(normalized);
    if (!validation.valid) {
      res.status(400).json({ error: 'Corrija os campos obrigatórios.', errors: validation.errors });
      return;
    }

    const current = readCollaboratorsStore();
    const targetIndex = current.findIndex((item) => item.id === req.params.id);
    if (targetIndex === -1) {
      res.status(404).json({ error: 'Colaborador não encontrado.' });
      return;
    }

    const hireDate =
      normalized.data_contratacao?.trim() ||
      `${Number(normalized.ano_contratacao) || new Date().getFullYear()}-01-01`;
    const parsedYear = Number(hireDate.slice(0, 4)) || new Date().getFullYear();

    const updatedItem: Collaborator = {
      ...current[targetIndex],
      nome_completo: normalized.nome_completo,
      cargo: normalized.cargo,
      telefone: normalized.telefone,
      email: normalized.email,
      ano_contratacao: parsedYear,
      data_contratacao: hireDate,
      status: normalized.status,
      foto_perfil: normalized.foto_perfil,
      departamento: normalized.departamento,
      localizacao: normalized.localizacao,
      horario_atendimento: normalized.horario_atendimento,
      idiomas: normalized.idiomas,
      especialidades: normalized.especialidades,
      bio: normalized.bio,
    };

    const updated = current.map((item, idx) => (idx === targetIndex ? updatedItem : item));
    writeCollaboratorsStore(updated);
    res.json({ collaborator: updatedItem, collaborators: updated });
  });

  app.patch(
    '/api/admin/collaborators/:id/status',
    requireAdminAuth,
    (req: Request, res: Response) => {
      const nextStatus = (req.body as { status?: unknown })?.status;
      if (
        typeof nextStatus !== 'string' ||
        !COLLABORATOR_STATUSES.includes(nextStatus as CollaboratorStatus)
      ) {
        res.status(400).json({ error: 'Status inválido.' });
        return;
      }

      const current = readCollaboratorsStore();
      const targetIndex = current.findIndex((item) => item.id === req.params.id);
      if (targetIndex === -1) {
        res.status(404).json({ error: 'Colaborador não encontrado.' });
        return;
      }

      const updatedItem: Collaborator = {
        ...current[targetIndex],
        status: nextStatus as CollaboratorStatus,
      };
      const updated = current.map((item, idx) => (idx === targetIndex ? updatedItem : item));
      writeCollaboratorsStore(updated);
      res.json({ collaborator: updatedItem, collaborators: updated });
    },
  );

  app.delete('/api/admin/collaborators/:id', requireAdminAuth, (req: Request, res: Response) => {
    const current = readCollaboratorsStore();
    const exists = current.some((item) => item.id === req.params.id);
    if (!exists) {
      res.status(404).json({ error: 'Colaborador não encontrado.' });
      return;
    }

    const updated = current.filter((item) => item.id !== req.params.id);
    writeCollaboratorsStore(updated);
    res.json({ collaborators: updated });
  });

  app.post('/api/admin/collaborators/reset', requireAdminAuth, (_req: Request, res: Response) => {
    writeCollaboratorsStore(SEED_COLLABORATORS);
    res.json({ collaborators: SEED_COLLABORATORS });
  });

  const httpServer = http.createServer(app);

  // --- Frontend SPA (Vite dev middleware ou dist em produção) ---
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Lecasu server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
