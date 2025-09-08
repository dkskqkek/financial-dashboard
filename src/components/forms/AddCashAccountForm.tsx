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
import type { CashAccount } from '@/types'

export function AddCashAccountForm() {
  const { addCashAccount } = useAppStore()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    bankName: '',
    accountType: '',
    accountNumber: '',
    currency: 'KRW',
    balance: '',
    memo: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newAccount: CashAccount = {
      id: generateId(),
      bankName: formData.bankName,
      accountType: formData.accountType,
      accountNumber: formData.accountNumber,
      currency: formData.currency,
      balance: Number(formData.balance),
      lastTransactionDate: new Date().toISOString().split('T')[0],
      memo: formData.memo || undefined,
    }

    addCashAccount(newAccount)
    setOpen(false)
    setFormData({
      bankName: '',
      accountType: '',
      accountNumber: '',
      currency: 'KRW',
      balance: '',
      memo: '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="add-account-trigger">
          <Plus className="h-4 w-4 mr-2" />
          계좌 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>새 계좌 추가</DialogTitle>
          <DialogDescription>현금 계좌 정보를 입력하여 자산 관리를 시작하세요.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="accountBankName" className="text-sm font-medium">
              은행명
            </label>
            <Input
              id="accountBankName"
              name="accountBankName"
              value={formData.bankName}
              onChange={e => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="은행명을 입력하세요"
              required
            />
          </div>

          <div>
            <label htmlFor="accountType" className="text-sm font-medium">
              계좌 종류
            </label>
            <select
              id="accountType"
              name="accountType"
              value={formData.accountType}
              onChange={e => setFormData({ ...formData, accountType: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md"
              required
            >
              <option value="">계좌 종류 선택</option>
              <option value="입출금통장">입출금통장</option>
              <option value="CMA">CMA</option>
              <option value="주식계좌">주식계좌</option>
              <option value="외화예금">외화예금</option>
              <option value="정기예금">정기예금</option>
              <option value="적금">적금</option>
            </select>
          </div>

          <div>
            <label htmlFor="accountNumber" className="text-sm font-medium">
              계좌번호
            </label>
            <Input
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder="계좌번호를 입력하세요"
              required
            />
          </div>

          <div>
            <label htmlFor="currency" className="text-sm font-medium">
              통화
            </label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={e => setFormData({ ...formData, currency: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              <option value="KRW">원화 (KRW)</option>
              <option value="USD">달러 (USD)</option>
              <option value="EUR">유로 (EUR)</option>
              <option value="JPY">엔화 (JPY)</option>
            </select>
          </div>

          <div>
            <label htmlFor="balance" className="text-sm font-medium">
              잔액
            </label>
            <Input
              id="balance"
              name="balance"
              type="number"
              value={formData.balance}
              onChange={e => setFormData({ ...formData, balance: e.target.value })}
              placeholder="현재 잔액을 입력하세요"
              required
            />
          </div>

          <div>
            <label htmlFor="memo" className="text-sm font-medium">
              메모 (선택)
            </label>
            <Input
              id="memo"
              name="memo"
              value={formData.memo}
              onChange={e => setFormData({ ...formData, memo: e.target.value })}
              placeholder="메모를 입력하세요"
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
