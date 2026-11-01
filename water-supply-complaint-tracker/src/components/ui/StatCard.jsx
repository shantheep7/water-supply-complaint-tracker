const TONES = {
  blue: 'bg-brand-50 text-brand-600',
  amber: 'bg-amber-50 text-amber-600',
  cyan: 'bg-cyan-50 text-cyan-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  slate: 'bg-slate-100 text-slate-600',
}

export default function StatCard({ label, value, icon: Icon, tone = 'blue', hint, active = false, onClick }) {
  const Component = onClick ? 'button' : 'div'
  return (
    <Component
      onClick={onClick}
      className={`card focus-ring flex w-full items-center gap-4 p-5 text-left transition-all duration-200 ${
        onClick ? 'hover:-translate-y-0.5 hover:shadow-md' : ''
      } ${active ? 'ring-2 ring-brand-500' : ''}`}
    >
      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${TONES[tone]}`}>
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        {hint && <p className="truncate text-xs text-slate-400">{hint}</p>}
      </div>
    </Component>
  )
}
