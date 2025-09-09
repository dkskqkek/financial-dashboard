import { fetchWithoutCache, devCacheClear } from '@/utils/cacheUtils'
import { API_CONFIG, DEFAULT_HEADERS } from './config'

export class HttpClient {
  constructor() {
    devCacheClear()
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const separator = endpoint.includes('?') ? '&' : '?'
    const endpointWithCache = `${endpoint}${separator}_t=${timestamp}&_cache=bust&_v=1.0.4&_r=${random}&_force=${Date.now()}`
    const url = `${API_CONFIG.baseUrl}${endpointWithCache}`

    console.log(`🌐 API 요청 (캐시 우회): ${url}`)
    console.log('🔧 요청 옵션:', options)

    for (let attempt = 1; attempt <= API_CONFIG.retryCount; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.requestTimeout)

        const response = await fetchWithoutCache(url, {
          headers: {
            ...DEFAULT_HEADERS,
            Origin: window.location.origin,
            ...options?.headers,
          },
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-cache',
          ...options,
        })

        clearTimeout(timeoutId)
        console.log(`📊 응답 상태: ${response.status} ${response.statusText}`)

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error')
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
        }

        const contentType = response.headers.get('content-type')
        if (!contentType?.includes('application/json')) {
          throw new Error(`Expected JSON response but got ${contentType}`)
        }

        const data = await response.json()
        console.log('✅ 응답 데이터 (실시간):', data)
        return data
      } catch (error) {
        console.error(`❌ API 요청 실패 (시도 ${attempt}/${API_CONFIG.retryCount}):`, error)

        if (attempt < API_CONFIG.retryCount && this.isRetryableError(error)) {
          console.log(`🔄 ${API_CONFIG.retryDelay}ms 후 재시도...`)
          await this.delay(API_CONFIG.retryDelay)
          continue
        }

        if (this.isCorsError(error)) {
          throw new Error('백엔드 서버 연결 실패: CORS 설정을 확인해주세요')
        }

        if (this.isNetworkError(error)) {
          throw new Error('네트워크 연결 실패: 백엔드 서버가 실행 중인지 확인해주세요')
        }

        throw error
      }
    }

    throw new Error('모든 재시도 실패')
  }

  private isRetryableError(error: any): boolean {
    return (
      error.name === 'TypeError' ||
      error.message.includes('fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('Failed to fetch')
    )
  }

  private isCorsError(error: any): boolean {
    return error.message.includes('CORS') || error.message.includes('Access-Control') || error.message.includes('cors')
  }

  private isNetworkError(error: any): boolean {
    return error.name === 'TypeError' && error.message.includes('Failed to fetch')
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const httpClient = new HttpClient()
