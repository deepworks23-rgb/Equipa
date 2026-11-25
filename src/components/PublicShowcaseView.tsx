import { ArrowRight, Calendar, ChevronDown, Mail, MessageCircle, Phone, Search, X } from 'lucide-react';
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
}

export function PublicShowcaseView({
  collaborators,
  onSelectCollaborator,
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
    <div className="h-dvh w-full overflow-hidden flex flex-col bg-[#F8FAFC] text-[#111827]">
      {/* Cabeçalho Institucional Limpo — Sem menus administrativos */}
      <header className="shrink-0 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 h-12 sm:h-14 flex items-center justify-between gap-2 sm:gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 sm:gap-3 min-w-0 flex-1 font-display text-sm sm:text-lg font-bold tracking-tight text-[#111827]"
          >
            <img
              src="/assets/aistudio/logo-transparent_81b43745.png"
              alt="Lecasu — Energy and Engineering Solutions"
              className="h-6 sm:h-8 md:h-9 w-auto object-contain shrink-0"
            />
            <span className="h-4 sm:h-5 w-px bg-[#E2E8F0] shrink-0" aria-hidden="true" />
            <span className="truncate">A Nossa Equipa</span>
          </a>

          <p
            data-testid="public-count"
            className="shrink-0 text-[11px] sm:text-xs text-[#64748B] tabular-nums whitespace-nowrap"
          >
            <span className="hidden sm:inline">A exibir </span>
            <strong className="text-[#111827] font-semibold">{visibleCollaborators.length}</strong>{' '}
            <span className="hidden sm:inline">
              {visibleCollaborators.length === 1 ? 'colaborador' : 'colaboradores'}
            </span>
            <span className="sm:hidden">
              {visibleCollaborators.length === 1 ? 'colab.' : 'colabs.'}
            </span>
          </p>
        </div>
      </header>

      <main className="flex-1 min-h-0 max-w-[1440px] w-full mx-auto px-3 sm:px-4 md:px-8 py-2 sm:py-4 flex flex-col gap-2 sm:gap-4 overflow-hidden">
        {/* Barra de Pesquisa à esquerda e Filtro Dropdown à direita (em linha única também no mobile) */}
        <div className="shrink-0 bg-white border border-[#E2E8F0] rounded-lg p-1.5 sm:p-3 shadow-level-1 flex flex-row items-center gap-1.5 sm:gap-3">
          <div className="relative flex-1 min-w-0">
            <label htmlFor="public-search" className="sr-only">
              Pesquisar por nome ou cargo
            </label>
            <Search
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#64748B] absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="public-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nome ou cargo..."
              className="w-full h-9 sm:h-10 pl-8 sm:pl-10 pr-7 sm:pr-9 rounded-md sm:rounded-lg border border-[#CBD5E1] bg-white text-xs sm:text-sm text-[#111827] placeholder:text-[#64748B] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Limpar pesquisa"
                className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9]"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

          <div className="relative shrink-0 w-[134px] sm:w-64">
            <label htmlFor="public-role-filter" className="sr-only">
              Filtrar por cargo
            </label>
            <select
              id="public-role-filter"
              aria-label="Filtrar por cargo"
              value={activeCargo}
              onChange={(e) => setSelectedCargo(e.target.value)}
              className="w-full h-9 sm:h-10 pl-2.5 sm:pl-3.5 pr-7 sm:pr-9 rounded-md sm:rounded-lg border border-[#CBD5E1] bg-white text-xs sm:text-sm font-medium text-[#111827] truncate appearance-none cursor-pointer focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
            >
              <option value="Todos">Todos os cargos</option>
              {dynamicRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#64748B] absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Grelha de Cartões (3 a 4 colunas no desktop, 1 a 2 no telemóvel) com scroll interno dentro de 100dvh */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-0.5 pb-1">
          {visibleCollaborators.length === 0 ? (
            <div className="h-full min-h-[200px] flex flex-col items-center justify-center bg-white border border-[#E2E8F0] rounded-lg p-6 sm:p-8 text-center shadow-level-1">
              <h2 className="font-display text-base sm:text-lg font-semibold text-[#111827]">
                Nenhum colaborador encontrado
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-[#64748B] max-w-md mx-auto">
                Não existem colaboradores correspondentes aos critérios selecionados.
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setSelectedCargo('Todos');
                  }}
                  className="mt-4 sm:mt-5 px-4 py-2 rounded-lg bg-[#FE8100] hover:bg-[#E57400] text-[#111827] text-sm font-semibold transition-colors"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          ) : (
            <div
              data-testid="public-showcase-grid"
              className="flex flex-wrap items-stretch gap-2.5 sm:gap-3.5"
            >
              {visibleCollaborators.map((person) => (
                <article
                  key={person.id}
                  className="collaborator-card w-full sm:w-[calc(50%-7px)] lg:w-[calc((100%-28px)/3)] xl:w-[calc((100%-42px)/4)] bg-white border border-[#E2E8F0] rounded-lg overflow-hidden flex flex-col justify-between"
                >
                  {/* Cabeçalho do Cartão: Foto à esquerda, Texto ao lado e Status à direita */}
                  <div className="bg-[#FFFAF5] border-b border-[#E2E8F0] px-3 py-2.5 sm:px-3.5 sm:py-3 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <div className="rounded-full ring-2 ring-[#FE8100]/25 shrink-0">
                        <CollaboratorAvatar
                          fullName={person.nome_completo}
                          avatarUrl={person.foto_perfil}
                          sizeClass="h-14 w-14 sm:h-16 sm:w-16"
                          textSizeClass="text-base sm:text-lg"
                        />
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col">
                        <h2
                          title={person.nome_completo}
                          className="font-display text-sm sm:text-[15px] font-semibold leading-tight text-[#111827] line-clamp-2 break-words"
                        >
                          {person.nome_completo}
                        </h2>
                        <p
                          title={person.cargo}
                          className="text-xs text-[#64748B] mt-0.5 leading-snug line-clamp-2 break-words"
                        >
                          {person.cargo}
                        </p>
                      </div>
                    </div>

                    <StatusChip status={person.status} variant="public" compact />
                  </div>

                  {/* Corpo do Cartão: Tempo de empresa, Telefone e Botões */}
                  <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between gap-2.5">
                    <div className="flex flex-col gap-1 text-xs text-[#44474E]">
                      <p
                        className="flex items-center gap-1.5 sm:gap-2 tabular-nums"
                        title={`Contratado em ${person.data_contratacao ?? person.ano_contratacao}`}
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#FE8100] shrink-0" aria-hidden="true" />
                        <span>{formatCompanyTenure(person)}</span>
                      </p>
                      <p className="flex items-center gap-1.5 sm:gap-2 tabular-nums">
                        <Phone className="w-3.5 h-3.5 text-[#FE8100] shrink-0" aria-hidden="true" />
                        <a
                          href={buildTelUrl(person.telefone)}
                          className="hover:text-[#C25900] hover:underline"
                        >
                          {person.telefone}
                        </a>
                      </p>
                    </div>

                    {/* Botões de Contacto Direto e Ver mais em Flexbox */}
                    <div className="flex flex-col gap-1.5 sm:gap-2 pt-0.5">
                      <div className="flex flex-row items-center gap-1.5 sm:gap-2">
                        <a
                          href={buildWhatsAppUrl(person.telefone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Contactar ${person.nome_completo} por WhatsApp`}
                          className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] hover:bg-[#D1FAE5] text-xs sm:text-[13px] font-medium whitespace-nowrap transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#10B981] shrink-0" aria-hidden="true" />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={buildMailtoUrl(person.email)}
                          aria-label={`Enviar e-mail para ${person.nome_completo}`}
                          className="flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#FFF4E5] border border-[#FFD6A8] text-[#9A4200] hover:bg-[#FFE8CC] text-xs sm:text-[13px] font-medium whitespace-nowrap transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FE8100] shrink-0" aria-hidden="true" />
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
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Rodapé Institucional Limpo — Sem links administrativos */}
      <footer className="shrink-0 border-t border-[#E2E8F0] bg-white">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 py-2 sm:py-3 flex items-center justify-center text-center text-[11px] sm:text-xs text-[#64748B]">
          <p className="truncate">© {new Date().getFullYear()} Lecasu · Energy and Engineering Solutions</p>
        </div>
      </footer>
    </div>
  );
}
