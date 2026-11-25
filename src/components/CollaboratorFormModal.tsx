import { Upload, X } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  COLLABORATOR_STATUSES,
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
  const currentYear = new Date().getFullYear();

  const [form, setForm] = useState<CollaboratorInput>(() => {
    if (mode === 'edit' && initialCollaborator) {
      return {
        nome_completo: initialCollaborator.nome_completo,
        cargo: initialCollaborator.cargo,
        telefone: initialCollaborator.telefone,
        email: initialCollaborator.email,
        ano_contratacao: initialCollaborator.ano_contratacao,
        status: initialCollaborator.status,
        foto_perfil: initialCollaborator.foto_perfil ?? '',
      };
    }

    return {
      nome_completo: '',
      cargo: '',
      telefone: '',
      email: '',
      ano_contratacao: currentYear,
      status: 'Ativo',
      foto_perfil: '',
    };
  });

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const validation = validateCollaboratorInput(form, currentYear);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit(
      {
        nome_completo: form.nome_completo.trim(),
        cargo: form.cargo.trim(),
        telefone: form.telefone.trim(),
        email: form.email.trim(),
        ano_contratacao: Number(form.ano_contratacao),
        status: form.status,
        foto_perfil: form.foto_perfil?.trim() || '',
      },
      mode === 'edit' ? initialCollaborator?.id : undefined,
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="collaborator-form-title"
    >
      <div className="bg-white w-full max-w-xl rounded-xl border border-[#E2E8F0] shadow-level-3 max-h-[92vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-center justify-between gap-4">
          <div>
            <h2
              id="collaborator-form-title"
              className="font-display text-xl font-semibold text-[#111827]"
            >
              {mode === 'create'
                ? 'Novo Colaborador'
                : `Editar ${initialCollaborator?.nome_completo}`}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Preencha os dados obrigatórios. Registos com status Rescindido ficam ocultos da vitrine pública.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar formulário"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
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

            <div>
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

            <div>
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

            <div className="sm:col-span-2">
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

            <div>
              <label
                htmlFor="field-ano"
                className="block text-xs font-medium text-[#1E293B] mb-1.5"
              >
                Ano de Contratação *
              </label>
              <input
                id="field-ano"
                type="number"
                min={1980}
                max={currentYear}
                value={form.ano_contratacao}
                onChange={(e) => updateField('ano_contratacao', e.target.value)}
                placeholder="2023"
                className="w-full h-10 px-3 rounded-lg border border-[#CBD5E1] bg-white font-mono text-sm tabular-nums text-[#1E293B] focus:outline-none focus:border-[#FE8100] focus:ring-3 focus:ring-[#FE8100]/20"
              />
              {errors.ano_contratacao && (
                <p className="mt-1 text-xs text-[#BA1A1A]">{errors.ano_contratacao}</p>
              )}
            </div>

            <div>
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

          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
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
