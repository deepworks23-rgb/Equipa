import { STATUS_META, type CollaboratorStatus } from '../utils/talentLogic';

interface StatusChipProps {
  status: CollaboratorStatus;
  variant?: 'public' | 'admin';
}

export function StatusChip({ status, variant = 'public' }: StatusChipProps) {
  const meta = STATUS_META[status];
  const label = variant === 'public' ? meta.publicLabel : meta.adminLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] whitespace-nowrap shrink-0 ${meta.bgClass} ${meta.textClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${meta.dotClass}`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
