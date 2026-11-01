import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800',
  secondary: 'bg-white text-brand-700 ring-1 ring-inset ring-brand-200 hover:bg-brand-50',
  cyan: 'bg-cyan-400 text-brand-900 shadow-sm hover:bg-cyan-300',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  outlineLight: 'text-white ring-1 ring-inset ring-white/40 hover:bg-white/10',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
}

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}) {
  return (
    <Component
      className={`focus-ring inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={Component === 'button' ? disabled || loading : undefined}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon && <Icon className="h-4 w-4" />}
      {children}
      {IconRight && <IconRight className="h-4 w-4" />}
    </Component>
  )
}
