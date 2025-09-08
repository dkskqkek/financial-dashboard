import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Edit, Trash2, Wallet, Building } from 'lucide-react'
import { formatCurrency, formatDate, maskAccountNumber } from '@/lib/utils'
import { ACCOUNT_TYPES } from '../types/constants'
import type { CashAccount } from '../types/asset.types'

interface AccountsListProps {
  filteredAccounts: CashAccount[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedType: string
  setSelectedType: (type: string) => void
  setSelectedAccount: (account: CashAccount | null) => void
  onEditAccount: (account: CashAccount) => void
  onDeleteAccount: (accountId: string) => void
}

export function AccountsList({
  filteredAccounts,
  searchTerm,
  setSearchTerm,
  selectedType,
  setSelectedType,
  setSelectedAccount,
  onEditAccount,
  onDeleteAccount,
}: AccountsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>계좌 목록</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="계좌번호, 은행명으로 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('all')}
            >
              전체
            </Button>
            {ACCOUNT_TYPES.map(type => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>은행/기관</TableHead>
              <TableHead>계좌구분</TableHead>
              <TableHead>계좌번호</TableHead>
              <TableHead>통화</TableHead>
              <TableHead className="text-right">잔액</TableHead>
              <TableHead>최근 거래일</TableHead>
              <TableHead>메모</TableHead>
              <TableHead className="text-center">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAccounts.map(account => (
              <TableRow
                key={account.id}
                className="hover:bg-muted/50 cursor-pointer"
                onClick={() => setSelectedAccount(account)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Building className="h-4 w-4 text-primary" />
                    </div>
                    <span>{account.bankName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{account.accountType}</Badge>
                </TableCell>
                <TableCell className="font-mono">{maskAccountNumber(account.accountNumber)}</TableCell>
                <TableCell>
                  <Badge variant={account.currency === 'KRW' ? 'default' : 'secondary'}>{account.currency}</Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {account.currency === 'KRW'
                    ? formatCurrency(account.balance)
                    : `$${account.balance.toLocaleString()}`}
                </TableCell>
                <TableCell>{formatDate(account.lastTransactionDate)}</TableCell>
                <TableCell className="max-w-32 truncate">{account.memo || '-'}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation()
                        onEditAccount(account)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation()
                        if (window.confirm(`${account.bankName} ${account.accountType} 계좌를 삭제하시겠습니까?`)) {
                          onDeleteAccount(account.id)
                        }
                      }}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredAccounts.length === 0 && (
          <div className="text-center py-12">
            <Wallet className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">계좌가 없습니다</p>
            <p className="text-sm text-muted-foreground">첫 번째 계좌를 추가해보세요</p>
            <Button
              className="mt-4"
              onClick={() => {
                const addButton = document.querySelector('[data-testid="add-account-trigger"]') as HTMLButtonElement
                if (addButton) {
                  addButton.click()
                } else {
                  alert('계좌 추가 기능을 사용하려면 상단의 "계좌 추가" 버튼을 클릭하세요.')
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              계좌 추가하기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
