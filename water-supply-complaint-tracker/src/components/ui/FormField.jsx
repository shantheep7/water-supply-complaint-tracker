import { ChevronDown } from 'lucide-react'

const base =
  'w-full rounded-xl border bg-white px-3.5 text-sm text-slate-800 placeholder:text-slate-400 transition focus:outline-none focus:ring-4'
const stateClass = (error) =>
  error
    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
    : 'border-slate-300 focus:border-brand-500 focus:ring-brand-100'

export function Field({ label, htmlFor, required, error, hint, children, className = '' }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
}

export function Input({ error, icon: Icon, className = '', ...props }) {
  return (
    <div className="relative">
      {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />}
      <input className={`${base} ${stateClass(error)} h-11 ${Icon ? 'pl-10' : ''} ${className}`} {...props} />
    </div>
  )
}

export function Select({ error, options, placeholder, className = '', ...props }) {
  return (
    <div className="relative">
      <select className={`${base} ${stateClass(error)} h-11 appearance-none pr-10 ${className}`} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => {
          const { value, label } = typeof option === 'string' ? { value: option, label: option } : option
          return (
            <option key={value} value={value}>
              {label}
            </option>
          )
        })}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

export function Textarea({ error, className = '', ...props }) {
  return <textarea className={`${base} ${stateClass(error)} py-3 ${className}`} {...props} />
}
