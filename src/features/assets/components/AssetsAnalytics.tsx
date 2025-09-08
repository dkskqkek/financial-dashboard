import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { calculatePercentage } from '../utils/assetCalculations'
import type { CashAccount, BankTotals, TypeTotals } from '../types/asset.types'

interface AssetsAnalyticsProps {
  cashAccounts: CashAccount[]
  totalBalance: number
  bankTotals: BankTotals
  typeTotals: TypeTotals
}

export function AssetsAnalytics({ cashAccounts, totalBalance, bankTotals, typeTotals }: AssetsAnalyticsProps) {
  const uniqueBanks = Array.from(new Set(cashAccounts.map(acc => acc.bankName)))
  const uniqueTypes = Array.from(new Set(cashAccounts.map(acc => acc.accountType)))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <Card>
        <CardHeader>
          <CardTitle>은행별 분산</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {uniqueBanks.map(bankName => {
              const bankTotal = bankTotals[bankName] || 0
              const percentage = calculatePercentage(bankTotal, totalBalance)

              return (
                <div key={bankName} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="font-medium">{bankName}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium currency">{formatCurrency(bankTotal)}</p>
                    <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>계좌 유형별 분산</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {uniqueTypes.map(accountType => {
              const typeTotal = typeTotals[accountType] || 0
              const percentage = calculatePercentage(typeTotal, totalBalance)

              return (
                <div key={accountType} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="font-medium">{accountType}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium currency">{formatCurrency(typeTotal)}</p>
                    <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
