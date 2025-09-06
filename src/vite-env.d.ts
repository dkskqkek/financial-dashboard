/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_WS_URL: string
  readonly VITE_ENABLE_MOCK_DATA: string
  readonly VITE_ENABLE_WEBSOCKET: string
  readonly VITE_YAHOO_FINANCE_API_KEY: string
  readonly VITE_ALPHA_VANTAGE_API_KEY: string
  readonly VITE_KIS_API_KEY: string
  readonly VITE_KIS_API_SECRET: string
  readonly VITE_JWT_SECRET: string
  readonly VITE_REFRESH_TOKEN_ENDPOINT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}