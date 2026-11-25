import { Upload, X } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  COLLABORATOR_STATUSES,
  formatCompanyTenure,
  formatHiringDateLong,
  formatTagList,
  parseIsoDateParts,
  parseTagList,
  resolveCollaboratorHireDate,
  toIsoDateString,
  validateCollaboratorInput,
  type Collaborator,
  type CollaboratorInput,
  type CollaboratorStatus,
} from '../utils/talentLogic';
import { CollaboratorAvatar } from './CollaboratorAvatar';

interface CollaboratorFormModalProps {
  mode: 'create' | 'edit';
  initialCollaborator?: Collaborator | null;
  onClose: () => void;
  onSubmit: (data: CollaboratorInput, existingId?: string) => void;
}

export function CollaboratorFormModal({
  mode,
  initialCollaborator,
  onClose,
  onSubmit,
}: CollaboratorFormModalProps) {
  const today = new Date();
  const todayIso = toIsoDateString(today);
  const currentYear = today.getFullYear();

  const [form, setForm] = useState<CollaboratorInput>(() => {
    if (mode === 'edit' && initialCollaborator) {
      const resolvedDate = resolveCollaboratorHireDate(initialCollaborator);
      return {
        nome_completo: initialCollaborator.nome_completo,
        cargo: initialCollaborator.cargo,
        telefone: initialCollaborator.telefone,
        email: initialCollaborator.email,
        ano_contratacao: initialCollaborator.ano_contratacao,
        data_contratacao: resolvedDate,
        status: initialCollaborator.status,
        foto_perfil: initialCollaborator.foto_perfil ?? '',
        departamento: initialCollaborator.departamento ?? '',
        localizacao: initialCollaborator.localizacao ?? '',
        horario_atendimento: initialCollaborator.horario_atendimento ?? '',
        idiomas: initialCollaborator.idiomas ?? [],
        especialidades: initialCollaborator.especialidades ?? [],
        bio: initialCollaborator.bio ?? '',
      };
    }

    return {
      nome_completo: '',
      cargo: '',
      telefone: '',
      email: '',
      ano_contratacao: currentYear,
      data_contratacao: todayIso,
      status: 'Ativo',
      foto_perfil: '',
      departamento: '',
      localizacao: '',
      horario_atendimento: '',
      idiomas: [],
      especialidades: [],
      bio: '',
    };
  });

  const [idiomasInput, setIdiomasInput] = useState<string>(() =>
    mode === 'edit' && initialCollaborator ? formatTagList(initialCollaborator.idiomas) : '',
  );
  const [especialidadesInput, setEspecialidadesInput] = useState<string>(() =>
    mode === 'edit' && initialCollaborator
      ? formatTagList(initialCollaborator.especialidades)
      : '',
  );

  const [errors, setErrors] = useState<Partial<Record<keyof CollaboratorInput, string>>>({});

  const updateField = <K extends keyof CollaboratorInput>(key: K, value: CollaboratorInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        foto_perfil: 'Selecione um ficheiro de imagem válido (JPG, PNG, WEBP).',
      }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateField('foto_perfil', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleHireDateChange = (nextDate: string) => {
    const parsed = parseIsoDateParts(nextDate);
    setForm((prev) => ({
      ...prev,
      data_contratacao: nextDate,
      ano_contratacao: parsed ? parsed.year : prev.ano_contratacao,
    }));
    if (errors.data_contratacao || errors.ano_contratacao) {
      setErrors((prev) => ({
        ...prev,
        data_contratacao: undefined,
        ano_contratacao: undefined,
      }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedLanguages = parseTagList(idiomasInput);
    const parsedSpecialties = parseTagList(especialidadesInput);
    const rawHireDate = (form.data_contratacao ?? '').trim();
    const parsedHireDate = parseIsoDateParts(rawHireDate);

    const payload: CollaboratorInput = {
      nome_completo: form.nome_completo.trim(),
      cargo: form.cargo.trim(),
      telefone: form.telefone.trim(),
      email: form.email.trim(),
      data_contratacao: rawHireDate,
      ano_contratacao: parsedHireDate ? parsedHireDate.year : Number(form.ano_contratacao) || currentYear,
      status: form.status,
      foto_perfil: form.foto_perfil?.trim() || '',
      departamento: form.departamento?.trim() || '',
      localizacao: form.localizacao?.trim() || '',
      horario_atendimento: form.horario_atendimento?.trim() || '',
      idiomas: parsedLanguages,
      especialidades: parsedSpecialties,
      bio: form.bio?.trim() || '',
    };

    const validation = validateCollaboratorInput(payload, today);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit(payload, mode === 'edit' ? initialCollaborator?.id : undefined);
  };

  const rawHireDate = (form.data_contratacao ?? '').trim();
  const isLiveHireDateValid =
    Boolean(parseIsoDateParts(rawHireDate)) &&
    rawHireDate >= '1980-01-01' &&
    rawHireDate <= todayIso;
  const bioLength = form.bio?.length ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#111827]/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="collaborator-form-title"
    >
      <div className="bg-white w-full max-w-2xl rounded-xl border border-[#E2E8F0] shadow-level-3 max-h-[92dvh] flex flex-col overflow-hidden">
        <div className="shrink-0 px-5 sm:px-6 py-4 sm:py-5 border-b border-[#E2E8F0] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="collaborator-form-title"
              className="font-display text-lg sm:text-xl font-semibold text-[#111827] truncate"
            >
              {mode === 'create'
                ? 'Novo Colaborador'
                : `Editar ${initialCollaborator?.nome_completo}`}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Preencha os dados obrigatórios e complete o perfil público da página "Ver mais".
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar formulário"
            className="shrink-0 p-1.5 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Pré-visualização e Upload/URL de Foto */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <CollaboratorAvatar
              fullName={form.nome_completo || 'Novo Colaborador'}
              avatarUrl={form.foto_perfil}
              sizeClass="h-16 w-16"
              textSizeClass="text-lg"
            />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#FFF4E5] hover:border-[#FE8100] text-xs font-medium text-[#111827] cursor-pointer">
                  <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Carregar Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </label>

                {form.foto_perfil && (
                  <button
                    type="button"
                    onClick={() => updateField('foto_perfil', '')}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#991B1B] hover:bg-[#FEE2E2]/60"
                  >
                    Remover Foto
                  </button>
                )}
              </div>

              <div>
                <label htmlFor="field-foto" className="sr-only">
                  URL da foto de perfil (opcional)
                </label>
                <input
                  id="field-foto"
                  type="url"
                  value={form.foto_perfil ?? ''}
                  onChange={(e) => updateField('foto_perfil', e.target.value)}
                  placeholder="Ou cole o URL da imagem (opcional — vazio gera iniciais)"
                  className="w-full h-9 px-3 rounded-lg border border-[#CBD5E1] bg-white text-xs text-[#1E293B] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
                />
              </div>
              {errors.foto_perfil && (
                <p className="text-xs text-[#BA1A1A]">{errors.foto_perfil}</p>
              )}
            </div>
          </div>

          {/* Dados Principais */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#64748B] mb-3">
              Dados Principais
            </p>
            <div className="flex flex-wrap gap-3.5">
              <div className="w-full">
                <label
                  htmlFor="field-nome"
                  className="block text-xs font-medium text-[#1E293B] mb-1.5"
                >
                  Nome Completo *
                </label>
                <input
                  id="field-nome"
                  type="text"
                  value={form.nome_completo}
                  onChange={(e) => updateField('nome_completo', e.target.value)}
                  placeholder="ex.: Mariana Costa"
                  className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
                />
                {errors.nome_completo && (
                  <p className="mt-1 text-xs text-[#BA1A1A]">{errors.nome_completo}</p>
                )}
              </div>

              <div className="w-full sm:w-[calc(50%-7px)]">
                <label
                  htmlFor="field-cargo"
                  className="block text-xs font-medium text-[#1E293B] mb-1.5"
                >
                  Cargo *
                </label>
                <input
                  id="field-cargo"
                  type="text"
                  value={form.cargo}
                  onChange={(e) => updateField('cargo', e.target.value)}
                  placeholder="ex.: Consultor Comercial"
                  className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
                />
                {errors.cargo && <p className="mt-1 text-xs text-[#BA1A1A]">{errors.cargo}</p>}
              </div>

              <div className="w-full sm:w-[calc(50%-7px)]">
                <label
                  htmlFor="field-telefone"
                  className="block text-xs font-medium text-[#1E293B] mb-1.5"
                >
                  Telefone / WhatsApp (com DDI) *
                </label>
                <input
                  id="field-telefone"
                  type="tel"
                  value={form.telefone}
                  onChange={(e) => updateField('telefone', e.target.value)}
                  placeholder="ex.: +258 84 123 4567"
                  className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm tabular-nums text-[#1E293B] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
                />
                {errors.telefone && (
                  <p className="mt-1 text-xs text-[#BA1A1A]">{errors.telefone}</p>
                )}
              </div>

              <div className="w-full">
                <label
                  htmlFor="field-email"
                  className="block text-xs font-medium text-[#1E293B] mb-1.5"
                >
                  E-mail *
                </label>
                <input
                  id="field-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="nome@meridian.corp"
                  className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
                />
                {errors.email && <p className="mt-1 text-xs text-[#BA1A1A]">{errors.email}</p>}
              </div>

              <div className="w-full sm:w-[calc(50%-7px)]">
                <label
                  htmlFor="field-data-contratacao"
                  className="block text-xs font-medium text-[#1E293B] mb-1.5"
                >
                  Data de Contratação *
                </label>
                <input
                  id="field-data-contratacao"
                  type="date"
                  min="1980-01-01"
                  max={todayIso}
                  value={form.data_contratacao ?? ''}
                  onChange={(e) => handleHireDateChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white font-mono text-sm tabular-nums text-[#1E293B] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
                />
                {errors.data_contratacao || errors.ano_contratacao ? (
                  <p className="mt-1 text-xs text-[#BA1A1A]">
                    {errors.data_contratacao ?? errors.ano_contratacao}
                  </p>
                ) : (
                  isLiveHireDateValid && (
                    <p
                      data-testid="live-tenure-preview"
                      className="mt-1 text-[11px] text-[#64748B]"
                    >
                      {formatHiringDateLong(rawHireDate)} ·{' '}
                      <span className="font-medium text-[#C25900]">
                        {formatCompanyTenure(rawHireDate, today)}
                      </span>
                    </p>
                  )
                )}
              </div>

              <div className="w-full sm:w-[calc(50%-7px)]">
                <label
                  htmlFor="field-status"
                  className="block text-xs font-medium text-[#1E293B] mb-1.5"
                >
                  Status *
                </label>
                <select
                  id="field-status"
                  value={form.status}
                  onChange={(e) => updateField('status', e.target.value as CollaboratorStatus)}
                  className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
                >
                  {COLLABORATOR_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Perfil Público & Atendimento */}
          <div className="pt-4 border-t border-[#E2E8F0]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#C25900] mb-3">
              Perfil Público &amp; Atendimento (Página &ldquo;Ver mais&rdquo;)
            </p>
            <div className="flex flex-wrap gap-3.5">
              <div className="w-full sm:w-[calc(50%-7px)]">
                <label
                  htmlFor="field-departamento"
                  className="block text-xs font-medium text-[#1E293B] mb-1.5"
                >
                  Departamento / Unidade
                </label>
                <input
                  id="field-departamento"
                  type="text"
                  value={form.departamento ?? ''}
                  onChange={(e) => updateField('departamento', e.target.value)}
                  placeholder="ex.: Operações & Engenharia"
                  className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
                />
              </div>

              <div className="w-full sm:w-[calc(50%-7px)]">
                <label
                  htmlFor="field-localizacao"
                  className="block text-xs font-medium text-[#1E293B] mb-1.5"
                >
                  Localização / Delegação
                </label>
                <input
                  id="field-localizacao"
                  type="text"
                  value={form.localizacao ?? ''}
                  onChange={(e) => updateField('localizacao', e.target.value)}
                  placeholder="ex.: Maputo, Moçambique"
                  className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
                />
              </div>

              <div className="w-full sm:w-[calc(50%-7px)]">
                <label
                  htmlFor="field-horario"
                  className="block text-xs font-medium text-[#1E293B] mb-1.5"
                >
                  Horário de Atendimento
                </label>
                <input
                  id="field-horario"
                  type="text"
                  value={form.horario_atendimento ?? ''}
                  onChange={(e) => updateField('horario_atendimento', e.target.value)}
                  placeholder="ex.: Seg–Sex · 08:00–17:00 (CAT)"
                  className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
                />
              </div>

              <div className="w-full sm:w-[calc(50%-7px)]">
                <label
                  htmlFor="field-idiomas"
                  className="block text-xs font-medium text-[#1E293B] mb-1.5"
                >
                  Idiomas Falados (separados por vírgula)
                </label>
                <input
                  id="field-idiomas"
                  type="text"
                  value={idiomasInput}
                  onChange={(e) => setIdiomasInput(e.target.value)}
                  placeholder="ex.: Português, Inglês"
                  className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="field-especialidades"
                  className="block text-xs font-medium text-[#1E293B] mb-1.5"
                >
                  Especialidades Técnicas (separadas por vírgula)
                </label>
                <input
                  id="field-especialidades"
                  type="text"
                  value={especialidadesInput}
                  onChange={(e) => setEspecialidadesInput(e.target.value)}
                  placeholder="ex.: Sistemas Solares, Manutenção Preventiva, Comissionamento"
                  className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
                />
              </div>

              <div className="w-full">
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="field-bio"
                    className="block text-xs font-medium text-[#1E293B]"
                  >
                    Resumo Profissional / Bio
                  </label>
                  <span className="text-[11px] text-[#64748B] tabular-nums">
                    {bioLength}/400
                  </span>
                </div>
                <textarea
                  id="field-bio"
                  rows={3}
                  maxLength={400}
                  value={form.bio ?? ''}
                  onChange={(e) => updateField('bio', e.target.value)}
                  placeholder="Breve descrição da experiência e de como apoia os clientes..."
                  className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#1E293B] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20 resize-y"
                />
                {errors.bio && <p className="mt-1 text-xs text-[#BA1A1A]">{errors.bio}</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#CBD5E1] text-sm font-medium text-[#1E293B] hover:bg-[#F1F5F9]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#FE8100] hover:bg-[#E57400] text-[#111827] text-sm font-semibold transition-colors"
            >
              {mode === 'create' ? 'Guardar Colaborador' : 'Atualizar Colaborador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
