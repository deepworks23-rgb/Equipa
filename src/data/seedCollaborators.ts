import type { Collaborator } from '../utils/talentLogic.ts';

export const STORAGE_KEY = 'meridian_equipa_colaboradores_v2';

// 6 colaboradores iniciais: 4 Ativos, 1 em Férias, 1 Rescindido
export const SEED_COLLABORATORS: Collaborator[] = [
  {
    id: 'col-1',
    nome_completo: 'Elena Rostova',
    cargo: 'Diretora de Operações',
    telefone: '+351 912 450 110',
    email: 'elena.rostova@meridian.corp',
    ano_contratacao: 2021,
    data_contratacao: '2021-03-15',
    status: 'Ativo',
    foto_perfil: '/src/assets/images/avatar_elena_rostova_1795591488968.jpg',
    departamento: 'Operações & Engenharia',
    localizacao: 'Lisboa, Portugal',
    horario_atendimento: 'Seg–Sex · 08:30–17:30 (WET)',
    idiomas: ['Português', 'Inglês', 'Espanhol'],
    especialidades: ['Gestão Operacional', 'Sistemas de Energia', 'Coordenação de Projetos'],
    bio: 'Lidera a coordenação técnica e operacional de projetos industriais e energéticos junto de clientes empresariais.',
  },
  {
    id: 'col-2',
    nome_completo: 'Marcus Vance',
    cargo: 'Suporte Técnico',
    telefone: '+258 84 320 1980',
    email: 'marcus.vance@meridian.corp',
    ano_contratacao: 2022,
    data_contratacao: '2022-07-04',
    status: 'Ativo',
    foto_perfil: '/src/assets/images/avatar_marcus_vance_1795591490206.jpg',
    departamento: 'Assistência & Manutenção',
    localizacao: 'Maputo, Moçambique',
    horario_atendimento: 'Seg–Sex · 08:00–17:00 (CAT)',
    idiomas: ['Português', 'Inglês'],
    especialidades: ['Diagnóstico Elétrico', 'Manutenção Preventiva', 'Comissionamento'],
    bio: 'Especialista no acompanhamento pós-instalação, resolução rápida de ocorrências e suporte técnico em campo.',
  },
  {
    id: 'col-3',
    nome_completo: 'Claire Chen',
    cargo: 'Consultora Comercial',
    telefone: '+55 11 98450 2210',
    email: 'claire.chen@meridian.corp',
    ano_contratacao: 2023,
    data_contratacao: '2023-02-20',
    status: 'Ativo',
    foto_perfil: '/src/assets/images/avatar_claire_chen_1795591490323.jpg',
    departamento: 'Comercial & Projetos',
    localizacao: 'São Paulo, Brasil',
    horario_atendimento: 'Seg–Sex · 09:00–18:00 (BRT)',
    idiomas: ['Português', 'Inglês', 'Mandarim'],
    especialidades: ['Propostas Técnicas', 'Eficiência Energética', 'Soluções B2B'],
    bio: 'Apoia empresas na definição de soluções de engenharia à medida, elaboração de orçamentos e planeamento inicial.',
  },
  {
    id: 'col-4',
    nome_completo: 'Sofia Lindqvist',
    cargo: 'Gerente de Contas',
    telefone: '+351 934 780 412',
    email: 'sofia.lindqvist@meridian.corp',
    ano_contratacao: 2024,
    data_contratacao: '2024-09-10',
    status: 'Ativo',
    foto_perfil: '',
    departamento: 'Gestão de Clientes',
    localizacao: 'Porto, Portugal',
    horario_atendimento: 'Seg–Sex · 09:00–18:00 (WET)',
    idiomas: ['Português', 'Inglês', 'Sueco'],
    especialidades: ['Contratos Corporativos', 'Acompanhamento de Contas', 'Renovações'],
    bio: 'Responsável pelo acompanhamento contínuo de clientes estratégicos, contratos de serviço e satisfação operacional.',
  },
  {
    id: 'col-5',
    nome_completo: 'Mateo Silva',
    cargo: 'Consultor Comercial',
    telefone: '+258 82 510 8840',
    email: 'mateo.silva@meridian.corp',
    ano_contratacao: 2021,
    data_contratacao: '2021-11-08',
    status: 'Férias',
    foto_perfil: '/src/assets/images/avatar_mateo_silva_1795591490453.jpg',
    departamento: 'Comercial & Projetos',
    localizacao: 'Maputo, Moçambique',
    horario_atendimento: 'Seg–Sex · 08:00–17:00 (CAT)',
    idiomas: ['Português', 'Inglês'],
    especialidades: ['Expansão Comercial', 'Energia Solar', 'Consultoria Técnica'],
    bio: 'Consultor dedicado a novos projetos de infraestrutura energética e atendimento comercial na região Austral.',
  },
  {
    id: 'col-6',
    nome_completo: 'Lucas Meyer',
    cargo: 'Analista de Implementação',
    telefone: '+55 21 97120 3305',
    email: 'lucas.meyer@meridian.corp',
    ano_contratacao: 2020,
    data_contratacao: '2020-05-18',
    status: 'Rescindido',
    foto_perfil: '/src/assets/images/avatar_lucas_meyer_1795591490322.jpg',
    departamento: 'Operações & Engenharia',
    localizacao: 'Rio de Janeiro, Brasil',
    horario_atendimento: 'Seg–Sex · 09:00–18:00 (BRT)',
    idiomas: ['Português', 'Inglês'],
    especialidades: ['Implantação de Sistemas', 'Documentação Técnica'],
    bio: 'Atuação anterior em implementação e entrega técnica de projetos.',
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
      const seedById = new Map(SEED_COLLABORATORS.map((item) => [item.id, item]));
      return (parsed as Collaborator[]).map((item) => {
        const seed = seedById.get(item.id);
        const fallbackDate = seed?.data_contratacao ?? `${item.ano_contratacao || 2024}-01-01`;
        const normalizedDate = item.data_contratacao || fallbackDate;

        if (!seed) {
          return item.data_contratacao
            ? item
            : { ...item, data_contratacao: normalizedDate };
        }

        const needsBackfill =
          item.departamento === undefined &&
          item.localizacao === undefined &&
          item.horario_atendimento === undefined &&
          item.bio === undefined;

        return needsBackfill
          ? {
              ...seed,
              ...item,
              data_contratacao: normalizedDate,
              departamento: seed.departamento,
              localizacao: seed.localizacao,
              horario_atendimento: seed.horario_atendimento,
              idiomas: seed.idiomas,
              especialidades: seed.especialidades,
              bio: seed.bio,
            }
          : item.data_contratacao
            ? item
            : { ...item, data_contratacao: normalizedDate };
      });
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
