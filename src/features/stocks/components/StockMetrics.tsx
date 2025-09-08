import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieIcon 
} from 'lucide-react'
import { formatCurrency, formatPercent, getColorByValue } from '@/lib/utils'

interface StockMetricsProps {
  totalMarketValueKrw: number
  totalUnrealizedPnLKrw: number
  totalCost: number
  totalReturn: number
  filteredStocksCount: number
}

export function StockMetrics({
  totalMarketValueKrw,
  totalUnrealizedPnLKrw,
  totalCost,
  totalReturn,
  filteredStocksCount
}: StockMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 평가금액</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold currency">{formatCurrency(totalMarketValueKrw)}</div>
          <p className="text-xs text-muted-foreground">{filteredStocksCount}개 종목</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">평가손익</CardTitle>
          {totalUnrealizedPnLKrw > 0 ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold currency ${getColorByValue(totalUnrealizedPnLKrw)}`}>
            {formatCurrency(totalUnrealizedPnLKrw)}
          </div>
          <p className={`text-xs ${getColorByValue(totalReturn)}`}>{formatPercent(totalReturn)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">투자원금</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold currency">{formatCurrency(totalCost)}</div>
          <p className="text-xs text-muted-foreground">매수 기준</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">수익률</CardTitle>
          <PieIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getColorByValue(totalReturn)}`}>{formatPercent(totalReturn)}</div>
          <p className="text-xs text-muted-foreground">연환산 기준</p>
        </CardContent>
      </Card>
    </div>
  )
}