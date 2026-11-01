import { ChevronRight, MapPin } from 'lucide-react'
import { COMPLAINT_TYPE_META } from '../../constants/complaint'
import { timeAgo } from '../../utils/format'
import PriorityBadge from '../ui/PriorityBadge'
import StatusBadge from '../ui/StatusBadge'
import ComplaintTypeIcon from './ComplaintTypeIcon'

export default function ComplaintCard({ complaint, team, onClick, actionLabel = 'View' }) {
  return (
    <button
      onClick={onClick}
      className="card focus-ring group flex w-full flex-col gap-3 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ComplaintTypeIcon type={complaint.type} size="sm" />
          <div className="min-w-0">
            <p className="font-mono text-xs font-semibold text-brand-600">{complaint.id}</p>
            <p className="text-sm font-semibold leading-snug text-slate-900">{COMPLAINT_TYPE_META[complaint.type]?.label}</p>
          </div>
        </div>
        <StatusBadge status={complaint.status} />
      </div>
      <p className="line-clamp-2 text-sm text-slate-600">{complaint.description}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {complaint.area}
        </span>
        <PriorityBadge priority={complaint.priority} />
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <span className="text-slate-500">
          {team ? team.name : 'Not assigned'} · {timeAgo(complaint.createdAt)}
        </span>
        <span className="flex items-center gap-0.5 font-semibold text-brand-600 group-hover:gap-1.5 transition-all">
          {actionLabel} <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </button>
  )
}
