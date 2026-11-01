// Enum values mirror the Java enums planned for the Spring Boot backend
// (e.g. enum ComplaintStatus { SUBMITTED, ASSIGNED, IN_PROGRESS, RESOLVED }).

export const COMPLAINT_STATUS = {
  SUBMITTED: 'SUBMITTED',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
}

export const STATUS_FLOW = [
  COMPLAINT_STATUS.SUBMITTED,
  COMPLAINT_STATUS.ASSIGNED,
  COMPLAINT_STATUS.IN_PROGRESS,
  COMPLAINT_STATUS.RESOLVED,
]

export const STATUS_META = {
  SUBMITTED: {
    label: 'Submitted',
    description: 'Complaint received by the water board',
    badge: 'bg-slate-100 text-slate-700 ring-slate-300',
    dot: 'bg-slate-500',
  },
  ASSIGNED: {
    label: 'Assigned',
    description: 'Maintenance team assigned',
    badge: 'bg-amber-50 text-amber-700 ring-amber-300',
    dot: 'bg-amber-500',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    description: 'Repair work under way',
    badge: 'bg-sky-50 text-sky-700 ring-sky-300',
    dot: 'bg-sky-500',
  },
  RESOLVED: {
    label: 'Resolved',
    description: 'Issue fixed and supply restored',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-300',
    dot: 'bg-emerald-500',
  },
}

export const COMPLAINT_TYPE = {
  WATER_SHORTAGE: 'WATER_SHORTAGE',
  PIPELINE_LEAKAGE: 'PIPELINE_LEAKAGE',
  NO_WATER_SUPPLY: 'NO_WATER_SUPPLY',
  CONTAMINATED_WATER: 'CONTAMINATED_WATER',
}

export const COMPLAINT_TYPE_META = {
  WATER_SHORTAGE: {
    label: 'Water Shortage',
    description: 'Low pressure or insufficient supply hours',
    color: 'text-amber-600 bg-amber-50',
  },
  PIPELINE_LEAKAGE: {
    label: 'Pipeline Leakage',
    description: 'Burst, cracked or leaking pipes and valves',
    color: 'text-sky-600 bg-sky-50',
  },
  NO_WATER_SUPPLY: {
    label: 'No Water Supply',
    description: 'Complete stoppage of water supply',
    color: 'text-rose-600 bg-rose-50',
  },
  CONTAMINATED_WATER: {
    label: 'Contaminated Water',
    description: 'Muddy, smelly or discoloured water',
    color: 'text-violet-600 bg-violet-50',
  },
}

export const PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
}

export const PRIORITY_META = {
  LOW: { label: 'Low', badge: 'bg-slate-50 text-slate-600 ring-slate-200' },
  MEDIUM: { label: 'Medium', badge: 'bg-blue-50 text-blue-700 ring-blue-200' },
  HIGH: { label: 'High', badge: 'bg-orange-50 text-orange-700 ring-orange-200' },
  CRITICAL: { label: 'Critical', badge: 'bg-red-50 text-red-700 ring-red-200' },
}

export const AREAS = [
  'Riverside Ward',
  'Lakeview Colony',
  'Hillcrest Heights',
  'Old Market Area',
  'Green Park Extension',
  'Station Road',
  'Gandhi Nagar',
  'Industrial Estate',
  'Sunrise Enclave',
  'Temple Street',
]

export const toOptions = (meta) =>
  Object.entries(meta).map(([value, { label }]) => ({ value, label }))
