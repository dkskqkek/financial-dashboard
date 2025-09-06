import React, { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { useAppStore } from '@/stores'

interface StockDisplayCellProps {
  value: number
  currency: string
  className?: string
}

export function StockDisplayCell({ value, currency, className = '' }: StockDisplayCellProps) {
  const { exchangeRate, updateExchangeRate } = useAppStore()
  const [displayValue, setDisplayValue] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const convertAndDisplay = () => {
      console.log(`💱 StockDisplayCell: value=${value}, currency=${currency}`)
      
      if (currency === 'USD') {
        if (exchangeRate?.USD_KRW) {
          const rate = exchangeRate.USD_KRW
          const krwValue = value * rate
          const formattedValue = formatCurrency(krwValue)
          
          console.log(`✅ USD → KRW 변환 (환율 ${rate}): $${value} → ${formattedValue}`)
          setDisplayValue(formattedValue)
        } else {
          // 환율 데이터가 없으면 스토어에서 업데이트 요청
          console.log('🔄 환율 데이터 없음, 업데이트 요청')
          updateExchangeRate()
          setDisplayValue(`$${value.toLocaleString()} (환율 로딩...)`)
        }
      } else {
        const formattedValue = formatCurrency(value)
        console.log(`✅ KRW 표시: ${formattedValue}`)
        setDisplayValue(formattedValue)
      }
      setIsLoading(false)
    }

    convertAndDisplay()
  }, [value, currency, exchangeRate, updateExchangeRate])

  // 컴포넌트 마운트 시 환율 업데이트
  useEffect(() => {
    if (!exchangeRate) {
      updateExchangeRate()
    }
  }, [])

  if (isLoading) {
    return <span className={className}>💱...</span>
  }

  const currentRate = exchangeRate?.USD_KRW

  return (
    <span className={className} title={currentRate ? `환율: $1 = ₩${currentRate.toFixed(2)} (${exchangeRate?.lastUpdated ? new Date(exchangeRate.lastUpdated).toLocaleTimeString() : '알수없음'})` : undefined}>
      {displayValue}
      {currency === 'USD' && currentRate && (
        <span className="text-xs text-muted-foreground ml-1">
          (@{currentRate.toFixed(0)})
        </span>
      )}
    </span>
  )
}