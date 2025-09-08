import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { StockWeightDisplay } from '@/components/StockWeightDisplay'
import { formatCurrency } from '@/lib/utils'
import { STOCK_COLORS } from '../types/constants'
import type { SectorData, StockKrwValue, Stock } from '../types/stock.types'

interface StockChartsProps {
  sectorData: SectorData
  sortedStocksKrw: StockKrwValue[]
  totalMarketValueKrw: number
  convertStockValueToKrw: (stock: Stock) => Promise<number>
}

export function StockCharts({ 
  sectorData, 
  sortedStocksKrw, 
  totalMarketValueKrw,
  convertStockValueToKrw 
}: StockChartsProps) {
  const sectorChartData = Object.entries(sectorData).map(([sector, value]) => ({
    name: sector,
    value,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>섹터별 분산</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {sectorChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STOCK_COLORS[index % STOCK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={value => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>보유 비중 Top 5</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedStocksKrw.slice(0, 5).map(({ stock }) => {
              return (
                <div key={stock.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">{stock.symbol.slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{stock.name}</p>
                      <p className="text-xs text-muted-foreground">{stock.symbol}</p>
                    </div>
                  </div>
                  <StockWeightDisplay
                    stock={stock}
                    totalMarketValueKrw={totalMarketValueKrw}
                    convertStockValueToKrw={convertStockValueToKrw}
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}