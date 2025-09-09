import React, { useState } from 'react'
import { useAppStore } from '@/stores'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Building2,
  CreditCard,
  Wallet,
  ArrowRightLeft,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  PieChart as PieChartIcon,
} from 'lucide-react'
import { UI_TEXT, UI_ICON_SIZES } from '@/constants/ui'
import { AddCashAccountForm } from '@/components/forms/AddCashAccountForm'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { CashAccount, Transaction } from '@/types'

export function AccountsPage() {
  const { cashAccounts, transactions, convertToKrwTotal, deleteCashAccount, addTransaction } = useAppStore()

  const [viewMode, setViewMode] = useState<'unified' | 'separate'>('unified')
  const [showBalances, setShowBalances] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)

  // 계좌별 거래 내역 필터링
  const getAccountTransactions = (account: CashAccount): Transaction[] => {
    return transactions
      .filter(tx => tx.account === `${account.bankName} - ${account.accountType}` || tx.account === account.bankName)
      .slice(0, 10) // 최근 10개만
  }

  // 계좌별 그룹화
  const accountsByBank = cashAccounts.reduce(
    (acc, account) => {
      if (!acc[account.bankName]) {
        acc[account.bankName] = []
      }
      acc[account.bankName].push(account)
      return acc
    },
    {} as Record<string, CashAccount[]>
  )

  // 계좌간 이체 처리
  const handleTransfer = (fromAccount: CashAccount, toAccount: CashAccount, amount: number, memo?: string) => {
    const transferId = `transfer-${Date.now()}`
    const today = new Date().toISOString().split('T')[0]

    // 출금 거래
    const withdrawTransaction: Transaction = {
      id: `${transferId}-out`,
      date: today,
      type: 'transfer',
      account: `${fromAccount.bankName} - ${fromAccount.accountType}`,
      description: `이체 출금 → ${toAccount.bankName}`,
      amount: -amount,
      balance: fromAccount.balance - amount,
      category: '이체',
      memo: memo || `${toAccount.bankName}로 이체`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // 입금 거래
    const depositTransaction: Transaction = {
      id: `${transferId}-in`,
      date: today,
      type: 'transfer',
      account: `${toAccount.bankName} - ${toAccount.accountType}`,
      description: `이체 입금 ← ${fromAccount.bankName}`,
      amount: amount,
      balance: toAccount.balance + amount,
      category: '이체',
      memo: memo || `${fromAccount.bankName}에서 이체`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    addTransaction(withdrawTransaction)
    addTransaction(depositTransaction)
  }

  const AccountCard = ({ account }: { account: CashAccount }) => {
    const recentTransactions = getAccountTransactions(account)

    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className={`${UI_ICON_SIZES.MD} text-muted-foreground`} />
              <div>
                <CardTitle className="text-lg">{account.bankName}</CardTitle>
                <p className="text-sm text-muted-foreground">{account.accountType}</p>
              </div>
            </div>
            <Badge variant={account.currency === 'KRW' ? 'default' : 'secondary'}>{account.currency}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">계좌번호</span>
              <span className="font-mono text-sm">{account.accountNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">잔액</span>
              <span className={`font-semibold ${showBalances ? '' : 'blur-sm'}`}>
                {showBalances ? formatCurrency(account.balance, account.currency) : '***,***'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">최근 거래</span>
              <span className="text-sm">{formatDate(account.lastTransactionDate)}</span>
            </div>
          </div>

          {recentTransactions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">최근 거래 내역</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {recentTransactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between text-xs p-2 bg-muted/30 rounded">
                    <div className="truncate">
                      <p className="font-medium truncate">{tx.description}</p>
                      <p className="text-muted-foreground">{formatDate(tx.date)}</p>
                    </div>
                    <div className={`font-mono ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedAccount(account.id)} className="flex-1">
              <ArrowRightLeft className={`${UI_ICON_SIZES.SM} mr-1`} />
              이체
            </Button>
            <Button variant="destructive" size="sm" onClick={() => deleteCashAccount(account.id)}>
              삭제
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mobile-container space-y-3 sm:space-y-4 lg:space-y-6">
      {/* 헤더 - 모바일 최적화 */}
      <div className="flex flex-col space-y-2 sm:space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="space-y-1">
          <h1 className="mobile-title">계좌 관리</h1>
          <p className="mobile-subtitle mobile-text-wrap">멀티 계좌 통합 관리</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowBalances(!showBalances)} className="mobile-button">
            {showBalances ? <EyeOff className={UI_ICON_SIZES.XS} /> : <Eye className={UI_ICON_SIZES.XS} />}
            <span className="ml-1 mobile-hide">잔액 {showBalances ? '숨김' : '표시'}</span>
          </Button>
          <AddCashAccountForm />
        </div>
      </div>

      {/* 통합 통계 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className={`${UI_ICON_SIZES.MD} mr-2`} />
            전체 현금 자산
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">총 계좌 수</p>
              <p className="text-2xl font-bold">{cashAccounts.length}개</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">KRW 자산</p>
              <p className="text-2xl font-bold">
                {formatCurrency(cashAccounts.filter(a => a.currency === 'KRW').reduce((sum, a) => sum + a.balance, 0))}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">USD 자산</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  cashAccounts.filter(a => a.currency === 'USD').reduce((sum, a) => sum + a.balance, 0),
                  'USD'
                )}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">총 자산 (KRW 환산)</p>
              <p className="text-2xl font-bold text-green-600">
                {/* convertToKrwTotal 비동기 함수이므로 별도 state 관리 필요 */}
                계산 중...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 보기 모드 선택 */}
      <Tabs value={viewMode} onValueChange={value => setViewMode(value as any)}>
        <TabsList>
          <TabsTrigger value="unified" className="flex items-center">
            <PieChartIcon className={`${UI_ICON_SIZES.SM} mr-2`} />
            통합 보기
          </TabsTrigger>
          <TabsTrigger value="separate" className="flex items-center">
            <Building2 className={`${UI_ICON_SIZES.SM} mr-2`} />
            계좌별 보기
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unified" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cashAccounts.map(account => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="separate" className="space-y-6">
          {Object.entries(accountsByBank).map(([bankName, accounts]) => (
            <Card key={bankName}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className={`${UI_ICON_SIZES.MD} mr-2`} />
                  {bankName} ({accounts.length}개 계좌)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {accounts.map(account => (
                    <AccountCard key={account.id} account={account} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {cashAccounts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Wallet className={`h-12 w-12 text-muted-foreground mx-auto mb-4`} />
            <h3 className="text-lg font-medium mb-2">계좌가 없습니다</h3>
            <p className="text-muted-foreground mb-4">첫 번째 계좌를 추가하여 자산 관리를 시작하세요</p>
            <AddCashAccountForm />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
