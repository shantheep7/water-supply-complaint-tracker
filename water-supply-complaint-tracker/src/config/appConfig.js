// Central configuration. Switch VITE_DATA_SOURCE to "api" once the
// Spring Boot backend is available (see .env.example and README.md).
export const APP_CONFIG = {
  appName: 'Water Supply Complaint Tracker',
  authority: 'Municipal Water Supply & Sewerage Board',
  helpline: '1916',
  email: 'support@watersupply.gov.example',
  dataSource: import.meta.env.VITE_DATA_SOURCE || 'local',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  // Artificial latency for the local data source so loading states are visible.
  mockLatencyMs: 250,
}

export const isApiMode = () => APP_CONFIG.dataSource === 'api'
