import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BaseModalForm } from '@/components/common/BaseModalForm'
import { useAppStore } from '@/stores'
import { generateId } from '@/lib/utils'
import { Plus } from 'lucide-react'
import type { RealEstate } from '@/types'

interface RealEstateFormData {
  type: 'apartment' | 'house' | 'commercial' | 'land'
  location: string
  purchaseDate: string
  purchasePrice: string
  currentValue: string
  monthlyIncome: string
  expenses: string
}

export function AddRealEstateForm() {
  const { addRealEstate } = useAppStore()
  
  const initialData: RealEstateFormData = {
    type: 'apartment',
    location: '',
    purchaseDate: '',
    purchasePrice: '',
    currentValue: '',
    monthlyIncome: '',
    expenses: '',
  }

  const handleSubmit = (formData: RealEstateFormData) => {
    const newProperty: RealEstate = {
      id: generateId(),
      type: formData.type,
      location: formData.location,
      purchaseDate: formData.purchaseDate,
      purchasePrice: Number(formData.purchasePrice),
      currentValue: Number(formData.currentValue),
      monthlyIncome: formData.monthlyIncome ? Number(formData.monthlyIncome) : undefined,
      expenses: formData.expenses ? Number(formData.expenses) : undefined,
    }

    addRealEstate(newProperty)
  }

  return (
    <BaseModalForm
      title="부동산 추가"
      description="아파트, 주택, 상업용 부동산 등의 정보를 추가하세요."
      triggerButton={
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          부동산 추가
        </Button>
      }
      initialData={initialData}
      onSubmit={handleSubmit}
    >
      {({ formData, updateField }) => (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="propertyType" className="text-sm font-medium">
                부동산 종류
              </label>
              <select
                id="propertyType"
                name="propertyType"
                value={formData.type}
                onChange={e => updateField('type', e.target.value as RealEstateFormData['type'])}
                className="w-full mt-1 px-3 py-2 border rounded-md"
                required
              >
                <option value="apartment">아파트</option>
                <option value="house">단독주택</option>
                <option value="commercial">상업용</option>
                <option value="land">토지</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="text-sm font-medium">
                위치
              </label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={e => updateField('location', e.target.value)}
                placeholder="예: 서울특별시 강남구"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="purchaseDate" className="text-sm font-medium">
              매입일
            </label>
            <Input
              id="purchaseDate"
              name="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={e => updateField('purchaseDate', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="purchasePrice" className="text-sm font-medium">
                매입가격
              </label>
              <Input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                value={formData.purchasePrice}
                onChange={e => updateField('purchasePrice', e.target.value)}
                placeholder="원"
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="currentValue" className="text-sm font-medium">
                현재가치
              </label>
              <Input
                id="currentValue"
                name="currentValue"
                type="number"
                value={formData.currentValue}
                onChange={e => updateField('currentValue', e.target.value)}
                placeholder="원"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="monthlyIncome" className="text-sm font-medium">
                월 수익 (선택)
              </label>
              <Input
                id="monthlyIncome"
                name="monthlyIncome"
                type="number"
                value={formData.monthlyIncome}
                onChange={e => updateField('monthlyIncome', e.target.value)}
                placeholder="월세, 임대료 등"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="expenses" className="text-sm font-medium">
                월 지출 (선택)
              </label>
              <Input
                id="expenses"
                name="expenses"
                type="number"
                value={formData.expenses}
                onChange={e => updateField('expenses', e.target.value)}
                placeholder="관리비, 세금 등"
                min="0"
              />
            </div>
          </div>
        </>
      )}
    </BaseModalForm>
  )
}