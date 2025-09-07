import React, { useEffect, useState } from 'react'
import { useAppStore } from '@/stores'
import { apiService } from '@/services/api'
import { exchangeRateService } from '@/services/exchangeRateService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Wallet,
  Building,
  CreditCard,
} from 'lucide-react'
import { AddCashAccountForm } from '@/components/forms/AddCashAccountForm'
import { formatCurrency, formatDate, maskAccountNumber } from '@/lib/utils'
import type { CashAccount } from '@/types'

export function AssetsPage() {
  const { 
    cashAccounts, 
    setCashAccounts, 
    deleteCashAccount, 
    updateCashAccount, 
    isLoading, 
    setIsLoading,
    exchangeRate,
    updateExchangeRate,
    convertToKrwTotal
  } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedAccount, setSelectedAccount] = useState<CashAccount | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<CashAccount | null>(null)
  const [totalBalance, setTotalBalance] = useState<number>(0)
  const [usdTotalInKrw, setUsdTotalInKrw] = useState<number>(0)
  const [bankTotals, setBankTotals] = useState<Record<string, number>>({})
  const [typeTotals, setTypeTotals] = useState<Record<string, number>>({})
  const [editFormData, setEditFormData] = useState({
    bankName: '',
    accountType: '',
    accountNumber: '',
    balance: '',
    memo: ''
  })

  // 페이지 로드 시 환율 업데이트 및 총 잔액 계산
  useEffect(() => {
    const initializeData = async () => {
      // 환율 업데이트
      if (!exchangeRate) {
        await updateExchangeRate()
      }
      
      // 총 잔액 계산 (환율 변환 적용)
      updateTotalBalance()
    }
    
    initializeData()
  }, [])

  // 계좌 데이터가 변경될 때마다 총 잔액 재계산
  useEffect(() => {
    updateTotalBalance()
  }, [cashAccounts, exchangeRate])

  const updateTotalBalance = async () => {
    if (cashAccounts.length > 0) {
      const total = await convertToKrwTotal(filteredAccounts)
      setTotalBalance(total)
      
      // USD 계좌 총액 계산 (KRW 변환)
      const usdAccounts = filteredAccounts.filter(acc => acc.currency === 'USD')
      let usdTotal = 0
      for (const account of usdAccounts) {
        usdTotal += await exchangeRateService.convertUsdToKrw(account.balance)
      }
      setUsdTotalInKrw(usdTotal)
      
      // 은행별 총액 계산
      const banks = Array.from(new Set(cashAccounts.map(acc => acc.bankName)))
      const bankTotalsMap: Record<string, number> = {}
      for (const bankName of banks) {
        const bankAccounts = cashAccounts.filter(acc => acc.bankName === bankName)
        bankTotalsMap[bankName] = await convertToKrwTotal(bankAccounts)
      }
      setBankTotals(bankTotalsMap)
      
      // 계좌 유형별 총액 계산
      const types = Array.from(new Set(cashAccounts.map(acc => acc.accountType)))
      const typeTotalsMap: Record<string, number> = {}
      for (const accountType of types) {
        const typeAccounts = cashAccounts.filter(acc => acc.accountType === accountType)
        typeTotalsMap[accountType] = await convertToKrwTotal(typeAccounts)
      }
      setTypeTotals(typeTotalsMap)
    }
  }

  const loadCashAccounts = async () => {
    setIsLoading(true)
    try {
      const accounts = await apiService.getCashAccounts()
      setCashAccounts(accounts)
    } catch (error) {
      console.error('Failed to load cash accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 계좌 수정 모달 열기
  const handleEditAccount = (account: CashAccount) => {
    setEditingAccount(account)
    setEditFormData({
      bankName: account.bankName,
      accountType: account.accountType,
      accountNumber: account.accountNumber,
      balance: account.balance.toString(),
      memo: account.memo || ''
    })
    setEditModalOpen(true)
  }

  // 계좌 수정 저장
  const handleSaveEdit = () => {
    if (!editingAccount) return

    const updatedAccount = {
      ...editingAccount,
      bankName: editFormData.bankName,
      accountType: editFormData.accountType,
      accountNumber: editFormData.accountNumber,
      balance: Number(editFormData.balance),
      memo: editFormData.memo
    }

    updateCashAccount(editingAccount.id, updatedAccount)
    setEditModalOpen(false)
    setEditingAccount(null)
  }

  // 수정 모달 닫기
  const handleCancelEdit = () => {
    setEditModalOpen(false)
    setEditingAccount(null)
    setEditFormData({
      bankName: '',
      accountType: '',
      accountNumber: '',
      balance: '',
      memo: ''
    })
  }

  const filteredAccounts = cashAccounts.filter(account => {
    const matchesSearch = 
      account.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountNumber.includes(searchTerm)
    
    const matchesType = selectedType === 'all' || account.accountType === selectedType
    
    return matchesSearch && matchesType
  })

  // totalBalance는 이제 state로 관리되므로 이 계산은 제거됨
  // 실시간 환율 변환은 updateTotalBalance()에서 처리

  const accountTypes = ['입출금통장', 'CMA', '외화예금', '정기예금', '적금']

  return (
    <div className="mobile-container space-y-4 sm:space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">자산 상세</h1>
          <p className="text-muted-foreground">
            보유 중인 현금성 자산을 관리하고 추적하세요
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => {
            alert('데이터 내보내기 기능은 준비 중입니다.')
          }}>
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
          <AddCashAccountForm />
        </div>
      </div>

      {/* 요약 카드들 */}
      <div className="mobile-grid gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 현금 자산</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold currency">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredAccounts.length}개 계좌
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">원화 자산</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold currency">
              {formatCurrency(
                filteredAccounts
                  .filter(acc => acc.currency === 'KRW')
                  .reduce((sum, acc) => sum + acc.balance, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredAccounts.filter(acc => acc.currency === 'KRW').length}개 계좌
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">외화 자산</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold currency">
              {formatCurrency(usdTotalInKrw)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredAccounts.filter(acc => acc.currency === 'USD').length}개 계좌
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle>계좌 목록</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="계좌번호, 은행명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              {accountTypes.map((type) => (
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
              {filteredAccounts.map((account) => (
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
                  <TableCell className="font-mono">
                    {maskAccountNumber(account.accountNumber)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={account.currency === 'KRW' ? 'default' : 'secondary'}>
                      {account.currency}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {account.currency === 'KRW' 
                      ? formatCurrency(account.balance)
                      : `$${account.balance.toLocaleString()}`}
                  </TableCell>
                  <TableCell>{formatDate(account.lastTransactionDate)}</TableCell>
                  <TableCell className="max-w-32 truncate">
                    {account.memo || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditAccount(account)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (window.confirm(`${account.bankName} ${account.accountType} 계좌를 삭제하시겠습니까?`)) {
                            deleteCashAccount(account.id)
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
              <p className="mt-4 text-lg font-medium text-muted-foreground">
                계좌가 없습니다
              </p>
              <p className="text-sm text-muted-foreground">
                첫 번째 계좌를 추가해보세요
              </p>
              <Button className="mt-4" onClick={() => {
                const addButton = document.querySelector('[data-testid="add-account-trigger"]') as HTMLButtonElement
                if (addButton) {
                  addButton.click()
                } else {
                  alert('계좌 추가 기능을 사용하려면 상단의 "계좌 추가" 버튼을 클릭하세요.')
                }
              }}>
                <Plus className="h-4 w-4 mr-2" />
                계좌 추가하기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 자산 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>은행별 분산</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from(new Set(cashAccounts.map(acc => acc.bankName))).map(bankName => {
                const bankTotal = bankTotals[bankName] || 0
                const percentage = totalBalance > 0 ? (bankTotal / totalBalance) * 100 : 0

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
              {Array.from(new Set(cashAccounts.map(acc => acc.accountType))).map(accountType => {
                const typeTotal = typeTotals[accountType] || 0
                const percentage = totalBalance > 0 ? (typeTotal / totalBalance) * 100 : 0

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

      {/* 계좌 수정 모달 */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>계좌 정보 수정</DialogTitle>
            <DialogDescription>
              현금 계좌의 정보를 수정할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="bankName" className="text-sm font-medium">은행명</label>
              <Input
                id="bankName"
                value={editFormData.bankName}
                onChange={(e) => setEditFormData({ ...editFormData, bankName: e.target.value })}
                placeholder="은행명을 입력하세요"
              />
            </div>
            
            <div>
              <label htmlFor="accountType" className="text-sm font-medium">계좌 유형</label>
              <Input
                id="accountType"
                value={editFormData.accountType}
                onChange={(e) => setEditFormData({ ...editFormData, accountType: e.target.value })}
                placeholder="계좌 유형을 입력하세요"
              />
            </div>
            
            <div>
              <label htmlFor="accountNumber" className="text-sm font-medium">계좌번호</label>
              <Input
                id="accountNumber"
                value={editFormData.accountNumber}
                onChange={(e) => setEditFormData({ ...editFormData, accountNumber: e.target.value })}
                placeholder="계좌번호를 입력하세요"
              />
            </div>
            
            <div>
              <label htmlFor="balance" className="text-sm font-medium">잔액</label>
              <Input
                id="balance"
                type="number"
                value={editFormData.balance}
                onChange={(e) => setEditFormData({ ...editFormData, balance: e.target.value })}
                placeholder="잔액을 입력하세요"
              />
            </div>
            
            <div>
              <label htmlFor="memo" className="text-sm font-medium">메모</label>
              <Input
                id="memo"
                value={editFormData.memo}
                onChange={(e) => setEditFormData({ ...editFormData, memo: e.target.value })}
                placeholder="메모를 입력하세요 (선택사항)"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancelEdit}>
              취소
            </Button>
            <Button type="button" onClick={handleSaveEdit}>
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}