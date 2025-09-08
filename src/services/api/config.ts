export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3007/api',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws',
  retryCount: 3,
  retryDelay: 1000,
  requestTimeout: 10000,
} as const

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
  'X-Requested-With': 'XMLHttpRequest',
} as const
