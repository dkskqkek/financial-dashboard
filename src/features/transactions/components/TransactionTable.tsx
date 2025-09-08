import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Calendar, Plus } from 'lucide-react'
import { formatCurrency, formatDate, getColorByValue } from '@/lib/utils'
import type { Transaction } from '@/types'
import type { TransactionFilters, TransactionTypeFilter } from '../hooks/useTransactionFilters'

interface TransactionTableProps {
  transactions: Transaction[]
  filters: TransactionFilters
  allCategories: string[]
  setSearchTerm: (value: string) => void
  setSelectedType: (value: TransactionTypeFilter) => void
  setSelectedCategory: (value: string) => void
}

const TransactionEmptyState: React.FC = () => (
  <div className="text-center py-12">
    <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
    <p className="mt-4 text-lg font-medium text-muted-foreground">해당 조건의 거래 내역이 없습니다</p>
    <p className="text-sm text-muted-foreground">검색어나 필터를 변경해보세요.</p>
  </div>
)

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  filters,
  allCategories,
  setSearchTerm,
  setSelectedType,
  setSelectedCategory,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>거래 목록</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="설명, 계좌, 카테고리로 검색..."
              value={filters.searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.type}
              onChange={e => setSelectedType(e.target.value as TransactionTypeFilter)}
              className="px-3 py-1 border rounded-md text-sm bg-background"
            >
              <option value="all">모든 유형</option>
              <option value="income">수입</option>
              <option value="expense">지출</option>
              <option value="transfer">이체</option>
            </select>

            <select
              value={filters.category}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm bg-background"
            >
              <option value="all">모든 카테고리</option>
              {allCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <TransactionEmptyState />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>날짜</TableHead>
                <TableHead>구분</TableHead>
                <TableHead>계좌/종목</TableHead>
                <TableHead>거래내용</TableHead>
                <TableHead className="text-right">금액</TableHead>
                <TableHead>카테고리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.slice(0, 100).map(transaction => (
                <TableRow key={transaction.id} className="hover:bg-muted/50">
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        transaction.type === 'income'
                          ? 'success'
                          : transaction.type === 'expense'
                            ? 'destructive'
                            : 'outline'
                      }
                    >
                      {transaction.type === 'income' ? '수입' : transaction.type === 'expense' ? '지출' : '이체'}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.account}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className={`text-right font-mono ${getColorByValue(transaction.amount)}`}>
                    {formatCurrency(transaction.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.category}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
