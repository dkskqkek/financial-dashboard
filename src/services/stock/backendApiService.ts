import type { ApiResponse, StockInfo } from './types'

export class BackendApiService {
  private readonly baseUrl = 'http://localhost:3006'

  async searchKoreanStock(symbol: string): Promise<ApiResponse> {
    // 한국 주식 코드 패턴 확인 (6자리 숫자)
    if (!/^\d{6}$/.test(symbol)) {
      return { success: false, error: 'Not Korean stock symbol' }
    }

    try {
      console.log(`🇰🇷 한국 주식 조회 시작: ${symbol}`)

      const response = await fetch(`${this.baseUrl}/api/stock/korean/${symbol}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        console.log(`✅ 한국 주식 조회 성공: ${result.data.name}`)
        return { success: true, data: result.data, source: 'Yahoo Finance (Backend)' }
      } else {
        console.warn(`❌ 한국 주식 조회 실패: ${result.error}`)
        throw new Error(result.error || '한국 주식을 찾을 수 없습니다')
      }
    } catch (error) {
      console.warn('Korean Stock API failed:', error)
    }

    return { success: false, error: 'Korean stock not found' }
  }

  async searchGlobalStock(symbol: string): Promise<ApiResponse> {
    try {
      console.log(`🌍 글로벌 주식 조회 시작: ${symbol}`)

      const response = await fetch(`${this.baseUrl}/api/stock/global/${symbol}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        console.log(`✅ 글로벌 주식 조회 성공: ${result.data.name}`)
        return { success: true, data: result.data, source: 'Backend API' }
      } else {
        console.warn(`❌ 글로벌 주식 조회 실패: ${result.error}`)
        throw new Error(result.error || '글로벌 주식을 찾을 수 없습니다')
      }
    } catch (error) {
      console.error(`💥 글로벌 주식 API 호출 오류 (${symbol}):`, error)
      throw error
    }
  }

  isKoreanStock(symbol: string): boolean {
    return /^\d{6}$/.test(symbol)
  }

  isBackendAvailable(): boolean {
    // 백엔드 서버 가용성 체크 (향후 확장 가능)
    return true
  }
}

export const backendApiService = new BackendApiService()
