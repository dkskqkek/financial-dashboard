import { httpClient } from './httpClient'
import { mockDataGenerators } from './mockDataGenerators'
import type { MarketData } from '@/types'

export class MarketApi {
  async getMarketData(): Promise<MarketData> {
    try {
      return await httpClient.request<MarketData>('/market/data')
    } catch (error) {
      console.warn('Backend API failed, using mock data for market data')
      return mockDataGenerators.generateRealtimeMarketData()
    }
  }

  getMockMarketData(): MarketData {
    return mockDataGenerators.generateMarketData()
  }
}

export const marketApi = new MarketApi()
