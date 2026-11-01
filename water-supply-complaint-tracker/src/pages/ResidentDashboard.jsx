import { CheckCircle2, ClipboardPlus, Copy, FileText, Info, ListChecks, Phone, Search, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ComplaintCard from '../components/complaints/ComplaintCard'
import ComplaintForm from '../components/complaints/ComplaintForm'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import PageHeader from '../components/ui/PageHeader'
import Spinner from '../components/ui/Spinner'
import { APP_CONFIG } from '../config/appConfig'
import { COMPLAINT_TYPE_META } from '../constants/complaint'
import { useComplaints } from '../context/ComplaintContext'
import { useToast } from '../context/ToastContext'

function SubmissionSuccess({ complaint, onClose }) {
  const { notify } = useToast()
  const navigate = useNavigate()

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(complaint.id)
      notify('Complaint ID copied to clipboard.', 'info')
    } catch {
      notify('Could not copy — please note the ID manually.', 'error')
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Complaint registered"
      size="max-w-md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button icon={Search} onClick={() => navigate(`/track?id=${complaint.id}`)}>
            Track status
          </Button>
        </>
      }
    >
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <p className="mt-4 text-sm text-slate-500">Your complaint ID is</p>
        <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 ring-1 ring-brand-100">
          <span className="font-mono text-xl font-bold tracking-wide text-brand-700">{complaint.id}</span>
          <button onClick={copyId} className="focus-ring rounded-md p-1 text-brand-500 hover:bg-brand-100" aria-label="Copy complaint ID">
            <Copy className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          {COMPLAINT_TYPE_META[complaint.type].label} in <strong>{complaint.area}</strong>. Save this ID to follow the
          repair — the control room will assign a maintenance team shortly.
        </p>
      </div>
    </Modal>
  )
}

export default function ResidentDashboard() {
  const { createComplaint, myComplaints, getTeam, loading } = useComplaints()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(null)

  const handleSubmit = async (form) => {
    try {
      const complaint = await createComplaint(form)
      setSubmitted(complaint)
      notify(`Complaint ${complaint.id} registered successfully.`)
    } catch (error) {
      notify(error.message || 'Could not register the complaint.', 'error')
      throw error
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Resident dashboard"
        title="Register a water supply complaint"
        description="Tell us what is wrong and where. You will receive a unique complaint ID to track the repair."
        icon={UserRound}
        actions={
          <Button as={Link} to="/track" variant="outlineLight" icon={Search}>
            Track a complaint
          </Button>
        }
      />

      <div className="container-page mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card title="New complaint" subtitle="Fields marked * are required" icon={ClipboardPlus}>
          <ComplaintForm onSubmit={handleSubmit} />
        </Card>

        <div className="space-y-6">
          <Card
            title="My complaints"
            subtitle="Submitted from this device"
            icon={ListChecks}
            bodyClassName="p-4"
            actions={<span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{myComplaints.length}</span>}
          >
            {loading ? (
              <Spinner />
            ) : myComplaints.length ? (
              <div className="space-y-3">
                {myComplaints.map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    team={getTeam(complaint.assignedTeamId)}
                    onClick={() => navigate(`/track?id=${complaint.id}`)}
                    actionLabel="Track"
                  />
                ))}
              </div>
            ) : (
              <EmptyState icon={FileText} title="No complaints yet" message="Complaints you register will appear here for quick tracking." />
            )}
          </Card>

          <div className="card space-y-3 p-5 text-sm">
            <p className="flex items-center gap-2 font-semibold text-slate-900">
              <Info className="h-4 w-4 text-brand-600" /> Before you submit
            </p>
            <ul className="list-disc space-y-1.5 pl-5 text-slate-600">
              <li>Check the "My complaints" list to avoid duplicate reports.</li>
              <li>Mention a nearby landmark so crews can find the site quickly.</li>
              <li>For major bursts or flooding, mark urgency as Critical.</li>
            </ul>
            <p className="flex items-center gap-2 rounded-lg bg-cyan-50 px-3 py-2 font-medium text-cyan-800">
              <Phone className="h-4 w-4" /> Emergency helpline: {APP_CONFIG.helpline}
            </p>
          </div>
        </div>
      </div>

      {submitted && <SubmissionSuccess complaint={submitted} onClose={() => setSubmitted(null)} />}
    </>
  )
}
