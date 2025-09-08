import React from 'react'
import { Input } from '@/components/ui/input'
import type { StockTransactionFormData } from '../types'
import { getCurrencySymbol, calculateProfitLossPercentage } from '../utils/calculations'

interface PriceDisplayProps {
  formData: StockTransactionFormData
  currentPrice: number | null
  onPriceChange: (price: string) => void
}

export function PriceDisplay({ formData, currentPrice, onPriceChange }: PriceDisplayProps) {
  const currencySymbol = getCurrencySymbol(formData.exchange)

  return (
    <div>
      <label htmlFor="stockPrice" className="text-sm font-medium">
        {formData.type === 'existing' ? '평균 매수단가' : '단가'}
      </label>
      <div className="relative">
        <Input
          id="stockPrice"
          name="stockPrice"
          type="number"
          value={formData.price}
          onChange={e => onPriceChange(e.target.value)}
          placeholder={formData.type === 'existing' ? `실제 매수한 ${currencySymbol}` : currencySymbol}
          min="0"
          step="0.01"
          required
          className={
            formData.type === 'existing'
              ? 'bg-yellow-50 border-yellow-200'
              : formData.price && formData.symbol && formData.name
                ? 'bg-blue-50 border-blue-200'
                : ''
          }
        />
      </div>

      {/* 현재가 정보 표시 */}
      {currentPrice && formData.symbol && formData.name && (
        <div className="text-xs mt-1 space-y-1">
          <p className="text-gray-600">
            📊 현재가: {currentPrice.toLocaleString()}
            {currencySymbol}
          </p>

          {formData.type === 'existing' && formData.price && (
            <p
              className={`font-medium ${
                Number(formData.price) < currentPrice
                  ? 'text-green-600'
                  : Number(formData.price) > currentPrice
                    ? 'text-red-600'
                    : 'text-gray-600'
              }`}
            >
              {Number(formData.price) < currentPrice && '📈 수익 '}
              {Number(formData.price) > currentPrice && '📉 손실 '}
              {Number(formData.price) === currentPrice && '➖ 동일 '}
              {Math.abs(calculateProfitLossPercentage(currentPrice, Number(formData.price))).toFixed(2)}%
            </p>
          )}

          {formData.type !== 'existing' && (
            <p className="text-blue-600">💡 {formData.type === 'buy' ? '매수' : '매도'}가로 현재가 사용됨</p>
          )}
        </div>
      )}

      {formData.type === 'existing' && !currentPrice && (
        <p className="text-xs text-yellow-600 mt-1">⚠️ 실제로 매수한 평균단가를 입력하세요</p>
      )}
    </div>
  )
}
