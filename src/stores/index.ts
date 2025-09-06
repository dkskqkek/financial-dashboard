import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { exchangeRateService } from '@/services/exchangeRateService'
import type { 
  User, 
  AssetSummary, 
  AssetAllocation, 
  CashAccount, 
  Transaction, 
  Stock, 
  StockTransaction,
  Dividend,
  Savings,
  RealEstate,
  Loan,
  LoanPayment,
  MarketData,
  TimeRange
} from '@/types'
import type { ExchangeRate } from '@/services/exchangeRateService'

interface AppStore {
  // User
  user: User | null
  setUser: (user: User | null) => void
  
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
  
  // Transactions
  transactions: Transaction[]
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  
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
  
  // Loans
  loans: Loan[]
  loanPayments: LoanPayment[]
  setLoans: (loans: Loan[]) => void
  setLoanPayments: (payments: LoanPayment[]) => void
  addLoan: (loan: Loan) => void
  addLoanPayment: (payment: LoanPayment) => void
  updateLoan: (id: string, updates: Partial<Loan>) => void
  updateLoanPayment: (id: string, updates: Partial<LoanPayment>) => void
  deleteLoan: (id: string) => void
  deleteLoanPayment: (id: string) => void
  
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
  
  // Exchange Rate
  exchangeRate: ExchangeRate | null
  setExchangeRate: (rate: ExchangeRate) => void
  updateExchangeRate: () => Promise<void>
  
