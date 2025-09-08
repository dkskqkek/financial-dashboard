import type { Stock } from '@/types'
import type { TransactionCalculation } from '../types'

export function calculateTransactionUpdate(
  existingStock: Stock | undefined,
  transactionType: 'buy' | 'sell' | 'existing',
  quantity: number,
  price: number,
  currentPrice?: number
): TransactionCalculation {
  if (!existingStock) {
    // 새로운 주식
    const actualCurrentPrice = currentPrice || price
    const actualQuantity = transactionType === 'sell' ? 0 : quantity

    return {
      totalAmount: quantity * price,
      newQuantity: actualQuantity,
      newAveragePrice: price,
      unrealizedPnL: actualQuantity > 0 ? (actualCurrentPrice - price) * actualQuantity : 0,
      marketValue: actualQuantity * actualCurrentPrice,
    }
  }

  // 기존 주식 업데이트
  let newQuantity = existingStock.quantity
  let newAveragePrice = existingStock.averagePrice

  if (transactionType === 'buy') {
    const totalCost = existingStock.quantity * existingStock.averagePrice + quantity * price
    newQuantity = existingStock.quantity + quantity
    newAveragePrice = totalCost / newQuantity
  } else if (transactionType === 'sell') {
    newQuantity = Math.max(0, existingStock.quantity - quantity)
  } else if (transactionType === 'existing') {
    const totalCost = existingStock.quantity * existingStock.averagePrice + quantity * price
    newQuantity = existingStock.quantity + quantity
    newAveragePrice = totalCost / newQuantity
  }

  const actualCurrentPrice = currentPrice || price
  const unrealizedPnL = (actualCurrentPrice - newAveragePrice) * newQuantity
  const marketValue = newQuantity * actualCurrentPrice

  return {
    totalAmount: quantity * price,
    newQuantity,
    newAveragePrice,
    unrealizedPnL,
    marketValue,
  }
}

export function getCurrencyByExchange(exchange: string): string {
  return ['KRX', 'BITHUMB'].includes(exchange) ? 'KRW' : 'USD'
}

export function getCurrencySymbol(exchange: string): string {
  return ['KRX', 'BITHUMB'].includes(exchange) ? '원' : '달러'
}

export function calculateProfitLossPercentage(currentPrice: number, averagePrice: number): number {
  return ((currentPrice - averagePrice) / averagePrice) * 100
}
