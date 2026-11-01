import { STATUS_META } from '../../constants/complaint'
import { formatDate } from '../../utils/format'

export default function ActivityLog({ history }) {
  const entries = [...history].reverse()
  return (
    <ul className="space-y-4">
      {entries.map((entry, index) => (
        <li key={`${entry.timestamp}-${index}`} className="flex gap-3">
          <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_META[entry.status]?.dot || 'bg-slate-400'}`} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-800">{entry.note}</p>
            <p className="text-xs text-slate-500">
              {formatDate(entry.timestamp)} · {entry.by} · {STATUS_META[entry.status]?.label}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
