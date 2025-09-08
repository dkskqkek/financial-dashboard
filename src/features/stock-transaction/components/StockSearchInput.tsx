import React from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import type { StockTransactionFormData } from '../types'

interface StockSearchInputProps {
  formData: StockTransactionFormData
  isSearching: boolean
  onSymbolChange: (symbol: string) => void
}

export function StockSearchInput({ formData, isSearching, onSymbolChange }: StockSearchInputProps) {
  return (
    <div>
      <label htmlFor="symbol" className="text-sm font-medium">
        종목 코드
      </label>
      <div className="relative">
        <Input
          id="symbol"
          name="symbol"
          value={formData.symbol}
          onChange={e => onSymbolChange(e.target.value)}
          placeholder="예: 005930, AAPL"
          required
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Search className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      {formData.symbol.length >= 3 && !formData.name && !isSearching && (
        <p className="text-xs text-muted-foreground mt-1">종목을 찾을 수 없습니다. 코드를 확인해주세요.</p>
      )}
    </div>
  )
}
