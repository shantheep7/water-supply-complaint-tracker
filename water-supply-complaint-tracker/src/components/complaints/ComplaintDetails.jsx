import { CalendarClock, Hash, MapPin, Phone, User } from 'lucide-react'
import { COMPLAINT_TYPE_META } from '../../constants/complaint'
import { formatDate } from '../../utils/format'
import PriorityBadge from '../ui/PriorityBadge'
import StatusBadge from '../ui/StatusBadge'
import ComplaintTypeIcon from './ComplaintTypeIcon'

function Detail({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
        <dd className="text-sm font-medium text-slate-800">{children}</dd>
      </div>
    </div>
  )
}

const maskPhone = (phone) => phone.replace(/^(\d{2})\d{5}(\d{3})$/, '$1•••••$2')

export default function ComplaintDetails({ complaint, showContact = false }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ComplaintTypeIcon type={complaint.type} />
          <div>
            <p className="font-mono text-xs font-semibold text-brand-600">{complaint.id}</p>
            <h3 className="text-lg font-semibold text-slate-900">{COMPLAINT_TYPE_META[complaint.type]?.label}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <p className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">{complaint.description}</p>

      <dl className="grid gap-4 sm:grid-cols-2">
        <Detail icon={MapPin} label="Location">
          {complaint.area}
          <span className="block text-xs font-normal text-slate-500">{complaint.address}</span>
        </Detail>
        <Detail icon={User} label="Reported by">
          {complaint.residentName}
        </Detail>
        <Detail icon={Phone} label="Contact">
          {showContact ? complaint.phone : maskPhone(complaint.phone)}
          {showContact && complaint.email && <span className="block text-xs font-normal text-slate-500">{complaint.email}</span>}
        </Detail>
        <Detail icon={CalendarClock} label="Registered on">
          {formatDate(complaint.createdAt)}
        </Detail>
        <Detail icon={Hash} label="Last updated">
          {formatDate(complaint.updatedAt)}
        </Detail>
      </dl>
    </div>
  )
}
