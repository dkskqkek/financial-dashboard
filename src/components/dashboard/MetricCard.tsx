import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatPercent, getColorByValue } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: number
  change?: {
    amount: number
    percentage: number
  }
  format: 'currency' | 'percent' | 'number'
  currency?: string
  icon?: React.ReactNode
  subtitle?: string
}

export function MetricCard({ title, value, change, format, currency = 'KRW', icon, subtitle }: MetricCardProps) {
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return formatCurrency(value, currency)
      case 'percent':
        return `${value.toFixed(2)}%`
      case 'number':
        return value.toLocaleString('ko-KR')
      default:
        return value.toString()
    }
  }

  const getTrendIcon = () => {
    if (!change) {
      return null
    }

    if (change.percentage > 0) {
      return <TrendingUp className="h-4 w-4 text-success" />
    } else if (change.percentage < 0) {
      return <TrendingDown className="h-4 w-4 text-destructive" />
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getChangeColor = () => {
    if (!change) {
      return 'outline'
    }
    return change.percentage > 0 ? 'success' : change.percentage < 0 ? 'destructive' : 'outline'
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 mobile-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground mobile-text">{title}</CardTitle>
        {icon && <div className="text-muted-foreground flex-shrink-0 w-4 h-4">{icon}</div>}
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="flex flex-col space-y-1 sm:space-y-2">
          <div className="text-lg sm:text-2xl font-bold currency break-all">{formatValue()}</div>

          {subtitle && <p className="text-xs text-muted-foreground mobile-text leading-tight">{subtitle}</p>}

          {change && (
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <div className="flex items-center space-x-1">
                {getTrendIcon()}
                <Badge variant={getChangeColor()} className="text-xs whitespace-nowrap">
                  {change.percentage > 0 && '+'}
                  {formatCurrency(change.amount, currency)} ({formatPercent(change.percentage)})
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground mobile-text">전월 대비</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
