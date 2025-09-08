import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/stores'
import { generateId, formatCurrency } from '@/lib/utils'
import { Plus, Calculator } from 'lucide-react'
import type { LoanPayment } from '@/types'

interface AddLoanPaymentFormProps {
  selectedLoanId?: string
}

export function AddLoanPaymentForm({ selectedLoanId }: AddLoanPaymentFormProps) {
  const { loans, loanPayments, addLoanPayment, updateLoan } = useAppStore()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    loanId: selectedLoanId || '',
    date: new Date().toISOString().split('T')[0],
    totalAmount: '',
    principalAmount: '',
    interestAmount: '',
    memo: '',
  })

  // 선택된 대출 정보 가져오기
  const selectedLoan = loans.find(loan => loan.id === formData.loanId)

  // 총 상환액 입력 시 원금/이자 자동 계산
  const handleTotalAmountChange = (totalAmount: string) => {
    setFormData(prev => ({ ...prev, totalAmount }))

    if (selectedLoan && totalAmount) {
      const total = Number(totalAmount)
      const currentBalance = selectedLoan.currentBalance
      const monthlyInterestRate = selectedLoan.interestRate / 100 / 12

      // 이자액 계산 (잔액 * 월이자율)
      const interestAmount = Math.round(currentBalance * monthlyInterestRate)
      const principalAmount = total - interestAmount

      setFormData(prev => ({
        ...prev,
        principalAmount: principalAmount > 0 ? principalAmount.toString() : '0',
        interestAmount: interestAmount.toString(),
      }))
    }
  }

  // 원금/이자 직접 입력 시 총액 자동 계산
  const handlePrincipalOrInterestChange = (field: 'principalAmount' | 'interestAmount', value: string) => {
    const newFormData = { ...formData, [field]: value }

    const principal = Number(newFormData.principalAmount || 0)
    const interest = Number(newFormData.interestAmount || 0)
    const total = principal + interest

    setFormData({
      ...newFormData,
      totalAmount: total > 0 ? total.toString() : '',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const totalAmount = Number(formData.totalAmount)
    const principalAmount = Number(formData.principalAmount)
    const interestAmount = Number(formData.interestAmount)

    if (!selectedLoan) {
      return
    }

    // 새로운 잔액 계산
    const newBalance = Math.max(0, selectedLoan.currentBalance - principalAmount)

    // 상환 기록 추가
    const newPayment: LoanPayment = {
      id: generateId(),
      loanId: formData.loanId,
      date: formData.date,
      totalAmount,
      principalAmount,
      interestAmount,
      remainingBalance: newBalance,
      memo: formData.memo || undefined,
    }

    addLoanPayment(newPayment)

    // 대출 잔액 업데이트
    updateLoan(selectedLoan.id, {
      currentBalance: newBalance,
    })

    // 폼 초기화 및 닫기
    setOpen(false)
    setFormData({
      loanId: selectedLoanId || '',
      date: new Date().toISOString().split('T')[0],
      totalAmount: '',
      principalAmount: '',
      interestAmount: '',
      memo: '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          상환 기록
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>대출 상환 기록 추가</DialogTitle>
          <DialogDescription>대출 상환 내역을 원금과 이자로 분리하여 기록합니다.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 대출 선택 */}
          <div className="space-y-2">
            <Label htmlFor="loanId">대출 선택</Label>
            <Select
              value={formData.loanId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData(prev => ({ ...prev, loanId: e.target.value }))
              }
              required
            >
              <SelectContent>
                <SelectItem value="">대출을 선택하세요</SelectItem>
                {loans.map(loan => (
                  <SelectItem key={loan.id} value={loan.id}>
                    {loan.lender} - {loan.type} ({formatCurrency(loan.currentBalance)} 잔액)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 상환일 */}
          <div className="space-y-2">
            <Label htmlFor="date">상환일</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          {/* 총 상환액 */}
          <div className="space-y-2">
            <Label htmlFor="totalAmount">총 상환액</Label>
            <div className="relative">
              <Input
                id="totalAmount"
                type="number"
                placeholder="0"
                value={formData.totalAmount}
                onChange={e => handleTotalAmountChange(e.target.value)}
                className="pr-12"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">원</span>
            </div>
          </div>

          {/* 원금/이자 분할 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principalAmount">
                원금 상환액
                {selectedLoan && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (잔액: {formatCurrency(selectedLoan.currentBalance)})
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="principalAmount"
                  type="number"
                  placeholder="0"
                  value={formData.principalAmount}
                  onChange={e => handlePrincipalOrInterestChange('principalAmount', e.target.value)}
                  className="pr-8"
                  required
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">원</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interestAmount">
                이자 상환액
                {selectedLoan && (
                  <span className="text-xs text-muted-foreground ml-2">(연 {selectedLoan.interestRate}%)</span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="interestAmount"
                  type="number"
                  placeholder="0"
                  value={formData.interestAmount}
                  onChange={e => handlePrincipalOrInterestChange('interestAmount', e.target.value)}
                  className="pr-8"
                  required
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">원</span>
              </div>
            </div>
          </div>

          {/* 이자 계산 도움말 */}
          {selectedLoan && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                <Calculator className="h-3 w-3 mr-1" />
                예상 월 이자
              </div>
              <div className="text-sm">
                {formatCurrency(Math.round((selectedLoan.currentBalance * selectedLoan.interestRate) / 100 / 12))}
                <span className="text-xs text-muted-foreground ml-2">
                  (잔액 × {selectedLoan.interestRate}% ÷ 12개월)
                </span>
              </div>
            </div>
          )}

          {/* 메모 */}
          <div className="space-y-2">
            <Label htmlFor="memo">메모 (선택사항)</Label>
            <Textarea
              id="memo"
              placeholder="상환 관련 메모를 입력하세요"
              value={formData.memo}
              onChange={e => setFormData(prev => ({ ...prev, memo: e.target.value }))}
              rows={2}
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit" disabled={!formData.loanId}>
              상환 기록 추가
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
