import type { ProxyConfig } from './types'

export class ProxyService {
  private readonly safeProxies: ProxyConfig[] = [
    {
      url: 'https://api.allorigins.win/get?url=',
      name: 'AllOrigins',
      contentField: 'contents',
    },
  ]

  async fetchWithProxy(url: string): Promise<Response> {
    // 개발 환경에서만 프록시 사용
    if (import.meta.env.DEV) {
      console.log('🔧 개발 환경 감지: 프록시 서버 시도')

      for (const proxy of this.safeProxies) {
        try {
          const proxyUrl = proxy.url + encodeURIComponent(url)
          console.log(`🌐 프록시 시도: ${proxy.name}`)

          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
            signal: AbortSignal.timeout(10000), // 10초 타임아웃
          })

          if (response.ok) {
            const data = await response.json()

            // allorigins의 경우 contents 필드에 실제 데이터가 있음
            if (proxy.contentField && data[proxy.contentField]) {
              console.log(`✅ 프록시 성공: ${proxy.name}`)
              return new Response(data[proxy.contentField], {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              })
            }

            // 직접 데이터가 있는 경우
            if (!proxy.contentField) {
              console.log(`✅ 프록시 성공: ${proxy.name}`)
              return new Response(JSON.stringify(data), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
              })
            }
          }
        } catch (error) {
          console.warn(`❌ 프록시 실패: ${proxy.name}`, error)
          continue
        }
      }
    }

    console.log('🚫 프록시 사용 불가 또는 실패 - 로컬 데이터 사용')
    throw new Error('CORS blocked - using fallback data')
  }

  isDevEnvironment(): boolean {
    return import.meta.env.DEV
  }
}

export const proxyService = new ProxyService()
