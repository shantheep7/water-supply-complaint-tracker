import { createContext, useCallback, useContext, useMemo, useState } from 'react'

// Front-end only demo gate that separates the administrator view from the
// resident view. Replace with Spring Security (e.g. JWT login at
// POST /api/auth/login) when the backend is connected.
export const DEMO_OFFICER = {
  officerId: 'WSB-ADMIN',
  accessCode: 'demo@123',
  name: 'Control Room Officer',
}

const SESSION_KEY = 'wsct.adminSession'
const AuthContext = createContext(null)

function readSession() {
  try {
    return JSON.parse(window.sessionStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [officer, setOfficer] = useState(readSession)

  const login = useCallback((officerId, accessCode) => {
    const valid =
      officerId.trim().toUpperCase() === DEMO_OFFICER.officerId && accessCode === DEMO_OFFICER.accessCode
    if (!valid) return false
    const session = { officerId: DEMO_OFFICER.officerId, name: DEMO_OFFICER.name }
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch {
      // ignore - session simply won't survive a reload
    }
    setOfficer(session)
    return true
  }, [])

  const logout = useCallback(() => {
    try {
      window.sessionStorage.removeItem(SESSION_KEY)
    } catch {
      // ignore
    }
    setOfficer(null)
  }, [])

  const value = useMemo(() => ({ officer, isAdmin: Boolean(officer), login, logout }), [officer, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
