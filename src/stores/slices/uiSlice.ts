import { StateCreator } from 'zustand'
import type { User, MarketData, TimeRange } from '@/types'

export interface UiSlice {
  // User
  user: User | null
  setUser: (user: User | null) => void

  // Market Data
  marketData: MarketData | null
  setMarketData: (data: MarketData) => void

  // UI State
  selectedTimeRange: TimeRange
  setSelectedTimeRange: (range: TimeRange) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  isDarkMode: boolean
  toggleDarkMode: () => void

  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  // Financial Data (from uploaded files)
  financialData: any
  setFinancialData: (data: any) => void
}

export const createUiSlice: StateCreator<UiSlice, [], [], UiSlice> = (set, get) => ({
  // User
  user: null,
  setUser: user => set({ user }),

  // Market Data
  marketData: null,
  setMarketData: marketData => set({ marketData }),

  // UI State
  selectedTimeRange: '1Y',
  setSelectedTimeRange: range => set({ selectedTimeRange: range }),
  sidebarOpen: true,
  setSidebarOpen: open => set({ sidebarOpen: open }),
  isDarkMode: false,
  toggleDarkMode: () => set(state => ({ isDarkMode: !state.isDarkMode })),

  // Loading states
  isLoading: false,
  setIsLoading: loading => set({ isLoading: loading }),

  // Financial Data
  financialData: null,
  setFinancialData: data => set({ financialData: data }),
})