  // Currency Conversion Helpers
  convertToKrwTotal: (accounts: CashAccount[]) => Promise<number>
  convertStockValueToKrw: (stock: Stock) => Promise<number>
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),
      
      // Assets
      assetSummary: null,
      assetAllocation: null,
      setAssetSummary: (summary) => set({ assetSummary: summary }),
      setAssetAllocation: (allocation) => set({ assetAllocation: allocation }),
      
      // Cash Accounts
      cashAccounts: [],
      setCashAccounts: (accounts) => set({ cashAccounts: accounts }),
      addCashAccount: (account) => 
        set((state) => ({ 
          cashAccounts: [...state.cashAccounts, account] 
        })),
      updateCashAccount: (id, updates) =>
        set((state) => ({
          cashAccounts: state.cashAccounts.map(account =>
            account.id === id ? { ...account, ...updates } : account
          )
        })),
      deleteCashAccount: (id) =>
        set((state) => ({
          cashAccounts: state.cashAccounts.filter(account => account.id !== id)
        })),
      
      // Transactions
      transactions: [],
      setTransactions: (transactions) => set({ transactions }),
      addTransaction: (transaction) =>
        set((state) => ({ 
          transactions: [...state.transactions, transaction] 
        })),
      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map(transaction =>
            transaction.id === id ? { ...transaction, ...updates } : transaction
          )
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter(transaction => transaction.id !== id)
        })),
      
      // Stocks
      stocks: [],
      stockTransactions: [],
      dividends: [],
      setStocks: (stocks) => set({ stocks }),
      setStockTransactions: (stockTransactions) => set({ stockTransactions }),
      setDividends: (dividends) => set({ dividends }),
      addStock: (stock) =>
        set((state) => ({ 
          stocks: [...state.stocks, stock] 
        })),
      addStockTransaction: (transaction) =>
        set((state) => ({
          stockTransactions: [...state.stockTransactions, transaction]
        })),
      updateStock: (id, updates) =>
        set((state) => ({
          stocks: state.stocks.map(stock =>
            stock.id === id ? { ...stock, ...updates } : stock
          )
        })),
      deleteStock: (id) =>
        set((state) => ({
          stocks: state.stocks.filter(stock => stock.id !== id)
        })),
      
      // Savings
      savings: [],
      setSavings: (savings) => set({ savings }),
      addSavings: (saving) =>
        set((state) => ({ 
          savings: [...state.savings, saving] 
        })),
      updateSavings: (id, updates) =>
        set((state) => ({
          savings: state.savings.map(saving =>
            saving.id === id ? { ...saving, ...updates } : saving
          )
        })),
      deleteSavings: (id) =>
        set((state) => ({
          savings: state.savings.filter(saving => saving.id !== id)
        })),
      
      // Real Estate
      realEstate: [],
      setRealEstate: (realEstate) => set({ realEstate }),
      addRealEstate: (property) =>
        set((state) => ({ 
          realEstate: [...state.realEstate, property] 
        })),
      updateRealEstate: (id, updates) =>
        set((state) => ({
          realEstate: state.realEstate.map(property =>
            property.id === id ? { ...property, ...updates } : property
          )
        })),
      deleteRealEstate: (id) =>
        set((state) => ({
          realEstate: state.realEstate.filter(property => property.id !== id)
        })),
      
      // Loans
      loans: [],
      loanPayments: [],
      setLoans: (loans) => set({ loans }),
      setLoanPayments: (loanPayments) => set({ loanPayments }),
      addLoan: (loan) =>
        set((state) => ({ 
          loans: [...state.loans, loan] 
        })),
      addLoanPayment: (payment) =>
        set((state) => ({ 
          loanPayments: [...state.loanPayments, payment] 
        })),
      updateLoan: (id, updates) =>
        set((state) => ({
          loans: state.loans.map(loan =>
            loan.id === id ? { ...loan, ...updates } : loan
          )
        })),
      updateLoanPayment: (id, updates) =>
        set((state) => ({
          loanPayments: state.loanPayments.map(payment =>
            payment.id === id ? { ...payment, ...updates } : payment
          )
        })),
      deleteLoan: (id) =>
        set((state) => ({
          loans: state.loans.filter(loan => loan.id !== id)
        })),
      deleteLoanPayment: (id) =>
        set((state) => ({
          loanPayments: state.loanPayments.filter(payment => payment.id !== id)
        })),
      
      // Market Data
      marketData: null,
      setMarketData: (marketData) => set({ marketData }),
      
      // UI State
      selectedTimeRange: '1Y',
      setSelectedTimeRange: (range) => set({ selectedTimeRange: range }),
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      // Loading states
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      // Financial Data
      financialData: null,
      setFinancialData: (data) => set({ financialData: data }),
      
      // Exchange Rate
      exchangeRate: null,
      setExchangeRate: (rate) => set({ exchangeRate: rate }),
      updateExchangeRate: async () => {
        try {
          // 캐시를 강제로 새로고침하여 최신 환율 가져오기
          const rate = await exchangeRateService.refreshCache()
          console.log('💰 환율 스토어 업데이트:', rate)
          set({ 
            exchangeRate: {
              USD_KRW: rate,
              lastUpdated: new Date().toISOString()
            }
          })
        } catch (error) {
          console.error('환율 업데이트 실패:', error)
        }
      },
      
      // Currency Conversion Helpers
      convertToKrwTotal: async (accounts: CashAccount[]): Promise<number> => {
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
      
      convertStockValueToKrw: async (stock: Stock): Promise<number> => {
        if (stock.currency === 'KRW') {
          return stock.marketValue
        } else if (stock.currency === 'USD') {
          return await exchangeRateService.convertUsdToKrw(stock.marketValue)
        }
        return stock.marketValue
      },
    }),
    {
      name: 'financial-dashboard-store',
      partialize: (state) => ({
        user: state.user,
        stocks: state.stocks,
        stockTransactions: state.stockTransactions,
        dividends: state.dividends,
        cashAccounts: state.cashAccounts,
        transactions: state.transactions,
        savings: state.savings,
        realEstate: state.realEstate,
        loans: state.loans,
        loanPayments: state.loanPayments,
        isDarkMode: state.isDarkMode,
        selectedTimeRange: state.selectedTimeRange,
        sidebarOpen: state.sidebarOpen,
        financialData: state.financialData,
        exchangeRate: state.exchangeRate,
      }),
    }
  )
)