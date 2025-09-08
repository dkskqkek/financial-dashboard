import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const monthlyData: any[] = []

const currentMonth = { income: 0, expense: 0, netChange: 0, assets: 0 }

export function MonthlyPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">월별 요약</h1>
          <p className="text-muted-foreground">월별 자산 변화와 주요 이벤트를 확인하세요</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 수입</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold currency text-success">{formatCurrency(currentMonth.income)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">이번 달 지출</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold currency text-destructive">{formatCurrency(currentMonth.expense)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">순 자산 증가</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold currency text-primary">{formatCurrency(currentMonth.netChange)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 자산</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold currency">{formatCurrency(currentMonth.assets)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>월별 수입/지출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={value => formatCurrency(value).slice(0, -1)} />
                  <Tooltip formatter={value => formatCurrency(value as number)} />
                  <Bar dataKey="income" fill="#10B981" name="수입" />
                  <Bar dataKey="expense" fill="#EF4444" name="지출" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>자산 성장 추이</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={value => formatCurrency(value).slice(0, -3) + 'M'} />
                  <Tooltip formatter={value => formatCurrency(value as number)} />
                  <Line type="monotone" dataKey="assets" stroke="#1E3A8A" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>주요 이벤트</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-success/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-success mt-0.5" />
              <div>
                <p className="font-medium">배당금 수령</p>
                <p className="text-sm text-muted-foreground">
                  삼성전자, SK하이닉스 배당금 총 {formatCurrency(450000)} 수령
                </p>
                <Badge variant="outline" className="mt-1">
                  2024-01-15
                </Badge>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">정기예금 만기</p>
                <p className="text-sm text-muted-foreground">신한은행 정기예금 만기 도래 예정 (만기일: 2024-02-28)</p>
                <Badge variant="outline" className="mt-1">
                  예정
                </Badge>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-warning/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="font-medium">대출 상환</p>
                <p className="text-sm text-muted-foreground">주택담보대출 원리금 상환 {formatCurrency(2100000)}</p>
                <Badge variant="outline" className="mt-1">
                  2024-01-05
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
