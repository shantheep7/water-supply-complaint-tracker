import { COMPLAINT_STATUS } from '../../constants/complaint'

export default function TeamWorkload({ teams, complaints }) {
  return (
    <ul className="divide-y divide-slate-100">
      {teams.map((team) => {
        const active = complaints.filter(
          (c) => c.assignedTeamId === team.id && c.status !== COMPLAINT_STATUS.RESOLVED,
        ).length
        const resolved = complaints.filter(
          (c) => c.assignedTeamId === team.id && c.status === COMPLAINT_STATUS.RESOLVED,
        ).length
        return (
          <li key={team.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">{team.name}</p>
              <p className="truncate text-xs text-slate-500">{team.specialization}</p>
            </div>
            <div className="flex shrink-0 gap-2 text-xs font-semibold">
              <span className="rounded-md bg-sky-50 px-2 py-1 text-sky-700">{active} active</span>
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-emerald-700">{resolved} done</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
