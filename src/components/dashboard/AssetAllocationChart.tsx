import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { AssetAllocation, AssetSummary } from '@/types'

interface AssetAllocationChartProps {
  allocation: AssetAllocation
  summary: AssetSummary
}

const COLORS = {
  cash: '#10B981',
  stocks: '#1E3A8A',
  bonds: '#F59E0B',
  gold: '#FFD700',
  crypto: '#F97316',
  realEstate: '#8B5CF6',
  debt: '#EF4444',
}

const LABELS = {
  cash: '현금',
  stocks: '주식',
  bonds: '채권',
  gold: '금',
  crypto: '가상화폐',
  realEstate: '부동산',
  debt: '부채',
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-card p-4 border rounded-lg shadow-lg">
        <p className="font-medium">{data.name}</p>
        <div className="flex items-center justify-between mt-2 space-x-4">
          <span className="text-sm text-muted-foreground">비중:</span>
          <span className="font-medium">{data.percentage.toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between space-x-4">
          <span className="text-sm text-muted-foreground">금액:</span>
          <span className="font-medium">{formatCurrency(data.value)}</span>
        </div>
      </div>
    )
  }
  return null
}

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
  if (percentage < 5) return null // 5% 미만은 라벨 숨김
  
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-sm font-medium"
    >
      {`${percentage.toFixed(1)}%`}
    </text>
  )
}

export function AssetAllocationChart({ allocation, summary }: AssetAllocationChartProps) {
  const chartData = Object.entries(allocation).map(([key, percentage]) => ({
    name: LABELS[key as keyof AssetAllocation],
    key,
    percentage,
    value: (summary.totalAssets * percentage) / 100,
  })).filter(item => item.percentage > 0)

  // 리밸런싱 제안
  const targetAllocation = {
    cash: 10,
    stocks: 50,
    bonds: 20,
    gold: 5,
    crypto: 5,
    realEstate: 10,
    debt: 0,
  }

  const rebalanceNeeded = Object.entries(allocation).some(([key, current]) => {
    const target = targetAllocation[key as keyof AssetAllocation]
    return Math.abs(current - target) > 5 // 5%p 이상 차이
  })

  return (
    <Card className="col-span-full lg:col-span-1 mobile-card">
      <CardHeader className="px-3 pt-3">
        <CardTitle className="text-base sm:text-lg">자산 구성</CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground mobile-text">
          자산 유형별 분산 현황
        </p>
      </CardHeader>
      
      <CardContent className="px-3 pb-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* 도넛 차트 */}
          <div className="h-48 sm:h-64 relative mobile-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={80}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.key as keyof typeof COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* 중앙 총자산 표시 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xs text-muted-foreground">총자산</div>
              <div className="text-lg font-bold currency">
                {formatCurrency(summary.totalAssets)}
              </div>
            </div>
          </div>
          
          {/* 범례 및 상세 정보 */}
          <div className="space-y-3">
            {chartData.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[item.key as keyof typeof COLORS] }}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium currency">
                    {formatCurrency(item.value)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 리밸런싱 제안 */}
        {rebalanceNeeded && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">리밸런싱 제안</h4>
              <Badge variant="warning">조정 필요</Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              {Object.entries(allocation).map(([key, current]) => {
                const target = targetAllocation[key as keyof AssetAllocation]
                const diff = current - target
                if (Math.abs(diff) < 5) return null
                
                return (
                  <div key={key} className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">
                      {LABELS[key as keyof AssetAllocation]}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className={diff > 0 ? 'text-destructive' : 'text-success'}>
                        {diff > 0 ? '▼' : '▲'} {Math.abs(diff).toFixed(1)}%p
                      </span>
                      <span className="text-xs text-muted-foreground">
                        → {target}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}