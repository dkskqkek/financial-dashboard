import type { CashAccount, Stock, RealEstate, Loan, Savings, FinancialData } from '@/types'

interface AssetMetricsInput {
  cashAccounts: CashAccount[]
  stocks: Stock[]
  realEstate: RealEstate[]
  savings: Savings[]
  loans: Loan[]
  financialData: FinancialData | null
  convertToKrwTotal: (accounts: CashAccount[]) => Promise<number>
  convertStockValueToKrw: (stock: Stock) => Promise<number>
}

export interface AssetSummary {
  totalAssets: number
  netWorth: number
  monthlyChange: { amount: number; percentage: number }
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
  domesticStocks: number // Not directly calculated, example value
  foreignStocks: number // Not directly calculated, example value
}

export interface AssetMetrics {
  summary: AssetSummary
  allocation: AssetAllocation
}

/**
 * 모든 원시 자산 데이터를 기반으로 자산 요약 및 배분 정보를 한 번에 계산합니다.
 * @param input - 계산에 필요한 모든 자산 데이터 및 변환 함수
 * @returns 자산 요약 및 배분 정보를 포함하는 객체
 */
export const calculateAssetMetrics = async (input: AssetMetricsInput): Promise<AssetMetrics> => {
  const { cashAccounts, stocks, realEstate, savings, loans, financialData, convertToKrwTotal, convertStockValueToKrw } =
    input

  // 1. 자산 유형별 총액 계산 (단일 순회)
  const totalCash = await convertToKrwTotal(cashAccounts)
  const totalSavings = savings.reduce((sum, s) => sum + s.currentValue, 0)
  const totalRealEstate = realEstate.reduce((sum, p) => sum + p.currentValue, 0)
  const totalDebt = loans.reduce((sum, l) => sum + l.currentBalance, 0)

  let stocksTotal = 0
  let bondsTotal = 0
  let goldTotal = 0
  let cryptoTotal = 0
  let domesticStocksTotal = 0
  let foreignStocksTotal = 0

  for (const stock of stocks) {
    const stockValue = await convertStockValueToKrw(stock)

    if (
      stock.sector === '가상화폐' ||
      ['BINANCE', 'BITHUMB'].includes(stock.exchange) ||
      stock.name.toLowerCase().includes('bitcoin') ||
      stock.name.toLowerCase().includes('btc') ||
      stock.name.toLowerCase().includes('ethereum') ||
      stock.name.toLowerCase().includes('eth')
    ) {
      cryptoTotal += stockValue
    } else if (
      stock.name.includes('금') ||
      stock.name.toLowerCase().includes('gold') ||
      stock.symbol.includes('GLD') ||
      stock.sector === '원자재'
    ) {
      goldTotal += stockValue
    } else if (
      stock.sector === '채권' ||
      stock.name.includes('채권') ||
      stock.name.toLowerCase().includes('bond') ||
      stock.name.includes('회사채') ||
      stock.name.includes('국고채') ||
      stock.name.includes('TIPS') ||
      stock.name.toLowerCase().includes('treasury')
    ) {
      bondsTotal += stockValue
    } else {
      stocksTotal += stockValue
      // 국내/해외 주식 구분 (예시 로직)
      if (['KOSPI', 'KOSDAQ'].includes(stock.exchange)) {
        domesticStocksTotal += stockValue
      } else {
        foreignStocksTotal += stockValue
      }
    }
  }

  // 2. 자산 요약 (Summary) 계산
  let totalAssets = totalCash + totalSavings + totalRealEstate + stocksTotal + bondsTotal + goldTotal + cryptoTotal
  let netWorth = totalAssets - totalDebt
  const monthlyChange = { amount: 0, percentage: 0 }

  if (financialData?.summary) {
    totalAssets += financialData.summary.totalIncome || 0
    netWorth = totalAssets - (financialData.summary.totalExpense || 0) - totalDebt
  }
  if (financialData?.monthly && financialData.monthly.length >= 2) {
    const recent = financialData.monthly[financialData.monthly.length - 1]
    const previous = financialData.monthly[financialData.monthly.length - 2]
    monthlyChange.amount = recent.netIncome - previous.netIncome
    if (previous.netIncome !== 0) {
      monthlyChange.percentage = (monthlyChange.amount / Math.abs(previous.netIncome)) * 100
    }
  }

  const summary: AssetSummary = {
    totalAssets,
    netWorth,
    monthlyChange,
    ytdReturn: 0, // Placeholder
    goalAchievement: 0, // Placeholder
  }

  // 3. 자산 배분 (Allocation) 계산
  const totalPositiveAssets = totalAssets > 0 ? totalAssets : 1 // 0으로 나누기 방지

  const allocation: AssetAllocation = {
    cash: ((totalCash + totalSavings) / totalPositiveAssets) * 100,
    stocks: (stocksTotal / totalPositiveAssets) * 100,
    bonds: (bondsTotal / totalPositiveAssets) * 100,
    gold: (goldTotal / totalPositiveAssets) * 100,
    crypto: (cryptoTotal / totalPositiveAssets) * 100,
    realEstate: (totalRealEstate / totalPositiveAssets) * 100,
    domesticStocks: (domesticStocksTotal / totalPositiveAssets) * 100,
    foreignStocks: (foreignStocksTotal / totalPositiveAssets) * 100,
  }

  return { summary, allocation }
}
