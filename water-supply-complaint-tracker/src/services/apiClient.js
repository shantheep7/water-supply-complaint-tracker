import { APP_CONFIG } from '../config/appConfig'

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

// Minimal fetch wrapper for the Spring Boot REST API.
// Add an Authorization header here once Spring Security (JWT) is in place.
export async function apiRequest(path, { method = 'GET', body, params } = {}) {
  const url = new URL(APP_CONFIG.apiBaseUrl + path, window.location.origin)
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
  })

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })

  const isJson = response.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await response.json() : null

  if (!response.ok) {
    // Spring Boot error responses carry a "message" field by default.
    throw new ApiError(data?.message || `Request failed (${response.status})`, response.status, data)
  }
  return data
}
