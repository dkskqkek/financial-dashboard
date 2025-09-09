import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Building, Home, CreditCard, TrendingUp, Receipt, Edit, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { AddRealEstateForm } from '@/components/forms/AddRealEstateForm'
import { AddLoanForm } from '@/components/forms/AddLoanForm'
import { AddLoanPaymentForm } from '@/components/forms/AddLoanPaymentForm'
import { useAppStore } from '@/stores'
import { PageLayout, StatsGrid, ContentSection } from '@/components/common/PageLayout'

export function RealEstatePage() {
  const { realEstate, loans, deleteRealEstate, deleteLoan } = useAppStore()
  const totalRealEstateValue = realEstate.reduce((sum, item) => sum + item.currentValue, 0)
  const totalLoanBalance = loans.reduce((sum, item) => sum + item.currentBalance, 0)
  const netRealEstateValue = totalRealEstateValue - totalLoanBalance

  return (
    <PageLayout
      title="부동산 & 대출"
      description="자산과 대출 관리"
      headerAction={
        <div className="flex space-x-2">
          <AddLoanPaymentForm />
          <AddLoanForm />
          <AddRealEstateForm />
        </div>
      }
      containerType="mobile"
    >
      <StatsGrid columns={4}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">부동산 가치</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold currency">{formatCurrency(totalRealEstateValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대출 잔액</CardTitle>
            <CreditCard className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold currency text-destructive">{formatCurrency(totalLoanBalance)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">순 부동산 가치</CardTitle>
            <Home className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold currency text-success">{formatCurrency(netRealEstateValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">월 임대수익</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold currency text-primary">
              {formatCurrency(realEstate.reduce((sum, item) => sum + (item.monthlyIncome || 0), 0))}
            </div>
          </CardContent>
        </Card>
      </StatsGrid>

      <ContentSection>
        <Card>
        <CardHeader>
          <CardTitle>부동산 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>유형</TableHead>
                <TableHead>위치</TableHead>
                <TableHead>매입일</TableHead>
                <TableHead className="text-right">매입가</TableHead>
                <TableHead className="text-right">현재시세</TableHead>
                <TableHead className="text-right">평가손익</TableHead>
                <TableHead className="text-right">월 임대료</TableHead>
                <TableHead className="text-center">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {realEstate.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    등록된 부동산이 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                realEstate.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {item.type === 'apartment'
                          ? '아파트'
                          : item.type === 'house'
                            ? '단독주택'
                            : item.type === 'commercial'
                              ? '상가'
                              : '토지'}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{formatDate(item.purchaseDate)}</TableCell>
                    <TableCell className="text-right currency">{formatCurrency(item.purchasePrice)}</TableCell>
                    <TableCell className="text-right currency">{formatCurrency(item.currentValue)}</TableCell>
                    <TableCell className="text-right currency text-success">
                      {formatCurrency(item.currentValue - item.purchasePrice)}
                    </TableCell>
                    <TableCell className="text-right currency">
                      {item.monthlyIncome ? formatCurrency(item.monthlyIncome) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // TODO: 수정 모달 구현
                            console.log('Edit real estate:', item.id)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              window.confirm(
                                `${item.location} ${item.type === 'apartment' ? '아파트' : item.type === 'house' ? '단독주택' : item.type === 'commercial' ? '상가' : '토지'}를 삭제하시겠습니까?`
                              )
                            ) {
                              deleteRealEstate(item.id)
                            }
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>대출 목록</CardTitle>
          {loans.length > 0 && <AddLoanPaymentForm />}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>대출기관</TableHead>
                <TableHead>대출종류</TableHead>
                <TableHead className="text-right">원금</TableHead>
                <TableHead className="text-right">잔액</TableHead>
                <TableHead className="text-right">금리</TableHead>
                <TableHead className="text-right">월 상환액</TableHead>
                <TableHead>만기일</TableHead>
                <TableHead className="text-center">상환기록</TableHead>
                <TableHead className="text-center">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    등록된 대출이 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                loans.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.lender}</p>
                        <p className="text-sm text-muted-foreground">{item.type}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.purpose}</Badge>
                    </TableCell>
                    <TableCell className="text-right currency">{formatCurrency(item.originalAmount)}</TableCell>
                    <TableCell className="text-right currency text-destructive">
                      {formatCurrency(item.currentBalance)}
                    </TableCell>
                    <TableCell className="text-right">{item.interestRate}%</TableCell>
                    <TableCell className="text-right currency">{formatCurrency(item.monthlyPayment)}</TableCell>
                    <TableCell>{formatDate(item.maturityDate)}</TableCell>
                    <TableCell className="text-center">
                      <AddLoanPaymentForm />
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // TODO: 수정 모달 구현
                            console.log('Edit loan:', item.id)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (window.confirm(`${item.lender} ${item.type} 대출을 삭제하시겠습니까?`)) {
                              deleteLoan(item.id)
                            }
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        </Card>
      </ContentSection>
    </PageLayout>
  )
}
