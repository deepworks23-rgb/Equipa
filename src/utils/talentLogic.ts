export const COLLABORATOR_STATUSES = ['Ativo', 'Férias', 'Rescindido'] as const;

export type CollaboratorStatus = (typeof COLLABORATOR_STATUSES)[number];

export interface Collaborator {
  id: string;
  nome_completo: string;
  cargo: string;
  telefone: string;
  email: string;
  ano_contratacao: number;
  data_contratacao?: string;
  status: CollaboratorStatus;
  foto_perfil?: string;
  departamento?: string;
  localizacao?: string;
  horario_atendimento?: string;
  idiomas?: string[];
  especialidades?: string[];
  bio?: string;
}

export interface CollaboratorInput {
  nome_completo: string;
  cargo: string;
  telefone: string;
  email: string;
  ano_contratacao: number | string;
  data_contratacao?: string;
  status: CollaboratorStatus;
  foto_perfil?: string;
  departamento?: string;
  localizacao?: string;
  horario_atendimento?: string;
  idiomas?: string[];
  especialidades?: string[];
  bio?: string;
}

export interface PublicFilterCriteria {
  query: string;
  cargo: string;
}

export interface AdminFilterCriteria {
  query: string;
  status: CollaboratorStatus | 'Todos';
}

export interface WorkforceMetrics {
  total: number;
  ativos: number;
  ferias: number;
  rescindidos: number;
}

export interface DepartmentStatusSummary {
  departamento: string;
  Ativo: number;
  Férias: number;
  Rescindido: number;
  total: number;
}

export interface StatusDistributionItem {
  status: CollaboratorStatus;
  count: number;
  percentage: number;
}

export const STATUS_META: Record<
  CollaboratorStatus,
  {
    publicLabel: string;
    adminLabel: string;
    bgClass: string;
    textClass: string;
    dotClass: string;
  }
> = {
  Ativo: {
    publicLabel: 'Disponível',
    adminLabel: 'Ativo',
    bgClass: 'bg-[#D1FAE5]',
    textClass: 'text-[#065F46]',
    dotClass: 'bg-[#10B981]',
  },
  Férias: {
    publicLabel: 'Em férias',
    adminLabel: 'Férias',
    bgClass: 'bg-[#FEF3C7]',
    textClass: 'text-[#92400E]',
    dotClass: 'bg-[#F59E0B]',
  },
  Rescindido: {
    publicLabel: 'Rescindido',
    adminLabel: 'Rescindido',
    bgClass: 'bg-[#FEE2E2]',
    textClass: 'text-[#991B1B]',
    dotClass: 'bg-[#EF4444]',
  },
};

