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
  cash: '#10B981',      // 녹색 - 현금
  stocks: '#3B82F6',    // 파랑 - 주식  
  bonds: '#F59E0B',     // 주황 - 채권
  gold: '#FBBF24',      // 골드 - 금
  crypto: '#F97316',    // 오렌지 - 가상화폐
  realEstate: '#8B5CF6', // 보라 - 부동산
  debt: '#EF4444',      // 빨강 - 부채
}

// 그라데이션 색상 팔레트 (미래 확장용)
const GRADIENT_COLORS = {
  cash: ['#10B981', '#059669'],
  stocks: ['#3B82F6', '#1D4ED8'],
  bonds: ['#F59E0B', '#D97706'],
  gold: ['#FBBF24', '#F59E0B'],
  crypto: ['#F97316', '#EA580C'],
  realEstate: ['#8B5CF6', '#7C3AED'],
  debt: ['#EF4444', '#DC2626'],
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const colorKey = data.key as keyof typeof COLORS
    return (
      <div className="bg-card p-4 border rounded-lg shadow-xl border-border/50 backdrop-blur-sm">
        <div className="flex items-center space-x-2 mb-3">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: COLORS[colorKey] }}
          />
          <p className="font-semibold text-foreground">{data.name}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between space-x-6">
            <span className="text-sm text-muted-foreground">비중</span>
            <span className="font-bold text-lg">{data.percentage.toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between space-x-6">
            <span className="text-sm text-muted-foreground">금액</span>
            <span className="font-medium text-base">{formatCurrency(data.value)}</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage, name }: any) => {
  if (percentage < 3) return null // 3% 미만은 라벨 숨김
  
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.8
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <g>
      <text
        x={x}
        y={y - 6}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {name}
      </text>
      <text
        x={x}
        y={y + 6}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {`${percentage.toFixed(1)}%`}
      </text>
    </g>
  )
}

export function AssetAllocationChart({ allocation, summary }: AssetAllocationChartProps) {
  // 부채 제외한 순자산 계산
  const netWorth = summary.netWorth || (summary.totalAssets - (allocation.debt || 0))
  const totalDebt = summary.totalAssets * (allocation.debt || 0) / 100

  const chartData = Object.entries(allocation)
    .filter(([key]) => key !== 'debt') // 부채 제외
    .map(([key, percentage]) => ({
      name: LABELS[key as keyof AssetAllocation],
      key,
      percentage,
      value: (summary.totalAssets * percentage) / 100,
    }))
    .filter(item => item.percentage > 0.1) // 0.1% 이상만 표시
    .sort((a, b) => b.percentage - a.percentage) // 큰 순으로 정렬

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
        {/* 자산/부채 요약 */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 p-2 sm:p-3 bg-muted/20 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">총 자산</div>
            <div className="text-sm sm:text-base font-bold text-green-600 mobile-text">
              {formatCurrency(summary.totalAssets)}
            </div>
          </div>
          {totalDebt > 0 && (
            <div className="text-center">
              <div className="text-xs text-muted-foreground">총 부채</div>
              <div className="text-sm sm:text-base font-bold text-red-600 mobile-text">
                {formatCurrency(totalDebt)}
              </div>
            </div>
          )}
          <div className="text-center">
            <div className="text-xs text-muted-foreground">순 자산</div>
            <div className="text-sm sm:text-base font-bold text-blue-600 mobile-text">
              {formatCurrency(netWorth)}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 도넛 차트 */}
          <div className="h-56 sm:h-64 relative mobile-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) => CustomLabel({...props, name: chartData.find(item => item.value === props.value)?.name})}
                  outerRadius={85}
                  innerRadius={45}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={3}
                  animationBegin={0}
                  animationDuration={1200}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.key as keyof typeof COLORS]}
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="hover:opacity-80 transition-opacity duration-200"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* 중앙 순자산 표시 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xs text-muted-foreground mobile-text">순자산</div>
              <div className="text-sm sm:text-lg font-bold currency mobile-text">
                {formatCurrency(netWorth)}
              </div>
              {totalDebt > 0 && (
                <div className="text-xs text-red-600 mobile-text mt-1">
                  부채: {formatCurrency(totalDebt)}
                </div>
              )}
            </div>
          </div>
          
          {/* 범례 및 상세 정보 */}
          <div className="space-y-2">
            {chartData.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[item.key as keyof typeof COLORS] }}
                  />
                  <span className="font-medium text-xs sm:text-sm mobile-text-wrap">{item.name}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs sm:text-sm font-medium currency mobile-text">
                    {formatCurrency(item.value)}
                  </div>
                  <div className="text-xs text-muted-foreground mobile-text">
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