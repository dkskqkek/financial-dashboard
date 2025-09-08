import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAppStore } from '@/stores'
import { generateId } from '@/lib/utils'
import { Plus } from 'lucide-react'
import type { Loan } from '@/types'

export function AddLoanForm() {
  const { addLoan } = useAppStore()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    lender: '',
    type: '',
    originalAmount: '',
    currentBalance: '',
    interestRate: '',
    monthlyPayment: '',
    maturityDate: '',
    purpose: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newLoan: Loan = {
      id: generateId(),
      lender: formData.lender,
      type: formData.type,
      originalAmount: Number(formData.originalAmount),
      currentBalance: Number(formData.currentBalance),
      interestRate: Number(formData.interestRate),
      monthlyPayment: Number(formData.monthlyPayment),
      maturityDate: formData.maturityDate,
      purpose: formData.purpose,
    }

    addLoan(newLoan)
    setOpen(false)
    setFormData({
      lender: '',
      type: '',
      originalAmount: '',
      currentBalance: '',
      interestRate: '',
      monthlyPayment: '',
      maturityDate: '',
      purpose: '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          대출 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>대출 추가</DialogTitle>
          <DialogDescription>주택대출, 전세대출, 신용대출 등의 대출 정보를 추가하세요.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="lender" className="text-sm font-medium">
                대출기관
              </label>
              <Input
                id="lender"
                name="lender"
                value={formData.lender}
                onChange={e => setFormData({ ...formData, lender: e.target.value })}
                placeholder="예: 국민은행"
                required
              />
            </div>

            <div>
              <label htmlFor="type" className="text-sm font-medium">
                대출종류
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                required
              >
                <option value="">선택하세요</option>
                <option value="주택담보대출">주택담보대출</option>
                <option value="전세자금대출">전세자금대출</option>
                <option value="신용대출">신용대출</option>
                <option value="자동차대출">자동차대출</option>
                <option value="기타">기타</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="originalAmount" className="text-sm font-medium">
                원래 대출금
              </label>
              <Input
                id="originalAmount"
                name="originalAmount"
                type="number"
                value={formData.originalAmount}
                onChange={e => setFormData({ ...formData, originalAmount: e.target.value })}
                placeholder="원"
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="currentBalance" className="text-sm font-medium">
                현재 잔액
              </label>
              <Input
                id="currentBalance"
                name="currentBalance"
                type="number"
                value={formData.currentBalance}
                onChange={e => setFormData({ ...formData, currentBalance: e.target.value })}
                placeholder="원"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="interestRate" className="text-sm font-medium">
                금리 (%)
              </label>
              <Input
                id="interestRate"
                name="interestRate"
                type="number"
                value={formData.interestRate}
                onChange={e => setFormData({ ...formData, interestRate: e.target.value })}
                placeholder="3.2"
                min="0"
                max="100"
                step="0.01"
                required
              />
            </div>

            <div>
              <label htmlFor="monthlyPayment" className="text-sm font-medium">
                월 상환액
              </label>
              <Input
                id="monthlyPayment"
                name="monthlyPayment"
                type="number"
                value={formData.monthlyPayment}
                onChange={e => setFormData({ ...formData, monthlyPayment: e.target.value })}
                placeholder="원"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="maturityDate" className="text-sm font-medium">
              만기일
            </label>
            <Input
              id="maturityDate"
              name="maturityDate"
              type="date"
              value={formData.maturityDate}
              onChange={e => setFormData({ ...formData, maturityDate: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="purpose" className="text-sm font-medium">
              대출 목적
            </label>
            <Input
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={e => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="예: 주택구매, 사업자금 등"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit">추가</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
