import { COMPLAINT_STATUS, COMPLAINT_TYPE_META } from '../constants/complaint'

export function computeStats(complaints) {
  const count = (status) => complaints.filter((c) => c.status === status).length
  const submitted = count(COMPLAINT_STATUS.SUBMITTED)
  const assigned = count(COMPLAINT_STATUS.ASSIGNED)
  const inProgress = count(COMPLAINT_STATUS.IN_PROGRESS)
  const resolved = count(COMPLAINT_STATUS.RESOLVED)

  const resolvedDurations = complaints
    .filter((c) => c.status === COMPLAINT_STATUS.RESOLVED)
    .map((c) => {
      const end = c.history.find((h) => h.status === COMPLAINT_STATUS.RESOLVED)?.timestamp
      return end ? new Date(end) - new Date(c.createdAt) : null
    })
    .filter((d) => d !== null && d >= 0)

  const avgResolutionMs = resolvedDurations.length
    ? resolvedDurations.reduce((a, b) => a + b, 0) / resolvedDurations.length
    : 0

  const byType = Object.keys(COMPLAINT_TYPE_META).map((type) => ({
    type,
    count: complaints.filter((c) => c.type === type).length,
  }))

  return {
    total: complaints.length,
    submitted,
    assigned,
    // "Pending" = waiting for repair work to start.
    pending: submitted + assigned,
    inProgress,
    resolved,
    resolutionRate: complaints.length ? Math.round((resolved / complaints.length) * 100) : 0,
    avgResolutionMs,
    byType,
  }
}
