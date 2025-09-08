export { useAppStore, type AppStore } from './store'

// Re-export slice types for backward compatibility
export type { StocksSlice } from './slices/stocksSlice'
export type { AssetsSlice } from './slices/assetsSlice'
export type { TransactionsSlice } from './slices/transactionsSlice'
export type { LoansSlice } from './slices/loansSlice'
export type { UiSlice } from './slices/uiSlice'
