export interface StockFormData {
  name: string
  quantity: string
  averagePrice: string
  sector: string
}

export interface StockKrwValue {
  stock: Stock
  krwValue: number
}

export interface SectorData {
  [sector: string]: number
}

export interface ExchangeData {
  [exchange: string]: number
}

export interface StockChartData {
  name: string
  value: number
}

export interface StockPriceUpdate {
  symbol: string
  oldPrice: number
  currentPrice: number
}

// Stock 타입은 메인 types에서 import
import type { Stock } from '@/types'
export type { Stock }