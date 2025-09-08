import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores'
import { calculateAssetMetrics, AssetMetrics } from '../utils/assetCalculator'

const initialState: AssetMetrics = {
  summary: {
    totalAssets: 0,
    netWorth: 0,
    monthlyChange: { amount: 0, percentage: 0 },
    ytdReturn: 0,
    goalAchievement: 0,
  },
  allocation: {
    cash: 0,
    stocks: 0,
    bonds: 0,
    gold: 0,
    crypto: 0,
    realEstate: 0,
    domesticStocks: 0,
    foreignStocks: 0,
  },
}

export const useAssetMetrics = (): { metrics: AssetMetrics; isLoading: boolean } => {
  const [metrics, setMetrics] = useState<AssetMetrics>(initialState)
  const [isLoading, setIsLoading] = useState(true)

  const { cashAccounts, stocks, realEstate, loans, savings, financialData, convertToKrwTotal, convertStockValueToKrw } =
    useAppStore()

  useEffect(() => {
    const computeMetrics = async () => {
      setIsLoading(true)
      try {
        const result = await calculateAssetMetrics({
          cashAccounts,
          stocks,
          realEstate,
          savings,
          loans,
          financialData,
          convertToKrwTotal,
          convertStockValueToKrw,
        })
        setMetrics(result)
      } catch (error) {
        console.error('Error calculating asset metrics:', error)
        setMetrics(initialState) // 에러 발생 시 초기 상태로 리셋
      } finally {
        setIsLoading(false)
      }
    }

    computeMetrics()
  }, [cashAccounts, stocks, realEstate, savings, loans, financialData, convertToKrwTotal, convertStockValueToKrw])

  return { metrics, isLoading }
}
