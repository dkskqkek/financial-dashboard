export interface AssetFormData {
  bankName: string
  accountType: string
  accountNumber: string
  balance: string
  memo: string
}

export interface BankTotals {
  [bankName: string]: number
}

export interface TypeTotals {
  [accountType: string]: number
}

export interface AssetCalculations {
  totalBalance: number
  usdTotalInKrw: number
  bankTotals: BankTotals
  typeTotals: TypeTotals
}

// CashAccount 타입은 메인 types에서 import
import type { CashAccount } from '@/types'
export type { CashAccount }
