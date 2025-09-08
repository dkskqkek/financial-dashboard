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
import type { Savings } from '@/types'

export function AddSavingsForm() {
  const { addSavings } = useAppStore()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    bankName: '',
    productName: '',
    principal: '',
    interestRate: '',
    maturityDate: '',
    type: 'savings' as 'savings' | 'deposit' | 'cma',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const principal = Number(formData.principal)
    const rate = Number(formData.interestRate) / 100
    const maturityDate = new Date(formData.maturityDate)
    const startDate = new Date()
    const monthsDiff =
      (maturityDate.getFullYear() - startDate.getFullYear()) * 12 + (maturityDate.getMonth() - startDate.getMonth())

    // 단순 복리 계산
    const currentValue = principal * Math.pow(1 + rate / 12, monthsDiff)

    const newSaving: Savings = {
      id: generateId(),
      bankName: formData.bankName,
      productName: formData.productName,
      principal,
      interestRate: Number(formData.interestRate),
      maturityDate: formData.maturityDate,
      currentValue: Math.round(currentValue),
      type: formData.type,
    }

    addSavings(newSaving)
    setOpen(false)
    setFormData({
      bankName: '',
      productName: '',
      principal: '',
      interestRate: '',
      maturityDate: '',
      type: 'savings',
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          상품 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>예적금 상품 추가</DialogTitle>
          <DialogDescription>예금, 적금, CMA 등의 금융 상품 정보를 추가하세요.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="savingsType" className="text-sm font-medium">
              상품 구분
            </label>
            <select
              id="savingsType"
              name="savingsType"
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full mt-1 px-3 py-2 border rounded-md"
              required
            >
              <option value="savings">적금</option>
              <option value="deposit">정기예금</option>
              <option value="cma">CMA</option>
            </select>
          </div>

          <div>
            <label htmlFor="bankName" className="text-sm font-medium">
              은행/기관명
            </label>
            <Input
              id="bankName"
              name="bankName"
              value={formData.bankName}
              onChange={e => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="은행명을 입력하세요"
              required
            />
          </div>

          <div>
            <label htmlFor="productName" className="text-sm font-medium">
              상품명
            </label>
            <Input
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={e => setFormData({ ...formData, productName: e.target.value })}
              placeholder="상품명을 입력하세요"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="principal" className="text-sm font-medium">
                원금
              </label>
              <Input
                id="principal"
                name="principal"
                type="number"
                value={formData.principal}
                onChange={e => setFormData({ ...formData, principal: e.target.value })}
                placeholder="원"
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="savingsInterestRate" className="text-sm font-medium">
                금리 (%)
              </label>
              <Input
                id="savingsInterestRate"
                name="savingsInterestRate"
                type="number"
                value={formData.interestRate}
                onChange={e => setFormData({ ...formData, interestRate: e.target.value })}
                placeholder="3.5"
                min="0"
                max="100"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="savingsMaturityDate" className="text-sm font-medium">
              만기일
            </label>
            <Input
              id="savingsMaturityDate"
              name="savingsMaturityDate"
              type="date"
              value={formData.maturityDate}
              onChange={e => setFormData({ ...formData, maturityDate: e.target.value })}
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
