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
import { Plus } from 'lucide-react'
import { useStockSearch } from '../hooks/useStockSearch'
import { useTransactionForm } from '../hooks/useTransactionForm'
import { StockSearchInput } from './StockSearchInput'
import { TransactionTypeSelector } from './TransactionTypeSelector'
import { AccountSelector } from './AccountSelector'
import { PriceDisplay } from './PriceDisplay'

export function AddStockTransactionForm() {
  const [open, setOpen] = useState(false)
  const { searchStock, isSearching, currentPrice, resetSearch } = useStockSearch()
  const { formData, customAccount, updateFormData, setCustomAccount, handleTypeChange, submitTransaction, resetForm } =
    useTransactionForm()

  const handleSymbolChange = async (symbol: string) => {
    updateFormData({ symbol })

    if (symbol.trim().length === 0) {
      resetSearch()
      updateFormData({ name: '', price: '' })
      return
    }

    const result = await searchStock(symbol)
    if (result) {
      updateFormData({
        name: result.name,
        price: formData.type !== 'existing' ? result.currentPrice?.toString() || '' : formData.price,
        exchange: result.exchange === 'KRX' ? 'KRX' : result.currency === 'USD' ? 'NASDAQ' : 'NYSE',
      })
    } else {
      updateFormData({ name: '', price: '' })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitTransaction(currentPrice || undefined)
    handleClose()
  }

  const handleClose = () => {
    setOpen(false)
    resetForm()
    resetSearch()
  }

  const handleTypeChangeWithPrice = (newType: 'buy' | 'sell' | 'existing') => {
    handleTypeChange(newType, currentPrice || undefined)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="add-stock-trigger">
          <Plus className="h-4 w-4 mr-2" />
          매매 기록
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>주식 매매 기록 추가</DialogTitle>
          <DialogDescription>종목 코드를 입력하면 자동으로 종목명과 현재가가 조회됩니다.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TransactionTypeSelector value={formData.type} onChange={handleTypeChangeWithPrice} />

          <AccountSelector
            selectedAccount={formData.account}
            customAccount={customAccount}
            onAccountChange={account => updateFormData({ account })}
            onCustomAccountChange={setCustomAccount}
          />

          <div className="grid grid-cols-2 gap-4">
            <StockSearchInput formData={formData} isSearching={isSearching} onSymbolChange={handleSymbolChange} />

            <div>
              <label htmlFor="exchange" className="text-sm font-medium">
                거래소
              </label>
              <select
                id="exchange"
                name="exchange"
                value={formData.exchange}
                onChange={e => updateFormData({ exchange: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value="KRX">한국거래소 (KRX)</option>
                <option value="NASDAQ">나스닥 (NASDAQ)</option>
                <option value="NYSE">뉴욕증권거래소 (NYSE)</option>
                <option value="BINANCE">바이낸스 (BINANCE)</option>
                <option value="BITHUMB">빗썸 (BITHUMB)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="stockName" className="text-sm font-medium">
              종목명
            </label>
            <Input
              id="stockName"
              name="stockName"
              value={formData.name}
              onChange={e => updateFormData({ name: e.target.value })}
              placeholder={formData.symbol ? '자동 조회됩니다...' : '종목명을 입력하세요'}
              required
              className={formData.name && formData.symbol ? 'bg-green-50 border-green-200' : ''}
            />
            {formData.name && formData.symbol && (
              <p className="text-xs text-green-600 mt-1">✓ 종목이 자동으로 조회되었습니다</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="text-sm font-medium">
                수량
              </label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={e => updateFormData({ quantity: e.target.value })}
                placeholder="주 (소수점 가능)"
                min="0"
                step="0.00000001"
                required
              />
            </div>

            <PriceDisplay
              formData={formData}
              currentPrice={currentPrice}
              onPriceChange={price => updateFormData({ price })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fee" className="text-sm font-medium">
                수수료 (선택)
              </label>
              <Input
                id="fee"
                name="fee"
                type="number"
                value={formData.fee}
                onChange={e => updateFormData({ fee: e.target.value })}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label htmlFor="sector" className="text-sm font-medium">
                섹터 (선택)
              </label>
              <select
                id="sector"
                name="sector"
                value={formData.sector}
                onChange={e => updateFormData({ sector: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value="">선택안함</option>
                <option value="기술">기술</option>
                <option value="반도체">반도체</option>
                <option value="자동차">자동차</option>
                <option value="금융">금융</option>
                <option value="바이오">바이오</option>
                <option value="에너지">에너지</option>
                <option value="소비재">소비재</option>
                <option value="패시브">패시브</option>
                <option value="채권">채권</option>
                <option value="리츠">리츠</option>
                <option value="원자재">원자재</option>
                <option value="헬스케어">헬스케어</option>
                <option value="통신">통신</option>
                <option value="유틸리티">유틸리티</option>
                <option value="가상화폐">가상화폐</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="tradeMemo" className="text-sm font-medium">
              메모 (선택)
            </label>
            <Input
              id="tradeMemo"
              name="tradeMemo"
              value={formData.memo}
              onChange={e => updateFormData({ memo: e.target.value })}
              placeholder="거래 메모를 입력하세요"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button type="submit">
              {formData.type === 'buy' ? '매수' : formData.type === 'sell' ? '매도' : '기존 보유'} 기록
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
