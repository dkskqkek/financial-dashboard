import { useState, useEffect, useCallback } from 'react'
import { exchangeRateService } from '@/services/exchangeRateService'
import { filterStocks, calculateTotalReturn } from '../utils/stockCalculations'
import { DEBOUNCE_DELAY } from '../types/constants'
import type { Stock, SectorData, ExchangeData, StockKrwValue } from '../types/stock.types'

interface UseStockCalculationsProps {
  stocks: Stock[]
  searchTerm: string
  selectedExchange: string
  selectedSector: string
  convertStockValueToKrw: (stock: Stock) => Promise<number>
}

export const useStockCalculations = ({
  stocks,
  searchTerm,
  selectedExchange,
  selectedSector,
  convertStockValueToKrw,
}: UseStockCalculationsProps) => {
  const [totalMarketValueKrw, setTotalMarketValueKrw] = useState<number>(0)
  const [totalUnrealizedPnLKrw, setTotalUnrealizedPnLKrw] = useState<number>(0)
  const [sectorData, setSectorData] = useState<SectorData>({})
  const [exchangeData, setExchangeData] = useState<ExchangeData>({})
  const [sortedStocksKrw, setSortedStocksKrw] = useState<StockKrwValue[]>([])

  const updateStockTotals = useCallback(
    async (stocksToCalculate: Stock[]) => {
      if (!stocksToCalculate || stocksToCalculate.length === 0) {
        setTotalMarketValueKrw(0)
        setTotalUnrealizedPnLKrw(0)
        return
      }

      try {
        let totalMarketValue = 0
        let totalUnrealizedPnL = 0

        for (const stock of stocksToCalculate) {
          const marketValueKrw = await convertStockValueToKrw(stock)
          totalMarketValue += marketValueKrw

          // 손익도 환율 적용
          if (stock.currency === 'USD') {
            const unrealizedPnLKrw = await exchangeRateService.convertUsdToKrw(stock.unrealizedPnL)
            totalUnrealizedPnL += unrealizedPnLKrw
          } else {
            totalUnrealizedPnL += stock.unrealizedPnL
          }
        }

        setTotalMarketValueKrw(totalMarketValue)
        setTotalUnrealizedPnLKrw(totalUnrealizedPnL)
      } catch (error) {
        console.error('총액 계산 실패:', error)
      }
    },
    [convertStockValueToKrw]
  )

  // 필터링된 주식들
  const filteredStocks = filterStocks(stocks, searchTerm, selectedExchange, selectedSector)

  // 주식 데이터가 변경될 때마다 총 금액 재계산 (디바운싱)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateStockTotals(filteredStocks)
    }, DEBOUNCE_DELAY.TOTAL_UPDATE)

    return () => clearTimeout(timeoutId)
  }, [stocks, searchTerm, selectedExchange, selectedSector, updateStockTotals])

  // 섹터/거래소별 데이터 계산 (환율 변환 적용) - 디바운싱 적용
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (filteredStocks.length === 0) {
        setSectorData({})
        setExchangeData({})
        setSortedStocksKrw([])
        return
      }

      try {
        const newSectorData: SectorData = {}
        const newExchangeData: ExchangeData = {}
        const stocksWithKrwValue: StockKrwValue[] = []

        for (const stock of filteredStocks) {
          const stockValueKrw = await convertStockValueToKrw(stock)

          // 정렬용 데이터 저장
          stocksWithKrwValue.push({ stock, krwValue: stockValueKrw })

          // 섹터별 합계
          newSectorData[stock.sector] = (newSectorData[stock.sector] || 0) + stockValueKrw

          // 거래소별 합계
          newExchangeData[stock.exchange] = (newExchangeData[stock.exchange] || 0) + stockValueKrw
        }

        // KRW 가치 기준으로 정렬
        stocksWithKrwValue.sort((a, b) => b.krwValue - a.krwValue)
        setSortedStocksKrw(stocksWithKrwValue)

        setSectorData(newSectorData)
        setExchangeData(newExchangeData)
      } catch (error) {
        console.error('섹터/거래소 데이터 계산 실패:', error)
      }
    }, DEBOUNCE_DELAY.CALCULATION)

    return () => clearTimeout(timeoutId)
  }, [stocks, searchTerm, selectedExchange, selectedSector, convertStockValueToKrw])

  // 포트폴리오 통계 계산
  const totalCost = totalMarketValueKrw - totalUnrealizedPnLKrw
  const totalReturn = calculateTotalReturn(totalMarketValueKrw, totalUnrealizedPnLKrw)

  return {
    filteredStocks,
    totalMarketValueKrw,
    totalUnrealizedPnLKrw,
    totalCost,
    totalReturn,
    sectorData,
    exchangeData,
    sortedStocksKrw,
    updateStockTotals,
  }
}
