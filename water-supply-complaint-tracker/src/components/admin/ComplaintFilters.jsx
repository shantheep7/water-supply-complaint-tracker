import { RotateCcw, Search } from 'lucide-react'
import { AREAS, COMPLAINT_TYPE_META, STATUS_META, toOptions } from '../../constants/complaint'
import Button from '../ui/Button'
import { Input, Select } from '../ui/FormField'

export const EMPTY_FILTERS = { search: '', area: '', type: '', status: '' }

export default function ComplaintFilters({ filters, onChange }) {
  const set = (field) => (event) => onChange({ ...filters, [field]: event.target.value })
  const active = Object.values(filters).some(Boolean)

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
      <Input icon={Search} placeholder="Search ID, name or phone" value={filters.search} onChange={set('search')} aria-label="Search complaints" />
      <Select aria-label="Filter by area" placeholder="All areas" options={AREAS} value={filters.area} onChange={set('area')} />
      <Select aria-label="Filter by type" placeholder="All types" options={toOptions(COMPLAINT_TYPE_META)} value={filters.type} onChange={set('type')} />
      <Select aria-label="Filter by status" placeholder="All statuses" options={toOptions(STATUS_META)} value={filters.status} onChange={set('status')} />
      <Button variant="ghost" icon={RotateCcw} onClick={() => onChange(EMPTY_FILTERS)} disabled={!active} className="h-11">
        Clear
      </Button>
    </div>
  )
}
