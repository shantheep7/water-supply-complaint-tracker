import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { SAMPLE_RESIDENT_COMPLAINT_IDS } from '../data/sampleData'
import { complaintService } from '../services/complaintService'
import { storage, STORAGE_KEYS } from '../services/storage'
import { teamService } from '../services/teamService'
import { computeStats } from '../utils/stats'

const ComplaintContext = createContext(null)

export function ComplaintProvider({ children }) {
  const [complaints, setComplaints] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [myComplaintIds, setMyComplaintIds] = useState(
    () => storage.get(STORAGE_KEYS.myComplaints) ?? SAMPLE_RESIDENT_COMPLAINT_IDS,
  )

  useEffect(() => {
    storage.set(STORAGE_KEYS.myComplaints, myComplaintIds)
  }, [myComplaintIds])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [complaintList, teamList] = await Promise.all([complaintService.getAll(), teamService.getAll()])
      setComplaints(complaintList)
      setTeams(teamList)
    } catch (err) {
      setError(err.message || 'Unable to load complaints.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const replaceComplaint = (updated) =>
    setComplaints((list) => list.map((c) => (c.id === updated.id ? updated : c)))

  const createComplaint = useCallback(async (payload) => {
    const created = await complaintService.create(payload)
    setComplaints((list) => [created, ...list])
    setMyComplaintIds((ids) => [created.id, ...ids.filter((id) => id !== created.id)])
    return created
  }, [])

  const assignTeam = useCallback(async (id, teamId, note) => {
    const updated = await complaintService.assignTeam(id, teamId, note)
    replaceComplaint(updated)
    return updated
  }, [])

  const updateStatus = useCallback(async (id, status, note) => {
    const updated = await complaintService.updateStatus(id, status, note)
    replaceComplaint(updated)
    return updated
  }, [])

  const getComplaintById = useCallback((id) => complaintService.getById(id), [])

  const resetDemoData = useCallback(async () => {
    await complaintService.resetDemoData()
    setMyComplaintIds(SAMPLE_RESIDENT_COMPLAINT_IDS)
    await refresh()
  }, [refresh])

  const value = useMemo(() => {
    const teamById = Object.fromEntries(teams.map((t) => [t.id, t]))
    return {
      complaints,
      teams,
      loading,
      error,
      stats: computeStats(complaints),
      myComplaints: complaints.filter((c) => myComplaintIds.includes(c.id)),
      getTeam: (teamId) => (teamId ? teamById[teamId] || null : null),
      refresh,
      createComplaint,
      assignTeam,
      updateStatus,
      getComplaintById,
      resetDemoData,
    }
  }, [complaints, teams, loading, error, myComplaintIds, refresh, createComplaint, assignTeam, updateStatus, getComplaintById, resetDemoData])

  return <ComplaintContext.Provider value={value}>{children}</ComplaintContext.Provider>
}

export function useComplaints() {
  const context = useContext(ComplaintContext)
  if (!context) throw new Error('useComplaints must be used inside <ComplaintProvider>')
  return context
}
