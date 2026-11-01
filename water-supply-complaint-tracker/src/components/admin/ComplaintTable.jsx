import { Settings2 } from 'lucide-react'
import { COMPLAINT_TYPE_META } from '../../constants/complaint'
import { formatDate } from '../../utils/format'
import ComplaintCard from '../complaints/ComplaintCard'
import ComplaintTypeIcon from '../complaints/ComplaintTypeIcon'
import Button from '../ui/Button'
import PriorityBadge from '../ui/PriorityBadge'
import StatusBadge from '../ui/StatusBadge'

const COLUMNS = ['Complaint', 'Area', 'Priority', 'Assigned team', 'Status', 'Registered', '']

export default function ComplaintTable({ complaints, getTeam, onManage }) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto xl:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {COLUMNS.map((column) => (
                <th key={column} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {complaints.map((complaint) => {
              const team = getTeam(complaint.assignedTeamId)
              return (
                <tr key={complaint.id} className="transition-colors hover:bg-brand-50/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <ComplaintTypeIcon type={complaint.type} size="sm" />
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold text-brand-600">{complaint.id}</p>
                        <p className="font-medium text-slate-900">{COMPLAINT_TYPE_META[complaint.type]?.label}</p>
                        <p className="max-w-[16rem] truncate text-xs text-slate-500">{complaint.residentName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">{complaint.area}</td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={complaint.priority} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {team ? (
                      <>
                        <p className="font-medium text-slate-800">{team.name}</p>
                        <p className="text-xs text-slate-500">{team.specialization}</p>
                      </>
                    ) : (
                      <span className="text-xs font-medium italic text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={complaint.status} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatDate(complaint.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="secondary" icon={Settings2} onClick={() => onManage(complaint)}>
                      Manage
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet / small laptop cards */}
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:hidden">
        {complaints.map((complaint) => (
          <ComplaintCard
            key={complaint.id}
            complaint={complaint}
            team={getTeam(complaint.assignedTeamId)}
            onClick={() => onManage(complaint)}
            actionLabel="Manage"
          />
        ))}
      </div>
    </>
  )
}
