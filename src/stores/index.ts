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
  
  // Real-time Stock Price Updates
  updateStockPrices: (stocks: Stock[]) => Promise<void>
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
        set((state) => {
          // 계좌 잔액 자동 업데이트
          const updatedCashAccounts = state.cashAccounts.map(account => {
            if (account.bankName + ' - ' + account.accountType === transaction.account ||
                account.bankName === transaction.account) {
              return {
                ...account,
                balance: account.balance + transaction.amount,
                lastTransactionDate: transaction.date
              }
            }
            return account
          })
          
          return {
            transactions: [...state.transactions, transaction],
            cashAccounts: updatedCashAccounts
          }
        }),
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
        set((state) => {
          // 기존 주식 찾기 또는 새로 추가
          let updatedStocks = [...state.stocks]
          const existingStockIndex = updatedStocks.findIndex(stock => stock.symbol === transaction.stockId)
          
          if (existingStockIndex >= 0) {
            // 기존 주식 업데이트
            const existingStock = updatedStocks[existingStockIndex]
            if (transaction.type === 'buy') {
              const totalValue = (existingStock.quantity * existingStock.averagePrice) + (transaction.quantity * transaction.price)
              const totalQuantity = existingStock.quantity + transaction.quantity
              updatedStocks[existingStockIndex] = {
                ...existingStock,
                quantity: totalQuantity,
                averagePrice: totalValue / totalQuantity,
                marketValue: totalQuantity * (existingStock.currentPrice || transaction.price),
                lastUpdated: new Date().toISOString()
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
                  lastUpdated: new Date().toISOString()
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
              lastUpdated: new Date().toISOString()
            }
            updatedStocks.push(newStock)
          }
          
          return {
            stockTransactions: [...state.stockTransactions, transaction],
            stocks: updatedStocks
          }
        }),
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

      // 실시간 주식 가격 업데이트
      updateStockPrices: async (stocks: Stock[]) => {
        set((state) => {
          const updatedStocks = [...state.stocks]
          
          stocks.forEach(updatedStock => {
            const index = updatedStocks.findIndex(s => s.symbol === updatedStock.symbol)
            if (index >= 0) {
              const currentStock = updatedStocks[index]
              updatedStocks[index] = {
                ...currentStock,
                currentPrice: updatedStock.currentPrice,
                marketValue: currentStock.quantity * updatedStock.currentPrice,
                unrealizedPnL: (currentStock.quantity * updatedStock.currentPrice) - (currentStock.quantity * currentStock.averagePrice),
                dailyChange: updatedStock.dailyChange || 0,
                dailyChangePercent: updatedStock.dailyChangePercent || 0,
                lastUpdated: new Date().toISOString()
              }
            }
          })
          
          return { stocks: updatedStocks }
        })
      },
    }),
    {
      name: 'financial-dashboard-store',
      // version: 1 제거하여 기존 데이터 보존
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
        // 계산된 값들도 캐시하여 초기 로드 성능 향상
        assetSummary: state.assetSummary,
        assetAllocation: state.assetAllocation,
      }),
    }
  )
)