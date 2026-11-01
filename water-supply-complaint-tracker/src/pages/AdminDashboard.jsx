import { BarChart3, CheckCircle2, ClipboardList, Clock3, HardHat, LayoutDashboard, RefreshCw, RotateCcw, SearchX, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import ComplaintFilters, { EMPTY_FILTERS } from '../components/admin/ComplaintFilters'
import ComplaintTable from '../components/admin/ComplaintTable'
import ManageComplaintModal from '../components/admin/ManageComplaintModal'
import TeamWorkload from '../components/admin/TeamWorkload'
import TypeBreakdown from '../components/admin/TypeBreakdown'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'
import Spinner from '../components/ui/Spinner'
import StatCard from '../components/ui/StatCard'
import { isApiMode } from '../config/appConfig'
import { COMPLAINT_STATUS } from '../constants/complaint'
import { useAuth } from '../context/AuthContext'
import { useComplaints } from '../context/ComplaintContext'
import { useToast } from '../context/ToastContext'
import { formatDuration } from '../utils/format'
import AdminLogin from './AdminLogin'

const PENDING = [COMPLAINT_STATUS.SUBMITTED, COMPLAINT_STATUS.ASSIGNED]

function filterComplaints(list, { search, area, type, status }, quick) {
  const query = search.trim().toLowerCase()
  return list.filter(
    (c) =>
      (!area || c.area === area) &&
      (!type || c.type === type) &&
      (!status || c.status === status) &&
      (quick !== 'PENDING' || PENDING.includes(c.status)) &&
      (!query ||
        c.id.toLowerCase().includes(query) ||
        c.residentName.toLowerCase().includes(query) ||
        c.phone.includes(query)),
  )
}

function AdminConsole() {
  const { complaints, teams, stats, loading, error, getTeam, refresh, resetDemoData } = useComplaints()
  const { officer } = useAuth()
  const { notify } = useToast()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [quick, setQuick] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const filtered = useMemo(() => filterComplaints(complaints, filters, quick), [complaints, filters, quick])
  // Read the selected complaint from the live list so the modal reflects saved changes.
  const selected = complaints.find((c) => c.id === selectedId) || null

  const applyQuick = (key) => {
    if (key === 'PENDING') {
      setQuick(quick === 'PENDING' ? '' : 'PENDING')
      setFilters((f) => ({ ...f, status: '' }))
    } else {
      setQuick('')
      setFilters((f) => ({ ...f, status: f.status === key ? '' : key }))
    }
  }

  const handleFiltersChange = (next) => {
    if (next.status) setQuick('')
    if (!Object.values(next).some(Boolean)) setQuick('')
    setFilters(next)
  }

  const handleReset = async () => {
    await resetDemoData()
    setFilters(EMPTY_FILTERS)
    setQuick('')
    notify('Demo data restored to the original sample complaints.', 'info')
  }

  return (
    <>
      <PageHeader
        eyebrow={`Signed in as ${officer.name}`}
        title="Complaint management console"
        description="Review incoming complaints, assign maintenance teams and keep residents informed of repair progress."
        icon={LayoutDashboard}
        actions={
          <>
            <Button variant="outlineLight" icon={RefreshCw} onClick={refresh} loading={loading}>
              Refresh
            </Button>
            {!isApiMode() && (
              <Button variant="outlineLight" icon={RotateCcw} onClick={handleReset}>
                Reset demo data
              </Button>
            )}
          </>
        }
      />

      <div className="container-page mt-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total complaints" value={stats.total} icon={ClipboardList} tone="blue" hint={`${stats.resolutionRate}% resolution rate`} active={!filters.status && !quick} onClick={() => { setQuick(''); setFilters((f) => ({ ...f, status: '' })) }} />
          <StatCard label="Pending" value={stats.pending} icon={Clock3} tone="amber" hint={`${stats.submitted} unassigned · ${stats.assigned} assigned`} active={quick === 'PENDING'} onClick={() => applyQuick('PENDING')} />
          <StatCard label="In progress" value={stats.inProgress} icon={HardHat} tone="cyan" hint="Crews working on site" active={filters.status === COMPLAINT_STATUS.IN_PROGRESS} onClick={() => applyQuick(COMPLAINT_STATUS.IN_PROGRESS)} />
          <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} tone="emerald" hint={stats.avgResolutionMs ? `Avg. ${formatDuration(stats.avgResolutionMs)} to resolve` : 'No resolved complaints yet'} active={filters.status === COMPLAINT_STATUS.RESOLVED} onClick={() => applyQuick(COMPLAINT_STATUS.RESOLVED)} />
        </div>

        <Card
          title="All complaints"
          subtitle={`Showing ${filtered.length} of ${complaints.length}${quick === 'PENDING' ? ' · pending only' : ''}`}
          icon={ClipboardList}
          bodyClassName=""
        >
          <div className="border-b border-slate-100 p-4 sm:px-6">
            <ComplaintFilters filters={filters} onChange={handleFiltersChange} />
          </div>
          {error ? (
            <EmptyState icon={SearchX} title="Could not load complaints" message={error} action={<Button onClick={refresh}>Retry</Button>} />
          ) : loading && !complaints.length ? (
            <Spinner label="Loading complaints…" />
          ) : filtered.length ? (
            <ComplaintTable complaints={filtered} getTeam={getTeam} onManage={(c) => setSelectedId(c.id)} />
          ) : (
            <EmptyState icon={SearchX} title="No matching complaints" message="Try changing or clearing the filters." action={<Button variant="secondary" onClick={() => handleFiltersChange(EMPTY_FILTERS)}>Clear filters</Button>} />
          )}
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Complaints by type" icon={BarChart3}>
            <TypeBreakdown byType={stats.byType} total={stats.total} />
          </Card>
          <Card title="Maintenance team workload" icon={Users}>
            <TeamWorkload teams={teams} complaints={complaints} />
          </Card>
        </div>
      </div>

      <Modal open={Boolean(selected)} onClose={() => setSelectedId(null)} title="Manage complaint" subtitle={selected?.id} size="max-w-3xl">
        <ManageComplaintModal complaint={selected} onClose={() => setSelectedId(null)} />
      </Modal>
    </>
  )
}

export default function AdminDashboard() {
  const { isAdmin } = useAuth()
  return isAdmin ? <AdminConsole /> : <AdminLogin />
}
