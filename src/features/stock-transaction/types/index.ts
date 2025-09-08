export interface StockTransactionFormData {
  type: 'buy' | 'sell' | 'existing'
  symbol: string
  name: string
  quantity: string
  price: string
  fee: string
  exchange: string
  sector: string
  memo: string
  account: string
}

export interface StockSearchResult {
  symbol: string
  name: string
  currentPrice?: number
  currency: string
  exchange: string
}

export interface TransactionCalculation {
  totalAmount: number
  newQuantity: number
  newAveragePrice: number
  unrealizedPnL: number
  marketValue: number
}

export interface FormValidationErrors {
  symbol?: string
  name?: string
  quantity?: string
  price?: string
  account?: string
}
