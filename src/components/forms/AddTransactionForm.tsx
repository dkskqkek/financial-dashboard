import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BaseModalForm } from '@/components/common/BaseModalForm'
import { useAppStore } from '@/stores'
import { generateId } from '@/lib/utils'
import { Plus } from 'lucide-react'
import type { Transaction } from '@/types'

interface TransactionFormData {
  type: 'income' | 'expense' | 'transfer'
  account: string
  description: string
  amount: string
  category: string
  memo: string
  date: string
  fee: string
  reference: string
}

export function AddTransactionForm() {
  const { addTransaction, cashAccounts } = useAppStore()
  const [customAccount, setCustomAccount] = useState('')
  
  const initialData: TransactionFormData = {
    type: 'expense',
    account: '',
    description: '',
    amount: '',
    category: '',
    memo: '',
    date: new Date().toISOString().split('T')[0],
    fee: '',
    reference: '',
  }

  const handleSubmit = (formData: TransactionFormData) => {
    const accountName = formData.account === '기타' ? customAccount : formData.account

    const now = new Date().toISOString()
    const newTransaction: Transaction = {
      id: generateId(),
      date: formData.date,
      type: formData.type,
      account: accountName,
      description: formData.description,
      amount: formData.type === 'expense' ? -Math.abs(Number(formData.amount)) : Number(formData.amount),
      balance: 0,
      category: formData.category,
      memo: formData.memo || undefined,
      fee: formData.fee ? Number(formData.fee) : undefined,
      reference: formData.reference || undefined,
      createdAt: now,
      updatedAt: now,
    }

    addTransaction(newTransaction)
  }

  const handleReset = () => {
    setCustomAccount('')
  }

  return (
    <BaseModalForm
      title="새 거래 추가"
      description="수입, 지출 또는 이체 거래를 기록하세요."
      triggerButton={
        <Button data-testid="add-transaction-trigger">
          <Plus className="h-4 w-4 mr-2" />
          거래 추가
        </Button>
      }
      initialData={initialData}
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      {({ formData, updateField }) => (
        <>
          <div>
            <label htmlFor="transactionType" className="text-sm font-medium">
              거래 유형
            </label>
            <select
              id="transactionType"
              name="transactionType"
              value={formData.type}
              onChange={e => updateField('type', e.target.value as TransactionFormData['type'])}
              className="w-full mt-1 px-3 py-2 border rounded-md"
              required
            >
              <option value="income">수입</option>
              <option value="expense">지출</option>
              <option value="transfer">이체</option>
            </select>
          </div>

          <div>
            <label htmlFor="transactionAccount" className="text-sm font-medium">
              계좌
            </label>
            <select
              id="transactionAccount"
              name="transactionAccount"
              value={formData.account}
              onChange={e => updateField('account', e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md"
              required
            >
              <option value="">계좌를 선택하세요</option>
              {cashAccounts.map(account => (
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
                onChange={e => setCustomAccount(e.target.value)}
                required
              />
            )}
          </div>

          <div>
            <label htmlFor="transactionDate" className="text-sm font-medium">
              거래일
            </label>
            <Input
              id="transactionDate"
              name="transactionDate"
              type="date"
              value={formData.date}
              onChange={e => updateField('date', e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-medium">
              내용
            </label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={e => updateField('description', e.target.value)}
              placeholder="거래 내용을 입력하세요"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="text-sm font-medium">
                금액
              </label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={e => updateField('amount', e.target.value)}
                placeholder="금액을 입력하세요"
                required
              />
            </div>
            <div>
              <label htmlFor="fee" className="text-sm font-medium">
                수수료 (선택)
              </label>
              <Input
                id="fee"
                name="fee"
                type="number"
                value={formData.fee}
                onChange={e => updateField('fee', e.target.value)}
                placeholder="수수료"
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="text-sm font-medium">
              카테고리
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={e => updateField('category', e.target.value)}
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
            <label htmlFor="reference" className="text-sm font-medium">
              참조번호 (선택)
            </label>
            <Input
              id="reference"
              name="reference"
              value={formData.reference}
              onChange={e => updateField('reference', e.target.value)}
              placeholder="거래 참조번호 (영수증번호 등)"
            />
          </div>

          <div>
            <label htmlFor="transactionMemo" className="text-sm font-medium">
              메모 (선택)
            </label>
            <Input
              id="transactionMemo"
              name="transactionMemo"
              value={formData.memo}
              onChange={e => updateField('memo', e.target.value)}
              placeholder="메모를 입력하세요"
            />
          </div>
        </>
      )}
    </BaseModalForm>
  )
}
