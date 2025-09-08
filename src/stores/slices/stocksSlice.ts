import { StateCreator } from 'zustand'
import type { Stock, StockTransaction, Dividend } from '@/types'

export interface StocksSlice {
  // Stocks
  stocks: Stock[]
  stockTransactions: StockTransaction[]
  dividends: Dividend[]
  setStocks: (stocks: Stock[]) => void
  setStockTransactions: (transactions: StockTransaction[]) => void
  setDividends: (dividends: Dividend[]) => void
  addStock: (stock: Stock) => void
  addStockTransaction: (transaction: StockTransaction) => void
  updateStock: (id: string, updates: Partial<Stock>) => void
  deleteStock: (id: string) => void

  // Real-time Stock Price Updates
  updateStockPrices: (stocks: Stock[]) => void

  // Currency Conversion Helper
  convertStockValueToKrw: (stock: Stock) => Promise<number>
}

export const createStocksSlice: StateCreator<StocksSlice & { exchangeRate: any }, [], [], StocksSlice> = (
  set,
  get
) => ({
  // Stocks
  stocks: [],
  stockTransactions: [],
  dividends: [],
  setStocks: stocks => set({ stocks }),
  setStockTransactions: stockTransactions => set({ stockTransactions }),
  setDividends: dividends => set({ dividends }),
  addStock: stock =>
    set(state => ({
      stocks: [...state.stocks, stock],
    })),
  addStockTransaction: transaction =>
    set(state => {
      // 기존 주식 찾기 또는 새로 추가
      const updatedStocks = [...state.stocks]
      const existingStockIndex = updatedStocks.findIndex(stock => stock.symbol === transaction.stockId)

      if (existingStockIndex >= 0) {
        // 기존 주식 업데이트
        const existingStock = updatedStocks[existingStockIndex]
        if (transaction.type === 'buy') {
          const totalValue =
            existingStock.quantity * existingStock.averagePrice + transaction.quantity * transaction.price
          const totalQuantity = existingStock.quantity + transaction.quantity
          updatedStocks[existingStockIndex] = {
            ...existingStock,
            quantity: totalQuantity,
            averagePrice: totalValue / totalQuantity,
            marketValue: totalQuantity * (existingStock.currentPrice || transaction.price),
            lastUpdated: new Date().toISOString(),
          }
        } else if (transaction.type === 'sell') {
          const newQuantity = existingStock.quantity - transaction.quantity
          if (newQuantity <= 0) {
            // 모든 주식 매도 시 제거
            updatedStocks.splice(existingStockIndex, 1)
          } else {
            updatedStocks[existingStockIndex] = {
              ...existingStock,
              quantity: newQuantity,
              marketValue: newQuantity * (existingStock.currentPrice || transaction.price),
              lastUpdated: new Date().toISOString(),
            }
          }
        }
      } else if (transaction.type === 'buy') {
        // 새로운 주식 추가 (매수인 경우만)
        const newStock = {
          id: `stock-${Date.now()}`,
          symbol: transaction.stockId,
          name: transaction.stockId, // API에서 나중에 업데이트
          quantity: transaction.quantity,
          averagePrice: transaction.price,
          currentPrice: transaction.price,
          marketValue: transaction.quantity * transaction.price,
          unrealizedPnL: 0,
          dailyChange: 0,
          dailyChangePercent: 0,
          weight: 0, // 나중에 계산
          sector: '미분류',
          exchange: transaction.stockId.match(/^\d{6}$/) ? 'KRX' : 'NASDAQ',
          currency: transaction.stockId.match(/^\d{6}$/) ? 'KRW' : 'USD',
          lastUpdated: new Date().toISOString(),
        }
        updatedStocks.push(newStock)
      }

      return {
        stockTransactions: [...state.stockTransactions, transaction],
        stocks: updatedStocks,
      }
    }),
  updateStock: (id, updates) =>
    set(state => ({
      stocks: state.stocks.map(stock => (stock.id === id ? { ...stock, ...updates } : stock)),
    })),
  deleteStock: id =>
    set(state => ({
      stocks: state.stocks.filter(stock => stock.id !== id),
    })),

  // 실시간 주식 가격 업데이트
  updateStockPrices: (stocks: Stock[]) => {
    set(state => {
      const updatedStocks = [...state.stocks]

      stocks.forEach(updatedStock => {
        const index = updatedStocks.findIndex(s => s.symbol === updatedStock.symbol)
        if (index >= 0) {
          const currentStock = updatedStocks[index]
          updatedStocks[index] = {
            ...currentStock,
            currentPrice: updatedStock.currentPrice,
            marketValue: currentStock.quantity * updatedStock.currentPrice,
            unrealizedPnL:
              currentStock.quantity * updatedStock.currentPrice - currentStock.quantity * currentStock.averagePrice,
            dailyChange: updatedStock.dailyChange || 0,
            dailyChangePercent: updatedStock.dailyChangePercent || 0,
            lastUpdated: new Date().toISOString(),
          }
        }
      })

      return { stocks: updatedStocks }
    })
  },

  convertStockValueToKrw: async (stock: Stock): Promise<number> => {
    const { exchangeRateService } = await import('@/services/exchangeRateService')
    if (stock.currency === 'KRW') {
      return stock.marketValue
    } else if (stock.currency === 'USD') {
      return await exchangeRateService.convertUsdToKrw(stock.marketValue)
    }
    return stock.marketValue
  },
})
