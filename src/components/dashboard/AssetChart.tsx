import React from 'react'
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { ChartDataPoint, TimeRange } from '@/types'

interface AssetChartProps {
  data: ChartDataPoint[]
  selectedRange: TimeRange
  onRangeChange: (range: TimeRange) => void
}

const timeRanges: { label: string; value: TimeRange }[] = [
  { label: '1개월', value: '1M' },
  { label: '3개월', value: '3M' },
  { label: '6개월', value: '6M' },
  { label: '1년', value: '1Y' },
  { label: '3년', value: '3Y' },
  { label: '5년', value: '5Y' },
  { label: '전체', value: 'ALL' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-4 border rounded-lg shadow-lg">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium">
              {entry.name === '수익' || entry.name === '손실'
                ? formatCurrency(Math.abs(entry.value))
                : formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function AssetChart({ data, selectedRange, onRangeChange }: AssetChartProps) {
  const chartData = data.map(point => ({
    ...point,
    date: new Date(point.date).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    }),
    profit: point.income && point.expense ? point.income - point.expense : 0,
    loss: point.income && point.expense && point.income < point.expense ? point.expense - point.income : 0,
  }))

  return (
    <Card className="col-span-full mobile-card">
      <CardHeader className="px-3 pt-3">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle className="text-base sm:text-lg">자산 성장 추이</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 mobile-text">
              시간별 자산 변화와 수익/손실 분석
            </p>
          </div>
          <div className="flex items-center space-x-2 overflow-x-auto">
            <div className="flex items-center space-x-2 sm:space-x-1 text-xs flex-shrink-0">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-primary rounded-full" />
                <span className="whitespace-nowrap">총자산</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-success rounded-full" />
                <span className="whitespace-nowrap">순자산</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-muted-foreground rounded-full" />
                <span className="whitespace-nowrap">목표선</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 sm:gap-2 mt-4 overflow-x-auto">
          {timeRanges.map(range => (
            <Button
              key={range.value}
              variant={selectedRange === range.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onRangeChange(range.value)}
              className="text-xs flex-shrink-0 px-2 py-1"
            >
              {range.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3">
        <div className="h-48 sm:h-64 lg:h-80 w-full mobile-chart">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
                tickFormatter={value => formatCurrency(value).slice(0, -1)}
              />
              <Tooltip content={<CustomTooltip />} />

              <Bar dataKey="profit" fill="#10B981" name="월별 수익" radius={[2, 2, 0, 0]} opacity={0.8} />
              <Bar dataKey="loss" fill="#EF4444" name="월별 손실" radius={[2, 2, 0, 0]} opacity={0.8} />

              <Line
                type="monotone"
                dataKey="totalAssets"
                stroke="#1E3A8A"
                strokeWidth={3}
                name="총자산"
                dot={{ r: 4, fill: '#1E3A8A' }}
                activeDot={{ r: 6, fill: '#1E3A8A' }}
              />
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="#10B981"
                strokeWidth={3}
                name="순자산"
                dot={{ r: 4, fill: '#10B981' }}
                activeDot={{ r: 6, fill: '#10B981' }}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#6B7280"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="목표선"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 성과 지표 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
          <div className="text-center py-2">
            <div className="text-lg sm:text-2xl font-bold text-primary currency break-all">
              {formatCurrency(chartData[chartData.length - 1]?.totalAssets || 0)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mobile-text">현재 총자산</div>
          </div>
          <div className="text-center py-2">
            <div className="text-lg sm:text-2xl font-bold text-success currency break-all">
              {formatCurrency(chartData[chartData.length - 1]?.netWorth || 0)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mobile-text">현재 순자산</div>
          </div>
          <div className="text-center py-2">
            <Badge variant="outline" className="text-sm sm:text-lg px-2 sm:px-3 py-1">
              78.5%
            </Badge>
            <div className="text-xs sm:text-sm text-muted-foreground mt-1 mobile-text">목표 달성률</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
