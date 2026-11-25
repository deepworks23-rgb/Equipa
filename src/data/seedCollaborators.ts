import { type Collaborator } from '../utils/talentLogic';

export const STORAGE_KEY = 'meridian_equipa_colaboradores_v2';
export const ADMIN_SESSION_KEY = 'meridian_admin_authenticated_v1';

// 6 colaboradores iniciais: 4 Ativos, 1 em Férias, 1 Rescindido
export const SEED_COLLABORATORS: Collaborator[] = [
  {
    id: 'col-1',
    nome_completo: 'Elena Rostova',
    cargo: 'Diretora de Operações',
    telefone: '+351 912 450 110',
    email: 'elena.rostova@meridian.corp',
    ano_contratacao: 2021,
    status: 'Ativo',
    foto_perfil: '/src/assets/images/avatar_elena_rostova_1795591488968.jpg',
  },
  {
    id: 'col-2',
    nome_completo: 'Marcus Vance',
    cargo: 'Suporte Técnico',
    telefone: '+258 84 320 1980',
    email: 'marcus.vance@meridian.corp',
    ano_contratacao: 2022,
    status: 'Ativo',
    foto_perfil: '/src/assets/images/avatar_marcus_vance_1795591490206.jpg',
  },
  {
    id: 'col-3',
    nome_completo: 'Claire Chen',
    cargo: 'Consultora Comercial',
    telefone: '+55 11 98450 2210',
    email: 'claire.chen@meridian.corp',
    ano_contratacao: 2023,
    status: 'Ativo',
    foto_perfil: '/src/assets/images/avatar_claire_chen_1795591490323.jpg',
  },
  {
    id: 'col-4',
    nome_completo: 'Sofia Lindqvist',
    cargo: 'Gerente de Contas',
    telefone: '+351 934 780 412',
    email: 'sofia.lindqvist@meridian.corp',
    ano_contratacao: 2024,
    status: 'Ativo',
    foto_perfil: '',
  },
  {
    id: 'col-5',
    nome_completo: 'Mateo Silva',
    cargo: 'Consultor Comercial',
    telefone: '+258 82 510 8840',
    email: 'mateo.silva@meridian.corp',
    ano_contratacao: 2021,
    status: 'Férias',
    foto_perfil: '/src/assets/images/avatar_mateo_silva_1795591490453.jpg',
  },
  {
    id: 'col-6',
    nome_completo: 'Lucas Meyer',
    cargo: 'Analista de Implementação',
    telefone: '+55 21 97120 3305',
    email: 'lucas.meyer@meridian.corp',
    ano_contratacao: 2020,
    status: 'Rescindido',
    foto_perfil: '/src/assets/images/avatar_lucas_meyer_1795591490322.jpg',
  },
];

export function loadCollaborators(): Collaborator[] {
  if (typeof window === 'undefined') {
    return SEED_COLLABORATORS;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_COLLABORATORS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as Collaborator[];
    }
  } catch {
    // Fallback to seed data if storage is malformed
  }
  return SEED_COLLABORATORS;
}

export function saveCollaborators(collaborators: Collaborator[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collaborators));
  } catch {
    // Ignore storage quota errors
  }
}

export function loadAdminSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

export function saveAdminSession(authenticated: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (authenticated) {
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch {
    // Ignore sessionStorage restrictions
  }
}
