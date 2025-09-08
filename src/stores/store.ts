import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createStocksSlice, type StocksSlice } from './slices/stocksSlice'
import { createAssetsSlice, type AssetsSlice } from './slices/assetsSlice'
import { createTransactionsSlice, type TransactionsSlice } from './slices/transactionsSlice'
import { createLoansSlice, type LoansSlice } from './slices/loansSlice'
import { createUiSlice, type UiSlice } from './slices/uiSlice'

// Combined store type
export type AppStore = StocksSlice & AssetsSlice & TransactionsSlice & LoansSlice & UiSlice

export const useAppStore = create<AppStore>()(
  persist(
    (...args) => ({
      ...createStocksSlice(...args),
      ...createAssetsSlice(...args),
      ...createTransactionsSlice(...args),
      ...createLoansSlice(...args),
      ...createUiSlice(...args),
    }),
    {
      name: 'financial-dashboard-store',
      partialize: state => ({
        // User & UI
        user: state.user,
        isDarkMode: state.isDarkMode,
        selectedTimeRange: state.selectedTimeRange,
        sidebarOpen: state.sidebarOpen,
        financialData: state.financialData,

        // Assets & Exchange Rate
        exchangeRate: state.exchangeRate,
        assetSummary: state.assetSummary,
        assetAllocation: state.assetAllocation,
        cashAccounts: state.cashAccounts,
        savings: state.savings,
        realEstate: state.realEstate,

        // Stocks
        stocks: state.stocks,
        stockTransactions: state.stockTransactions,
        dividends: state.dividends,

        // Transactions
        transactions: state.transactions,

        // Loans
        loans: state.loans,
        loanPayments: state.loanPayments,
      }),
    }
  )
)
