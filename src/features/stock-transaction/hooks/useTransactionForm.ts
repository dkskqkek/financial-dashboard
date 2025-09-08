import { useState } from 'react'
import { useAppStore } from '@/stores'
import { generateId } from '@/lib/utils'
import type { Stock, StockTransaction } from '@/types'
import type { StockTransactionFormData } from '../types'
import { calculateTransactionUpdate } from '../utils/calculations'

const initialFormData: StockTransactionFormData = {
  type: 'buy',
  symbol: '',
  name: '',
  quantity: '',
  price: '',
  fee: '',
  exchange: 'KRX',
  sector: '',
  memo: '',
  account: '',
}

export function useTransactionForm() {
  const { stocks, addStock, addStockTransaction, updateStock } = useAppStore()
  const [formData, setFormData] = useState<StockTransactionFormData>(initialFormData)
  const [customAccount, setCustomAccount] = useState('')

  const updateFormData = (updates: Partial<StockTransactionFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleTypeChange = (newType: 'buy' | 'sell' | 'existing', currentPrice?: number) => {
    let newPrice = formData.price

    // 매매 구분이 바뀔 때 가격 처리
    if (newType !== 'existing' && currentPrice && (!formData.price || formData.price === '')) {
      // 매수/매도로 변경하고 현재가가 있으면 현재가를 입력
      newPrice = currentPrice.toString()
    } else if (newType === 'existing' && currentPrice && formData.price === currentPrice.toString()) {
      // 기존 보유로 변경하고 현재 입력값이 현재가와 같으면 초기화
      newPrice = ''
    }

    setFormData(prev => ({ ...prev, type: newType, price: newPrice }))
  }

  const submitTransaction = (currentPrice?: number) => {
    const accountName = formData.account === '기타' ? customAccount : formData.account
    const existingStock = stocks.find(s => s.symbol === formData.symbol)
    const quantity = Number(formData.quantity)
    const price = Number(formData.price)
    const fee = Number(formData.fee || 0)

    const calculation = calculateTransactionUpdate(existingStock, formData.type, quantity, price, currentPrice)

    if (existingStock) {
      // 기존 주식 업데이트
      updateStock(existingStock.id, {
        quantity: calculation.newQuantity,
        averagePrice: calculation.newAveragePrice,
        currentPrice: currentPrice || price,
        marketValue: calculation.marketValue,
        unrealizedPnL: calculation.unrealizedPnL,
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
        weight: 0,
        sector: formData.sector,
        exchange: formData.exchange,
        currency: ['KRX', 'BITHUMB'].includes(formData.exchange) ? 'KRW' : 'USD',
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
        tax: 0,
        account: accountName,
        memo: formData.memo,
      }
      addStockTransaction(transaction)
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setCustomAccount('')
  }

  return {
    formData,
    customAccount,
    updateFormData,
    setCustomAccount,
    handleTypeChange,
    submitTransaction,
    resetForm,
  }
}
