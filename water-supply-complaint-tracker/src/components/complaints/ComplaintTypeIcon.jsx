import { Ban, Droplet, FlaskConical, Wrench } from 'lucide-react'
import { COMPLAINT_TYPE_META } from '../../constants/complaint'

export const TYPE_ICONS = {
  WATER_SHORTAGE: Droplet,
  PIPELINE_LEAKAGE: Wrench,
  NO_WATER_SUPPLY: Ban,
  CONTAMINATED_WATER: FlaskConical,
}

export default function ComplaintTypeIcon({ type, size = 'md' }) {
  const Icon = TYPE_ICONS[type] || Droplet
  const color = COMPLAINT_TYPE_META[type]?.color || 'text-brand-600 bg-brand-50'
  const dims = size === 'sm' ? 'h-8 w-8 rounded-lg [&>svg]:h-4 [&>svg]:w-4' : 'h-11 w-11 rounded-xl [&>svg]:h-5 [&>svg]:w-5'
  return (
    <span className={`grid shrink-0 place-items-center ${dims} ${color}`}>
      <Icon />
    </span>
  )
}
