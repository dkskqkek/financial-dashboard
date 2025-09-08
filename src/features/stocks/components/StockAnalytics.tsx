import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { calculateWeight } from '../utils/stockCalculations'
import { categorizeStocksByReturn } from '../utils/stockCalculations'
import { RETURN_RANGES } from '../types/constants'
import type { Stock, ExchangeData } from '../types/stock.types'

interface StockAnalyticsProps {
  exchangeData: ExchangeData
  totalMarketValueKrw: number
  filteredStocks: Stock[]
}

export function StockAnalytics({ 
  exchangeData, 
  totalMarketValueKrw,
  filteredStocks 
}: StockAnalyticsProps) {
  const returnCategories = categorizeStocksByReturn(filteredStocks)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>거래소별 분산</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(exchangeData).map(([exchange, value]) => {
              const percentage = calculateWeight(value, totalMarketValueKrw)
              return (
                <div key={exchange} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="font-medium">{exchange}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{percentage.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground currency">{formatCurrency(value)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>수익률 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {RETURN_RANGES.map((range) => {
              const count = returnCategories[range] || 0
              return (
                <div key={range} className="flex items-center justify-between">
                  <span className="text-sm">{range}</span>
                  <Badge variant="outline">{count}종목</Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>리밸런싱 제안</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-warning/10 rounded-lg">
              <p className="font-medium text-warning">⚠ 집중도 위험</p>
              <p className="text-xs text-muted-foreground mt-1">상위 3종목이 포트폴리오의 60% 이상을 차지합니다</p>
            </div>

            <div className="p-3 bg-success/10 rounded-lg">
              <p className="font-medium text-success">✓ 섹터 분산 양호</p>
              <p className="text-xs text-muted-foreground mt-1">다양한 섹터에 고르게 분산되어 있습니다</p>
            </div>

            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="font-medium text-primary">💡 추천</p>
              <p className="text-xs text-muted-foreground mt-1">해외 주식 비중을 늘려 지역 분산을 고려해보세요</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}