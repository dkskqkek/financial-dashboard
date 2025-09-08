import type { ApiResponse, StockInfo } from './types'

export class ExternalApisService {
  // Alpha Vantage API (무료 5회/분)
  async searchAlphaVantage(symbol: string): Promise<ApiResponse> {
    const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY || 'demo'

    try {
      // 먼저 심볼 검색으로 정확한 종목명 확인
      const searchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${symbol}&apikey=${API_KEY}`

      const response = await fetch(searchUrl)
      const data = await response.json()

      if (data['bestMatches'] && data['bestMatches'].length > 0) {
        const match = data['bestMatches'][0]
        const stockInfo: StockInfo = {
          symbol: match['1. symbol'],
          name: match['2. name'],
          currency: match['8. currency'] === 'KRW' ? 'KRW' : 'USD',
          exchange: match['4. type'].includes('KRX') ? 'KRX' : 'NYSE',
        }

        // 현재가 조회
        const priceUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockInfo.symbol}&apikey=${API_KEY}`
        const priceResponse = await fetch(priceUrl)
        const priceData = await priceResponse.json()

        if (priceData['Global Quote']) {
          const quote = priceData['Global Quote']
          stockInfo.currentPrice = parseFloat(quote['05. price'])
          stockInfo.change = parseFloat(quote['09. change'])
          stockInfo.changePercent = parseFloat(quote['10. change percent'].replace('%', ''))
        }

        return { success: true, data: stockInfo, source: 'Alpha Vantage' }
      }
    } catch (error) {
      console.warn('Alpha Vantage API failed:', error)
    }

    return { success: false, error: 'Alpha Vantage API failed' }
  }

  // Polygon.io API (무료 5회/분)
  async searchPolygon(symbol: string): Promise<ApiResponse> {
    const API_KEY = import.meta.env.VITE_POLYGON_KEY || 'demo'

    try {
      // 종목 정보 조회
      const url = `https://api.polygon.io/v3/reference/tickers/${symbol.toUpperCase()}?apikey=${API_KEY}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.results) {
        const result = data.results
        const stockInfo: StockInfo = {
          symbol: result.ticker,
          name: result.name,
          currency: result.currency_name === 'United States Dollar' ? 'USD' : 'KRW',
          exchange: result.primary_exchange || 'NYSE',
          marketCap: result.market_cap,
        }

        // 최근 가격 조회
        const priceUrl = `https://api.polygon.io/v2/last/trade/${symbol.toUpperCase()}?apikey=${API_KEY}`
        const priceResponse = await fetch(priceUrl)
        const priceData = await priceResponse.json()

        if (priceData.results) {
          stockInfo.currentPrice = priceData.results.p
        }

        return { success: true, data: stockInfo, source: 'Polygon' }
      }
    } catch (error) {
      console.warn('Polygon API failed:', error)
    }

    return { success: false, error: 'Polygon API failed' }
  }

  // IEX Cloud API (무료 50,000회/월)
  async searchIEXCloud(symbol: string): Promise<ApiResponse> {
    const API_TOKEN = import.meta.env.VITE_IEX_TOKEN || 'demo'

    try {
      // 종목 정보와 가격을 한 번에 조회
      const url = `https://cloud.iexapis.com/stable/stock/${symbol.toUpperCase()}/batch?types=quote,company&token=${API_TOKEN}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.quote && data.company) {
        const quote = data.quote
        const company = data.company

        const stockInfo: StockInfo = {
          symbol: quote.symbol,
          name: company.companyName,
          currentPrice: quote.latestPrice,
          currency: 'USD',
          exchange: quote.primaryExchange,
          marketCap: quote.marketCap,
          volume: quote.latestVolume,
          change: quote.change,
          changePercent: quote.changePercent,
        }

        return { success: true, data: stockInfo, source: 'IEX Cloud' }
      }
    } catch (error) {
      console.warn('IEX Cloud API failed:', error)
    }

    return { success: false, error: 'IEX Cloud API failed' }
  }

  // Finnhub API (무료 60회/분)
  async searchFinnhub(symbol: string): Promise<ApiResponse> {
    const API_KEY = import.meta.env.VITE_FINNHUB_KEY || 'demo'

    try {
      // 종목 정보 조회
      const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol.toUpperCase()}&token=${API_KEY}`
      const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${API_KEY}`

      const [profileResponse, quoteResponse] = await Promise.all([fetch(profileUrl), fetch(quoteUrl)])

      const profile = await profileResponse.json()
      const quote = await quoteResponse.json()

      if (profile.name && quote.c) {
        const stockInfo: StockInfo = {
          symbol: symbol.toUpperCase(),
          name: profile.name,
          currentPrice: quote.c,
          currency: profile.currency || 'USD',
          exchange: profile.exchange || 'NASDAQ',
          marketCap: profile.marketCapitalization * 1000000, // 단위: 백만달러
          change: quote.d,
          changePercent: quote.dp,
        }

        return { success: true, data: stockInfo, source: 'Finnhub' }
      }
    } catch (error) {
      console.warn('Finnhub API failed:', error)
    }

    return { success: false, error: 'Finnhub API failed' }
  }
}

export const externalApisService = new ExternalApisService()
