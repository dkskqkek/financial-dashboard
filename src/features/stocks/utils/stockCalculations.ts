import type { Stock } from '@/types'
import type { ReturnRange } from '../types/constants'
import { RETURN_RANGES } from '../types/constants'

/**
 * 주식 수익률 계산
 */
export const calculateReturnRate = (currentPrice: number, averagePrice: number): number => {
  return ((currentPrice - averagePrice) / averagePrice) * 100
}

/**
 * 포트폴리오 총 수익률 계산
 */
export const calculateTotalReturn = (totalMarketValue: number, totalUnrealizedPnL: number): number => {
  const totalCost = totalMarketValue - totalUnrealizedPnL
  return totalCost !== 0 ? (totalUnrealizedPnL / totalCost) * 100 : 0
}

/**
 * 주식을 수익률 범위별로 분류
 */
export const categorizeStocksByReturn = (stocks: Stock[]): Record<ReturnRange, number> => {
  return RETURN_RANGES.reduce((acc, range) => {
    let count = 0
    
    stocks.forEach(stock => {
      const rate = calculateReturnRate(stock.currentPrice, stock.averagePrice)
      
      switch (range) {
        case '20% 이상':
          if (rate >= 20) count++
          break
        case '10-20%':
          if (rate >= 10 && rate < 20) count++
          break
        case '0-10%':
          if (rate >= 0 && rate < 10) count++
          break
        case '0% 미만':
          if (rate < 0) count++
          break
      }
    })
    
    acc[range] = count
    return acc
  }, {} as Record<ReturnRange, number>)
}

/**
 * 섹터별/거래소별 비중 계산
 */
export const calculateWeight = (value: number, total: number): number => {
  return total > 0 ? (value / total) * 100 : 0
}

/**
 * 주식 필터링 함수
 */
export const filterStocks = (
  stocks: Stock[],
  searchTerm: string,
  selectedExchange: string,
  selectedSector: string
): Stock[] => {
  return stocks.filter(stock => {
    const matchesSearch = 
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesExchange = selectedExchange === 'all' || stock.exchange === selectedExchange
    const matchesSector = selectedSector === 'all' || stock.sector === selectedSector

    return matchesSearch && matchesExchange && matchesSector
  })
}