import { StateCreator } from 'zustand'
import type { AssetSummary, AssetAllocation, CashAccount, Savings, RealEstate } from '@/types'
import type { ExchangeRate } from '@/services/exchangeRateService'

export interface AssetsSlice {
  // Assets
  assetSummary: AssetSummary | null
  assetAllocation: AssetAllocation | null
  setAssetSummary: (summary: AssetSummary) => void
  setAssetAllocation: (allocation: AssetAllocation) => void

  // Cash Accounts
  cashAccounts: CashAccount[]
  setCashAccounts: (accounts: CashAccount[]) => void
  addCashAccount: (account: CashAccount) => void
  updateCashAccount: (id: string, updates: Partial<CashAccount>) => void
  deleteCashAccount: (id: string) => void

  // Savings
  savings: Savings[]
  setSavings: (savings: Savings[]) => void
  addSavings: (saving: Savings) => void
  updateSavings: (id: string, updates: Partial<Savings>) => void
  deleteSavings: (id: string) => void

  // Real Estate
  realEstate: RealEstate[]
  setRealEstate: (properties: RealEstate[]) => void
  addRealEstate: (property: RealEstate) => void
  updateRealEstate: (id: string, updates: Partial<RealEstate>) => void
  deleteRealEstate: (id: string) => void

  // Exchange Rate
  exchangeRate: ExchangeRate | null
  setExchangeRate: (rate: ExchangeRate) => void
  updateExchangeRate: () => Promise<void>

  // Currency Conversion Helpers
  convertToKrwTotal: (accounts: CashAccount[]) => Promise<number>
}

export const createAssetsSlice: StateCreator<AssetsSlice, [], [], AssetsSlice> = (set, get) => ({
  // Assets
  assetSummary: null,
  assetAllocation: null,
  setAssetSummary: summary => set({ assetSummary: summary }),
  setAssetAllocation: allocation => set({ assetAllocation: allocation }),

  // Cash Accounts
  cashAccounts: [],
  setCashAccounts: accounts => set({ cashAccounts: accounts }),
  addCashAccount: account =>
    set(state => ({
      cashAccounts: [...state.cashAccounts, account],
    })),
  updateCashAccount: (id, updates) =>
    set(state => ({
      cashAccounts: state.cashAccounts.map(account => (account.id === id ? { ...account, ...updates } : account)),
    })),
  deleteCashAccount: id =>
    set(state => ({
      cashAccounts: state.cashAccounts.filter(account => account.id !== id),
    })),

  // Savings
  savings: [],
  setSavings: savings => set({ savings }),
  addSavings: saving =>
    set(state => ({
      savings: [...state.savings, saving],
    })),
  updateSavings: (id, updates) =>
    set(state => ({
      savings: state.savings.map(saving => (saving.id === id ? { ...saving, ...updates } : saving)),
    })),
  deleteSavings: id =>
    set(state => ({
      savings: state.savings.filter(saving => saving.id !== id),
    })),

  // Real Estate
  realEstate: [],
  setRealEstate: realEstate => set({ realEstate }),
  addRealEstate: property =>
    set(state => ({
      realEstate: [...state.realEstate, property],
    })),
  updateRealEstate: (id, updates) =>
    set(state => ({
      realEstate: state.realEstate.map(property => (property.id === id ? { ...property, ...updates } : property)),
    })),
  deleteRealEstate: id =>
    set(state => ({
      realEstate: state.realEstate.filter(property => property.id !== id),
    })),

  // Exchange Rate
  exchangeRate: null,
  setExchangeRate: rate => set({ exchangeRate: rate }),
  updateExchangeRate: async () => {
    try {
      const { exchangeRateService } = await import('@/services/exchangeRateService')
      // 캐시를 강제로 새로고침하여 최신 환율 가져오기
      const rate = await exchangeRateService.refreshCache()
      console.log('💰 환율 스토어 업데이트:', rate)
      set({
        exchangeRate: {
          USD_KRW: rate,
          lastUpdated: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.error('환율 업데이트 실패:', error)
    }
  },

  // Currency Conversion Helpers
  convertToKrwTotal: async (accounts: CashAccount[]): Promise<number> => {
    const { exchangeRateService } = await import('@/services/exchangeRateService')
    let total = 0
    for (const account of accounts) {
      if (account.currency === 'KRW') {
        total += account.balance
      } else if (account.currency === 'USD') {
        const converted = await exchangeRateService.convertUsdToKrw(account.balance)
        total += converted
      } else {
        total += account.balance // 기타 통화는 그대로 합산 (필요시 확장 가능)
      }
    }
    return total
  },
})
