import { getErrorMessage } from '@/lib/utils'

interface ExchangeRate {
  USD_KRW: number
  lastUpdated: string
}

interface CachedRate {
  rate: ExchangeRate
  timestamp: number
}

class ExchangeRateService {
  private cache: CachedRate | null = null
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5분 캐싱으로 단축
  private readonly FALLBACK_RATE = 1380 // 2025년 현재 환율 반영

  // 백엔드 API를 우선적으로 사용하여 환율 조회
  async fetchExchangeRate(): Promise<number> {
    try {
      // 캐시된 데이터가 유효한지 확인
      if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_DURATION) {
        console.log('💰 환율 캐시 사용:', this.cache.rate.USD_KRW)
        return this.cache.rate.USD_KRW
      }

      // 1순위: 백엔드 API에서 환율 조회 (Yahoo Finance 기반)
      let rate = await this.fetchFromBackendApi()

      // 백엔드 실패시 기존 API들 시도
      if (!rate) {
        rate = await this.tryExchangeRateApis()
      }

      if (rate) {
        // 캐시 저장
        this.cache = {
          rate: {
            USD_KRW: rate,
            lastUpdated: new Date().toISOString(),
          },
          timestamp: Date.now(),
        }
        console.log('💰 환율 업데이트 성공:', rate)
        return rate
      } else {
        console.warn('⚠️ 모든 환율 API 실패, fallback 사용:', this.FALLBACK_RATE)
        return this.FALLBACK_RATE
      }
    } catch (error) {
      console.error('💥 환율 조회 오류:', error)
      return this.FALLBACK_RATE
    }
  }

  private async tryExchangeRateApis(): Promise<number | null> {
    const apis = [
      this.fetchFromExchangeRateApi.bind(this),
      this.fetchFromCurrencyApi.bind(this),
      this.fetchFromFixer.bind(this),
    ]

    for (const apiCall of apis) {
      try {
        const rate = await apiCall()
        if (rate && rate > 0) {
          return rate
        }
      } catch (error) {
        console.log('환율 API 시도 실패, 다음 API 시도 중...')
        continue
      }
    }

    return null
  }

  // 백엔드 API에서 환율 조회 (우선순위 1)
  private async fetchFromBackendApi(): Promise<number | null> {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3007/api'
      const response = await fetch(`${baseUrl}/market/data`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
      })

      if (!response.ok) {
        throw new Error(`백엔드 API 응답 오류: ${response.status}`)
      }

      const data = await response.json()
      const rate = data.usdKrw?.value

      if (rate && rate > 0) {
        console.log('✅ 백엔드에서 환율 조회 성공:', rate)
        return rate
      }

      throw new Error('백엔드 환율 데이터가 유효하지 않음')
    } catch (error) {
      console.warn('❌ 백엔드 환율 조회 실패:', getErrorMessage(error))
      return null
    }
  }

  // ExchangeRate-API (무료, API 키 불필요)
  private async fetchFromExchangeRateApi(): Promise<number | null> {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    if (!response.ok) {
      throw new Error('ExchangeRate API 응답 오류')
    }

    const data = await response.json()
    return data.rates?.KRW || null
  }

  // Currency API (무료)
  private async fetchFromCurrencyApi(): Promise<number | null> {
    const response = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json')
    if (!response.ok) {
      throw new Error('Currency API 응답 오류')
    }

    const data = await response.json()
    return data.usd?.krw || null
  }

  // Fixer (backup, 제한된 무료)
  private async fetchFromFixer(): Promise<number | null> {
    const response = await fetch('https://api.fixer.io/latest?base=USD&symbols=KRW')
    if (!response.ok) {
      throw new Error('Fixer API 응답 오류')
    }

    const data = await response.json()
    return data.rates?.KRW || null
  }

  // USD를 KRW로 변환
  async convertUsdToKrw(usdAmount: number): Promise<number> {
    const rate = await this.fetchExchangeRate()
    return usdAmount * rate
  }

  // 현재 환율 반환 (캐싱된 값 우선)
  async getCurrentRate(): Promise<number> {
    return await this.fetchExchangeRate()
  }

  // 캐시 강제 새로고침
  async refreshCache(): Promise<number> {
    this.cache = null
    return await this.fetchExchangeRate()
  }

  // 캐시된 환율 정보 반환
  getCachedRate(): ExchangeRate | null {
    return this.cache?.rate || null
  }
}

export const exchangeRateService = new ExchangeRateService()
export type { ExchangeRate }
