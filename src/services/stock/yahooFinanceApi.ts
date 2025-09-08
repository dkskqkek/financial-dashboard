import { proxyService } from './proxyService'
import type { ApiResponse, StockInfo } from './types'

export class YahooFinanceApi {
  async searchStock(symbol: string): Promise<ApiResponse> {
    try {
      // Yahoo Finance의 기본 정보 조회
      const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`
      const response = await proxyService.fetchWithProxy(quoteUrl)
      const data = await response.json()

      if (data.quoteResponse?.result && data.quoteResponse.result.length > 0) {
        const quote = data.quoteResponse.result[0]

        const stockInfo: StockInfo = {
          symbol: quote.symbol,
          name: quote.longName || quote.shortName || quote.displayName,
          currentPrice: quote.regularMarketPrice || quote.bid || quote.ask,
          currency: quote.currency || 'USD',
          exchange: quote.fullExchangeName || quote.exchange,
          marketCap: quote.marketCap,
          volume: quote.regularMarketVolume,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
        }

        // 한국 주식인지 확인하여 통화 설정
        if (this.isKoreanStock(quote)) {
          stockInfo.currency = 'KRW'
          stockInfo.exchange = 'KRX'
        }

        return { success: true, data: stockInfo, source: 'Yahoo Finance' }
      }
    } catch (error) {
      console.warn('Yahoo Finance API failed:', error)
    }

    return { success: false, error: 'Yahoo Finance API failed' }
  }

  async searchKoreanStock(symbol: string): Promise<ApiResponse> {
    // 한국 주식 코드 패턴 확인 (6자리 숫자)
    if (!/^\d{6}$/.test(symbol)) {
      return { success: false, error: 'Not Korean stock symbol' }
    }

    try {
      // 야후 파이낸스는 한국 주식에 .KS (코스피) 또는 .KQ (코스닥) 접미사 필요
      const suffixes = ['.KS', '.KQ']

      for (const suffix of suffixes) {
        const yahooSymbol = symbol + suffix
        console.log(`🔍 Yahoo Finance 한국 주식 검색: ${yahooSymbol}`)

        const result = await this.searchStock(yahooSymbol)
        if (result.success && result.data) {
          // 심볼을 원래 코드로 변경
          result.data.symbol = symbol
          result.data.exchange = 'KRX'
          result.data.currency = 'KRW'
          console.log(`✅ Yahoo Finance에서 한국 주식 조회 성공: ${result.data.name}`)
          return result
        }
      }
    } catch (error) {
      console.warn('Yahoo Finance Korean stock search failed:', error)
    }

    return { success: false, error: 'Korean stock not found in Yahoo Finance' }
  }

  async searchSymbols(query: string): Promise<StockInfo[]> {
    try {
      const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&lang=en-US&region=US&quotesCount=10&newsCount=0`
      const response = await proxyService.fetchWithProxy(searchUrl)
      const data = await response.json()

      if (data.quotes && data.quotes.length > 0) {
        return data.quotes
          .map((quote: any) => ({
            symbol: quote.symbol,
            name: quote.longname || quote.shortname,
            exchange: quote.exchDisp,
            currency: quote.currency || 'USD',
          }))
          .filter((stock: StockInfo) => stock.symbol && stock.name)
      }
    } catch (error) {
      console.warn('Yahoo Finance search failed:', error)
    }

    return []
  }

  async getMultipleQuotes(symbols: string[]): Promise<StockInfo[]> {
    try {
      const symbolsStr = symbols.join(',')
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsStr}`
      const response = await proxyService.fetchWithProxy(url)
      const data = await response.json()

      if (data.quoteResponse?.result) {
        return data.quoteResponse.result.map((quote: any) => ({
          symbol: quote.symbol,
          name: quote.longName || quote.shortName,
          currentPrice: quote.regularMarketPrice,
          currency: quote.currency,
          exchange: quote.exchange,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          volume: quote.regularMarketVolume,
          marketCap: quote.marketCap,
        }))
      }
    } catch (error) {
      console.error('Yahoo Finance multiple quotes failed:', error)
    }

    return []
  }

  private isKoreanStock(quote: any): boolean {
    return (
      quote.exchange === 'KSC' ||
      quote.exchange === 'KOE' ||
      quote.symbol.endsWith('.KS') ||
      quote.symbol.endsWith('.KQ')
    )
  }
}

export const yahooFinanceApi = new YahooFinanceApi()
