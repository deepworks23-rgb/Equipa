import {
  Edit3,
  ExternalLink,
  LogOut,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  COLLABORATOR_STATUSES,
  computeWorkforceMetrics,
  getAdminCollaborators,
  STATUS_META,
  type Collaborator,
  type CollaboratorStatus,
} from '../utils/talentLogic';
import { CollaboratorAvatar } from './CollaboratorAvatar';

interface AdminDashboardViewProps {
  collaborators: Collaborator[];
  onOpenCreate: () => void;
  onEditCollaborator: (collaborator: Collaborator) => void;
  onRequestDelete: (collaborator: Collaborator) => void;
  onStatusChange: (id: string, nextStatus: CollaboratorStatus) => void;
  onLogout: () => void;
  onResetSeed: () => void;
}

export function AdminDashboardView({
  collaborators,
  onOpenCreate,
  onEditCollaborator,
  onRequestDelete,
  onStatusChange,
  onLogout,
  onResetSeed,
}: AdminDashboardViewProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CollaboratorStatus | 'Todos'>('Todos');

  const metrics = useMemo(() => computeWorkforceMetrics(collaborators), [collaborators]);
  const filtered = useMemo(
    () =>
      getAdminCollaborators(collaborators, {
        query,
        status: statusFilter,
      }),
    [collaborators, query, statusFilter],
  );

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#F8FAFC] text-[#1E293B]">
      {/* Cabeçalho Administrativo */}
      <header className="shrink-0 z-30 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="h-8 w-8 rounded-lg bg-[#0F294A] text-white flex items-center justify-center text-sm font-bold shrink-0"
              aria-hidden="true"
            >
              M
            </span>
            <span className="font-display text-base sm:text-lg font-bold tracking-tight text-[#0F294A] truncate">
              Painel Administrativo
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs sm:text-sm font-medium text-[#0F294A] whitespace-nowrap transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-[#0058BE] shrink-0" aria-hidden="true" />
              <span>Ver Vitrine Pública</span>
            </a>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-[#64748B] hover:text-[#0F294A] hover:bg-[#F1F5F9] whitespace-nowrap transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Terminar Sessão</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 min-w-0 max-w-[1440px] w-full mx-auto px-4 md:px-8 py-4 md:py-5 flex flex-col gap-4 overflow-hidden">
        {/* Título + Botão + Novo Colaborador */}
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-[22px] md:text-[26px] font-bold text-[#0F294A] leading-tight">
              Gestão da Equipa
            </h1>
            <p className="text-xs md:text-sm text-[#64748B] mt-0.5">
              Adicione colaboradores, edite registos e controle quem aparece na vitrine pública.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={onResetSeed}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs font-medium text-[#64748B] hover:text-[#0F294A] whitespace-nowrap transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Restaurar Base</span>
            </button>

            <button
              type="button"
              onClick={onOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-sm font-medium whitespace-nowrap transition-colors"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Novo Colaborador</span>
            </button>
          </div>
        </div>

        {/* Resumo Rápido (KPIs) */}
        <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white border border-[#E2E8F0] rounded-lg p-3.5 md:p-4 shadow-level-1">
            <p className="text-xs font-medium text-[#64748B]">Total de Colaboradores</p>
            <p
              data-testid="kpi-total"
              className="mt-1.5 font-display text-2xl md:text-[26px] font-bold text-[#0F294A] tabular-nums leading-none"
            >
              {metrics.total}
            </p>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-lg p-3.5 md:p-4 shadow-level-1">
            <p className="text-xs font-medium text-[#64748B]">Ativos</p>
            <p
              data-testid="kpi-ativos"
              className="mt-1.5 font-display text-2xl md:text-[26px] font-bold text-[#065F46] tabular-nums leading-none"
            >
              {metrics.ativos}
            </p>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-lg p-3.5 md:p-4 shadow-level-1">
            <p className="text-xs font-medium text-[#64748B]">Em Férias</p>
            <p
              data-testid="kpi-ferias"
              className="mt-1.5 font-display text-2xl md:text-[26px] font-bold text-[#92400E] tabular-nums leading-none"
            >
              {metrics.ferias}
            </p>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-lg p-3.5 md:p-4 shadow-level-1">
            <p className="text-xs font-medium text-[#64748B]">Rescindidos</p>
            <p
              data-testid="kpi-rescindidos"
              className="mt-1.5 font-display text-2xl md:text-[26px] font-bold text-[#991B1B] tabular-nums leading-none"
            >
              {metrics.rescindidos}
            </p>
          </div>
        </div>

        {/* Tabela de Gestão com scroll interno dentro de 100vh */}
        <div className="flex-1 min-h-0 min-w-0 flex flex-col bg-white border border-[#E2E8F0] rounded-lg shadow-level-1 overflow-hidden">
          <div className="shrink-0 p-3 md:p-3.5 border-b border-[#E2E8F0] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-md min-w-0">
              <label htmlFor="admin-search" className="sr-only">
                Pesquisar colaboradores
              </label>
              <Search
                className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="admin-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome, cargo, e-mail ou telefone..."
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#1E293B] placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] focus:ring-3 focus:ring-[#3B82F6]/20"
              />
            </div>

            <div
              role="group"
              aria-label="Filtrar tabela por status"
              className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0]"
            >
              {(['Todos', ...COLLABORATOR_STATUSES] as const).map((tab) => {
                const active = statusFilter === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStatusFilter(tab)}
                    aria-pressed={active}
                    className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-white text-[#0F294A] shadow-xs font-semibold'
                        : 'text-[#64748B] hover:text-[#0F294A]'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex-1 min-h-0 min-w-0 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-[#F8FAFC]">
                <tr className="border-b border-[#E2E8F0]">
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] whitespace-nowrap">
                    Colaborador
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] whitespace-nowrap">
                    Cargo
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] whitespace-nowrap">
                    Contratação
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] whitespace-nowrap">
                    Telefone / WhatsApp
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] whitespace-nowrap">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E2E8F0]">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <p className="font-display text-base font-semibold text-[#0F294A]">
                        Nenhum colaborador encontrado
                      </p>
                      <p className="mt-1 text-sm text-[#64748B]">
                        Ajuste os filtros ou adicione um novo colaborador.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((person) => {
                    const statusStyle = STATUS_META[person.status];
                    return (
                      <tr key={person.id} className="hover:bg-[#F1F5F9] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-[220px]">
                            <CollaboratorAvatar
                              fullName={person.nome_completo}
                              avatarUrl={person.foto_perfil}
                              sizeClass="h-9 w-9"
                              textSizeClass="text-xs"
                            />
                            <div className="min-w-0">
                              <p className="font-display text-sm font-semibold text-[#0B1C30] truncate">
                                {person.nome_completo}
                              </p>
                              <p className="text-xs text-[#64748B] truncate">{person.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-sm text-[#1E293B] whitespace-nowrap">
                          {person.cargo}
                        </td>

                        <td className="px-4 py-3 font-mono text-xs text-[#1E293B] tabular-nums whitespace-nowrap">
                          {person.ano_contratacao}
                        </td>

                        <td className="px-4 py-3 text-xs text-[#1E293B] tabular-nums whitespace-nowrap">
                          {person.telefone}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            id={`admin-status-${person.id}`}
                            aria-label={`Status de ${person.nome_completo}`}
                            value={person.status}
                            onChange={(e) =>
                              onStatusChange(person.id, e.target.value as CollaboratorStatus)
                            }
                            className={`h-8 pl-2.5 pr-6 rounded-full text-[11px] font-semibold uppercase tracking-[0.04em] border border-transparent focus:outline-none focus:ring-2 focus:ring-[#3B82F6] cursor-pointer ${statusStyle.bgClass} ${statusStyle.textClass}`}
                          >
                            <option value="Ativo">Ativo</option>
                            <option value="Férias">Férias</option>
                            <option value="Rescindido">Rescindido</option>
                          </select>
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onEditCollaborator(person)}
                              aria-label={`Editar ${person.nome_completo}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-xs font-medium text-[#1E293B] transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#0058BE]" aria-hidden="true" />
                              <span>Editar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => onRequestDelete(person)}
                              aria-label={`Excluir ${person.nome_completo}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#FECACA] bg-[#FEE2E2]/50 hover:bg-[#FEE2E2] text-xs font-medium text-[#991B1B] transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Excluir</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
