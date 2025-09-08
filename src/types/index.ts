export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  preferences: UserPreferences
}

export interface UserPreferences {
  currency: string
  language: string
  dateFormat: string
  numberFormat: string
  theme: 'light' | 'dark'
  notifications: boolean
}

export interface AssetSummary {
  totalAssets: number
  netWorth: number
  monthlyChange: {
    amount: number
    percentage: number
  }
  ytdReturn: number
  goalAchievement: number
}

export interface AssetAllocation {
  cash: number
  stocks: number
  bonds: number
  gold: number
  crypto: number
  realEstate: number
  debt?: number  // 선택적 속성으로 변경 (차트에서 별도 표시)
  // Optional properties for detailed stock allocation
  domesticStocks?: number
  foreignStocks?: number
}

export interface CashAccount {
  id: string
  bankName: string
  accountType: string
  accountNumber: string
  currency: string
  balance: number
  lastTransactionDate: string
  memo?: string
}

export interface Transaction {
  id: string
  date: string
  type: 'income' | 'expense' | 'transfer'
  account: string
  description: string
  amount: number
  balance: number
  category: string
  memo?: string
  fee?: number // 수수료 (PRD 요구사항)
  reference?: string // 참조번호 (PRD 요구사항)
  createdAt?: string // 생성 시간 추적
  updatedAt?: string // 수정 시간 추적
}

export interface Stock {
  id: string
  symbol: string
  name: string
  quantity: number
  averagePrice: number
  currentPrice: number
  marketValue: number
  unrealizedPnL: number
  dailyChange: number
  dailyChangePercent: number
  weight: number
  sector: string
  exchange: string
  currency: string
  lastUpdated?: string
}

export interface StockTransaction {
  id: string
  stockId: string
  date: string
  type: 'buy' | 'sell'
  quantity: number
  price: number
  amount: number
  fee: number
  tax: number
  account: string
  memo?: string
}

export interface Dividend {
  id: string
  stockId: string
  exDate: string
  payDate: string
  amount: number
  currency: string
  status: 'scheduled' | 'paid'
}

export interface Savings {
  id: string
  bankName: string
  productName: string
  principal: number
  interestRate: number
  maturityDate: string
  currentValue: number
  type: 'savings' | 'deposit' | 'cma'
}

export interface RealEstate {
  id: string
  type: 'apartment' | 'house' | 'commercial' | 'land'
  location: string
  purchaseDate: string
  purchasePrice: number
  currentValue: number
  monthlyIncome?: number
  expenses?: number
}

export interface Loan {
  id: string
  lender: string
  type: string
  originalAmount: number
  currentBalance: number
  interestRate: number
  monthlyPayment: number
  maturityDate: string
  purpose: string
}

export interface LoanPayment {
  id: string
  loanId: string
  date: string
  totalAmount: number
  principalAmount: number
  interestAmount: number
  remainingBalance: number
  memo?: string
}

export interface MonthlyReport {
  month: string
  totalIncome: number
  totalExpense: number
  netChange: number
  assetGrowth: number
  majorEvents: string[]
}

export interface MarketData {
  kospi: {
    value: number
    change: number
    changePercent: number
    isRealTime?: boolean
    marketTime?: string | null
    previousClose?: number
  }
  sp500: {
    value: number
    change: number
    changePercent: number
    isRealTime?: boolean
    marketTime?: string | null
    previousClose?: number
  }
  usdKrw: {
    value: number
    change: number
    changePercent: number
    isRealTime?: boolean
    marketTime?: string | null
    previousClose?: number
  }
}

export interface ChartDataPoint {
  date: string
  totalAssets: number
  netWorth: number
  target?: number
  income?: number
  expense?: number
}

export interface PortfolioRebalancing {
  current: AssetAllocation
  target: AssetAllocation
  recommendations: RebalanceRecommendation[]
}

export interface RebalanceRecommendation {
  assetType: string
  currentWeight: number
  targetWeight: number
  requiredAmount: number
  action: 'buy' | 'sell'
}

export type TimeRange = '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'ALL'

export type SortDirection = 'asc' | 'desc'

export interface TableColumn<T> {
  key: keyof T
  header: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}