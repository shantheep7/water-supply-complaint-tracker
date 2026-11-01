// Thin, failure-tolerant wrapper around localStorage.
const PREFIX = 'wsct.'

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = window.localStorage.getItem(PREFIX + key)
      return raw === null ? fallback : JSON.parse(raw)
    } catch {
      return fallback
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      // Storage full or blocked (private mode) - the app keeps working in memory.
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(PREFIX + key)
    } catch {
      // ignore
    }
  },
}

export const STORAGE_KEYS = {
  complaints: 'complaints.v1',
  teams: 'teams.v1',
  myComplaints: 'myComplaints.v1',
}
