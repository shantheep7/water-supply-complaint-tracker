import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  ClipboardPlus,
  Clock3,
  HardHat,
  Search,
  ShieldCheck,
  Timer,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { TYPE_ICONS } from '../components/complaints/ComplaintTypeIcon'
import Button from '../components/ui/Button'
import { COMPLAINT_TYPE_META } from '../constants/complaint'
import { useComplaints } from '../context/ComplaintContext'
import { formatDuration } from '../utils/format'

const STEPS = [
  { icon: ClipboardPlus, title: 'Register', text: 'Report a shortage, leak or contamination once — online, in under two minutes.' },
  { icon: Users, title: 'Assigned', text: 'The control room assigns the right maintenance team for your locality.' },
  { icon: HardHat, title: 'Repair', text: 'Field crews post progress updates as work moves forward on site.' },
  { icon: CheckCircle2, title: 'Resolved', text: 'Supply is restored and the complaint is closed with a resolution note.' },
]

function HeroStat({ value, label }) {
  return (
    <div>
      <p className="text-2xl font-bold text-white sm:text-3xl">{value}</p>
      <p className="text-xs font-medium text-blue-200 sm:text-sm">{label}</p>
    </div>
  )
}

export default function HomePage() {
  const { stats, teams, loading } = useComplaints()
  const show = (value) => (loading ? '—' : value)

  const statCards = [
    { icon: ClipboardPlus, label: 'Complaints registered', value: show(stats.total), tone: 'bg-brand-50 text-brand-600' },
    { icon: Clock3, label: 'Awaiting repair', value: show(stats.pending), tone: 'bg-amber-50 text-amber-600' },
    { icon: HardHat, label: 'Repairs in progress', value: show(stats.inProgress), tone: 'bg-cyan-50 text-cyan-600' },
    { icon: CheckCircle2, label: 'Resolved', value: show(stats.resolved), tone: 'bg-emerald-50 text-emerald-600' },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-sky-500">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.35)_1px,transparent_0)] [background-size:28px_28px]" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-cyan-400/30 blur-3xl" />
        <svg className="absolute inset-x-0 bottom-0 w-full text-slate-50" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden>
          <path fill="currentColor" d="M0 60c120-25 240-38 360-30s240 40 360 40 240-32 360-40 240 5 360 22v38H0z" />
        </svg>

        <div className="container-page relative grid items-center gap-12 pb-28 pt-14 lg:grid-cols-[1.15fr_1fr] lg:pb-36 lg:pt-20">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100 ring-1 ring-white/20">
              <ShieldCheck className="h-4 w-4" /> Official citizen grievance portal
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Report water problems once.
              <span className="block bg-gradient-to-r from-cyan-200 to-white bg-clip-text text-transparent">
                Track every repair.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-blue-100 sm:text-lg">
              No more calling multiple offices. Register water shortages, pipeline leaks or contamination, see which
              maintenance team is assigned, and follow your complaint until it is resolved.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button as={Link} to="/resident" variant="cyan" size="lg" icon={ClipboardPlus}>
                Register Complaint
              </Button>
              <Button as={Link} to="/track" variant="outlineLight" size="lg" icon={Search}>
                Track Complaint
              </Button>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-white/15 pt-6">
              <HeroStat value={show(`${stats.resolutionRate}%`)} label="Resolution rate" />
              <HeroStat value={show(stats.avgResolutionMs ? formatDuration(stats.avgResolutionMs) : '—')} label="Avg. fix time" />
              <HeroStat value={show(teams.length)} label="Field teams" />
            </div>
          </div>

          {/* Hero illustration card */}
          <div className="relative mx-auto hidden w-full max-w-md lg:block">
            <div className="absolute -inset-4 rounded-3xl bg-cyan-300/20 blur-2xl" />
            <div className="relative rounded-3xl bg-white/95 p-6 shadow-2xl ring-1 ring-white/50 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs font-semibold text-brand-600">WSC-2026-1002</p>
                  <p className="font-semibold text-slate-900">Water Shortage · Lakeview Colony</p>
                </div>
                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-200">In Progress</span>
              </div>
              <ol className="mt-6 space-y-4">
                {[
                  ['Submitted', 'Complaint received online', true],
                  ['Assigned', 'Team Bravo · Leak Detection', true],
                  ['In Progress', 'Valve survey under way', true],
                  ['Resolved', 'Awaiting completion', false],
                ].map(([title, text, done]) => (
                  <li key={title} className="flex items-center gap-3">
                    <span className={`grid h-8 w-8 place-items-center rounded-full ${done ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${done ? 'text-slate-900' : 'text-slate-400'}`}>{title}</p>
                      <p className="text-xs text-slate-500">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-6 flex items-center gap-2 rounded-xl bg-cyan-50 p-3 text-xs font-medium text-cyan-800">
                <BellRing className="h-4 w-4" /> Updates are posted as the crew progresses.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="container-page relative z-10 -mt-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ icon: Icon, label, value, tone }) => (
            <div key={label} className="card flex items-center gap-4 p-5 transition-transform hover:-translate-y-0.5">
              <span className={`grid h-12 w-12 place-items-center rounded-xl ${tone}`}>
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container-page mt-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">How it works</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">From complaint to repair, in plain sight</h2>
          <p className="mt-3 text-slate-500">Every complaint follows the same transparent four-step process.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <div key={title} className="card relative p-6">
              <span className="absolute right-5 top-5 text-4xl font-extrabold text-slate-100">0{index + 1}</span>
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-sky-500 text-white shadow-md shadow-brand-500/25">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Complaint types */}
      <section className="container-page mt-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">What you can report</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Complaint categories</h2>
          </div>
          <Link to="/resident" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:gap-2 transition-all">
            Start a complaint <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(COMPLAINT_TYPE_META).map(([type, meta]) => {
            const Icon = TYPE_ICONS[type]
            const count = stats.byType.find((t) => t.type === type)?.count ?? 0
            return (
              <Link key={type} to="/resident" className="card focus-ring group p-6 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg">
                <span className={`grid h-12 w-12 place-items-center rounded-xl ${meta.color}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">{meta.label}</h3>
                <p className="mt-1 text-sm text-slate-500">{meta.description}</p>
                <p className="mt-4 text-xs font-medium text-slate-400">{show(count)} reported</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page mt-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 to-sky-500 px-6 py-10 sm:px-12">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-cyan-300/30 blur-2xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <span className="hidden h-12 w-12 place-items-center rounded-xl bg-white/15 text-white sm:grid">
                <Timer className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-2xl font-bold text-white">Already registered a complaint?</h2>
                <p className="mt-1 text-blue-100">Enter your complaint ID to see the assigned team and live repair status.</p>
              </div>
            </div>
            <Button as={Link} to="/track" variant="cyan" size="lg" iconRight={ArrowRight}>
              Track now
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
