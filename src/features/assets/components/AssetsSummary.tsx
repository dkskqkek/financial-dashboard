import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, Building, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { CashAccount } from '../types/asset.types'

interface AssetsSummaryProps {
  totalBalance: number
  usdTotalInKrw: number
  filteredAccounts: CashAccount[]
}

export function AssetsSummary({ totalBalance, usdTotalInKrw, filteredAccounts }: AssetsSummaryProps) {
  const krwAccounts = filteredAccounts.filter(acc => acc.currency === 'KRW')
  const usdAccounts = filteredAccounts.filter(acc => acc.currency === 'USD')
  const krwTotal = krwAccounts.reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <div className="mobile-grid gap-4 sm:gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 현금 자산</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold currency">{formatCurrency(totalBalance)}</div>
          <p className="text-xs text-muted-foreground">{filteredAccounts.length}개 계좌</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">원화 자산</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold currency">{formatCurrency(krwTotal)}</div>
          <p className="text-xs text-muted-foreground">{krwAccounts.length}개 계좌</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">외화 자산</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold currency">{formatCurrency(usdTotalInKrw)}</div>
          <p className="text-xs text-muted-foreground">{usdAccounts.length}개 계좌</p>
        </CardContent>
      </Card>
    </div>
  )
}
