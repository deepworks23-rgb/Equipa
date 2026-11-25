import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Calendar,
  Hash,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  UserCheck,
} from 'lucide-react';
import {
  buildMailtoUrl,
  buildTelUrl,
  buildWhatsAppUrl,
  formatCompanyTenure,
  STATUS_META,
  type Collaborator,
} from '../utils/talentLogic';
import { CollaboratorAvatar } from './CollaboratorAvatar';
import { StatusChip } from './StatusChip';

interface CollaboratorProfilePageProps {
  collaborator: Collaborator | null;
  onBackToShowcase: () => void;
  onNavigateAdmin: () => void;
}

function getYearsCountLabel(anoContratacao: number): string {
  const diff = new Date().getFullYear() - anoContratacao;
  if (diff <= 0) return 'Integrado este ano';
  if (diff === 1) return '1 ano de casa';
  return `${diff} anos de casa`;
}

export function CollaboratorProfilePage({
  collaborator,
  onBackToShowcase,
  onNavigateAdmin,
}: CollaboratorProfilePageProps) {
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#F8FAFC] text-[#1E293B]">
      {/* Cabeçalho Institucional Limpo */}
      <header className="shrink-0 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onBackToShowcase();
            }}
            className="inline-flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-[#0F294A] whitespace-nowrap"
          >
            <span
              className="h-8 w-8 rounded-lg bg-[#0F294A] text-white flex items-center justify-center text-sm font-bold"
              aria-hidden="true"
            >
              M
            </span>
            <span>A Nossa Equipa</span>
          </a>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onBackToShowcase();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-xs sm:text-sm font-medium text-[#0F294A] whitespace-nowrap transition-colors"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Voltar à Equipa</span>
          </a>
        </div>
      </header>

      {/* Conteúdo da Página Única do Colaborador em 100vh */}
      <main className="flex-1 min-h-0 max-w-[1040px] w-full mx-auto px-4 md:px-8 py-4 md:py-6 overflow-y-auto flex flex-col">
        {!collaborator ? (
          <div className="w-full max-w-lg m-auto bg-white border border-[#E2E8F0] rounded-xl p-8 text-center shadow-level-2">
            <h1 className="font-display text-xl font-bold text-[#0F294A]">
              Colaborador indisponível
            </h1>
            <p className="mt-2 text-sm text-[#64748B]">
              Este perfil não está disponível na vitrine pública ou o registo não foi encontrado.
            </p>
            <button
              type="button"
              onClick={onBackToShowcase}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0F294A] hover:bg-[#1E3A8A] text-white text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Voltar à Vitrine Pública</span>
            </button>
          </div>
        ) : (
          <article
            data-testid="collaborator-profile-card"
            className="w-full bg-white border border-[#E2E8F0] rounded-xl shadow-level-2 overflow-hidden my-auto"
          >
            {/* Banner Superior do Perfil */}
            <div className="p-6 md:p-8 border-b border-[#E2E8F0] bg-[#F8FAFC]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4 md:gap-5 min-w-0">
                <CollaboratorAvatar
                  fullName={collaborator.nome_completo}
                  avatarUrl={collaborator.foto_perfil}
                  sizeClass="h-20 w-20 md:h-24 md:w-24"
                  textSizeClass="text-2xl"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <StatusChip status={collaborator.status} variant="public" />
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#64748B] bg-white border border-[#E2E8F0] px-2 py-0.5 rounded-md tabular-nums">
                      <Hash className="w-3 h-3" aria-hidden="true" />
                      {collaborator.id}
                    </span>
                  </div>
                  <h1 className="mt-2 font-display text-2xl md:text-[28px] font-bold text-[#0B1C30] leading-tight">
                    {collaborator.nome_completo}
                  </h1>
                  <p className="mt-0.5 text-sm md:text-base font-medium text-[#44474E]">
                    {collaborator.cargo}
                  </p>
                </div>
              </div>
            </div>

            {/* Todos os Detalhes do Colaborador */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                    <Briefcase className="w-3.5 h-3.5 text-[#0058BE]" aria-hidden="true" />
                    <span>Cargo / Função</span>
                  </p>
                  <p className="mt-1.5 font-display text-sm font-semibold text-[#0B1C30]">
                    {collaborator.cargo}
                  </p>
                </div>

                <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                    <Calendar className="w-3.5 h-3.5 text-[#0058BE]" aria-hidden="true" />
                    <span>Tempo de Empresa</span>
                  </p>
                  <p className="mt-1.5 font-display text-sm font-semibold text-[#0B1C30] tabular-nums">
                    {formatCompanyTenure(collaborator.ano_contratacao)}
                  </p>
                  <p className="mt-0.5 text-xs text-[#64748B] tabular-nums">
                    Ano de contratação: {collaborator.ano_contratacao} ·{' '}
                    {getYearsCountLabel(collaborator.ano_contratacao)}
                  </p>
                </div>

                <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                    <UserCheck className="w-3.5 h-3.5 text-[#0058BE]" aria-hidden="true" />
                    <span>Estado de Atendimento</span>
                  </p>
                  <p className="mt-1.5 font-display text-sm font-semibold text-[#0B1C30]">
                    {STATUS_META[collaborator.status].publicLabel}
                  </p>
                  <p className="mt-0.5 text-xs text-[#64748B]">
                    {collaborator.status === 'Ativo'
                      ? 'Colaborador ativo e disponível para contacto direto.'
                      : 'Colaborador em período de férias.'}
                  </p>
                </div>

                <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                    <Phone className="w-3.5 h-3.5 text-[#0058BE]" aria-hidden="true" />
                    <span>Telefone / WhatsApp</span>
                  </p>
                  <a
                    href={buildTelUrl(collaborator.telefone)}
                    className="mt-1.5 block font-display text-sm font-semibold text-[#0058BE] hover:underline tabular-nums"
                  >
                    {collaborator.telefone}
                  </a>
                </div>

                <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 sm:col-span-2">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                    <Mail className="w-3.5 h-3.5 text-[#0058BE]" aria-hidden="true" />
                    <span>E-mail Corporativo</span>
                  </p>
                  <a
                    href={buildMailtoUrl(collaborator.email)}
                    className="mt-1.5 block font-display text-sm font-semibold text-[#0058BE] hover:underline break-all"
                  >
                    {collaborator.email}
                  </a>
                </div>
              </div>

              {/* Canais de Contacto Direto */}
              <div className="pt-4 border-t border-[#E2E8F0]">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-3">
                  <BadgeCheck className="w-3.5 h-3.5 text-[#0058BE]" aria-hidden="true" />
                  <span>Canais de Contacto Direto</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a
                    href={buildWhatsAppUrl(collaborator.telefone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] hover:bg-[#D1FAE5] text-sm font-medium transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-[#10B981] shrink-0" aria-hidden="true" />
                    <span>Conversar no WhatsApp</span>
                  </a>

                  <a
                    href={buildTelUrl(collaborator.telefone)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F294A] hover:bg-[#E2E8F0] text-sm font-medium transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[#0F294A] shrink-0" aria-hidden="true" />
                    <span>Ligar Agora</span>
                  </a>

                  <a
                    href={buildMailtoUrl(collaborator.email)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8] hover:bg-[#DBEAFE] text-sm font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4 text-[#1D4ED8] shrink-0" aria-hidden="true" />
                    <span>Enviar E-mail</span>
                  </a>
                </div>
              </div>
            </div>
          </article>
        )}
      </main>

      {/* Rodapé Institucional */}
      <footer className="shrink-0 border-t border-[#E2E8F0] bg-white">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4 text-xs text-[#64748B]">
          <p>© {new Date().getFullYear()} Meridian Corporação · Diretório Oficial de Equipa</p>
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              onNavigateAdmin();
            }}
            aria-label="Acesso administrativo"
            title="Acesso administrativo"
            className="p-1.5 rounded-md text-[#94A3B8] hover:text-[#0F294A] hover:bg-[#F1F5F9] transition-colors"
          >
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  );
}
