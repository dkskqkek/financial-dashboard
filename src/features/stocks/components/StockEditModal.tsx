import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SECTOR_OPTIONS } from '../types/constants'
import type { Stock, StockFormData } from '../types/stock.types'

interface StockEditModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingStock: Stock | null
  formData: StockFormData
  setFormData: (data: StockFormData) => void
  onSave: () => void
  onCancel: () => void
}

export function StockEditModal({
  isOpen,
  onOpenChange,
  editingStock,
  formData,
  setFormData,
  onSave,
  onCancel,
}: StockEditModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>주식 정보 수정</DialogTitle>
          <DialogDescription>보유 주식의 정보를 수정할 수 있습니다.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="stockName" className="text-sm font-medium">
              종목명
            </label>
            <Input
              id="stockName"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="종목명을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="quantity" className="text-sm font-medium">
              보유 수량
            </label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="보유 수량을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="averagePrice" className="text-sm font-medium">
              평균 매입가
            </label>
            <Input
              id="averagePrice"
              type="number"
              value={formData.averagePrice}
              onChange={e => setFormData({ ...formData, averagePrice: e.target.value })}
              placeholder="평균 매입가를 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="sector" className="text-sm font-medium">
              섹터
            </label>
            <select
              id="sector"
              value={formData.sector}
              onChange={e => setFormData({ ...formData, sector: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              <option value="">선택안함</option>
              {SECTOR_OPTIONS.map(sector => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button type="button" onClick={onSave}>
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
