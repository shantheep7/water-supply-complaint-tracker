import { PRIORITY_META } from '../../constants/complaint'

export default function PriorityBadge({ priority }) {
  const meta = PRIORITY_META[priority] || PRIORITY_META.MEDIUM
  return (
    <span className={`inline-flex whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.badge}`}>
      {meta.label}
    </span>
  )
}
