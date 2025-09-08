import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, PiggyBank, Calendar, Percent, TrendingUp } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AddSavingsForm } from '@/components/forms/AddSavingsForm'
import { useAppStore } from '@/stores'

const mockSavings: any[] = []

export function SavingsPage() {
  const { savings } = useAppStore()
  const totalPrincipal = savings.reduce((sum, item) => sum + item.principal, 0)
  const totalCurrentValue = savings.reduce((sum, item) => sum + item.currentValue, 0)
  const totalInterest = totalCurrentValue - totalPrincipal

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">예적금 관리</h1>
          <p className="text-muted-foreground">예금과 적금을 관리하고 수익을 추적하세요</p>
        </div>
        <AddSavingsForm />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 원금</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold currency">{formatCurrency(totalPrincipal)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">현재 평가액</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold currency text-success">{formatCurrency(totalCurrentValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">누적 이자</CardTitle>
            <Percent className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold currency text-primary">{formatCurrency(totalInterest)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 수익률</CardTitle>
            <Calendar className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">3.9%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>예적금 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>은행/상품명</TableHead>
                <TableHead>구분</TableHead>
                <TableHead className="text-right">원금</TableHead>
                <TableHead className="text-right">현재가치</TableHead>
                <TableHead className="text-right">금리</TableHead>
                <TableHead>만기일</TableHead>
                <TableHead className="text-right">예상수익</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savings.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">{item.bankName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.type === 'savings' ? 'default' : 'secondary'}>
                      {item.type === 'savings' ? '적금' : '예금'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right currency">{formatCurrency(item.principal)}</TableCell>
                  <TableCell className="text-right currency">{formatCurrency(item.currentValue)}</TableCell>
                  <TableCell className="text-right">{item.interestRate}%</TableCell>
                  <TableCell>{formatDate(item.maturityDate)}</TableCell>
                  <TableCell className="text-right currency text-success">
                    {formatCurrency(item.currentValue - item.principal)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
