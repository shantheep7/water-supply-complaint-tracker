import { CheckCircle2, ClipboardList, HardHat, Users } from 'lucide-react'
import { STATUS_FLOW, STATUS_META } from '../../constants/complaint'
import { formatDate } from '../../utils/format'

const STEP_ICONS = {
  SUBMITTED: ClipboardList,
  ASSIGNED: Users,
  IN_PROGRESS: HardHat,
  RESOLVED: CheckCircle2,
}

// Submitted → Assigned → In Progress → Resolved
export default function StatusTimeline({ complaint }) {
  const currentIndex = STATUS_FLOW.indexOf(complaint.status)
  const reachedAt = (status) => complaint.history.find((h) => h.status === status)?.timestamp

  return (
    <ol className="relative grid gap-0 md:grid-cols-4 md:gap-4">
      {STATUS_FLOW.map((status, index) => {
        const Icon = STEP_ICONS[status]
        const done = index <= currentIndex
        const current = index === currentIndex
        const isLast = index === STATUS_FLOW.length - 1
        const timestamp = reachedAt(status)

        return (
          <li key={status} className="relative flex gap-4 pb-8 last:pb-0 md:flex-col md:items-center md:pb-0 md:text-center">
            {!isLast && (
              <span
                aria-hidden
                className={`absolute left-5 top-11 h-[calc(100%-2.75rem)] w-0.5 md:left-[calc(50%+1.75rem)] md:top-5 md:h-0.5 md:w-[calc(100%-2.5rem)] ${
                  index < currentIndex ? 'bg-brand-500' : 'bg-slate-200'
                }`}
              />
            )}
            <span
              className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors ${
                done ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30' : 'bg-white text-slate-400 ring-2 ring-slate-200'
              } ${current ? 'ring-4 ring-cyan-200' : ''}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <div className="md:mt-3">
              <p className={`text-sm font-semibold ${done ? 'text-slate-900' : 'text-slate-400'}`}>
                {STATUS_META[status].label}
                {current && (
                  <span className="ml-2 rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-700">
                    Current
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-500">{done && timestamp ? formatDate(timestamp) : STATUS_META[status].description}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
