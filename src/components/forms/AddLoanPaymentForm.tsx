import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BaseModalForm } from '@/components/common/BaseModalForm'
import { useAppStore } from '@/stores'
import { generateId } from '@/lib/utils'
import { Plus } from 'lucide-react'
import type { LoanPayment } from '@/types'

interface LoanPaymentFormData {
  loanId: string
  date: string
  totalAmount: string
  principalAmount: string
  interestAmount: string
  memo: string
}

export function AddLoanPaymentForm() {
  const { addLoanPayment, loans } = useAppStore()
  
  const initialData: LoanPaymentFormData = {
    loanId: '',
    date: new Date().toISOString().split('T')[0],
    totalAmount: '',
    principalAmount: '',
    interestAmount: '',
    memo: '',
  }

  const handleSubmit = (formData: LoanPaymentFormData) => {
    const selectedLoan = loans.find(loan => loan.id === formData.loanId)
    const remainingBalance = selectedLoan 
      ? selectedLoan.currentBalance - Number(formData.principalAmount)
      : 0

    const newPayment: LoanPayment = {
      id: generateId(),
      loanId: formData.loanId,
      date: formData.date,
      totalAmount: Number(formData.totalAmount),
      principalAmount: Number(formData.principalAmount),
      interestAmount: Number(formData.interestAmount),
      remainingBalance,
      memo: formData.memo || undefined,
    }

    addLoanPayment(newPayment)
  }

  return (
    <BaseModalForm
      title="대출 상환 추가"
      description="대출 상환 내역을 기록하세요."
      triggerButton={
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          상환 기록
        </Button>
      }
      initialData={initialData}
      onSubmit={handleSubmit}
    >
      {({ formData, updateField }) => (
        <>
          <div>
            <label htmlFor="loanId" className="text-sm font-medium">
              대출 선택
            </label>
            <select
              id="loanId"
              name="loanId"
              value={formData.loanId}
              onChange={e => updateField('loanId', e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md"
              required
            >
              <option value="">대출을 선택하세요</option>
              {loans.map(loan => (
                <option key={loan.id} value={loan.id}>
                  {loan.lender} - {loan.type} (잔액: {loan.currentBalance.toLocaleString()}원)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="paymentDate" className="text-sm font-medium">
              상환일
            </label>
            <Input
              id="paymentDate"
              name="paymentDate"
              type="date"
              value={formData.date}
              onChange={e => updateField('date', e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="totalAmount" className="text-sm font-medium">
              총 상환액
            </label>
            <Input
              id="totalAmount"
              name="totalAmount"
              type="number"
              value={formData.totalAmount}
              onChange={e => updateField('totalAmount', e.target.value)}
              placeholder="원"
              min="0"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="principalAmount" className="text-sm font-medium">
                원금 상환액
              </label>
              <Input
                id="principalAmount"
                name="principalAmount"
                type="number"
                value={formData.principalAmount}
                onChange={e => updateField('principalAmount', e.target.value)}
                placeholder="원"
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="interestAmount" className="text-sm font-medium">
                이자 납부액
              </label>
              <Input
                id="interestAmount"
                name="interestAmount"
                type="number"
                value={formData.interestAmount}
                onChange={e => updateField('interestAmount', e.target.value)}
                placeholder="원"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="memo" className="text-sm font-medium">
              메모 (선택)
            </label>
            <Input
              id="memo"
              name="memo"
              value={formData.memo}
              onChange={e => updateField('memo', e.target.value)}
              placeholder="추가 메모가 있다면 입력하세요"
            />
          </div>
        </>
      )}
    </BaseModalForm>
  )
}