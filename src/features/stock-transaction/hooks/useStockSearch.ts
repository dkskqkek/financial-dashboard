import { useState } from 'react'
import { apiService } from '@/services/api'
import { getErrorMessage } from '@/lib/utils'
import type { StockSearchResult } from '../types'

export function useStockSearch() {
  const [isSearching, setIsSearching] = useState(false)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)

  const searchStock = async (symbol: string): Promise<StockSearchResult | null> => {
    const cleanSymbol = symbol.trim().toUpperCase()

    // 최소 길이 조건: 한국 주식 6자리, 미국 주식 1자리 이상
    const isKorean = /^\d{1,6}$/.test(cleanSymbol)
    const isGlobal = /^[A-Z]{1,}/.test(cleanSymbol)
    const minLength = isKorean ? 6 : 1

    if (cleanSymbol.length < minLength) {
      setCurrentPrice(null)
      return null
    }

    setIsSearching(true)
    console.log(`🔍 종목 검색 시작: ${cleanSymbol}`)

    try {
      console.log(`📡 API 요청 전 - baseUrl: ${(apiService as any).baseUrl}`)
      const stockInfo = await apiService.searchStock(cleanSymbol)
      console.log('📈 API 응답:', stockInfo)

      if (stockInfo) {
        const result: StockSearchResult = {
          symbol: stockInfo.symbol || cleanSymbol,
          name: stockInfo.name,
          currentPrice: stockInfo.currentPrice,
          currency: stockInfo.currency,
          exchange: stockInfo.exchange,
        }

        setCurrentPrice(stockInfo.currentPrice || null)
        console.log(`✅ 종목 조회 성공: ${stockInfo.name}`)
        return result
      } else {
        console.log(`❌ 종목 조회 실패: ${cleanSymbol}`)
        setCurrentPrice(null)
        return null
      }
    } catch (error) {
      console.error(`💥 종목 검색 오류 (${cleanSymbol}):`, getErrorMessage(error))
      setCurrentPrice(null)
      return null
    } finally {
      setIsSearching(false)
    }
  }

  const resetSearch = () => {
    setCurrentPrice(null)
    setIsSearching(false)
  }

  return {
    searchStock,
    isSearching,
    currentPrice,
    resetSearch,
  }
}
