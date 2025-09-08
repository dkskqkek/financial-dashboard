import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpCircle, ArrowDownCircle, Calendar } from 'lucide-react'
import { formatCurrency, getColorByValue } from '@/lib/utils'

interface SummaryStats {
  totalIncome: number
  totalExpense: number
  netAmount: number
  incomeCount: number
  expenseCount: number
  averageExpense: number
}

interface TransactionSummaryProps {
  stats: SummaryStats
}

export const TransactionSummary: React.FC<TransactionSummaryProps> = ({ stats }) => {
  return (
    <div className="mobile-stat-grid">
      <Card className="mobile-card">
        <CardHeader className="mobile-card-header flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="mobile-card-title">총 수입</CardTitle>
          <ArrowUpCircle className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
        </CardHeader>
        <CardContent className="mobile-stat-card">
          <div className="mobile-stat-value text-success mobile-number">{formatCurrency(stats.totalIncome)}</div>
          <p className="mobile-stat-label">{stats.incomeCount}건</p>
        </CardContent>
      </Card>

      <Card className="mobile-card">
        <CardHeader className="mobile-card-header flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="mobile-card-title">총 지출</CardTitle>
          <ArrowDownCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
        </CardHeader>
        <CardContent className="mobile-stat-card">
          <div className="mobile-stat-value text-destructive mobile-number">{formatCurrency(stats.totalExpense)}</div>
          <p className="mobile-stat-label">{stats.expenseCount}건</p>
        </CardContent>
      </Card>

      <Card className="mobile-card">
        <CardHeader className="mobile-card-header flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="mobile-card-title">순 변화</CardTitle>
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="mobile-stat-card">
          <div className={`mobile-stat-value mobile-number ${getColorByValue(stats.netAmount)}`}>
            {formatCurrency(stats.netAmount)}
          </div>
          <p className="mobile-stat-label">이번 달</p>
        </CardContent>
      </Card>

      <Card className="mobile-card">
        <CardHeader className="mobile-card-header flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="mobile-card-title">평균 지출</CardTitle>
          <ArrowDownCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="mobile-stat-card">
          <div className="mobile-stat-value mobile-number">{formatCurrency(stats.averageExpense)}</div>
          <p className="mobile-stat-label">건당 평균</p>
        </CardContent>
      </Card>
    </div>
  )
}
