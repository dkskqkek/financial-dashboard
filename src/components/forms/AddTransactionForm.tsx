import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { useAppStore } from '@/stores'
import { generateId } from '@/lib/utils'
import { Plus } from 'lucide-react'
import type { Transaction } from '@/types'

export function AddTransactionForm() {
  const { addTransaction, cashAccounts } = useAppStore()
  const [open, setOpen] = useState(false)
  const [customAccount, setCustomAccount] = useState('')
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense' | 'transfer',
    account: '',
    description: '',
    amount: '',
    category: '',
    memo: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const accountName = formData.account === '기타' ? customAccount : formData.account
    
    const newTransaction: Transaction = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      type: formData.type,
      account: accountName,
      description: formData.description,
      amount: formData.type === 'expense' ? -Math.abs(Number(formData.amount)) : Number(formData.amount),
      balance: 0, // 실제로는 계좌 잔액 계산 필요
      category: formData.category,
      memo: formData.memo || undefined
    }

    addTransaction(newTransaction)
    setOpen(false)
    setFormData({
      type: 'expense',
      account: '',
      description: '',
      amount: '',
      category: '',
      memo: ''
    })
    setCustomAccount('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          거래 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>새 거래 추가</DialogTitle>
          <DialogDescription>
            수입, 지출 또는 이체 거래를 기록하세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="transactionType" className="text-sm font-medium">거래 유형</label>
            <select
              id="transactionType"
              name="transactionType"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full mt-1 px-3 py-2 border rounded-md"
              required
            >
              <option value="income">수입</option>
              <option value="expense">지출</option>
              <option value="transfer">이체</option>
            </select>
          </div>

          <div>
            <label htmlFor="transactionAccount" className="text-sm font-medium">계좌</label>
            <select
              id="transactionAccount"
              name="transactionAccount"
              value={formData.account}
              onChange={(e) => setFormData({ ...formData, account: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md"
              required
            >
              <option value="">계좌를 선택하세요</option>
              {cashAccounts.map((account) => (
                <option key={account.id} value={account.bankName + ' - ' + account.accountType}>
                  {account.bankName} - {account.accountType} ({account.currency} {account.balance.toLocaleString()})
                </option>
              ))}
              <option value="기타">기타 (직접 입력)</option>
            </select>
            {formData.account === '기타' && (
              <Input
                className="mt-2"
                value={customAccount}
                placeholder="계좌명을 직접 입력하세요"
                onChange={(e) => setCustomAccount(e.target.value)}
                required
              />
            )}
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-medium">내용</label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="거래 내용을 입력하세요"
              required
            />
          </div>

          <div>
            <label htmlFor="amount" className="text-sm font-medium">금액</label>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="금액을 입력하세요"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="text-sm font-medium">카테고리</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md"
              required
            >
              <option value="">카테고리 선택</option>
              <option value="식비">식비</option>
              <option value="교통비">교통비</option>
              <option value="의료비">의료비</option>
              <option value="쇼핑">쇼핑</option>
              <option value="투자">투자</option>
              <option value="급여">급여</option>
              <option value="부업">부업</option>
            </select>
          </div>

          <div>
            <label htmlFor="transactionMemo" className="text-sm font-medium">메모 (선택)</label>
            <Input
              id="transactionMemo"
              name="transactionMemo"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              placeholder="메모를 입력하세요"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button type="submit">
              추가
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}