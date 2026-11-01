import { COMPLAINT_TYPE_META } from '../../constants/complaint'
import { TYPE_ICONS } from '../complaints/ComplaintTypeIcon'

export default function TypeBreakdown({ byType, total }) {
  return (
    <ul className="space-y-4">
      {byType.map(({ type, count }) => {
        const Icon = TYPE_ICONS[type]
        const percent = total ? Math.round((count / total) * 100) : 0
        return (
          <li key={type}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <Icon className="h-4 w-4 text-brand-500" />
                {COMPLAINT_TYPE_META[type].label}
              </span>
              <span className="tabular-nums text-slate-500">
                {count} <span className="text-xs">({percent}%)</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all duration-500" style={{ width: `${percent}%` }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
