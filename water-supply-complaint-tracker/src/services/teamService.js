import { isApiMode } from '../config/appConfig'
import { SAMPLE_TEAMS } from '../data/sampleData'
import { apiRequest } from './apiClient'
import { storage, STORAGE_KEYS } from './storage'

function loadTeams() {
  const teams = storage.get(STORAGE_KEYS.teams)
  if (Array.isArray(teams) && teams.length) return teams
  storage.set(STORAGE_KEYS.teams, SAMPLE_TEAMS)
  return SAMPLE_TEAMS
}

const localTeamService = {
  async getAll() {
    return loadTeams()
  },
  reset() {
    storage.set(STORAGE_KEYS.teams, SAMPLE_TEAMS)
  },
}

// Spring Boot: GET /api/teams
const apiTeamService = {
  getAll: () => apiRequest('/teams'),
  reset() {},
}

export const teamService = isApiMode() ? apiTeamService : localTeamService
