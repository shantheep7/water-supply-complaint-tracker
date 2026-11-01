import { STATUS_META } from '../../constants/complaint'

export default function StatusBadge({ status, className = '' }) {
  const meta = STATUS_META[status] || STATUS_META.SUBMITTED
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.badge} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  )
}
