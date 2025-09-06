import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { useAppStore } from '@/stores'
import { generateId } from '@/lib/utils'
import { Plus } from 'lucide-react'
import type { RealEstate } from '@/types'

export function AddRealEstateForm() {
  const { addRealEstate } = useAppStore()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: 'apartment' as 'apartment' | 'house' | 'commercial' | 'land',
    location: '',
    purchaseDate: '',
    purchasePrice: '',
    currentValue: '',
    monthlyIncome: '',
    expenses: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newProperty: RealEstate = {
      id: generateId(),
      type: formData.type,
      location: formData.location,
      purchaseDate: formData.purchaseDate,
      purchasePrice: Number(formData.purchasePrice),
      currentValue: Number(formData.currentValue),
      monthlyIncome: formData.monthlyIncome ? Number(formData.monthlyIncome) : undefined,
      expenses: formData.expenses ? Number(formData.expenses) : undefined
    }

    addRealEstate(newProperty)
    setOpen(false)
    setFormData({
      type: 'apartment',
      location: '',
      purchaseDate: '',
      purchasePrice: '',
      currentValue: '',
      monthlyIncome: '',
      expenses: ''
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          부동산 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>부동산 추가</DialogTitle>
          <DialogDescription>
            아파트, 단독주택, 상가, 토지 등의 부동산 자산을 추가하세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="propertyType" className="text-sm font-medium">부동산 유형</label>
            <select
              id="propertyType"
              name="propertyType"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full mt-1 px-3 py-2 border rounded-md"
              required
            >
              <option value="apartment">아파트</option>
              <option value="house">단독주택</option>
              <option value="commercial">상가</option>
              <option value="land">토지</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className="text-sm font-medium">위치</label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="예: 서울시 강남구"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="purchaseDate" className="text-sm font-medium">매입일</label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                required
              />
            </div>

            <div>
              <label htmlFor="purchasePrice" className="text-sm font-medium">매입가</label>
              <Input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                placeholder="원"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="currentValue" className="text-sm font-medium">현재시세</label>
            <Input
              id="currentValue"
              name="currentValue"
              type="number"
              value={formData.currentValue}
              onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
              placeholder="현재 예상 시세"
              min="0"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="monthlyIncome" className="text-sm font-medium">월 임대수익 (선택)</label>
              <Input
                id="monthlyIncome"
                name="monthlyIncome"
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                placeholder="원"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="expenses" className="text-sm font-medium">월 관리비 (선택)</label>
              <Input
                id="expenses"
                name="expenses"
                type="number"
                value={formData.expenses}
                onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
                placeholder="원"
                min="0"
              />
            </div>
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