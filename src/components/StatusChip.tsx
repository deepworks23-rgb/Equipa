import { STATUS_META, type CollaboratorStatus } from '../utils/talentLogic';

interface StatusChipProps {
  status: CollaboratorStatus;
  variant?: 'public' | 'admin';
  compact?: boolean;
}

export function StatusChip({ status, variant = 'public', compact = false }: StatusChipProps) {
  const meta = STATUS_META[status];
  const label = variant === 'public' ? meta.publicLabel : meta.adminLabel;

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold uppercase tracking-[0.04em] whitespace-nowrap shrink-0 ${
        compact ? 'gap-1 px-2 py-0.5 text-[10px]' : 'gap-1.5 px-2.5 py-1 text-[11px]'
      } ${meta.bgClass} ${meta.textClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${meta.dotClass}`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
