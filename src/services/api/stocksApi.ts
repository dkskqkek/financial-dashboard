import { httpClient } from './httpClient'
import { mockDataGenerators } from './mockDataGenerators'
import { getErrorMessage } from '@/lib/utils'
import type { Stock } from '@/types'

export class StocksApi {
  async getStocks(): Promise<Stock[]> {
    try {
      return await httpClient.request<Stock[]>('/stocks')
    } catch (error) {
      console.warn('Stocks API not available, using local store data')
      return []
    }
  }

  async searchStock(
    symbol: string
  ): Promise<{ symbol: string; name: string; currentPrice?: number; currency?: string; exchange?: string } | null> {
    try {
      console.log(`🔍 백엔드를 통한 주식 검색 요청: ${symbol}`)

      const response = await httpClient.request<{ success: boolean; data?: any; error?: string }>(
        `/stock/search?query=${encodeURIComponent(symbol)}`
      )

      if (response.success && response.data) {
        const stockInfo = response.data
        console.log(`✅ 백엔드에서 주식 조회 성공: ${stockInfo.name}`)
        return {
          symbol: stockInfo.symbol,
          name: stockInfo.name,
          currentPrice: stockInfo.currentPrice,
          currency: stockInfo.currency,
          exchange: stockInfo.exchange,
        }
      }

      console.log(`❌ 백엔드에서 ${symbol} 찾을 수 없음`)
      return null
    } catch (error) {
      console.error(`💥 백엔드 주식 검색 실패 (${symbol}):`, getErrorMessage(error))
      throw new Error(`주식 조회 실패: ${getErrorMessage(error)}`)
    }
  }

  async searchMultipleStocks(symbols: string[]): Promise<any[]> {
    try {
      console.log(`📊 다중 종목 조회 요청: ${symbols.join(', ')}`)

      const response = await httpClient.request<{ success: boolean; data: any[]; total: number }>('/stock/multiple', {
        method: 'POST',
        body: JSON.stringify({ symbols }),
      })

      if (response.success) {
        console.log(`✅ 다중 종목 조회 성공: ${response.total}개 조회됨`)
        return response.data
      }

      return []
    } catch (error) {
      console.error('💥 다중 종목 조회 실패:', getErrorMessage(error))
      throw new Error(`다중 종목 조회 실패: ${getErrorMessage(error)}`)
    }
  }

  async getStockSuggestions(query: string): Promise<any[]> {
    try {
      if (!query || query.length < 2) {
        return []
      }

      console.log(`🔎 주식 검색 제안: ${query}`)

      const response = await httpClient.request<{ success: boolean; data: any[] }>(
        `/stock/suggestions/${encodeURIComponent(query)}`
      )

      if (response.success) {
        console.log(`✅ 검색 제안 조회 성공: ${response.data.length}개`)
        return response.data
      }

      return []
    } catch (error) {
      console.warn('검색 제안 실패:', getErrorMessage(error))
      return []
    }
  }

  getMockStocks(): Stock[] {
    return mockDataGenerators.generateStocks()
  }
}

export const stocksApi = new StocksApi()
