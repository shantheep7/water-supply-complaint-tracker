import { Droplets, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { APP_CONFIG } from '../../config/appConfig'

export default function Footer() {
  return (
    <footer className="mt-16 bg-brand-900 text-blue-100">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-cyan-300">
              <Droplets className="h-5 w-5" />
            </span>
            <span className="font-semibold text-white">AquaCare Portal</span>
          </div>
          <p className="mt-3 max-w-md text-sm text-blue-200/80">
            One window for every water supply complaint in the locality. Register once, and follow the repair from
            assignment to resolution — no more calling multiple offices.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Citizen services</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/resident" className="hover:text-white">Register a complaint</Link></li>
            <li><Link to="/track" className="hover:text-white">Track complaint status</Link></li>
            <li><Link to="/admin" className="hover:text-white">Officer login</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-cyan-300" /> Helpline {APP_CONFIG.helpline}</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-cyan-300" /> <span className="break-all">{APP_CONFIG.email}</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-1 py-4 text-xs text-blue-200/70 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} {APP_CONFIG.authority}. Demo application.</span>
          <span>Data source: {APP_CONFIG.dataSource === 'api' ? 'REST API' : 'Browser localStorage (demo)'}</span>
        </div>
      </div>
    </footer>
  )
}
