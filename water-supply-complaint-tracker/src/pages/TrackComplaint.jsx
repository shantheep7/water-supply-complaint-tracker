import { Activity, FileSearch, HardHat, Route, Search, SearchX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ActivityLog from '../components/complaints/ActivityLog'
import ComplaintDetails from '../components/complaints/ComplaintDetails'
import StatusTimeline from '../components/complaints/StatusTimeline'
import TeamCard from '../components/complaints/TeamCard'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import { Input } from '../components/ui/FormField'
import PageHeader from '../components/ui/PageHeader'
import Spinner from '../components/ui/Spinner'
import { useComplaints } from '../context/ComplaintContext'
import { normalizeComplaintId } from '../utils/idGenerator'

const EXAMPLE_IDS = ['WSC-2026-1002', 'WSC-2026-1003', 'WSC-2026-1001']

export default function TrackComplaint() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeId = searchParams.get('id') || ''
  const { getComplaintById, getTeam, complaints } = useComplaints()
  const [query, setQuery] = useState(activeId)
  const [result, setResult] = useState(null)
  const [state, setState] = useState('idle') // idle | loading | found | notFound | error
  const [error, setError] = useState('')

  useEffect(() => {
    setQuery(activeId)
  }, [activeId])

  // Re-run the lookup when the ID changes, and when complaint data changes
  // (e.g. an officer updates the status in another view).
  useEffect(() => {
    if (!activeId) {
      setState('idle')
      setResult(null)
      return undefined
    }
    let cancelled = false
    setState((current) => (current === 'found' ? current : 'loading'))
    getComplaintById(activeId)
      .then((complaint) => {
        if (cancelled) return
        setResult(complaint)
        setState(complaint ? 'found' : 'notFound')
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        setState('error')
      })
    return () => {
      cancelled = true
    }
  }, [activeId, complaints, getComplaintById])

  const search = (id) => {
    const normalized = normalizeComplaintId(id)
    if (!normalized) return
    setState('loading')
    setSearchParams({ id: normalized })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    search(query)
  }

  return (
    <>
      <PageHeader
        eyebrow="Complaint tracking"
        title="Track your complaint"
        description="Enter the complaint ID you received when registering to see the assigned team and repair progress."
        icon={Route}
      />

      <div className="container-page -mt-6 relative z-10">
        <form onSubmit={handleSubmit} className="card flex flex-col gap-3 p-4 sm:flex-row sm:p-5">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Enter complaint ID, e.g. WSC-2026-1002"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="font-mono uppercase placeholder:font-sans placeholder:normal-case"
              aria-label="Complaint ID"
            />
          </div>
          <Button type="submit" icon={FileSearch} className="sm:w-40" loading={state === 'loading'}>
            Track
          </Button>
        </form>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          Try a sample:
          {EXAMPLE_IDS.map((id) => (
            <button key={id} onClick={() => search(id)} className="rounded-md bg-white px-2 py-1 font-mono font-semibold text-brand-600 ring-1 ring-slate-200 hover:ring-brand-300">
              {id}
            </button>
          ))}
        </p>
      </div>

      <div className="container-page mt-8">
        {state === 'idle' && (
          <div className="card">
            <EmptyState icon={FileSearch} title="Search for a complaint" message="Your complaint ID looks like WSC-2026-1002 and is shown after you register a complaint." />
          </div>
        )}

        {state === 'loading' && (
          <div className="card">
            <Spinner label="Looking up complaint…" />
          </div>
        )}

        {state === 'notFound' && (
          <div className="card">
            <EmptyState
              icon={SearchX}
              title="No complaint found"
              message={`We couldn't find a complaint with ID "${activeId}". Check the ID and try again.`}
            />
          </div>
        )}

        {state === 'error' && (
          <div className="card">
            <EmptyState icon={SearchX} title="Something went wrong" message={error} />
          </div>
        )}

        {state === 'found' && result && (
          <div className="animate-fade-in space-y-6">
            <Card title="Repair status" subtitle="Submitted → Assigned → In Progress → Resolved" icon={Activity}>
              <StatusTimeline complaint={result} />
            </Card>

            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <Card title="Complaint details" icon={FileSearch}>
                <ComplaintDetails complaint={result} />
              </Card>
              <div className="space-y-6">
                <Card title="Assigned maintenance team" icon={HardHat}>
                  <TeamCard team={getTeam(result.assignedTeamId)} />
                </Card>
                <Card title="Updates" icon={Activity}>
                  <ActivityLog history={result.history} />
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
