import { yahooFinanceApi } from './yahooFinanceApi'
import { externalApisService } from './externalApisService'
import { backendApiService } from './backendApiService'
import { realTimeTracker } from './realTimeTracker'
import type { StockInfo, ApiProvider } from './types'

export class StockApiService {
  // 여러 API 소스를 순서대로 시도
  private readonly apiSources: ApiProvider[] = [
    { name: 'Yahoo Finance', enabled: true },
    { name: 'IEX Cloud', enabled: true },
    { name: 'Finnhub', enabled: true },
    { name: 'Alpha Vantage', enabled: true },
    { name: 'Polygon', enabled: true },
    { name: 'Korean Investment', enabled: true },
  ]

  // 메인 검색 함수 - 여러 API를 순서대로 시도
  async searchStock(symbol: string): Promise<StockInfo | null> {
    console.log(`🔍 주식 검색 시작: ${symbol}`)

    // 한국 주식인지 먼저 확인
    if (backendApiService.isKoreanStock(symbol)) {
      console.log('📈 한국 주식으로 인식, Yahoo Finance 우선 시도')

      // 1. Yahoo Finance로 한국 주식 먼저 시도
      const yahooResult = await yahooFinanceApi.searchKoreanStock(symbol)
      if (yahooResult.success && yahooResult.data) {
        console.log(`✅ ${yahooResult.source}에서 조회 성공:`, yahooResult.data)
        return yahooResult.data
      }

      // 2. 실패시 백엔드 API 사용
      console.log('🔄 Yahoo Finance 실패, 백엔드 API 사용')
      const backendResult = await backendApiService.searchKoreanStock(symbol)
      if (backendResult.success && backendResult.data) {
        console.log(`✅ ${backendResult.source}에서 조회 성공:`, backendResult.data)
        return backendResult.data
      }
    }

    // 글로벌 주식은 백엔드 API 호출
    try {
      console.log(`🌍 글로벌 주식 조회 시작: ${symbol}`)
      const globalResult = await backendApiService.searchGlobalStock(symbol)
      if (globalResult.success && globalResult.data) {
        console.log(`✅ 글로벌 주식 조회 성공: ${globalResult.data.name}`)
        return globalResult.data
      }
    } catch (error) {
      console.error(`💥 글로벌 주식 API 호출 오류 (${symbol}):`, error)
    }

    console.log(`❌ 모든 API에서 ${symbol} 조회 실패`)
    return null
  }

  // Yahoo Finance 검색 기능 (심볼 자동완성)
  async searchYahooSymbols(query: string): Promise<StockInfo[]> {
    return yahooFinanceApi.searchSymbols(query)
  }

  // 야후 파이낸스 실시간 가격 추적
  async startYahooRealTimeTracking(symbols: string[], callback: (data: StockInfo[]) => void): Promise<() => void> {
    return realTimeTracker.start(symbols, callback)
  }

  // 실시간 주가 업데이트 (WebSocket 대신 폴링)
  async startPriceTracking(symbols: string[], callback: (updates: StockInfo[]) => void): Promise<() => void> {
    return realTimeTracker.startPollingTracker(symbols, callback)
  }

  // 추가된 유틸리티 메서드들
  getApiSources(): ApiProvider[] {
    return [...this.apiSources]
  }

  isRealTimeTracking(): boolean {
    return realTimeTracker.isActive()
  }

  getActiveTrackersCount(): number {
    return realTimeTracker.getActiveTrackersCount()
  }

  stopAllTracking(): void {
    realTimeTracker.stop()
  }

  // 외부 API 서비스들에 직접 접근 (필요시)
  get yahoo() {
    return yahooFinanceApi
  }

  get external() {
    return externalApisService
  }

  get backend() {
    return backendApiService
  }

  get realtime() {
    return realTimeTracker
  }
}

// Export all types and services
export type { StockInfo, ApiResponse, ApiProvider, RealTimeTracker } from './types'
export { yahooFinanceApi } from './yahooFinanceApi'
export { externalApisService } from './externalApisService'
export { backendApiService } from './backendApiService'
export { realTimeTracker } from './realTimeTracker'
export { proxyService } from './proxyService'

export const stockApiService = new StockApiService()
