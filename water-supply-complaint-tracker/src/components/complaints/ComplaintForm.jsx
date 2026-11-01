import { Home, Mail, MapPin, Phone, Send, User } from 'lucide-react'
import { useState } from 'react'
import { AREAS, COMPLAINT_TYPE_META, PRIORITY, PRIORITY_META, toOptions } from '../../constants/complaint'
import Button from '../ui/Button'
import { Field, Input, Select, Textarea } from '../ui/FormField'
import { TYPE_ICONS } from './ComplaintTypeIcon'

const EMPTY_FORM = {
  residentName: '',
  phone: '',
  email: '',
  area: '',
  address: '',
  type: '',
  priority: PRIORITY.MEDIUM,
  description: '',
}

const MIN_DESCRIPTION = 20

function validate(form) {
  const errors = {}
  if (form.residentName.trim().length < 3) errors.residentName = 'Enter your full name.'
  if (!/^[6-9]\d{9}$/.test(form.phone.trim())) errors.phone = 'Enter a valid 10-digit mobile number.'
  if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.'
  if (!form.area) errors.area = 'Select your locality.'
  if (form.address.trim().length < 5) errors.address = 'Enter a house number, street or landmark.'
  if (!form.type) errors.type = 'Select the type of problem.'
  if (form.description.trim().length < MIN_DESCRIPTION)
    errors.description = `Describe the problem in at least ${MIN_DESCRIPTION} characters.`
  return errors
}

export default function ComplaintForm({ onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (event) => {
    const value = event.target.value
    setForm((current) => ({ ...current, [field]: value }))
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const found = validate(form)
    setErrors(found)
    if (Object.keys(found).length) return

    setSubmitting(true)
    try {
      await onSubmit(form)
      setForm(EMPTY_FORM)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Resident details</legend>
        <Field label="Full name" htmlFor="residentName" required error={errors.residentName}>
          <Input id="residentName" icon={User} placeholder="e.g. Anitha Raman" value={form.residentName} onChange={update('residentName')} error={errors.residentName} />
        </Field>
        <Field label="Mobile number" htmlFor="phone" required error={errors.phone}>
          <Input id="phone" icon={Phone} inputMode="numeric" maxLength={10} placeholder="10-digit mobile" value={form.phone} onChange={update('phone')} error={errors.phone} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email} hint="Optional — for status updates" className="sm:col-span-2">
          <Input id="email" type="email" icon={Mail} placeholder="you@example.com" value={form.email} onChange={update('email')} error={errors.email} />
        </Field>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Location</legend>
        <Field label="Locality / area" htmlFor="area" required error={errors.area}>
          <Select id="area" placeholder="Select locality" options={AREAS} value={form.area} onChange={update('area')} error={errors.area} />
        </Field>
        <Field label="Address / landmark" htmlFor="address" required error={errors.address}>
          <Input id="address" icon={MapPin} placeholder="House no., street, landmark" value={form.address} onChange={update('address')} error={errors.address} />
        </Field>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Complaint type <span className="text-red-500">*</span>
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(COMPLAINT_TYPE_META).map(([value, meta]) => {
            const Icon = TYPE_ICONS[value]
            const selected = form.type === value
            return (
              <label
                key={value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                  selected ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-100' : 'border-slate-200 hover:border-brand-200 hover:bg-slate-50'
                }`}
              >
                <input type="radio" name="type" value={value} checked={selected} onChange={update('type')} className="sr-only" />
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${meta.color}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-800">{meta.label}</span>
                  <span className="block text-xs text-slate-500">{meta.description}</span>
                </span>
              </label>
            )
          })}
        </div>
        {errors.type && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.type}</p>}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Urgency" htmlFor="priority">
          <Select id="priority" options={toOptions(PRIORITY_META)} value={form.priority} onChange={update('priority')} />
        </Field>
        <Field
          label="Description"
          htmlFor="description"
          required
          error={errors.description}
          hint={`${form.description.trim().length}/${MIN_DESCRIPTION} characters minimum`}
          className="sm:col-span-3"
        >
          <Textarea
            id="description"
            rows={4}
            placeholder="When did the problem start? How many houses are affected? Any visible leak or damage?"
            value={form.description}
            onChange={update('description')}
            error={errors.description}
          />
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-xs text-slate-500">
          <Home className="h-4 w-4" /> A unique complaint ID is generated on submission.
        </p>
        <Button type="submit" icon={Send} loading={submitting} className="w-full sm:w-auto">
          Submit complaint
        </Button>
      </div>
    </form>
  )
}
