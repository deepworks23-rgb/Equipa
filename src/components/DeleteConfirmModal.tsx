import { AlertTriangle, X } from 'lucide-react';
import { type Collaborator } from '../utils/talentLogic';

interface DeleteConfirmModalProps {
  collaborator: Collaborator | null;
  onCancel: () => void;
  onConfirm: (id: string) => void;
}

export function DeleteConfirmModal({
  collaborator,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!collaborator) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="bg-white w-full max-w-md rounded-xl border border-[#E2E8F0] shadow-level-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#FEE2E2] text-[#991B1B] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="delete-modal-title"
                className="font-display text-lg font-semibold text-[#111827]"
              >
                Confirmar Exclusão
              </h2>
              <p className="text-xs text-[#64748B]">Esta ação remove permanentemente o registo.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancelar exclusão"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-4 text-sm text-[#44474E]">
          Tem a certeza de que pretende excluir{' '}
          <strong className="text-[#111827]">{collaborator.nome_completo}</strong> ({collaborator.cargo})?
        </p>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-[#CBD5E1] text-sm font-medium text-[#1E293B] hover:bg-[#F1F5F9]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(collaborator.id)}
            className="px-4 py-2 rounded-lg bg-[#BA1A1A] hover:bg-[#93000A] text-white text-sm font-medium transition-colors"
          >
            Excluir Colaborador
          </button>
        </div>
      </div>
    </div>
  );
}
