import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { COMPLAINT_STATUS, STATUS_FLOW, STATUS_META } from '../../constants/complaint'
import { useComplaints } from '../../context/ComplaintContext'
import { useToast } from '../../context/ToastContext'
import ActivityLog from '../complaints/ActivityLog'
import ComplaintDetails from '../complaints/ComplaintDetails'
import StatusTimeline from '../complaints/StatusTimeline'
import Button from '../ui/Button'
import { Field, Select, Textarea } from '../ui/FormField'

export default function ManageComplaintModal({ complaint, onClose }) {
  const { teams, assignTeam, updateStatus } = useComplaints()
  const { notify } = useToast()
  const [teamId, setTeamId] = useState('')
  const [status, setStatus] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!complaint) return
    setTeamId(complaint.assignedTeamId || '')
    setStatus(complaint.status)
    setNote('')
    setError('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaint?.id])

  if (!complaint) return null

  const isResolved = complaint.status === COMPLAINT_STATUS.RESOLVED
  // Status only moves forward; SUBMITTED is reached automatically, ASSIGNED via team assignment.
  const statusOptions = STATUS_FLOW.slice(STATUS_FLOW.indexOf(complaint.status)).map((value) => ({
    value,
    label: STATUS_META[value].label,
  }))
  const teamChanged = teamId && teamId !== complaint.assignedTeamId
  const statusChanged = status !== complaint.status
  const hasChanges = teamChanged || statusChanged

  const handleSave = async () => {
    setError('')
    if (!teamId && status !== COMPLAINT_STATUS.SUBMITTED) {
      setError('Select a maintenance team before changing the status.')
      return
    }
    setSaving(true)
    try {
      let updated = complaint
      if (teamChanged) updated = await assignTeam(complaint.id, teamId, statusChanged ? '' : note)
      if (status !== updated.status) updated = await updateStatus(complaint.id, status, note)
      notify(`${complaint.id} updated — now ${STATUS_META[updated.status].label}.`)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <ComplaintDetails complaint={complaint} showContact />

      <div className="rounded-xl border border-slate-200 p-4 sm:p-5">
        <StatusTimeline complaint={complaint} />
      </div>

      {isResolved ? (
        <p className="rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          This complaint is resolved. No further changes can be made.
        </p>
      ) : (
        <div className="grid gap-4 rounded-xl bg-brand-50/50 p-4 ring-1 ring-brand-100 sm:grid-cols-2 sm:p-5">
          <Field label="Maintenance team" htmlFor="team">
            <Select
              id="team"
              placeholder="Select a team"
              options={teams.map((t) => ({ value: t.id, label: `${t.name} — ${t.specialization}` }))}
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
            />
          </Field>
          <Field label="Status" htmlFor="status">
            <Select id="status" options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value)} />
          </Field>
          <Field label="Update note" htmlFor="note" hint="Shown to the resident on the tracking page" className="sm:col-span-2">
            <Textarea id="note" rows={2} placeholder="e.g. Crew dispatched, valve replacement scheduled for 3 PM" value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          {error && <p className="text-sm font-medium text-red-600 sm:col-span-2">{error}</p>}
          <div className="flex justify-end gap-3 sm:col-span-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button icon={Save} onClick={handleSave} loading={saving} disabled={!hasChanges}>
              Save changes
            </Button>
          </div>
        </div>
      )}

      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-900">Activity log</h4>
        <ActivityLog history={complaint.history} />
      </div>
    </div>
  )
}
