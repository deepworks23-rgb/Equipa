import {
  BarChart3,
  Edit3,
  ExternalLink,
  LogOut,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  COLLABORATOR_STATUSES,
  computeWorkforceMetrics,
  formatHiringDateShort,
  formatTenureDuration,
  getAdminCollaborators,
  STATUS_META,
  type Collaborator,
  type CollaboratorStatus,
} from '../utils/talentLogic';
import { CollaboratorAvatar } from './CollaboratorAvatar';
import { WorkforceAnalyticsCharts } from './WorkforceAnalyticsCharts';

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
  const [showCharts, setShowCharts] = useState(true);
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

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
    <div className="h-dvh w-full overflow-hidden flex flex-col bg-[#F8FAFC] text-[#111827]">
      {/* Cabeçalho Administrativo */}
      <header className="shrink-0 z-30 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 h-12 sm:h-14 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img
              src="/assets/aistudio/logo-transparent_81b43745.png"
              alt="Lecasu — Energy and Engineering Solutions"
              className="h-6 sm:h-8 md:h-9 w-auto object-contain shrink-0"
            />
            <span className="h-4 sm:h-5 w-px bg-[#E2E8F0] shrink-0" aria-hidden="true" />
            <span className="font-display text-xs sm:text-base font-bold tracking-tight text-[#111827] truncate">
              <span className="sm:hidden">Admin</span>
              <span className="hidden sm:inline">Painel Administrativo</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#FFF4E5] hover:border-[#FE8100] text-xs sm:text-sm font-medium text-[#111827] whitespace-nowrap transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FE8100] shrink-0" aria-hidden="true" />
              <span className="sm:hidden">Vitrine</span>
              <span className="hidden sm:inline">Ver Vitrine Pública</span>
            </a>

            <button
              type="button"
              onClick={onLogout}
              aria-label="Terminar Sessão"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9] whitespace-nowrap transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Terminar Sessão</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 min-w-0 max-w-[1440px] w-full mx-auto px-3 sm:px-4 md:px-8 py-2 sm:py-4 md:py-5 flex flex-col gap-2.5 sm:gap-4 overflow-y-auto overscroll-contain">
        {/* Título + Botões de Ação */}
        <div className="shrink-0 flex flex-row items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-base sm:text-[22px] md:text-[26px] font-bold text-[#111827] leading-tight truncate">
              Gestão da Equipa
            </h1>
            <p className="hidden sm:block text-xs md:text-sm text-[#64748B] mt-0.5">
              Adicione colaboradores, edite registos e controle quem aparece na vitrine pública.
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowCharts((prev) => !prev)}
              aria-pressed={showCharts}
              aria-label={showCharts ? 'Ocultar gráficos' : 'Mostrar gráficos'}
              title={showCharts ? 'Ocultar gráficos' : 'Mostrar gráficos'}
              className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border text-xs font-medium whitespace-nowrap transition-colors ${
                showCharts
                  ? 'border-[#FFD6A8] bg-[#FFF4E5] text-[#9A4200] hover:bg-[#FFE8CC]'
                  : 'border-[#CBD5E1] bg-white text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">
                {showCharts ? 'Ocultar Gráficos' : 'Mostrar Gráficos'}
              </span>
            </button>

            <button
              type="button"
              onClick={onResetSeed}
              aria-label="Restaurar Base"
              title="Restaurar Base"
              className="inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs font-medium text-[#64748B] hover:text-[#111827] whitespace-nowrap transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Restaurar Base</span>
            </button>

            <button
              type="button"
              onClick={onOpenCreate}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-[#FE8100] hover:bg-[#E57400] text-[#111827] text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" aria-hidden="true" />
              <span className="sm:hidden">Novo</span>
              <span className="hidden sm:inline">Novo Colaborador</span>
            </button>
          </div>
        </div>

        {/* Resumo Rápido (KPIs) em Flexbox — 4 cartões proporcionais */}
        <div className="shrink-0 flex flex-row items-stretch gap-1.5 sm:gap-3 md:gap-4">
          <div className="flex-1 min-w-0 bg-white border border-[#E2E8F0] rounded-lg p-2 sm:p-3.5 md:p-4 shadow-level-1 flex flex-col justify-between">
            <p className="text-[10px] sm:text-xs font-medium text-[#64748B] truncate">
              <span className="lg:hidden">Total</span>
              <span className="hidden lg:inline">Total de Colaboradores</span>
            </p>
            <p
              data-testid="kpi-total"
              className="mt-0.5 sm:mt-1.5 font-display text-lg sm:text-2xl md:text-[26px] font-bold text-[#111827] tabular-nums leading-none"
            >
              {metrics.total}
            </p>
          </div>

          <div className="flex-1 min-w-0 bg-white border border-[#E2E8F0] rounded-lg p-2 sm:p-3.5 md:p-4 shadow-level-1 flex flex-col justify-between">
            <p className="text-[10px] sm:text-xs font-medium text-[#64748B] truncate">Ativos</p>
            <p
              data-testid="kpi-ativos"
              className="mt-0.5 sm:mt-1.5 font-display text-lg sm:text-2xl md:text-[26px] font-bold text-[#065F46] tabular-nums leading-none"
            >
              {metrics.ativos}
            </p>
          </div>

          <div className="flex-1 min-w-0 bg-white border border-[#E2E8F0] rounded-lg p-2 sm:p-3.5 md:p-4 shadow-level-1 flex flex-col justify-between">
            <p className="text-[10px] sm:text-xs font-medium text-[#64748B] truncate">
              <span className="sm:hidden">Férias</span>
              <span className="hidden sm:inline">Em Férias</span>
            </p>
            <p
              data-testid="kpi-ferias"
              className="mt-0.5 sm:mt-1.5 font-display text-lg sm:text-2xl md:text-[26px] font-bold text-[#C25900] tabular-nums leading-none"
            >
              {metrics.ferias}
            </p>
          </div>

          <div className="flex-1 min-w-0 bg-white border border-[#E2E8F0] rounded-lg p-2 sm:p-3.5 md:p-4 shadow-level-1 flex flex-col justify-between">
            <p className="text-[10px] sm:text-xs font-medium text-[#64748B] truncate">
              <span className="sm:hidden">Rescind.</span>
              <span className="hidden sm:inline">Rescindidos</span>
            </p>
            <p
              data-testid="kpi-rescindidos"
              className="mt-0.5 sm:mt-1.5 font-display text-lg sm:text-2xl md:text-[26px] font-bold text-[#991B1B] tabular-nums leading-none"
            >
              {metrics.rescindidos}
            </p>
          </div>
        </div>

        {/* Visualização de Dados (Recharts): Departamento e Status */}
        {showCharts && (
          <WorkforceAnalyticsCharts
            collaborators={collaborators}
            activeStatusFilter={statusFilter}
            onSelectStatusFilter={setStatusFilter}
          />
        )}

        {/* Lista / Tabela de Gestão */}
        <div className="shrink-0 lg:flex-1 min-h-[340px] min-w-0 flex flex-col bg-white border border-[#E2E8F0] rounded-lg shadow-level-1 overflow-hidden">
          <div className="shrink-0 p-2 sm:p-3 md:p-3.5 border-b border-[#E2E8F0] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-1.5 sm:gap-2.5">
            <div className="relative flex-1 md:max-w-md min-w-0">
              <label htmlFor="admin-search" className="sr-only">
                Pesquisar colaboradores
              </label>
              <Search
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#64748B] absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="admin-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar colaborador, cargo ou e-mail..."
                className="w-full h-8 sm:h-9 pl-8 sm:pl-9 pr-3 rounded-md sm:rounded-lg border border-[#CBD5E1] bg-white text-xs sm:text-sm text-[#111827] placeholder:text-[#64748B] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
              />
            </div>

            <div
              role="group"
              aria-label="Filtrar tabela por status"
              className="flex flex-row items-center gap-1 p-0.5 sm:p-1 rounded-md sm:rounded-lg bg-[#F1F5F9] border border-[#E2E8F0]"
            >
              {(['Todos', ...COLLABORATOR_STATUSES] as const).map((tab) => {
                const active = statusFilter === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStatusFilter(tab)}
                    aria-pressed={active}
                    className={`flex-1 sm:flex-initial px-2 sm:px-3 py-1 rounded text-[11px] sm:text-xs font-medium whitespace-nowrap text-center transition-colors ${
                      active
                        ? 'bg-[#FE8100] text-[#111827] shadow-xs font-semibold'
                        : 'text-[#64748B] hover:text-[#111827]'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex-1 min-h-0 min-w-0 overflow-auto">
            {!isDesktop ? (
              <div className="p-2.5 sm:p-3.5 flex flex-wrap items-stretch gap-2 sm:gap-3">
                {filtered.length === 0 ? (
                  <div className="w-full px-4 py-10 text-center">
                    <p className="font-display text-sm font-semibold text-[#111827]">
                      Nenhum colaborador encontrado
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                      Ajuste os filtros ou adicione um novo colaborador.
                    </p>
                  </div>
                ) : (
                  filtered.map((person) => {
                    const statusStyle = STATUS_META[person.status];
                    return (
                      <div
                        key={person.id}
                        className="w-full sm:w-[calc(50%-6px)] rounded-lg border border-[#E2E8F0] bg-white p-3 flex flex-col justify-between gap-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <CollaboratorAvatar
                              fullName={person.nome_completo}
                              avatarUrl={person.foto_perfil}
                              sizeClass="h-10 w-10"
                              textSizeClass="text-xs"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-display text-sm font-semibold text-[#111827] truncate">
                                {person.nome_completo}
                              </p>
                              <p className="text-[11px] text-[#64748B] truncate">{person.cargo}</p>
                            </div>
                          </div>

                          <select
                            id={`admin-status-${person.id}`}
                            aria-label={`Status de ${person.nome_completo}`}
                            value={person.status}
                            onChange={(e) =>
                              onStatusChange(person.id, e.target.value as CollaboratorStatus)
                            }
                            className={`shrink-0 h-7 pl-2 pr-5 rounded-full text-[10px] font-semibold uppercase tracking-[0.04em] border border-transparent focus:outline-none focus:ring-2 focus:ring-[#FE8100] cursor-pointer ${statusStyle.bgClass} ${statusStyle.textClass}`}
                          >
                            <option value="Ativo">Ativo</option>
                            <option value="Férias">Férias</option>
                            <option value="Rescindido">Rescindido</option>
                          </select>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#44474E]">
                          <span className="truncate">{person.email}</span>
                          <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                          <span className="font-mono tabular-nums">
                            {formatHiringDateShort(person)}
                          </span>
                          <span className="text-[#64748B]">({formatTenureDuration(person)})</span>
                          <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                          <span className="tabular-nums">{person.telefone}</span>
                        </div>

                        <div className="flex flex-row items-center gap-2 pt-1.5 border-t border-[#F1F5F9]">
                          <button
                            type="button"
                            onClick={() => onEditCollaborator(person)}
                            aria-label={`Editar ${person.nome_completo}`}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#FFF4E5] hover:border-[#FE8100] text-xs font-medium text-[#111827] transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#C25900]" aria-hidden="true" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onRequestDelete(person)}
                            aria-label={`Excluir ${person.nome_completo}`}
                            className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md border border-[#FECACA] bg-[#FEE2E2]/50 hover:bg-[#FEE2E2] text-xs font-medium text-[#991B1B] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Excluir</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
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
                        <p className="font-display text-base font-semibold text-[#111827]">
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
                        <tr key={person.id} className="hover:bg-[#FFFAF5] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3 min-w-[220px]">
                              <CollaboratorAvatar
                                fullName={person.nome_completo}
                                avatarUrl={person.foto_perfil}
                                sizeClass="h-9 w-9"
                                textSizeClass="text-xs"
                              />
                              <div className="min-w-0">
                                <p className="font-display text-sm font-semibold text-[#111827] truncate">
                                  {person.nome_completo}
                                </p>
                                <p className="text-xs text-[#64748B] truncate">{person.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-sm text-[#111827] whitespace-nowrap">
                            {person.cargo}
                          </td>

                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-mono text-xs text-[#111827] tabular-nums">
                                {formatHiringDateShort(person)}
                              </span>
                              <span className="text-[11px] text-[#64748B]">
                                {formatTenureDuration(person)}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-xs text-[#111827] tabular-nums whitespace-nowrap">
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
                              className={`h-8 pl-2.5 pr-6 rounded-full text-[11px] font-semibold uppercase tracking-[0.04em] border border-transparent focus:outline-none focus:ring-2 focus:ring-[#FE8100] cursor-pointer ${statusStyle.bgClass} ${statusStyle.textClass}`}
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
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#FFF4E5] hover:border-[#FE8100] text-xs font-medium text-[#111827] transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#C25900]" aria-hidden="true" />
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
