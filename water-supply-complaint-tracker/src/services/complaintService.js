import { APP_CONFIG, isApiMode } from '../config/appConfig'
import { COMPLAINT_STATUS, STATUS_FLOW, STATUS_META } from '../constants/complaint'
import { SAMPLE_COMPLAINTS } from '../data/sampleData'
import { generateComplaintId, normalizeComplaintId } from '../utils/idGenerator'
import { apiRequest } from './apiClient'
import { storage, STORAGE_KEYS } from './storage'
import { teamService } from './teamService'

/*
 * Complaint service - the single place the UI talks to for complaint data.
 *
 * Two interchangeable implementations share one async interface:
 *   - localComplaintService: localStorage demo data (default)
 *   - apiComplaintService:   Spring Boot REST API (VITE_DATA_SOURCE=api)
 *
 * The local implementation mirrors the validation the backend should enforce,
 * so the UI behaves the same when the API is switched on.
 */

const delay = (ms = APP_CONFIG.mockLatencyMs) => new Promise((resolve) => setTimeout(resolve, ms))

function loadComplaints() {
  const complaints = storage.get(STORAGE_KEYS.complaints)
  if (Array.isArray(complaints)) return complaints
  storage.set(STORAGE_KEYS.complaints, SAMPLE_COMPLAINTS)
  return SAMPLE_COMPLAINTS
}

const saveComplaints = (complaints) => storage.set(STORAGE_KEYS.complaints, complaints)

const sortNewestFirst = (list) =>
  [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

function applyFilters(list, { area, type, status, search } = {}) {
  const query = search?.trim().toLowerCase()
  return list.filter(
    (c) =>
      (!area || c.area === area) &&
      (!type || c.type === type) &&
      (!status || c.status === status) &&
      (!query ||
        c.id.toLowerCase().includes(query) ||
        c.residentName.toLowerCase().includes(query) ||
        c.phone.includes(query)),
  )
}

function findOrThrow(complaints, id) {
  const index = complaints.findIndex((c) => c.id === normalizeComplaintId(id))
  if (index === -1) throw new Error(`Complaint ${id} was not found.`)
  return index
}

const localComplaintService = {
  async getAll(filters) {
    await delay()
    return sortNewestFirst(applyFilters(loadComplaints(), filters))
  },

  async getById(id) {
    await delay()
    return loadComplaints().find((c) => c.id === normalizeComplaintId(id)) || null
  },

  async create(payload) {
    await delay()
    const complaints = loadComplaints()
    const now = new Date().toISOString()
    const complaint = {
      id: generateComplaintId(complaints.map((c) => c.id)),
      residentName: payload.residentName.trim(),
      phone: payload.phone.trim(),
      email: payload.email?.trim() || '',
      area: payload.area,
      address: payload.address.trim(),
      type: payload.type,
      priority: payload.priority,
      description: payload.description.trim(),
      status: COMPLAINT_STATUS.SUBMITTED,
      assignedTeamId: null,
      createdAt: now,
      updatedAt: now,
      history: [
        { status: COMPLAINT_STATUS.SUBMITTED, timestamp: now, note: 'Complaint registered online.', by: 'Resident' },
      ],
    }
    saveComplaints([complaint, ...complaints])
    return complaint
  },

  async assignTeam(id, teamId, note = '') {
    await delay()
    const complaints = loadComplaints()
    const index = findOrThrow(complaints, id)
    const team = (await teamService.getAll()).find((t) => t.id === teamId)
    if (!team) throw new Error('Please select a valid maintenance team.')

    const current = complaints[index]
    if (current.status === COMPLAINT_STATUS.RESOLVED) {
      throw new Error('A resolved complaint cannot be reassigned.')
    }
    const isReassign = Boolean(current.assignedTeamId)
    const nextStatus =
      current.status === COMPLAINT_STATUS.SUBMITTED ? COMPLAINT_STATUS.ASSIGNED : current.status
    const now = new Date().toISOString()

    const updated = {
      ...current,
      assignedTeamId: team.id,
      status: nextStatus,
      updatedAt: now,
      history: [
        ...current.history,
        {
          status: nextStatus,
          timestamp: now,
          note:
            note.trim() ||
            `${isReassign ? 'Reassigned' : 'Assigned'} to ${team.name} (${team.specialization}).`,
          by: 'Control Room',
        },
      ],
    }
    complaints[index] = updated
    saveComplaints(complaints)
    return updated
  },

  async updateStatus(id, status, note = '') {
    await delay()
    const complaints = loadComplaints()
    const index = findOrThrow(complaints, id)
    const current = complaints[index]

    if (!STATUS_FLOW.includes(status)) throw new Error('Unknown status.')
    if (STATUS_FLOW.indexOf(status) < STATUS_FLOW.indexOf(current.status)) {
      throw new Error('Status can only move forward: Submitted → Assigned → In Progress → Resolved.')
    }
    if (status !== COMPLAINT_STATUS.SUBMITTED && !current.assignedTeamId) {
      throw new Error('Assign a maintenance team before updating the status.')
    }
    if (status === current.status) return current

    const now = new Date().toISOString()
    const updated = {
      ...current,
      status,
      updatedAt: now,
      history: [
        ...current.history,
        {
          status,
          timestamp: now,
          note: note.trim() || `Status changed to ${STATUS_META[status].label}.`,
          by: 'Control Room',
        },
      ],
    }
    complaints[index] = updated
    saveComplaints(complaints)
    return updated
  },

  async resetDemoData() {
    saveComplaints(SAMPLE_COMPLAINTS)
    teamService.reset()
  },
}

// Expected Spring Boot endpoints - see README.md "Spring Boot integration".
const apiComplaintService = {
  getAll: (filters) => apiRequest('/complaints', { params: filters }),
  getById: async (id) => {
    try {
      return await apiRequest(`/complaints/${encodeURIComponent(normalizeComplaintId(id))}`)
    } catch (error) {
      if (error.status === 404) return null
      throw error
    }
  },
  create: (payload) => apiRequest('/complaints', { method: 'POST', body: payload }),
  assignTeam: (id, teamId, note) =>
    apiRequest(`/complaints/${encodeURIComponent(id)}/assign`, { method: 'PATCH', body: { teamId, note } }),
  updateStatus: (id, status, note) =>
    apiRequest(`/complaints/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status, note } }),
  resetDemoData: async () => {
    throw new Error('Resetting demo data is only available in local mode.')
  },
}

export const complaintService = isApiMode() ? apiComplaintService : localComplaintService
