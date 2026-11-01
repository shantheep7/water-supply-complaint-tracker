import { KeyRound, LogIn, ShieldCheck, UserCog } from 'lucide-react'
import { useState } from 'react'
import Button from '../components/ui/Button'
import { Field, Input } from '../components/ui/FormField'
import { DEMO_OFFICER, useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function AdminLogin() {
  const { login } = useAuth()
  const { notify } = useToast()
  const [officerId, setOfficerId] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (login(officerId, accessCode)) {
      notify('Signed in to the administrator console.')
    } else {
      setError('Invalid officer ID or access code.')
    }
  }

  const fillDemo = () => {
    setOfficerId(DEMO_OFFICER.officerId)
    setAccessCode(DEMO_OFFICER.accessCode)
    setError('')
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-sky-500 py-16 sm:py-24">
      <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="container-page relative flex justify-center">
        <div className="w-full max-w-md animate-slide-up rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">Administrator console</h1>
          <p className="mt-1 text-sm text-slate-500">For water board control room officers only. Residents can register and track complaints without signing in.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field label="Officer ID" htmlFor="officerId">
              <Input id="officerId" icon={UserCog} value={officerId} onChange={(e) => setOfficerId(e.target.value)} placeholder="Officer ID" autoComplete="username" />
            </Field>
            <Field label="Access code" htmlFor="accessCode">
              <Input id="accessCode" type="password" icon={KeyRound} value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder="Access code" autoComplete="current-password" />
            </Field>
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <Button type="submit" icon={LogIn} className="w-full">
              Sign in
            </Button>
          </form>

          <div className="mt-6 rounded-xl bg-cyan-50 p-4 text-xs text-cyan-900">
            <p className="font-semibold">Demo access</p>
            <p className="mt-1">
              Officer ID <code className="font-mono font-semibold">{DEMO_OFFICER.officerId}</code> · Access code{' '}
              <code className="font-mono font-semibold">{DEMO_OFFICER.accessCode}</code>
            </p>
            <button type="button" onClick={fillDemo} className="mt-2 font-semibold text-brand-700 hover:underline">
              Fill demo credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
