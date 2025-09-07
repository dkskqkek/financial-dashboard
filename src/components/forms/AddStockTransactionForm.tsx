import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { useAppStore } from '@/stores'
import { apiService } from '@/services/api'
import { generateId, getErrorMessage } from '@/lib/utils'
import { Plus, Search } from 'lucide-react'
import type { Stock, StockTransaction } from '@/types'

export function AddStockTransactionForm() {
  const { stocks, addStock, addStockTransaction, updateStock, cashAccounts } = useAppStore()
  const [open, setOpen] = useState(false)
  const [searchingStock, setSearchingStock] = useState(false)
  const [customAccount, setCustomAccount] = useState('')
  const [formData, setFormData] = useState({
    type: 'buy' as 'buy' | 'sell' | 'existing',
    symbol: '',
    name: '',
    quantity: '',
    price: '',
    fee: '',
    exchange: 'KRX',
    sector: '',
    memo: '',
    account: ''
  })
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)

  // 종목 코드 입력시 자동 검색 (Yahoo Finance API 전용)
  const handleSymbolChange = async (symbol: string) => {
    const cleanSymbol = symbol.trim().toUpperCase()
    setFormData(prev => ({ ...prev, symbol: cleanSymbol }))
    
    // 최소 길이 조건: 한국 주식 6자리, 미국 주식 1자리 이상
    const isKorean = /^\d{1,6}$/.test(cleanSymbol)
    const isGlobal = /^[A-Z]{1,}/.test(cleanSymbol)
    const minLength = isKorean ? 6 : 1
    
    if (cleanSymbol.length >= minLength) {
      setSearchingStock(true)
      console.log(`🔍 종목 검색 시작: ${cleanSymbol}`)
      
      try {
        console.log(`📡 API 요청 전 - baseUrl: ${(apiService as any).baseUrl}`)
        const stockInfo = await apiService.searchStock(cleanSymbol)
        console.log(`📈 API 응답:`, stockInfo)
        
        if (stockInfo) {
          setCurrentPrice(stockInfo.currentPrice || null)
          setFormData(prev => ({
            ...prev,
            name: stockInfo.name,
            // 기존 보유가 아닌 경우만 현재가를 단가에 입력
            price: prev.type !== 'existing' ? (stockInfo.currentPrice?.toString() || '') : prev.price,
            exchange: stockInfo.exchange === 'KRX' ? 'KRX' : 
                     stockInfo.currency === 'USD' ? 'NASDAQ' : 'NYSE'
          }))
          console.log(`✅ 종목 조회 성공: ${stockInfo.name}`)
        } else {
          console.log(`❌ 종목 조회 실패: ${cleanSymbol}`)
          setCurrentPrice(null)
          setFormData(prev => ({ ...prev, name: '', price: '' }))
        }
        
      } catch (error) {
        console.error(`💥 종목 검색 오류 (${cleanSymbol}):`, getErrorMessage(error))
        setFormData(prev => ({ ...prev, name: '', price: '' }))
        
        // 사용자에게 친화적인 오류 메시지 표시 (선택적)
        // alert(`종목 조회 중 오류가 발생했습니다: ${error.message}`)
        
      } finally {
        setSearchingStock(false)
      }
    } else {
      // 길이가 부족한 경우 필드 초기화
      setCurrentPrice(null)
      setFormData(prev => ({ ...prev, name: '', price: '' }))
    }
  }

  // 매매 구분 변경 시 처리
  const handleTypeChange = (newType: 'buy' | 'sell' | 'existing') => {
    setFormData(prev => {
      let newPrice = prev.price
      
      // 매매 구분이 바뀔 때 가격 처리
      if (newType !== 'existing' && currentPrice && (!prev.price || prev.price === '')) {
        // 매수/매도로 변경하고 현재가가 있으면 현재가를 입력
        newPrice = currentPrice.toString()
      } else if (newType === 'existing' && currentPrice && prev.price === currentPrice.toString()) {
        // 기존 보유로 변경하고 현재 입력값이 현재가와 같으면 초기화
        newPrice = ''
      }
      
      return { ...prev, type: newType, price: newPrice }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const accountName = formData.account === '기타' ? customAccount : formData.account
    const existingStock = stocks.find(s => s.symbol === formData.symbol)
    const quantity = Number(formData.quantity)
    const price = Number(formData.price)
    const fee = Number(formData.fee || 0)
    
    if (existingStock) {
      // 기존 주식 업데이트
      let newQuantity = existingStock.quantity
      let newAveragePrice = existingStock.averagePrice
      
      if (formData.type === 'buy') {
        const totalCost = (existingStock.quantity * existingStock.averagePrice) + (quantity * price)
        newQuantity = existingStock.quantity + quantity
        newAveragePrice = totalCost / newQuantity
      } else if (formData.type === 'sell') {
        newQuantity = Math.max(0, existingStock.quantity - quantity)
      } else if (formData.type === 'existing') {
        // 기존 보유 추가: 평균단가 재계산
        const totalCost = (existingStock.quantity * existingStock.averagePrice) + (quantity * price)
        newQuantity = existingStock.quantity + quantity
        newAveragePrice = totalCost / newQuantity
      }
      
      updateStock(existingStock.id, {
        quantity: newQuantity,
        averagePrice: newAveragePrice,
        currentPrice: currentPrice || price, // 현재가 우선, 없으면 입력가
        marketValue: newQuantity * (currentPrice || price),
        unrealizedPnL: ((currentPrice || price) - newAveragePrice) * newQuantity
      })
    } else {
      // 새 주식 추가
      const actualCurrentPrice = currentPrice || price
      const actualQuantity = formData.type === 'sell' ? 0 : quantity
      
      const newStock: Stock = {
        id: generateId(),
        symbol: formData.symbol,
        name: formData.name,
        quantity: actualQuantity,
        averagePrice: price,
        currentPrice: actualCurrentPrice,
        marketValue: actualQuantity * actualCurrentPrice,
        unrealizedPnL: actualQuantity > 0 ? (actualCurrentPrice - price) * actualQuantity : 0,
        dailyChange: 0,
        dailyChangePercent: 0,
        weight: 0, // 나중에 전체 포트폴리오에서 계산
        sector: formData.sector,
        exchange: formData.exchange,
        currency: ['KRX', 'BITHUMB'].includes(formData.exchange) ? 'KRW' : 'USD'
      }
      
      addStock(newStock)
    }

    // 거래 기록 추가 (매수/매도의 경우에만)
    if (formData.type === 'buy' || formData.type === 'sell') {
      const stockId = existingStock?.id || generateId()
      const transaction: StockTransaction = {
        id: generateId(),
        stockId: stockId,
        date: new Date().toISOString().split('T')[0],
        type: formData.type as 'buy' | 'sell',
        quantity: quantity,
        price: price,
        amount: quantity * price,
        fee: fee,
        tax: 0, // 세금 계산 로직 필요시 추가
        account: accountName,
        memo: formData.memo
      }
      addStockTransaction(transaction)
    }

    setOpen(false)
    setCurrentPrice(null)
    setCustomAccount('')
    setFormData({
      type: 'buy',
      symbol: '',
      name: '',
      quantity: '',
      price: '',
      fee: '',
      exchange: 'KRX',
      sector: '',
      memo: '',
      account: ''
    })
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
          <DialogDescription>
            종목 코드를 입력하면 자동으로 종목명과 현재가가 조회됩니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="tradeType" className="text-sm font-medium">매매 구분</label>
            <select
              id="tradeType"
              name="tradeType"
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value as any)}
              className="w-full mt-1 px-3 py-2 border rounded-md"
              required
            >
              <option value="buy">매수</option>
              <option value="sell">매도</option>
              <option value="existing">기존 보유</option>
            </select>
          </div>

          <div>
            <label htmlFor="stockAccount" className="text-sm font-medium">거래 계좌</label>
            <select
              id="stockAccount"
              name="stockAccount"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="symbol" className="text-sm font-medium">종목 코드</label>
              <div className="relative">
                <Input
                  id="symbol"
                  name="symbol"
                  value={formData.symbol}
                  onChange={(e) => handleSymbolChange(e.target.value)}
                  placeholder="예: 005930, AAPL"
                  required
                />
                {searchingStock && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Search className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              {formData.symbol.length >= 3 && !formData.name && !searchingStock && (
                <p className="text-xs text-muted-foreground mt-1">
                  종목을 찾을 수 없습니다. 코드를 확인해주세요.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="exchange" className="text-sm font-medium">거래소</label>
              <select
                id="exchange"
                name="exchange"
                value={formData.exchange}
                onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
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
            <label htmlFor="stockName" className="text-sm font-medium">종목명</label>
            <Input
              id="stockName"
              name="stockName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={formData.symbol ? "자동 조회됩니다..." : "종목명을 입력하세요"}
              required
              className={formData.name && formData.symbol ? "bg-green-50 border-green-200" : ""}
            />
            {formData.name && formData.symbol && (
              <p className="text-xs text-green-600 mt-1">
                ✓ 종목이 자동으로 조회되었습니다
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="text-sm font-medium">수량</label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="주 (소수점 가능)"
                min="0"
                step="0.00000001"
                required
              />
            </div>

            <div>
              <label htmlFor="stockPrice" className="text-sm font-medium">
                {formData.type === 'existing' ? '평균 매수단가' : '단가'}
              </label>
              <div className="relative">
                <Input
                  id="stockPrice"
                  name="stockPrice"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder={
                    formData.type === 'existing' 
                      ? `실제 매수한 ${['KRX', 'BITHUMB'].includes(formData.exchange) ? '원' : '달러'}` 
                      : ['KRX', 'BITHUMB'].includes(formData.exchange) ? '원' : '달러'
                  }
                  min="0"
                  step="0.01"
                  required
                  className={
                    formData.type === 'existing' 
                      ? "bg-yellow-50 border-yellow-200" 
                      : formData.price && formData.symbol && formData.name ? "bg-blue-50 border-blue-200" : ""
                  }
                />
              </div>
              
              {/* 현재가 정보 표시 */}
              {currentPrice && formData.symbol && formData.name && (
                <div className="text-xs mt-1 space-y-1">
                  <p className="text-gray-600">
                    📊 현재가: {currentPrice.toLocaleString()}{['KRX', 'BITHUMB'].includes(formData.exchange) ? '원' : '달러'}
                  </p>
                  
                  {formData.type === 'existing' && formData.price && (
                    <p className={`font-medium ${
                      Number(formData.price) < currentPrice ? 'text-green-600' : 
                      Number(formData.price) > currentPrice ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {Number(formData.price) < currentPrice && '📈 수익 '}
                      {Number(formData.price) > currentPrice && '📉 손실 '}
                      {Number(formData.price) === currentPrice && '➖ 동일 '}
                      {Math.abs(((currentPrice - Number(formData.price)) / Number(formData.price)) * 100).toFixed(2)}%
                    </p>
                  )}
                  
                  {formData.type !== 'existing' && (
                    <p className="text-blue-600">
                      💡 {formData.type === 'buy' ? '매수' : '매도'}가로 현재가 사용됨
                    </p>
                  )}
                </div>
              )}
              
              {formData.type === 'existing' && !currentPrice && (
                <p className="text-xs text-yellow-600 mt-1">
                  ⚠️ 실제로 매수한 평균단가를 입력하세요
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="fee" className="text-sm font-medium">수수료 (선택)</label>
              <Input
                id="fee"
                name="fee"
                type="number"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label htmlFor="sector" className="text-sm font-medium">섹터 (선택)</label>
              <select
                id="sector"
                name="sector"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
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
            <label htmlFor="tradeMemo" className="text-sm font-medium">메모 (선택)</label>
            <Input
              id="tradeMemo"
              name="tradeMemo"
              value={formData.memo}
              onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
              placeholder="거래 메모를 입력하세요"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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