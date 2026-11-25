import { ArrowRight, Calendar, ChevronDown, Lock, Mail, MessageCircle, Phone, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  buildMailtoUrl,
  buildTelUrl,
  buildWhatsAppUrl,
  formatCompanyTenure,
  getDynamicPublicRoles,
  getPublicCollaborators,
  type Collaborator,
} from '../utils/talentLogic';
import { CollaboratorAvatar } from './CollaboratorAvatar';
import { StatusChip } from './StatusChip';

interface PublicShowcaseViewProps {
  collaborators: Collaborator[];
  onSelectCollaborator: (id: string) => void;
  onNavigateAdmin: () => void;
}

export function PublicShowcaseView({
  collaborators,
  onSelectCollaborator,
  onNavigateAdmin,
}: PublicShowcaseViewProps) {
  const [query, setQuery] = useState('');
  const [selectedCargo, setSelectedCargo] = useState('Todos');

  const dynamicRoles = useMemo(
    () => getDynamicPublicRoles(collaborators),
    [collaborators],
  );

  const activeCargo =
    selectedCargo !== 'Todos' && !dynamicRoles.includes(selectedCargo)
      ? 'Todos'
      : selectedCargo;

  const visibleCollaborators = useMemo(
    () =>
      getPublicCollaborators(collaborators, {
        query,
        cargo: activeCargo,
      }),
    [collaborators, query, activeCargo],
  );

  const hasFilters = query.trim().length > 0 || activeCargo !== 'Todos';

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#F8FAFC] text-[#111827]">
      {/* Cabeçalho Institucional Limpo — Sem menus administrativos */}
      <header className="shrink-0 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-3 font-display text-base sm:text-lg font-bold tracking-tight text-[#111827] whitespace-nowrap"
          >
            <img
              src="/assets/aistudio/logo-transparent_81b43745.png"
              alt="Lecasu — Energy and Engineering Solutions"
              className="h-8 sm:h-9 w-auto object-contain shrink-0"
            />
            <span className="h-5 w-px bg-[#E2E8F0] shrink-0" aria-hidden="true" />
            <span>A Nossa Equipa</span>
          </a>

          <p className="text-xs text-[#64748B] tabular-nums whitespace-nowrap">
            A exibir <strong className="text-[#111827] font-semibold">{visibleCollaborators.length}</strong>{' '}
            {visibleCollaborators.length === 1 ? 'colaborador' : 'colaboradores'}
          </p>
        </div>
      </header>

      <main className="flex-1 min-h-0 max-w-[1440px] w-full mx-auto px-4 md:px-8 py-4 flex flex-col gap-4 overflow-hidden">
        {/* Barra de Pesquisa à esquerda e Filtro Dropdown à direita */}
        <div className="shrink-0 bg-white border border-[#E2E8F0] rounded-lg p-3 shadow-level-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 min-w-0">
            <label htmlFor="public-search" className="sr-only">
              Pesquisar por nome ou cargo
            </label>
            <Search
              className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="public-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pesquisar por nome ou cargo..."
              className="w-full h-10 pl-10 pr-9 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#111827] placeholder:text-[#64748B] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Limpar pesquisa"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative shrink-0 sm:w-64">
            <label htmlFor="public-role-filter" className="sr-only">
              Filtrar por cargo
            </label>
            <select
              id="public-role-filter"
              aria-label="Filtrar por cargo"
              value={activeCargo}
              onChange={(e) => setSelectedCargo(e.target.value)}
              className="w-full h-10 pl-3.5 pr-9 rounded-lg border border-[#CBD5E1] bg-white text-sm font-medium text-[#111827] appearance-none cursor-pointer focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
            >
              <option value="Todos">Todos os cargos</option>
              {dynamicRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Grelha de Cartões (3 a 4 colunas no desktop, 1 a 2 no telemóvel) com scroll interno dentro de 100vh */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 pb-1">
          {visibleCollaborators.length === 0 ? (
            <div className="h-full min-h-[220px] flex flex-col items-center justify-center bg-white border border-[#E2E8F0] rounded-lg p-8 text-center shadow-level-1">
              <h2 className="font-display text-lg font-semibold text-[#111827]">
                Nenhum colaborador encontrado
              </h2>
              <p className="mt-1.5 text-sm text-[#64748B] max-w-md mx-auto">
                Não existem colaboradores correspondentes aos critérios selecionados.
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSelectedCargo('Todos');
                  }}
                  className="mt-5 px-4 py-2 rounded-lg bg-[#FE8100] hover:bg-[#E57400] text-[#111827] text-sm font-semibold transition-colors"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          ) : (
            <div
              data-testid="public-showcase-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5"
            >
              {visibleCollaborators.map((person) => (
                <article
                  key={person.id}
                  className="collaborator-card bg-white border border-[#E2E8F0] rounded-lg p-3.5 md:p-4 flex flex-col justify-between gap-2.5"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <CollaboratorAvatar
                        fullName={person.nome_completo}
                        avatarUrl={person.foto_perfil}
                        sizeClass="h-11 w-11"
                        textSizeClass="text-sm"
                      />
                      <StatusChip status={person.status} variant="public" />
                    </div>

                    <div className="mt-2">
                      <h2 className="font-display text-[15px] font-semibold leading-5 text-[#111827]">
                        {person.nome_completo}
                      </h2>
                      <p className="text-xs text-[#64748B] mt-0.5">{person.cargo}</p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-[#E2E8F0] space-y-1 text-xs text-[#44474E]">
                      <p className="flex items-center gap-2 tabular-nums">
                        <Calendar className="w-3.5 h-3.5 text-[#FE8100] shrink-0" aria-hidden="true" />
                        <span>{formatCompanyTenure(person.ano_contratacao)}</span>
                      </p>
                      <p className="flex items-center gap-2 tabular-nums">
                        <Phone className="w-3.5 h-3.5 text-[#FE8100] shrink-0" aria-hidden="true" />
                        <a
                          href={buildTelUrl(person.telefone)}
                          className="hover:text-[#C25900] hover:underline"
                        >
                          {person.telefone}
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Botões de Contacto Direto e Ver mais */}
                  <div className="space-y-2 pt-0.5">
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={buildWhatsAppUrl(person.telefone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Contactar ${person.nome_completo} por WhatsApp`}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] hover:bg-[#D1FAE5] text-[13px] font-medium whitespace-nowrap transition-colors"
                      >
                        <MessageCircle className="w-4 h-4 text-[#10B981] shrink-0" aria-hidden="true" />
                        <span>WhatsApp</span>
                      </a>

                      <a
                        href={buildMailtoUrl(person.email)}
                        aria-label={`Enviar e-mail para ${person.nome_completo}`}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF4E5] border border-[#FFD6A8] text-[#9A4200] hover:bg-[#FFE8CC] text-[13px] font-medium whitespace-nowrap transition-colors"
                      >
                        <Mail className="w-4 h-4 text-[#FE8100] shrink-0" aria-hidden="true" />
                        <span>E-mail</span>
                      </a>
                    </div>

                    <a
                      href={`/colaborador/${encodeURIComponent(person.id)}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectCollaborator(person.id);
                      }}
                      aria-label={`Ver mais detalhes de ${person.nome_completo}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FE8100] hover:bg-[#E57400] text-[#111827] text-xs font-semibold transition-colors"
                    >
                      <span>Ver mais</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Rodapé Institucional com apenas ícone discreto para /admin */}
      <footer className="shrink-0 border-t border-[#E2E8F0] bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4 text-xs text-[#64748B]">
          <p>© {new Date().getFullYear()} Lecasu · Energy and Engineering Solutions</p>
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              onNavigateAdmin();
            }}
            aria-label="Acesso administrativo"
            title="Acesso administrativo"
            className="p-1.5 rounded-md text-[#94A3B8] hover:text-[#111827] hover:bg-[#FFF4E5] transition-colors"
          >
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  );
}
