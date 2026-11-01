import { ClipboardPlus, Droplets, Home, LogOut, Menu, Phone, Search, ShieldCheck, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { APP_CONFIG } from '../../config/appConfig'
import { useAuth } from '../../context/AuthContext'

const LINKS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/resident', label: 'Register Complaint', icon: ClipboardPlus },
  { to: '/track', label: 'Track Complaint', icon: Search },
  { to: '/admin', label: 'Admin', icon: ShieldCheck },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { isAdmin, logout } = useAuth()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const linkClass = ({ isActive }) =>
    `focus-ring flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`

  return (
    <header className="sticky top-0 z-40">
      <div className="hidden bg-brand-900 text-xs text-blue-100 sm:block">
        <div className="container-page flex h-8 items-center justify-between">
          <span>{APP_CONFIG.authority} · Citizen Services Portal</span>
          <span className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> 24×7 Helpline: <strong className="text-white">{APP_CONFIG.helpline}</strong>
          </span>
        </div>
      </div>
      <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link to="/" className="focus-ring flex items-center gap-2.5 rounded-lg">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-brand-700 text-white shadow-md shadow-brand-500/30">
              <Droplets className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-slate-900 sm:text-base">AquaCare Portal</span>
              <span className="block text-[11px] font-medium text-slate-500">Water Supply Complaint Tracker</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={linkClass}>
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <button onClick={logout} className="focus-ring ml-1 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            )}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="focus-ring rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {open && (
          <div className="animate-fade-in border-t border-slate-100 bg-white md:hidden">
            <div className="container-page flex flex-col gap-1 py-3">
              {LINKS.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} className={linkClass}>
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
              {isAdmin && (
                <button onClick={logout} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
