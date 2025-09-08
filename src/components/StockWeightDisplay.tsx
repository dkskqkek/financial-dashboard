import React, { useEffect, useState, useRef } from 'react'
import { formatPercent, getColorByValue } from '@/lib/utils'
import type { Stock } from '@/types'

interface StockWeightDisplayProps {
  stock: Stock
  totalMarketValueKrw: number
  convertStockValueToKrw: (stock: Stock) => Promise<number>
}

export function StockWeightDisplay({ stock, totalMarketValueKrw, convertStockValueToKrw }: StockWeightDisplayProps) {
  const [weight, setWeight] = useState<number>(0)
  const [returnRate, setReturnRate] = useState<number>(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    const calculateWeight = async () => {
      if (abortController.signal.aborted) {
        return
      }

      try {
        const stockValueKrw = await convertStockValueToKrw(stock)
        if (abortController.signal.aborted) {
          return
        }

        const calculatedWeight = totalMarketValueKrw > 0 ? (stockValueKrw / totalMarketValueKrw) * 100 : 0
        setWeight(calculatedWeight)

        // 수익률 계산 (환율 적용)
        const rate = ((stock.currentPrice - stock.averagePrice) / stock.averagePrice) * 100
        setReturnRate(rate)
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error('비중 계산 실패:', error)
          setWeight(0)
          setReturnRate(0)
        }
      }
    }

    const timeoutId = setTimeout(calculateWeight, 100) // 100ms 디바운싱

    return () => {
      clearTimeout(timeoutId)
      abortController.abort()
    }
  }, [stock.id, stock.marketValue, stock.currentPrice, stock.averagePrice, totalMarketValueKrw]) // 핵심 값만 의존성으로

  return (
    <div className="text-right">
      <p className="text-sm font-medium">{weight.toFixed(1)}%</p>
      <p className={`text-xs ${getColorByValue(stock.unrealizedPnL)}`}>{formatPercent(returnRate)}</p>
    </div>
  )
}
