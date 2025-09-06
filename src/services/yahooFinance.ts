interface YahooQuote {
  symbol: string
  regularMarketPrice: number
  regularMarketChange: number
  regularMarketChangePercent: number
  currency: string
  marketState: string
}

interface YahooFinanceResponse {
  quoteResponse: {
    result: YahooQuote[]
    error: null | string
  }
}

class YahooFinanceService {
  private baseUrl = 'https://query1.finance.yahoo.com/v7/finance/quote'
  
  // CORS 우회를 위한 프록시 서버들
  private proxyUrls = [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    // 직접 접근도 시도
    ''
  ]

  async getQuotes(symbols: string[]): Promise<YahooQuote[]> {
    const symbolsParam = symbols.join(',')
    const apiUrl = `${this.baseUrl}?symbols=${symbolsParam}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,currency,marketState`
    
    // 여러 방법으로 API 접근 시도
    for (const proxy of this.proxyUrls) {
      try {
        const url = proxy ? `${proxy}${encodeURIComponent(apiUrl)}` : apiUrl
        
        const response = await fetch(url, {
          headers: proxy ? {} : {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data: YahooFinanceResponse = await response.json()
        
        if (data.quoteResponse?.error) {
          throw new Error(data.quoteResponse.error)
        }
        
        if (data.quoteResponse?.result) {
          console.log(`✅ Yahoo Finance API 성공: ${proxy ? 'proxy' : 'direct'}`)
          return data.quoteResponse.result
        }
        
      } catch (error) {
        console.warn(`Yahoo Finance API 실패 (${proxy || 'direct'}):`, error)
        continue
      }
    }
    
    // 모든 방법 실패시 빈 배열 반환
    console.error('모든 Yahoo Finance API 접근 방법 실패')
    return []
  }

  async getKoreanStockQuotes(symbols: string[]): Promise<YahooQuote[]> {
    // 한국 주식 심볼에 .KS 추가
    const koreanSymbols = symbols.map(symbol => 
      symbol.includes('.') ? symbol : `${symbol}.KS`
    )
    return this.getQuotes(koreanSymbols)
  }

  async getUSStockQuotes(symbols: string[]): Promise<YahooQuote[]> {
    // 미국 주식은 그대로 사용
    return this.getQuotes(symbols)
  }

  async getMarketIndices(): Promise<{
    kospi: YahooQuote | null
    sp500: YahooQuote | null
    usdKrw: YahooQuote | null
  }> {
    try {
      const quotes = await this.getQuotes(['^KS11', '^GSPC', 'KRW=X'])
      
      return {
        kospi: quotes.find(q => q.symbol === '^KS11') || null,
        sp500: quotes.find(q => q.symbol === '^GSPC') || null,
        usdKrw: quotes.find(q => q.symbol === 'KRW=X') || null
      }
    } catch (error) {
      console.error('Failed to fetch market indices:', error)
      return { kospi: null, sp500: null, usdKrw: null }
    }
  }
}

export const yahooFinanceService = new YahooFinanceService()
export type { YahooQuote }