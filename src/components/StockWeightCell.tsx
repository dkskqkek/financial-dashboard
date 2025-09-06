import React, { useEffect, useState, useRef } from 'react'
import type { Stock } from '@/types'

interface StockWeightCellProps {
  stock: Stock
  totalMarketValueKrw: number
  convertStockValueToKrw: (stock: Stock) => Promise<number>
}

export function StockWeightCell({ stock, totalMarketValueKrw, convertStockValueToKrw }: StockWeightCellProps) {
  const [weight, setWeight] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    const calculateWeight = async () => {
      if (abortController.signal.aborted) return
      
      setIsLoading(true)
      try {
        const stockValueKrw = await convertStockValueToKrw(stock)
        if (abortController.signal.aborted) return
        
        const calculatedWeight = totalMarketValueKrw > 0 ? (stockValueKrw / totalMarketValueKrw) * 100 : 0
        setWeight(calculatedWeight)
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('비중 계산 실패:', error)
          setWeight(0)
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }
    
    const timeoutId = setTimeout(calculateWeight, 100) // 100ms 디바운싱
    
    return () => {
      clearTimeout(timeoutId)
      abortController.abort()
    }
  }, [stock.id, stock.marketValue, totalMarketValueKrw]) // convertStockValueToKrw 의존성 제거

  if (isLoading) {
    return <span>계산중...</span>
  }

  return <span>{weight.toFixed(1)}%</span>
}