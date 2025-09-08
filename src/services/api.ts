import { getErrorMessage } from '@/lib/utils'
import { fetchWithoutCache, devCacheClear } from '@/utils/cacheUtils'
import type {
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
  MarketData,
  MonthlyReport,
  ChartDataPoint,
} from '@/types'
import { yahooFinanceService } from './yahooFinance'

class ApiService {
  private baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3007/api'
  private retryCount = 3
  private retryDelay = 1000

  constructor() {
    // 개발 모드에서 캐시 자동 관리
    devCacheClear()
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // 캐시 우회를 위한 타임스탬프 추가
    const timestamp = Date.now()
    const separator = endpoint.includes('?') ? '&' : '?'
    const endpointWithCache = `${endpoint}${separator}_t=${timestamp}&_cache=bust`
    const url = `${this.baseUrl}${endpointWithCache}`

    console.log(`🌐 API 요청 (캐시 우회): ${url}`)
    console.log('🔧 요청 옵션:', options)

    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃

        const response = await fetchWithoutCache(url, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Origin: window.location.origin,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
            'X-Requested-With': 'XMLHttpRequest',
            ...options?.headers,
          },
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-cache',
          ...options,
        })

        clearTimeout(timeoutId)
        console.log(`📊 응답 상태: ${response.status} ${response.statusText}`)

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error')
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
        }

        const contentType = response.headers.get('content-type')
        if (!contentType?.includes('application/json')) {
          throw new Error(`Expected JSON response but got ${contentType}`)
        }

        const data = await response.json()
        console.log('✅ 응답 데이터 (실시간):', data)
        return data
      } catch (error) {
        console.error(`❌ API 요청 실패 (시도 ${attempt}/${this.retryCount}):`, error)

        // 네트워크 오류이고 재시도 횟수가 남아있으면 재시도
        if (attempt < this.retryCount && this.isRetryableError(error)) {
          console.log(`🔄 ${this.retryDelay}ms 후 재시도...`)
          await this.delay(this.retryDelay)
          continue
        }

        // CORS 오류 특별 처리
        if (this.isCorsError(error)) {
          throw new Error('백엔드 서버 연결 실패: CORS 설정을 확인해주세요')
        }

        // 네트워크 오류 특별 처리
        if (this.isNetworkError(error)) {
          throw new Error('네트워크 연결 실패: 백엔드 서버가 실행 중인지 확인해주세요')
        }

        throw error
      }
    }

    throw new Error('모든 재시도 실패')
  }

  private isRetryableError(error: any): boolean {
    return (
      error.name === 'TypeError' ||
      error.message.includes('fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('Failed to fetch')
    )
  }

  private isCorsError(error: any): boolean {
    return error.message.includes('CORS') || error.message.includes('Access-Control') || error.message.includes('cors')
  }

  private isNetworkError(error: any): boolean {
    return error.name === 'TypeError' && error.message.includes('Failed to fetch')
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Mock data generators for development
  private generateMockAssetSummary(): AssetSummary {
    return {
      totalAssets: 850000000,
      netWorth: 650000000,
      monthlyChange: {
        amount: 45000000,
        percentage: 5.6,
      },
      ytdReturn: 12.8,
      goalAchievement: 78.5,
    }
  }

  private generateMockAssetAllocation(): AssetAllocation {
    return {
      cash: 15.2,
      stocks: 61.2, // domesticStocks + foreignStocks
      bonds: 12.1,
      gold: 2.0,
      crypto: 1.5,
      realEstate: 8.5,
      debt: 3.0,
      domesticStocks: 35.8,
      foreignStocks: 25.4,
    }
  }

  private generateMockCashAccounts(): CashAccount[] {
    return [
      {
        id: '1',
        bankName: '국민은행',
        accountType: '입출금통장',
        accountNumber: '123456-78-901234',
        currency: 'KRW',
        balance: 45000000,
        lastTransactionDate: '2024-01-15',
        memo: '주거래 계좌',
      },
      {
        id: '2',
        bankName: 'KB증권',
        accountType: 'CMA',
        accountNumber: '987654-32-109876',
        currency: 'KRW',
        balance: 28000000,
        lastTransactionDate: '2024-01-14',
        memo: '투자자금',
      },
      {
        id: '3',
        bankName: '신한은행',
        accountType: '외화예금',
        accountNumber: '555666-77-888999',
        currency: 'USD',
        balance: 12000,
        lastTransactionDate: '2024-01-10',
        memo: '달러 예금',
      },
    ]
  }

  private generateMockTransactions(): Transaction[] {
    const transactions = []
    const categories = ['식비', '교통비', '의료비', '쇼핑', '투자', '급여', '부업']
    const types: ('income' | 'expense' | 'transfer')[] = ['income', 'expense', 'transfer']

    for (let i = 0; i < 50; i++) {
      const date = new Date(2024, 0, Math.floor(Math.random() * 30) + 1)
      const type = types[Math.floor(Math.random() * types.length)]
      const amount =
        type === 'income' ? Math.floor(Math.random() * 5000000) + 1000000 : Math.floor(Math.random() * 500000) + 10000

      transactions.push({
        id: `tx-${i + 1}`,
        date: date.toISOString().split('T')[0],
        type,
        account: Math.random() > 0.5 ? '국민은행 주계좌' : 'KB증권 CMA',
        description: type === 'income' ? '급여' : categories[Math.floor(Math.random() * categories.length)],
        amount: type === 'expense' ? -amount : amount,
        balance: Math.floor(Math.random() * 50000000) + 10000000,
        category: categories[Math.floor(Math.random() * categories.length)],
        memo: i % 3 === 0 ? '메모 내용' : undefined,
      })
    }

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  private generateMockStocks(): Stock[] {
    const koreanStocks = [
      { symbol: '005930', name: '삼성전자' },
      { symbol: '000660', name: 'SK하이닉스' },
      { symbol: '035420', name: 'NAVER' },
      { symbol: '005380', name: '현대차' },
      { symbol: '035720', name: '카카오' },
    ]

    const usStocks = [
      { symbol: 'AAPL', name: 'Apple Inc.' },
      { symbol: 'MSFT', name: 'Microsoft Corporation' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.' },
      { symbol: 'TSLA', name: 'Tesla, Inc.' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    ]

    const allStocks = [...koreanStocks, ...usStocks]
    const sectors = ['기술', '반도체', '자동차', '인터넷', '전기차']

    return allStocks.map((stock, index) => {
      const quantity = Math.floor(Math.random() * 100) + 10
      const averagePrice = Math.floor(Math.random() * 100000) + 50000
      const currentPrice = averagePrice * (0.8 + Math.random() * 0.4)
      const marketValue = quantity * currentPrice
      const unrealizedPnL = marketValue - quantity * averagePrice
      const dailyChange = (Math.random() - 0.5) * 10000

      return {
        id: `stock-${index + 1}`,
        symbol: stock.symbol,
        name: stock.name,
        quantity,
        averagePrice,
        currentPrice,
        marketValue,
        unrealizedPnL,
        dailyChange,
        dailyChangePercent: (dailyChange / (currentPrice - dailyChange)) * 100,
        weight: Math.random() * 20 + 5,
        sector: sectors[Math.floor(Math.random() * sectors.length)],
        exchange: koreanStocks.includes(stock) ? 'KRX' : 'NASDAQ',
        currency: koreanStocks.includes(stock) ? 'KRW' : 'USD',
      }
    })
  }

  private generateMockMarketData(): MarketData {
    return {
      kospi: {
        value: 2456.78,
        change: 15.23,
        changePercent: 0.62,
      },
      sp500: {
        value: 4789.35,
        change: -12.45,
        changePercent: -0.26,
      },
      usdKrw: {
        value: 1324.5,
        change: 3.2,
        changePercent: 0.24,
      },
    }
  }

  // API Methods with mock data fallback
  async getAssetSummary(): Promise<AssetSummary> {
    try {
      return await this.request<AssetSummary>('/assets/summary')
    } catch (error) {
      console.warn('Using mock data for asset summary')
      return this.generateMockAssetSummary()
    }
  }

  async getAssetAllocation(): Promise<AssetAllocation> {
    try {
      return await this.request<AssetAllocation>('/assets/allocation')
    } catch (error) {
      console.warn('Using mock data for asset allocation')
      return this.generateMockAssetAllocation()
    }
  }

  async getCashAccounts(): Promise<CashAccount[]> {
    try {
      return await this.request<CashAccount[]>('/cash/accounts')
    } catch (error) {
      console.warn('Cash accounts API not available, returning empty array')
      return []
    }
  }

  async getTransactions(limit?: number, offset?: number): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams()
      if (limit) {
        params.append('limit', limit.toString())
      }
      if (offset) {
        params.append('offset', offset.toString())
      }

      return await this.request<Transaction[]>(`/transactions?${params.toString()}`)
    } catch (error) {
      console.warn('Transactions API not available, returning empty array')
      return []
    }
  }

  async getStocks(): Promise<Stock[]> {
    try {
      return await this.request<Stock[]>('/stocks')
    } catch (error) {
      console.warn('Stocks API not available, using local store data')
      return []
    }
  }

  async getMarketData(): Promise<MarketData> {
    try {
      // 백엔드 API 우선 시도
      return await this.request<MarketData>('/market/data')
    } catch (error) {
      console.warn('Backend API failed, using mock data for market data')
      // 실시간 느낌의 Mock 데이터 생성 (시간에 따라 변화)
      const now = new Date()
      const randomFactor = Math.sin(now.getTime() / 100000) // 시간에 따른 변화

      return {
        kospi: {
          value: 2456.78 + randomFactor * 50,
          change: 15.23 + randomFactor * 10,
          changePercent: 0.62 + randomFactor * 0.5,
        },
        sp500: {
          value: 4789.35 + randomFactor * 100,
          change: -12.45 + randomFactor * 20,
          changePercent: -0.26 + randomFactor * 0.8,
        },
        usdKrw: {
          value: 1324.5 + randomFactor * 20,
          change: 3.2 + randomFactor * 5,
          changePercent: 0.24 + randomFactor * 0.3,
        },
      }
    }
  }

  async getChartData(timeRange: string): Promise<ChartDataPoint[]> {
    try {
      return await this.request<ChartDataPoint[]>(`/analytics/chart?range=${timeRange}`)
    } catch (error) {
      console.warn('Using mock data for chart data')
      // Generate mock chart data based on time range
      const months = timeRange === '1M' ? 1 : timeRange === '3M' ? 3 : timeRange === '6M' ? 6 : 12
      const data: ChartDataPoint[] = []

      for (let i = months; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)

        data.push({
          date: date.toISOString().split('T')[0],
          totalAssets: 800000000 + Math.random() * 100000000,
          netWorth: 600000000 + Math.random() * 100000000,
          target: 750000000,
          income: Math.random() * 5000000 + 2000000,
          expense: Math.random() * 3000000 + 1000000,
        })
      }

      return data
    }
  }

  // Public methods to access mock data directly
  getMockAssetSummary(): AssetSummary {
    return this.generateMockAssetSummary()
  }

  getMockAssetAllocation(): AssetAllocation {
    return this.generateMockAssetAllocation()
  }

  getMockMarketData(): MarketData {
    return this.generateMockMarketData()
  }

  private generateMockChartData(timeRange: string): ChartDataPoint[] {
    // Generate mock chart data based on time range
    const months = timeRange === '1M' ? 1 : timeRange === '3M' ? 3 : timeRange === '6M' ? 6 : 12
    const data: ChartDataPoint[] = []

    for (let i = months; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)

      data.push({
        date: date.toISOString().split('T')[0],
        totalAssets: 800000000 + Math.random() * 100000000,
        netWorth: 600000000 + Math.random() * 100000000,
        target: 750000000,
        income: Math.random() * 5000000 + 2000000,
        expense: Math.random() * 3000000 + 1000000,
      })
    }

    return data
  }

  getMockChartData(timeRange: string): ChartDataPoint[] {
    return this.generateMockChartData(timeRange)
  }

  getMockCashAccounts(): CashAccount[] {
    return this.generateMockCashAccounts()
  }

  getMockTransactions(): Transaction[] {
    return this.generateMockTransactions()
  }

  getMockStocks(): Stock[] {
    return this.generateMockStocks()
  }

  // Stock lookup by symbol - 백엔드 API 서버 사용
  async searchStock(
    symbol: string
  ): Promise<{ symbol: string; name: string; currentPrice?: number; currency?: string; exchange?: string } | null> {
    try {
      console.log(`🔍 백엔드를 통한 주식 검색 요청: ${symbol}`)

      // 백엔드 API 서버로 요청
      const response = await this.request<{ success: boolean; data?: any; error?: string }>(`/stock/search/${symbol}`)

      if (response.success && response.data) {
        const stockInfo = response.data
        console.log(`✅ 백엔드에서 주식 조회 성공: ${stockInfo.name}`)
        return {
          symbol: stockInfo.symbol,
          name: stockInfo.name,
          currentPrice: stockInfo.currentPrice,
          currency: stockInfo.currency,
          exchange: stockInfo.exchange,
        }
      }

      console.log(`❌ 백엔드에서 ${symbol} 찾을 수 없음`)
      return null
    } catch (error) {
      console.error(`💥 백엔드 주식 검색 실패 (${symbol}):`, getErrorMessage(error))

      // 사용자에게 명확한 오류 메시지 제공
      throw new Error(`주식 조회 실패: ${getErrorMessage(error)}`)
    }
  }

  // 다중 종목 조회
  async searchMultipleStocks(symbols: string[]): Promise<any[]> {
    try {
      console.log(`📊 다중 종목 조회 요청: ${symbols.join(', ')}`)

      const response = await this.request<{ success: boolean; data: any[]; total: number }>('/stock/multiple', {
        method: 'POST',
        body: JSON.stringify({ symbols }),
      })

      if (response.success) {
        console.log(`✅ 다중 종목 조회 성공: ${response.total}개 조회됨`)
        return response.data
      }

      return []
    } catch (error) {
      console.error('💥 다중 종목 조회 실패:', getErrorMessage(error))
      throw new Error(`다중 종목 조회 실패: ${getErrorMessage(error)}`)
    }
  }

  // 검색 제안
  async getStockSuggestions(query: string): Promise<any[]> {
    try {
      if (!query || query.length < 2) {
        return []
      }

      console.log(`🔎 주식 검색 제안: ${query}`)

      const response = await this.request<{ success: boolean; data: any[] }>(
        `/stock/suggestions/${encodeURIComponent(query)}`
      )

      if (response.success) {
        console.log(`✅ 검색 제안 조회 성공: ${response.data.length}개`)
        return response.data
      }

      return []
    } catch (error) {
      console.warn('검색 제안 실패:', getErrorMessage(error))
      return []
    }
  }

  // WebSocket connection for real-time stock prices
  connectWebSocket(onMessage: (data: any) => void): WebSocket {
    const ws = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:3001/ws')

    ws.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (error) {
        console.error('WebSocket message parsing error:', error)
      }
    }

    ws.onerror = error => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
    }

    return ws
  }
}

export const apiService = new ApiService()