export function getPublicCollaborators(
  collaborators: Collaborator[],
  criteria: PublicFilterCriteria,
): Collaborator[] {
  const normalizedQuery = criteria.query.trim().toLowerCase();

  return collaborators.filter((person) => {
    // Regra Crítica de Privacidade: Rescindido NUNCA aparece na Vitrine Pública
    if (person.status === 'Rescindido') {
      return false;
    }

    if (criteria.cargo !== 'Todos' && person.cargo !== criteria.cargo) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      person.nome_completo,
      person.cargo,
      person.departamento ?? '',
      person.localizacao ?? '',
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}

export function getPublicCollaboratorById(
  collaborators: Collaborator[],
  id: string,
): Collaborator | null {
  const found = collaborators.find((person) => person.id === id);
  if (!found || found.status === 'Rescindido') {
    return null;
  }
  return found;
}

export function getAlternativePublicCollaborators(
  collaborators: Collaborator[],
  target: Collaborator,
  limit: number = 3,
): Collaborator[] {
  const candidates = collaborators.filter(
    (person) => person.id !== target.id && person.status === 'Ativo',
  );

  const targetDept = target.departamento?.trim().toLowerCase() ?? '';
  const targetCargo = target.cargo.trim().toLowerCase();

  const sorted = [...candidates].sort((a, b) => {
    const aSameDept = targetDept && (a.departamento?.trim().toLowerCase() ?? '') === targetDept ? 2 : 0;
    const bSameDept = targetDept && (b.departamento?.trim().toLowerCase() ?? '') === targetDept ? 2 : 0;
    const aSameRole = a.cargo.trim().toLowerCase() === targetCargo ? 1 : 0;
    const bSameRole = b.cargo.trim().toLowerCase() === targetCargo ? 1 : 0;
    return bSameDept + bSameRole - (aSameDept + aSameRole);
  });

  return sorted.slice(0, limit);
}

export function getDynamicPublicRoles(collaborators: Collaborator[]): string[] {
  const seen = new Set<string>();
  const roles: string[] = [];

  for (const person of collaborators) {
    if (person.status === 'Rescindido') continue;
    const role = person.cargo.trim();
    if (role && !seen.has(role)) {
      seen.add(role);
      roles.push(role);
    }
  }

  return roles.sort((a, b) => a.localeCompare(b, 'pt'));
}

export function getAdminCollaborators(
  collaborators: Collaborator[],
  criteria: AdminFilterCriteria,
): Collaborator[] {
  const normalizedQuery = criteria.query.trim().toLowerCase();

  return collaborators.filter((person) => {
    if (criteria.status !== 'Todos' && person.status !== criteria.status) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      person.nome_completo,
      person.cargo,
      person.email,
      person.telefone,
      person.departamento ?? '',
      person.localizacao ?? '',
      ...(person.especialidades ?? []),
      formatHiringDateShort(person),
      String(person.ano_contratacao),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

export function computeWorkforceMetrics(collaborators: Collaborator[]): WorkforceMetrics {
  let ativos = 0;
  let ferias = 0;
  let rescindidos = 0;

  for (const person of collaborators) {
    if (person.status === 'Ativo') ativos += 1;
    else if (person.status === 'Férias') ferias += 1;
    else if (person.status === 'Rescindido') rescindidos += 1;
  }

  return {
    total: collaborators.length,
    ativos,
    ferias,
    rescindidos,
  };
}

export function computeDepartmentStatusDistribution(
  collaborators: Collaborator[],
): DepartmentStatusSummary[] {
  const map = new Map<string, DepartmentStatusSummary>();

  for (const person of collaborators) {
    const dept = person.departamento?.trim() || 'Sem departamento';
    const existing = map.get(dept) ?? {
      departamento: dept,
      Ativo: 0,
      Férias: 0,
      Rescindido: 0,
      total: 0,
    };

    existing[person.status] += 1;
    existing.total += 1;
    map.set(dept, existing);
  }

  return Array.from(map.values()).sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a.departamento.localeCompare(b.departamento, 'pt');
  });
}

export function computeStatusDistribution(
  collaborators: Collaborator[],
): StatusDistributionItem[] {
  const metrics = computeWorkforceMetrics(collaborators);
  const total = metrics.total;
  const counts: Record<CollaboratorStatus, number> = {
    Ativo: metrics.ativos,
    Férias: metrics.ferias,
    Rescindido: metrics.rescindidos,
  };

  return COLLABORATOR_STATUSES.map((status) => ({
    status,
    count: counts[status],
    percentage: total > 0 ? Math.round((counts[status] / total) * 100) : 0,
  }));
}

export function validateCollaboratorInput(
  input: CollaboratorInput,
  referenceDate: Date | number = new Date(),
): { valid: boolean; errors: Partial<Record<keyof CollaboratorInput, string>> } {
  const refDate =
    typeof referenceDate === 'number'
      ? new Date(referenceDate, 11, 31)
      : referenceDate;
  const currentYear = refDate.getFullYear();
  const todayIso = toIsoDateString(refDate);
  const errors: Partial<Record<keyof CollaboratorInput, string>> = {};

  if (!input.nome_completo.trim() || input.nome_completo.trim().length < 2) {
    errors.nome_completo = 'Informe o nome completo (mínimo de 2 caracteres).';
  }

  if (!input.cargo.trim()) {
    errors.cargo = 'Informe o cargo do colaborador.';
  }

  const digitsOnly = input.telefone.replace(/\D/g, '');
  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    errors.telefone = 'Informe o telefone com código do país (ex.: +258 84 123 4567).';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email.trim() || !emailRegex.test(input.email.trim())) {
    errors.email = 'Informe um endereço de e-mail válido.';
  }

  const rawDate = input.data_contratacao?.trim();
  if (rawDate !== undefined) {
    const parsed = parseIsoDateParts(rawDate);
    if (!parsed) {
      errors.data_contratacao = 'Informe uma data de contratação válida (dia, mês e ano).';
    } else if (rawDate < '1980-01-01' || rawDate > todayIso) {
      errors.data_contratacao = `A data de contratação deve estar entre 01/01/1980 e ${formatIsoDateShort(todayIso)}.`;
    }
  } else {
    const yearNumber = Number(input.ano_contratacao);
    if (
      !Number.isInteger(yearNumber) ||
      String(input.ano_contratacao).trim().length !== 4 ||
      yearNumber < 1980 ||
      yearNumber > currentYear
    ) {
      errors.ano_contratacao = `Informe um ano válido de 4 dígitos entre 1980 e ${currentYear}.`;
    }
  }

  if (!COLLABORATOR_STATUSES.includes(input.status)) {
    errors.status = 'Selecione um status válido.';
  }

  const photo = input.foto_perfil?.trim() ?? '';
  if (
    photo &&
    !photo.startsWith('http://') &&
    !photo.startsWith('https://') &&
    !photo.startsWith('/') &&
    !photo.startsWith('data:image/')
  ) {
    errors.foto_perfil = 'Use um URL válido (http/https) ou carregue uma imagem.';
  }

  if (input.bio && input.bio.trim().length > 400) {
    errors.bio = 'O resumo profissional deve ter no máximo 400 caracteres.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function parseTagList(raw: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of raw.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(trimmed);
    }
  }

  return result;
}

export function formatTagList(items?: string[]): string {
  return (items ?? []).join(', ');
}

export function buildVCardContent(person: Collaborator): string {
  const parts = person.nome_completo.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? person.nome_completo;
  const lastName = parts.slice(1).join(' ');
  const cleanPhone = person.telefone.replace(/[^\d+]/g, '');
  const escapeVCard = (val: string) =>
    val.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCard(person.nome_completo)}`,
    `N:${escapeVCard(lastName)};${escapeVCard(firstName)};;;`,
    'ORG:Lecasu — Energy and Engineering Solutions',
    `TITLE:${escapeVCard(person.cargo)}`,
    `TEL;TYPE=WORK,VOICE:${cleanPhone}`,
    `EMAIL;TYPE=PREF,INTERNET:${person.email.trim()}`,
  ];

  if (person.localizacao?.trim()) {
    lines.push(`ADR;TYPE=WORK:;;${escapeVCard(person.localizacao.trim())};;;;`);
  }

  const noteParts: string[] = [];
  if (person.departamento?.trim()) {
    noteParts.push(`Departamento: ${person.departamento.trim()}`);
  }
  if (person.horario_atendimento?.trim()) {
    noteParts.push(`Horário: ${person.horario_atendimento.trim()}`);
  }
  if (person.bio?.trim()) {
    noteParts.push(person.bio.trim());
  }
  if (noteParts.length > 0) {
    lines.push(`NOTE:${escapeVCard(noteParts.join(' | '))}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

const PT_MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

export function toIsoDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseIsoDateParts(
  iso?: string,
): { year: number; month: number; day: number } | null {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const check = new Date(year, month - 1, day);
  if (
    check.getFullYear() !== year ||
    check.getMonth() !== month - 1 ||
    check.getDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function resolveCollaboratorHireDate(
  source: Pick<Collaborator, 'data_contratacao' | 'ano_contratacao'> | string | number,
): string {
  if (typeof source === 'string') {
    if (parseIsoDateParts(source)) return source;
    return `${new Date().getFullYear()}-01-01`;
  }
  if (typeof source === 'number') {
    const safeYear = Number.isInteger(source) && source >= 1980 ? source : new Date().getFullYear();
    return `${safeYear}-01-01`;
  }
  if (source.data_contratacao && parseIsoDateParts(source.data_contratacao)) {
    return source.data_contratacao;
  }
  const safeYear =
    Number.isInteger(source.ano_contratacao) && source.ano_contratacao >= 1980
      ? source.ano_contratacao
      : new Date().getFullYear();
  return `${safeYear}-01-01`;
}

export function formatIsoDateShort(iso: string): string {
  const parts = parseIsoDateParts(iso);
  if (!parts) return iso;
  return `${String(parts.day).padStart(2, '0')}/${String(parts.month).padStart(2, '0')}/${parts.year}`;
}

export function formatHiringDateShort(
  source: Pick<Collaborator, 'data_contratacao' | 'ano_contratacao'> | string | number,
): string {
  return formatIsoDateShort(resolveCollaboratorHireDate(source));
}

export function formatHiringDateLong(
  source: Pick<Collaborator, 'data_contratacao' | 'ano_contratacao'> | string | number,
): string {
  const iso = resolveCollaboratorHireDate(source);
  const parts = parseIsoDateParts(iso);
  if (!parts) return iso;
  const monthName = PT_MONTHS[parts.month - 1] ?? '';
  return `${parts.day} de ${monthName} de ${parts.year}`;
}

export function calculateCompanyTenureParts(
  source: Pick<Collaborator, 'data_contratacao' | 'ano_contratacao'> | string | number,
  referenceDate: Date = new Date(),
): { years: number; months: number; days: number } {
  const iso = resolveCollaboratorHireDate(source);
  const parts = parseIsoDateParts(iso);
  if (!parts) return { years: 0, months: 0, days: 0 };

  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth() + 1;
  const refDay = referenceDate.getDate();

  let years = refYear - parts.year;
  let months = refMonth - parts.month;
  let days = refDay - parts.day;

  if (days < 0) {
    months -= 1;
    const daysInPrevMonth = new Date(refYear, refMonth - 1, 0).getDate();
    days += daysInPrevMonth;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years < 0) {
    return { years: 0, months: 0, days: 0 };
  }

  return { years, months, days };
}

export function formatTenureDuration(
  source: Pick<Collaborator, 'data_contratacao' | 'ano_contratacao'> | string | number,
  referenceDate: Date = new Date(),
): string {
  const { years, months, days } = calculateCompanyTenureParts(source, referenceDate);

  if (years === 0 && months === 0) {
    if (days <= 0) return 'Integrado hoje';
    return days === 1 ? '1 dia' : `${days} dias`;
  }

  const parts: string[] = [];
  if (years > 0) {
    parts.push(years === 1 ? '1 ano' : `${years} anos`);
  }
  if (months > 0) {
    parts.push(months === 1 ? '1 mês' : `${months} meses`);
  }
  return parts.join(' e ');
}

export function formatCompanyTenure(
  source: Pick<Collaborator, 'data_contratacao' | 'ano_contratacao'> | string | number,
  referenceDate: Date = new Date(),
): string {
  const { years, months, days } = calculateCompanyTenureParts(source, referenceDate);
  if (years === 0 && months === 0 && days <= 0) {
    return 'Integrado hoje';
  }
  return `${formatTenureDuration(source, referenceDate)} na empresa`;
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'CL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function buildWhatsAppUrl(telefone: string): string {
  const digits = telefone.replace(/\D/g, '');
  return `https://wa.me/${digits}`;
}

export function buildTelUrl(telefone: string): string {
  const cleaned = telefone.replace(/[^\d+]/g, '');
  return `tel:${cleaned}`;
}

export function buildMailtoUrl(email: string): string {
  return `mailto:${email.trim()}`;
}
