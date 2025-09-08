import type {
  AssetSummary,
  AssetAllocation,
  CashAccount,
  Transaction,
  Stock,
  MarketData,
  ChartDataPoint,
} from '@/types'

export class MockDataGenerators {
  generateAssetSummary(): AssetSummary {
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

  generateAssetAllocation(): AssetAllocation {
    return {
      cash: 15.2,
      stocks: 61.2,
      bonds: 12.1,
      gold: 2.0,
      crypto: 1.5,
      realEstate: 8.5,
      debt: 3.0,
      domesticStocks: 35.8,
      foreignStocks: 25.4,
    }
  }

  generateCashAccounts(): CashAccount[] {
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

  generateTransactions(): Transaction[] {
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

  generateStocks(): Stock[] {
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

  generateMarketData(): MarketData {
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

  generateChartData(timeRange: string): ChartDataPoint[] {
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

  generateRealtimeMarketData(): MarketData {
    const now = new Date()
    const randomFactor = Math.sin(now.getTime() / 100000)

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

export const mockDataGenerators = new MockDataGenerators()
