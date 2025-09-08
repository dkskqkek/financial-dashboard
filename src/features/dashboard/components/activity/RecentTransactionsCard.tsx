import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// TODO: 실제 데이터 타입을 정의하고 props로 받아야 함
const mockTransactions = [
  { id: 1, description: '삼성전자 매수', date: '2024.09.07', amount: 850000, type: 'buy' },
  { id: 2, description: 'TQQQ 매도', date: '2024.09.06', amount: -1200000, type: 'sell' },
  { id: 3, description: '애플 배당금', date: '2024.09.05', amount: 150000, type: 'dividend' },
]

export const RecentTransactionsCard: React.FC = () => {
  return (
    <Card className="mobile-card">
      <CardHeader className="mobile-card-header">
        <CardTitle className="mobile-card-title">최근 거래</CardTitle>
        <p className="mobile-text text-muted-foreground mobile-hide">최근 7일간의 주요 거래 내역</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-3">
          {mockTransactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mobile-text font-medium mobile-text-wrap">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`mobile-number font-medium ${tx.amount > 0 ? 'text-success' : 'text-destructive'}`}>
                  {tx.amount > 0 ? '+' : ''}
                  {formatCurrency(tx.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
