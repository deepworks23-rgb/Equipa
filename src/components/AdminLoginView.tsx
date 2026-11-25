import { KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

interface AdminLoginViewProps {
  onSuccess: (token: string, email: string) => void;
  onNavigatePublic: () => void;
}

interface AuthStatusResponse {
  configured: boolean;
  envManaged: boolean;
}

export function AdminLoginView({ onSuccess, onNavigatePublic }: AdminLoginViewProps) {
  const [authStatus, setAuthStatus] = useState<AuthStatusResponse | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/auth/status', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Falha ao verificar estado do acesso administrativo.');
        return (await res.json()) as AuthStatusResponse;
      })
      .then((data) => {
        if (active) {
          setAuthStatus(data);
          setStatusError(null);
        }
      })
      .catch(() => {
        if (active) {
          setStatusError('Não foi possível ligar ao servidor de autenticação.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const isSetupMode = authStatus !== null && !authStatus.configured;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setError('Preencha o e-mail e a palavra-passe para continuar.');
      return;
    }

    if (isSetupMode) {
      if (password.length < 8) {
        setError('A palavra-passe deve ter pelo menos 8 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('As palavras-passe não coincidem.');
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      const endpoint = isSetupMode ? '/api/admin/auth/setup' : '/api/admin/auth/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const data = (await response.json()) as {
        token?: string;
        email?: string;
        error?: string;
      };

      if (!response.ok || !data.token) {
        setError(data.error ?? 'Não foi possível validar o acesso administrativo.');
        return;
      }

      onSuccess(data.token, data.email ?? trimmedEmail);
    } catch {
      setError('Erro de ligação ao servidor. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-dvh w-full overflow-y-auto bg-[#F8FAFC] flex flex-col justify-center items-center px-3 sm:px-4 py-4 sm:py-6">
      <div className="w-full max-w-md shrink-0 bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-8 shadow-level-3">
        <div className="pb-4 sm:pb-5 border-b border-[#E2E8F0]">
          <img
            src="/assets/aistudio/logo-transparent_81b43745.png"
            alt="Lecasu — Energy and Engineering Solutions"
            className="h-8 sm:h-10 w-auto object-contain"
          />
          <div className="mt-4 flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#FFF4E5] border border-[#FFD6A8] text-[#C25900] flex items-center justify-center shrink-0">
              {isSetupMode ? (
                <KeyRound className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Lock className="w-4 h-4" aria-hidden="true" />
              )}
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-[#111827]">
                {isSetupMode ? 'Configurar Acesso Administrativo' : 'Painel Administrativo'}
              </h1>
              <p className="text-xs text-[#64748B]">
                {isSetupMode
                  ? 'Defina a conta e palavra-passe inicial para proteger o painel'
                  : 'Acesso exclusivo e autenticado para gestão de colaboradores'}
              </p>
            </div>
          </div>
        </div>

        {statusError ? (
          <div className="mt-5 rounded-lg bg-[#FEE2E2] px-3.5 py-3 text-xs font-medium text-[#991B1B]">
            {statusError}
          </div>
        ) : authStatus === null ? (
          <div className="mt-6 py-8 text-center text-xs text-[#64748B]">
            A verificar estado de segurança...
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
            {isSetupMode && (
              <div className="rounded-lg bg-[#FFFAF5] border border-[#FFD6A8] p-3 text-xs text-[#44474E] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C25900] shrink-0 mt-0.5" aria-hidden="true" />
                <p>
                  Primeiro acesso detetado. Crie uma palavra-passe forte (mínimo de 8 caracteres)
                  para bloquear este painel contra acessos não autorizados.
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="admin-login-email"
                className="block text-xs font-medium text-[#111827] mb-1.5"
              >
                E-mail do Administrador
              </label>
              <input
                id="admin-login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="admin@lecasu.com"
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#111827] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
              />
            </div>

            <div>
              <label
                htmlFor="admin-login-password"
                className="block text-xs font-medium text-[#111827] mb-1.5"
              >
                {isSetupMode ? 'Nova Palavra-passe' : 'Palavra-passe'}
              </label>
              <input
                id="admin-login-password"
                type="password"
                autoComplete={isSetupMode ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••••••••"
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#111827] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
              />
            </div>

            {isSetupMode && (
              <div>
                <label
                  htmlFor="admin-confirm-password"
                  className="block text-xs font-medium text-[#111827] mb-1.5"
                >
                  Confirmar Palavra-passe
                </label>
                <input
                  id="admin-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#111827] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
                />
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="text-xs font-medium text-[#991B1B] bg-[#FEE2E2] rounded-lg px-3 py-2"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-10 rounded-lg bg-[#FE8100] hover:bg-[#E57400] disabled:opacity-60 text-[#111827] text-sm font-semibold transition-colors"
            >
              {submitting
                ? 'A validar...'
                : isSetupMode
                  ? 'Definir Palavra-passe e Entrar'
                  : 'Entrar no Painel'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigatePublic();
            }}
            className="block text-center text-xs font-medium text-[#64748B] hover:text-[#111827]"
          >
            ← Voltar à Vitrine Pública
          </a>
        </div>
      </div>
    </div>
  );
}
