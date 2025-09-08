import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CashAccount, AssetFormData } from '../types/asset.types'

interface AssetEditModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editingAccount: CashAccount | null
  formData: AssetFormData
  setFormData: (data: AssetFormData) => void
  onSave: () => void
  onCancel: () => void
}

export function AssetEditModal({
  isOpen,
  onOpenChange,
  editingAccount,
  formData,
  setFormData,
  onSave,
  onCancel,
}: AssetEditModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>계좌 정보 수정</DialogTitle>
          <DialogDescription>현금 계좌의 정보를 수정할 수 있습니다.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="bankName" className="text-sm font-medium">
              은행명
            </label>
            <Input
              id="bankName"
              value={formData.bankName}
              onChange={e => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="은행명을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="accountType" className="text-sm font-medium">
              계좌 유형
            </label>
            <Input
              id="accountType"
              value={formData.accountType}
              onChange={e => setFormData({ ...formData, accountType: e.target.value })}
              placeholder="계좌 유형을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="accountNumber" className="text-sm font-medium">
              계좌번호
            </label>
            <Input
              id="accountNumber"
              value={formData.accountNumber}
              onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder="계좌번호를 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="balance" className="text-sm font-medium">
              잔액
            </label>
            <Input
              id="balance"
              type="number"
              value={formData.balance}
              onChange={e => setFormData({ ...formData, balance: e.target.value })}
              placeholder="잔액을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="memo" className="text-sm font-medium">
              메모
            </label>
            <Input
              id="memo"
              value={formData.memo}
              onChange={e => setFormData({ ...formData, memo: e.target.value })}
              placeholder="메모를 입력하세요 (선택사항)"
            />
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
