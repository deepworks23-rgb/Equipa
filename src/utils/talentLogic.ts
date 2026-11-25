export const COLLABORATOR_STATUSES = ['Ativo', 'Férias', 'Rescindido'] as const;

export type CollaboratorStatus = (typeof COLLABORATOR_STATUSES)[number];

export interface Collaborator {
  id: string;
  nome_completo: string;
  cargo: string;
  telefone: string;
  email: string;
  ano_contratacao: number;
  status: CollaboratorStatus;
  foto_perfil?: string;
}

export interface CollaboratorInput {
  nome_completo: string;
  cargo: string;
  telefone: string;
  email: string;
  ano_contratacao: number | string;
  status: CollaboratorStatus;
  foto_perfil?: string;
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

    const haystack = `${person.nome_completo} ${person.cargo}`.toLowerCase();
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

export function validateCollaboratorInput(
  input: CollaboratorInput,
  currentYear: number = new Date().getFullYear(),
): { valid: boolean; errors: Partial<Record<keyof CollaboratorInput, string>> } {
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

  const yearNumber = Number(input.ano_contratacao);
  if (
    !Number.isInteger(yearNumber) ||
    String(input.ano_contratacao).trim().length !== 4 ||
    yearNumber < 1980 ||
    yearNumber > currentYear
  ) {
    errors.ano_contratacao = `Informe um ano válido de 4 dígitos entre 1980 e ${currentYear}.`;
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

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function formatCompanyTenure(anoContratacao: number): string {
  return `Na empresa desde ${anoContratacao}`;
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
