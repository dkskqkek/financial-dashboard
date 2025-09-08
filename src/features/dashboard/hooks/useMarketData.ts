import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/stores'
import { apiService } from '@/services/api'
import type { ChartDataPoint, TimeRange, MarketData } from '@/types'

const initialMarketData: MarketData = {
  kospi: { value: 0, change: 0, changePercent: 0 },
  sp500: { value: 0, change: 0, changePercent: 0 },
  usdKrw: { value: 0, change: 0, changePercent: 0 },
}

export const useMarketData = () => {
  const {
    marketData,
    financialData,
    selectedTimeRange,
    setMarketData,
    setSelectedTimeRange, // Assuming this is for user interaction, passed through
  } = useAppStore()

  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      // API에서 시장 데이터와 차트 데이터 가져오기 (오프라인 모드 지원)
      let chartDataResponse: ChartDataPoint[] = []
      try {
        const [marketDataResponse, apiChartData] = await Promise.all([
          apiService.getMarketData().catch(err => {
            console.warn('⚠️ 시장 데이터 API 오프라인, 기본값 사용:', err.message)
            return initialMarketData
          }),
          apiService.getChartData(selectedTimeRange).catch(err => {
            console.warn('⚠️ 차트 데이터 API 오프라인, 로컬 데이터 사용:', err.message)
            return []
          }),
        ])

        setMarketData(marketDataResponse)
        chartDataResponse = apiChartData
      } catch (error) {
        console.warn('⚠️ API 전체 오프라인 모드:', error)
        setMarketData(initialMarketData)
      }

      // 뱅크샐러드 월별 데이터가 있으면 차트 데이터로 변환 (우선순위 높음)
      if (financialData?.monthly && financialData.monthly.length > 0) {
        const bankSaladChartData = financialData.monthly.map((month: any) => ({
          date: month.date,
          totalAssets: month.income, // Note: Mapping might need adjustment
          netWorth: month.netIncome,
          target: 0,
          income: month.income,
          expense: month.expense,
        }))
        setChartData(bankSaladChartData)
      } else if (chartDataResponse.length > 0) {
        setChartData(chartDataResponse)
      }

      setLastUpdateTime(new Date())
      console.log('✅ Market and chart data loaded successfully')
    } catch (error) {
      console.error('Failed to load market data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedTimeRange, financialData, setMarketData])

  // 초기 데이터 로드 및 주기적 새로고침
  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000) // 5분
    return () => clearInterval(interval)
  }, [fetchData])

  // WebSocket 연결
  useEffect(() => {
    if (import.meta.env.VITE_ENABLE_WEBSOCKET === 'true') {
      const ws = apiService.connectWebSocket(data => {
        if (data.type === 'market_update') {
          setMarketData(data.payload)
        }
      })
      return () => ws.close()
    }
  }, [setMarketData])

  return {
    marketData,
    chartData,
    isLoading,
    lastUpdateTime,
    selectedTimeRange,
    refreshData: fetchData,
    handleRangeChange: setSelectedTimeRange,
  }
}
