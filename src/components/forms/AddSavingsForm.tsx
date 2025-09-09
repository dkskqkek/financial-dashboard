import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BaseModalForm } from '@/components/common/BaseModalForm'
import { useAppStore } from '@/stores'
import { generateId } from '@/lib/utils'
import { Plus } from 'lucide-react'
import type { Savings } from '@/types'

interface SavingsFormData {
  bankName: string
  productName: string
  principal: string
  interestRate: string
  maturityDate: string
  type: 'savings' | 'deposit' | 'cma'
}

export function AddSavingsForm() {
  const { addSavings } = useAppStore()
  
  const initialData: SavingsFormData = {
    bankName: '',
    productName: '',
    principal: '',
    interestRate: '',
    maturityDate: '',
    type: 'savings',
  }

  const handleSubmit = (formData: SavingsFormData) => {
    const newSavings: Savings = {
      id: generateId(),
      bankName: formData.bankName,
      productName: formData.productName,
      principal: Number(formData.principal),
      interestRate: Number(formData.interestRate),
      maturityDate: formData.maturityDate,
      currentValue: Number(formData.principal), // 초기값은 원금과 동일
      type: formData.type,
    }

    addSavings(newSavings)
  }

  return (
    <BaseModalForm
      title="예적금 추가"
      description="정기예금, 적금, CMA 등의 예적금 상품을 추가하세요."
      triggerButton={
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          예적금 추가
        </Button>
      }
      initialData={initialData}
      onSubmit={handleSubmit}
    >
      {({ formData, updateField }) => (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="bankName" className="text-sm font-medium">
                은행명
              </label>
              <Input
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={e => updateField('bankName', e.target.value)}
                placeholder="예: 국민은행"
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
                onChange={e => updateField('productName', e.target.value)}
                placeholder="예: KB정기예금"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="savingsType" className="text-sm font-medium">
              상품 종류
            </label>
            <select
              id="savingsType"
              name="savingsType"
              value={formData.type}
              onChange={e => updateField('type', e.target.value as SavingsFormData['type'])}
              className="w-full mt-1 px-3 py-2 border rounded-md"
              required
            >
              <option value="savings">적금</option>
              <option value="deposit">정기예금</option>
              <option value="cma">CMA</option>
            </select>
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
                onChange={e => updateField('principal', e.target.value)}
                placeholder="원"
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="interestRate" className="text-sm font-medium">
                금리 (%)
              </label>
              <Input
                id="interestRate"
                name="interestRate"
                type="number"
                value={formData.interestRate}
                onChange={e => updateField('interestRate', e.target.value)}
                placeholder="3.2"
                min="0"
                max="100"
                step="0.01"
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
              onChange={e => updateField('maturityDate', e.target.value)}
              required
            />
          </div>
        </>
      )}
    </BaseModalForm>
  )
}