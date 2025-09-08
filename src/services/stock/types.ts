export interface StockInfo {
  symbol: string
  name: string
  currentPrice?: number
  currency: string
  exchange: string
  marketCap?: number
  volume?: number
  change?: number
  changePercent?: number
}

export interface ApiResponse {
  success: boolean
  data?: StockInfo
  error?: string
  source?: string
}

export interface ApiProvider {
  name: string
  enabled: boolean
}

export interface ProxyConfig {
  url: string
  name: string
  contentField?: string
}

export interface RealTimeTracker {
  start: (symbols: string[], callback: (data: StockInfo[]) => void) => Promise<() => void>
  stop: () => void
}
