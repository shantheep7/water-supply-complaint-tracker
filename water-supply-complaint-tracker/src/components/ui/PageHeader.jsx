export default function PageHeader({ eyebrow, title, description, icon: Icon, actions }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-600 to-sky-500">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="container-page relative flex flex-col gap-5 py-10 sm:flex-row sm:items-end sm:justify-between sm:py-12">
        <div className="flex items-start gap-4">
          {Icon && (
            <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 sm:grid">
              <Icon className="h-7 w-7" />
            </span>
          )}
          <div>
            {eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">{eyebrow}</p>}
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
            {description && <p className="mt-2 max-w-2xl text-sm text-blue-100 sm:text-base">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
    </div>
  )
}
