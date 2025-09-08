import { apiService } from '@/services/api'
import { useStockPrices } from '../hooks/useStockPrices'
import type { Stock } from '../types/stock.types'

export class StockService {
  static async loadStocks(
    setIsLoading: (loading: boolean) => void,
    setStocks: (stocks: Stock[]) => void,
    updateIndividualStockPrices: (stocks: Stock[]) => Promise<{ updatedStocks: Stock[]; updateCount: number }>
  ): Promise<void> {
    setIsLoading(true)
    try {
      const stockData = await apiService.getStocks()
      console.log('📊 API에서 받은 주식 데이터:', stockData)

      // API에서 유효한 데이터를 받았을 때만 업데이트
      if (stockData && stockData.length > 0) {
        console.log('✅ 유효한 주식 데이터로 업데이트:', stockData.length, '개')
        setStocks(stockData)
      } else {
        console.warn('⚠️ API에서 빈 데이터 반환 - 기존 데이터의 시세만 개별 업데이트')
        // 기존 주식들의 시세를 개별로 업데이트
        await updateIndividualStockPrices([]) // 현재 stocks을 파라미터로 전달해야 함
      }
    } catch (error) {
      console.error('❌ 시세 업데이트 실패:', error)
      alert('시세 업데이트에 실패했습니다. 기존 데이터를 유지합니다.')
    } finally {
      setIsLoading(false)
    }
  }
}

// 주식 수정 관련 유틸리티 함수
export const createUpdatedStock = (
  editingStock: Stock,
  formData: {
    name: string
    quantity: string
    averagePrice: string
    sector: string
  }
): Stock => {
  return {
    ...editingStock,
    name: formData.name,
    quantity: Number(formData.quantity),
    averagePrice: Number(formData.averagePrice),
    sector: formData.sector,
    marketValue: Number(formData.quantity) * editingStock.currentPrice,
    unrealizedPnL: (editingStock.currentPrice - Number(formData.averagePrice)) * Number(formData.quantity),
  }
}
