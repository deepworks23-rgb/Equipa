import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  Calendar,
  Check,
  Clock,
  Copy,
  Download,
  Globe,
  Hash,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  Share2,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useEffect, useMemo, useState } from 'react';
import {
  buildMailtoUrl,
  buildTelUrl,
  buildVCardContent,
  buildWhatsAppUrl,
  formatCompanyTenure,
  formatHiringDateLong,
  getAlternativePublicCollaborators,
  STATUS_META,
  type Collaborator,
} from '../utils/talentLogic';
import { CollaboratorAvatar } from './CollaboratorAvatar';
import { StatusChip } from './StatusChip';

interface CollaboratorProfilePageProps {
  collaborator: Collaborator | null;
  allCollaborators: Collaborator[];
  onSelectCollaborator: (id: string) => void;
  onBackToShowcase: () => void;
  onNavigateAdmin: () => void;
}

export function CollaboratorProfilePage({
  collaborator,
  allCollaborators,
  onSelectCollaborator,
  onBackToShowcase,
  onNavigateAdmin,
}: CollaboratorProfilePageProps) {
  const [copiedKey, setCopiedKey] = useState<'phone' | 'email' | 'share' | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const profileUrl = useMemo(() => {
    if (!collaborator || typeof window === 'undefined') return '';
    return `${window.location.origin}/colaborador/${encodeURIComponent(collaborator.id)}`;
  }, [collaborator]);

  useEffect(() => {
    let active = true;
    if (!profileUrl) {
      setQrDataUrl('');
      return;
    }
    QRCode.toDataURL(profileUrl, {
      width: 180,
      margin: 1,
      color: {
        dark: '#111827',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });

    return () => {
      active = false;
    };
  }, [profileUrl]);

  useEffect(() => {
    if (!copiedKey) return;
    const timer = window.setTimeout(() => setCopiedKey(null), 2000);
    return () => window.clearTimeout(timer);
  }, [copiedKey]);

  const alternativeColleagues = useMemo(() => {
    if (!collaborator || collaborator.status !== 'Férias') return [];
    return getAlternativePublicCollaborators(allCollaborators, collaborator, 3);
  }, [allCollaborators, collaborator]);

  const handleCopy = async (text: string, key: 'phone' | 'email' | 'share') => {
    let copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied) {
      try {
        const helper = document.createElement('textarea');
        helper.value = text;
        helper.setAttribute('readonly', 'true');
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        copied = document.execCommand('copy');
        document.body.removeChild(helper);
      } catch {
        copied = false;
      }
    }

    if (copied) {
      setCopiedKey(key);
    }
  };

  const handleDownloadVCard = () => {
    if (!collaborator) return;
    const vcardText = buildVCardContent(collaborator);
    const blob = new Blob([vcardText], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const slug = collaborator.nome_completo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${slug || collaborator.id}.vcf`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const hasProfileDetails = Boolean(
    collaborator &&
      (collaborator.bio?.trim() ||
        (collaborator.especialidades && collaborator.especialidades.length > 0) ||
        (collaborator.idiomas && collaborator.idiomas.length > 0)),
  );

  return (
    <div className="h-dvh w-full overflow-hidden flex flex-col bg-[#F8FAFC] text-[#111827]">
      {/* Cabeçalho Institucional Limpo */}
      <header className="shrink-0 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 h-12 sm:h-14 flex items-center justify-between gap-2 sm:gap-4">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onBackToShowcase();
            }}
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

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onBackToShowcase();
            }}
            className="shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#FFF4E5] hover:border-[#FE8100] text-xs sm:text-sm font-medium text-[#111827] whitespace-nowrap transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" aria-hidden="true" />
            <span className="sm:hidden">Voltar</span>
            <span className="hidden sm:inline">Voltar à Equipa</span>
          </a>
        </div>
      </header>

      {/* Conteúdo da Página Única do Colaborador em 100dvh */}
      <main className="flex-1 min-h-0 max-w-[1040px] w-full mx-auto px-3 sm:px-6 md:px-8 py-3 sm:py-5 md:py-6 overflow-y-auto overscroll-contain flex flex-col">
        {!collaborator ? (
          <div className="w-full max-w-lg m-auto shrink-0 bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 text-center shadow-level-2">
            <h1 className="font-display text-lg sm:text-xl font-bold text-[#111827]">
              Colaborador indisponível
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#64748B]">
              Este perfil não está disponível na vitrine pública ou o registo não foi encontrado.
            </p>
            <button
              type="button"
              onClick={onBackToShowcase}
              className="mt-5 sm:mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#FE8100] hover:bg-[#E57400] text-[#111827] text-sm font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Voltar à Vitrine Pública</span>
            </button>
          </div>
        ) : (
          <article
            data-testid="collaborator-profile-card"
            className="w-full shrink-0 bg-white border border-[#E2E8F0] rounded-xl shadow-level-2 overflow-hidden my-auto"
          >
            {/* Banner Superior do Perfil + Ações Rápidas */}
            <div className="p-4 sm:p-6 md:p-7 border-b border-[#E2E8F0] bg-[#FFFAF5] flex flex-col md:flex-row md:items-center md:justify-between gap-3.5 sm:gap-5">
              <div className="flex items-center gap-3.5 sm:gap-5 min-w-0 flex-1">
                <div className="rounded-full ring-2 ring-[#FE8100]/30 shrink-0">
                  <CollaboratorAvatar
                    fullName={collaborator.nome_completo}
                    avatarUrl={collaborator.foto_perfil}
                    sizeClass="h-16 w-16 sm:h-[84px] sm:w-[84px] md:h-24 md:w-24"
                    textSizeClass="text-lg sm:text-2xl md:text-3xl"
                  />
                </div>

                <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                  <div className="flex items-start justify-between md:justify-start md:items-center gap-2 sm:gap-3">
                    <div className="min-w-0">
                      <h1 className="font-display text-base sm:text-2xl md:text-[28px] font-bold text-[#111827] leading-tight break-words">
                        {collaborator.nome_completo}
                      </h1>
                      <p className="mt-0.5 text-xs sm:text-base font-medium text-[#44474E]">
                        {collaborator.cargo}
                      </p>
                    </div>

                    <div className="shrink-0 pt-0.5 md:pt-0">
                      <StatusChip status={collaborator.status} variant="public" compact />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs text-[#64748B]">
                    {collaborator.departamento?.trim() && (
                      <>
                        <span className="inline-flex items-center gap-1 font-medium text-[#44474E]">
                          <Building2
                            className="w-3.5 h-3.5 text-[#FE8100] shrink-0"
                            aria-hidden="true"
                          />
                          <span>{collaborator.departamento}</span>
                        </span>
                        <span aria-hidden="true" className="text-[#CBD5E1]">
                          ·
                        </span>
                      </>
                    )}
                    <span className="inline-flex items-center gap-0.5 font-mono tabular-nums text-[#64748B]">
                      <Hash className="w-3 h-3 text-[#FE8100] shrink-0" aria-hidden="true" />
                      <span>{collaborator.id}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Guardar na Agenda (.vcf) & Partilhar Link */}
              <div className="flex flex-row md:flex-col items-stretch gap-2 shrink-0 w-full md:w-auto">
                <button
                  type="button"
                  data-testid="download-vcard-btn"
                  onClick={handleDownloadVCard}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 rounded-lg bg-[#111827] hover:bg-[#1F2937] text-white text-xs font-medium whitespace-nowrap transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#FE8100] shrink-0" aria-hidden="true" />
                  <span className="sm:hidden">Guardar (.vcf)</span>
                  <span className="hidden sm:inline">Guardar na Agenda (.vcf)</span>
                </button>

                <button
                  type="button"
                  data-testid="share-profile-btn"
                  onClick={() => handleCopy(profileUrl, 'share')}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#FFF4E5] hover:border-[#FE8100] text-[#111827] text-xs font-medium whitespace-nowrap transition-colors"
                >
                  {copiedKey === 'share' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0" aria-hidden="true" />
                      <span className="text-[#065F46] font-semibold">Link copiado!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-[#FE8100] shrink-0" aria-hidden="true" />
                      <span className="sm:hidden">Partilhar</span>
                      <span className="hidden sm:inline">Partilhar Perfil</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Corpo de Informações do Colaborador */}
            <div className="p-4 sm:p-6 md:p-7 space-y-4 sm:space-y-5">
              {/* Resumo Profissional, Especialidades e Idiomas */}
              {hasProfileDetails && (
                <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 sm:p-4 space-y-3">
                  {collaborator.bio?.trim() && (
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                        <Sparkles className="w-3.5 h-3.5 text-[#FE8100]" aria-hidden="true" />
                        <span>Resumo Profissional</span>
                      </p>
                      <p className="mt-1.5 text-xs sm:text-sm text-[#1E293B] leading-relaxed">
                        {collaborator.bio}
                      </p>
                    </div>
                  )}

                  {((collaborator.especialidades && collaborator.especialidades.length > 0) ||
                    (collaborator.idiomas && collaborator.idiomas.length > 0)) && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      {collaborator.especialidades && collaborator.especialidades.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-medium text-[#64748B] mr-1">
                            Especialidades:
                          </span>
                          {collaborator.especialidades.map((spec) => (
                            <span
                              key={spec}
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#FFF4E5] border border-[#FFD6A8] text-[11px] font-medium text-[#9A4200]"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}

                      {collaborator.idiomas && collaborator.idiomas.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                          <Globe className="w-3.5 h-3.5 text-[#FE8100]" aria-hidden="true" />
                          <span className="text-[11px] font-medium text-[#64748B]">Idiomas:</span>
                          {collaborator.idiomas.map((lang) => (
                            <span
                              key={lang}
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-[#E2E8F0] text-[11px] font-medium text-[#111827]"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Detalhes do Colaborador em Flexbox */}
              <div className="flex flex-wrap items-stretch gap-2.5 sm:gap-3.5">
                <div className="w-full sm:w-[calc(50%-7px)] lg:w-[calc((100%-28px)/3)] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 sm:p-4 flex flex-col">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                    <Briefcase className="w-3.5 h-3.5 text-[#FE8100] shrink-0" aria-hidden="true" />
                    <span>Cargo / Função</span>
                  </p>
                  <p className="mt-1 font-display text-sm font-semibold text-[#111827]">
                    {collaborator.cargo}
                  </p>
                  {collaborator.departamento?.trim() && (
                    <p className="mt-0.5 text-xs text-[#64748B]">{collaborator.departamento}</p>
                  )}
                </div>

                <div className="w-full sm:w-[calc(50%-7px)] lg:w-[calc((100%-28px)/3)] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 sm:p-4 flex flex-col">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                    <Calendar className="w-3.5 h-3.5 text-[#FE8100] shrink-0" aria-hidden="true" />
                    <span>Tempo de Empresa</span>
                  </p>
                  <p className="mt-1 font-display text-sm font-semibold text-[#111827] tabular-nums">
                    {formatCompanyTenure(collaborator)}
                  </p>
                  <p className="mt-0.5 text-xs text-[#64748B] tabular-nums">
                    Desde {formatHiringDateLong(collaborator)}
                  </p>
                </div>

                <div className="w-full sm:w-[calc(50%-7px)] lg:w-[calc((100%-28px)/3)] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 sm:p-4 flex flex-col">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                    <UserCheck className="w-3.5 h-3.5 text-[#FE8100] shrink-0" aria-hidden="true" />
                    <span>Estado de Atendimento</span>
                  </p>
                  <p className="mt-1 font-display text-sm font-semibold text-[#111827]">
                    {STATUS_META[collaborator.status].publicLabel}
                  </p>
                  <p className="mt-0.5 text-xs text-[#64748B]">
                    {collaborator.status === 'Ativo'
                      ? 'Colaborador ativo e disponível para contacto direto.'
                      : 'Em período de férias. Veja colegas disponíveis abaixo.'}
                  </p>
                </div>

                <div className="w-full sm:w-[calc(50%-7px)] lg:w-[calc((100%-28px)/3)] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 sm:p-4 flex flex-col">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                    <MapPin className="w-3.5 h-3.5 text-[#FE8100] shrink-0" aria-hidden="true" />
                    <span>Localização &amp; Horário</span>
                  </p>
                  <p className="mt-1 font-display text-sm font-semibold text-[#111827]">
                    {collaborator.localizacao?.trim() || 'Sede / Atendimento Remoto'}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-[#64748B]">
                    <Clock className="w-3 h-3 text-[#FE8100] shrink-0" aria-hidden="true" />
                    <span>
                      {collaborator.horario_atendimento?.trim() || 'Horário comercial padrão'}
                    </span>
                  </p>
                </div>

                <div className="w-full sm:w-[calc(50%-7px)] lg:w-[calc((100%-28px)/3)] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 sm:p-4 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                      <Phone className="w-3.5 h-3.5 text-[#FE8100] shrink-0" aria-hidden="true" />
                      <span>Telefone / WhatsApp</span>
                    </p>
                    <a
                      href={buildTelUrl(collaborator.telefone)}
                      className="mt-1 block font-display text-sm font-semibold text-[#C25900] hover:underline tabular-nums truncate"
                    >
                      {collaborator.telefone}
                    </a>
                  </div>
                  <button
                    type="button"
                    data-testid="copy-phone-btn"
                    onClick={() => handleCopy(collaborator.telefone, 'phone')}
                    aria-label="Copiar telefone"
                    className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[#E2E8F0] bg-white hover:border-[#FE8100] text-[11px] font-medium text-[#44474E]"
                  >
                    {copiedKey === 'phone' ? (
                      <>
                        <Check className="w-3 h-3 text-[#10B981]" aria-hidden="true" />
                        <span className="text-[#065F46]">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" aria-hidden="true" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="w-full sm:w-[calc(50%-7px)] lg:w-[calc((100%-28px)/3)] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 sm:p-4 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-[#64748B]">
                      <Mail className="w-3.5 h-3.5 text-[#FE8100] shrink-0" aria-hidden="true" />
                      <span>E-mail Corporativo</span>
                    </p>
                    <a
                      href={buildMailtoUrl(collaborator.email)}
                      className="mt-1 block font-display text-[13px] font-semibold text-[#C25900] hover:underline break-all"
                    >
                      {collaborator.email}
                    </a>
                  </div>
                  <button
                    type="button"
                    data-testid="copy-email-btn"
                    onClick={() => handleCopy(collaborator.email, 'email')}
                    aria-label="Copiar e-mail"
                    className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[#E2E8F0] bg-white hover:border-[#FE8100] text-[11px] font-medium text-[#44474E]"
                  >
                    {copiedKey === 'email' ? (
                      <>
                        <Check className="w-3 h-3 text-[#10B981]" aria-hidden="true" />
                        <span className="text-[#065F46]">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" aria-hidden="true" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Atendimento Alternativo quando Em Férias */}
              {collaborator.status === 'Férias' && alternativeColleagues.length > 0 && (
                <section
                  data-testid="vacation-alternative-contacts"
                  className="rounded-lg border border-[#FCD34D] bg-[#FFFBEB] p-3.5 sm:p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#B45309] shrink-0" aria-hidden="true" />
                    <div className="min-w-0">
                      <h2 className="font-display text-xs sm:text-sm font-semibold text-[#92400E]">
                        Colaborador em férias — Atendimento alternativo disponível
                      </h2>
                      <p className="text-[11px] sm:text-xs text-[#92400E]/85">
                        Para suporte imediato, pode contactar um dos seguintes colegas disponíveis:
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-stretch gap-2.5">
                    {alternativeColleagues.map((peer) => (
                      <div
                        key={peer.id}
                        className="w-full sm:w-[calc(50%-5px)] md:w-[calc((100%-20px)/3)] rounded-lg bg-white border border-[#FDE68A] p-2.5 flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <CollaboratorAvatar
                            fullName={peer.nome_completo}
                            avatarUrl={peer.foto_perfil}
                            sizeClass="h-9 w-9"
                            textSizeClass="text-xs"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-xs font-semibold text-[#111827] truncate">
                              {peer.nome_completo}
                            </p>
                            <p className="text-[11px] text-[#64748B] truncate">{peer.cargo}</p>
                          </div>
                        </div>

                        <div className="flex flex-row items-center gap-1.5">
                          <a
                            href={buildWhatsAppUrl(peer.telefone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-2 py-1 rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[11px] font-medium hover:bg-[#D1FAE5] whitespace-nowrap"
                          >
                            <MessageCircle className="w-3 h-3 text-[#10B981] shrink-0" aria-hidden="true" />
                            <span>WhatsApp</span>
                          </a>

                          <a
                            href={`/colaborador/${encodeURIComponent(peer.id)}`}
                            onClick={(e) => {
                              e.preventDefault();
                              onSelectCollaborator(peer.id);
                            }}
                            className="flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-2 py-1 rounded bg-[#FE8100] hover:bg-[#E57400] text-[#111827] text-[11px] font-semibold whitespace-nowrap"
                          >
                            <span>Ver perfil</span>
                            <ArrowRight className="w-3 h-3 shrink-0" aria-hidden="true" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Canais de Contacto Direto + Código QR em Flexbox */}
              <div className="pt-3.5 sm:pt-4 border-t border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0 flex flex-col gap-2.5 sm:gap-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                    <BadgeCheck className="w-3.5 h-3.5 text-[#FE8100] shrink-0" aria-hidden="true" />
                    <span>Canais de Contacto Direto</span>
                  </p>

                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch gap-2.5 sm:gap-3">
                    <a
                      href={buildWhatsAppUrl(collaborator.telefone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] hover:bg-[#D1FAE5] text-xs sm:text-sm font-medium whitespace-nowrap transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-[#10B981] shrink-0" aria-hidden="true" />
                      <span>Conversar no WhatsApp</span>
                    </a>

                    <a
                      href={buildTelUrl(collaborator.telefone)}
                      className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-[#111827] text-white hover:bg-[#1F2937] text-xs sm:text-sm font-medium whitespace-nowrap transition-colors"
                    >
                      <Phone className="w-4 h-4 text-[#FE8100] shrink-0" aria-hidden="true" />
                      <span>Ligar Agora</span>
                    </a>

                    <a
                      href={buildMailtoUrl(collaborator.email)}
                      className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-[#FE8100] hover:bg-[#E57400] text-[#111827] text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors"
                    >
                      <Mail className="w-4 h-4 text-[#111827] shrink-0" aria-hidden="true" />
                      <span>Enviar E-mail</span>
                    </a>
                  </div>
                </div>

                {qrDataUrl && (
                  <div className="shrink-0 flex flex-row md:flex-col items-center gap-3 md:gap-1.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5">
                    <img
                      src={qrDataUrl}
                      alt={`Código QR do perfil de ${collaborator.nome_completo}`}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded border border-[#E2E8F0] bg-white p-1 shrink-0"
                    />
                    <div className="md:text-center">
                      <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#111827]">
                        <QrCode className="w-3 h-3 text-[#FE8100]" aria-hidden="true" />
                        <span>Aceder no telemóvel</span>
                      </p>
                      <p className="text-[10px] text-[#64748B] md:hidden">
                        Leia o código QR para abrir este perfil diretamente no seu smartphone.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>
        )}
      </main>

      {/* Rodapé Institucional */}
      <footer className="shrink-0 border-t border-[#E2E8F0] bg-white">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4 text-[11px] sm:text-xs text-[#64748B]">
          <p className="truncate">© {new Date().getFullYear()} Lecasu · Energy and Engineering Solutions</p>
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              onNavigateAdmin();
            }}
            aria-label="Acesso administrativo"
            title="Acesso administrativo"
            className="shrink-0 p-1.5 rounded-md text-[#94A3B8] hover:text-[#111827] hover:bg-[#FFF4E5] transition-colors"
          >
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>
      </footer>
    </div>
  );
}
