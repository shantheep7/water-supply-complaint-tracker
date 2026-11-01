import { HardHat, MapPinned, Phone, UserRound, Users } from 'lucide-react'

export default function TeamCard({ team }) {
  if (!team) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-slate-400 ring-1 ring-slate-200">
          <Users className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-700">Awaiting team assignment</p>
          <p className="text-xs text-slate-500">The control room will assign a maintenance team shortly.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-gradient-to-br from-brand-50 to-cyan-50 p-4 ring-1 ring-brand-100">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white">
          <HardHat className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-slate-900">{team.name}</p>
          <p className="text-xs font-medium text-brand-700">{team.specialization}</p>
        </div>
      </div>
      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <UserRound className="h-4 w-4 text-slate-400" />
          <dt className="sr-only">Team leader</dt>
          <dd>
            Lead: <span className="font-medium text-slate-800">{team.leader}</span> · {team.members} members
          </dd>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Phone className="h-4 w-4 text-slate-400" />
          <dt className="sr-only">Contact</dt>
          <dd>
            <a href={`tel:${team.phone.replace(/\s/g, '')}`} className="font-medium text-brand-700 hover:underline">
              {team.phone}
            </a>
          </dd>
        </div>
        <div className="flex items-start gap-2 text-slate-600">
          <MapPinned className="mt-0.5 h-4 w-4 text-slate-400" />
          <dt className="sr-only">Zones</dt>
          <dd>{team.zones.join(', ')}</dd>
        </div>
      </dl>
    </div>
  )
}
