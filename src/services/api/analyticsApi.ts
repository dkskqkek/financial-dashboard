import { httpClient } from './httpClient'
import { mockDataGenerators } from './mockDataGenerators'
import type { ChartDataPoint } from '@/types'

export class AnalyticsApi {
  async getChartData(timeRange: string): Promise<ChartDataPoint[]> {
    try {
      return await httpClient.request<ChartDataPoint[]>(`/analytics/chart?range=${timeRange}`)
    } catch (error) {
      console.warn('Using mock data for chart data')
      return mockDataGenerators.generateChartData(timeRange)
    }
  }

  getMockChartData(timeRange: string): ChartDataPoint[] {
    return mockDataGenerators.generateChartData(timeRange)
  }
}

export const analyticsApi = new AnalyticsApi()
