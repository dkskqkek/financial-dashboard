import { useState } from 'react'
import { yahooFinanceService } from '@/services/yahooFinance'
import type { Stock } from '../types/stock.types'

export const useStockPrices = () => {
  const [isUpdating, setIsUpdating] = useState(false)

  const updateIndividualStockPrices = async (stocks: Stock[]): Promise<{ updatedStocks: Stock[], updateCount: number }> => {
    console.log('🔄 개별 주식 시세 업데이트 시작')
    const updatedStocks = [...stocks]
    let updateCount = 0

    for (let i = 0; i < updatedStocks.length; i++) {
      const stock = updatedStocks[i]
      try {
        // Yahoo Finance API로 현재 주가 조회
        const quotes = await yahooFinanceService.getQuotes([stock.symbol])
        if (quotes && quotes.length > 0 && quotes[0].regularMarketPrice) {
          const oldPrice = stock.currentPrice
          const currentPrice = quotes[0].regularMarketPrice
          updatedStocks[i] = {
            ...stock,
            currentPrice: currentPrice,
            marketValue: stock.quantity * currentPrice,
            unrealizedPnL: (currentPrice - stock.averagePrice) * stock.quantity,
            lastUpdated: new Date().toISOString(),
          }
          console.log(`✅ ${stock.symbol}: ${oldPrice} → ${currentPrice}`)
          updateCount++
        }
      } catch (error) {
        console.warn(`❌ ${stock.symbol} 시세 업데이트 실패:`, error)
      }
    }

    console.log(`✅ ${updateCount}개 주식 시세 업데이트 완료`)
    return { updatedStocks, updateCount }
  }

  const updateStockPricesWithFeedback = async (
    stocks: Stock[], 
    setStocks: (stocks: Stock[]) => void
  ) => {
    setIsUpdating(true)
    try {
      const { updatedStocks, updateCount } = await updateIndividualStockPrices(stocks)
      
      if (updateCount > 0) {
        setStocks(updatedStocks)
        alert(`${updateCount}개 주식의 시세가 업데이트되었습니다.`)
      } else {
        console.warn('⚠️ 시세 업데이트된 주식이 없습니다')
        alert('시세를 업데이트할 수 없었습니다.')
      }
    } catch (error) {
      console.error('❌ 시세 업데이트 실패:', error)
      alert('시세 업데이트에 실패했습니다.')
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    isUpdating,
    updateIndividualStockPrices,
    updateStockPricesWithFeedback
  }
}