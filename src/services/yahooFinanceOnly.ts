// Yahoo Finance API 전용 서비스 (로컬 데이터 없음)
interface StockInfo {
  symbol: string
  name: string
  currentPrice?: number
  currency: string
  exchange: string
  marketCap?: number
  volume?: number
  change?: number
  changePercent?: number
}

interface ApiResponse {
  success: boolean
  data?: StockInfo
  error?: string
}

class YahooFinanceService {
  
  // Yahoo Finance API 호출
  private async callYahooAPI(url: string): Promise<any> {
    const proxies = [
      'https://api.allorigins.win/get?url=',
      'https://corsproxy.io/?',
      'https://cors-anywhere.herokuapp.com/',
    ]

    let lastError: Error | null = null

    for (const proxy of proxies) {
      try {
        console.log(`🌐 Yahoo API 호출 시도: ${proxy.split('?')[0]}...`)
        
        const proxyUrl = proxy + encodeURIComponent(url)
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: AbortSignal.timeout(15000) // 15초 타임아웃
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        let data
        const contentType = response.headers.get('content-type')
        
        if (contentType?.includes('application/json')) {
          data = await response.json()
        } else {
          const text = await response.text()
          try {
            data = JSON.parse(text)
          } catch {
            throw new Error('Invalid JSON response')
          }
        }

        // allorigins.win의 경우 contents 필드에 실제 데이터가 있음
        if (proxy.includes('allorigins') && data.contents) {
          data = JSON.parse(data.contents)
        }

        console.log(`✅ Yahoo API 호출 성공`)
        return data

      } catch (error) {
        console.warn(`❌ 프록시 실패 (${proxy.split('?')[0]}):`, error.message)
        lastError = error
        continue
      }
    }

    throw new Error(`모든 프록시 실패. 마지막 오류: ${lastError?.message}`)
  }

  // 한국 주식 검색 (6자리 숫자 코드)
  async searchKoreanStock(symbol: string): Promise<StockInfo | null> {
    if (!/^\d{6}$/.test(symbol)) {
      throw new Error('한국 주식 코드는 6자리 숫자여야 합니다')
    }

    console.log(`🇰🇷 한국 주식 검색 시작: ${symbol}`)

    // 코스피(.KS)와 코스닥(.KQ) 둘 다 시도
    const suffixes = ['.KS', '.KQ']
    
    for (const suffix of suffixes) {
      try {
        const yahooSymbol = symbol + suffix
        console.log(`🔍 Yahoo Finance 검색: ${yahooSymbol}`)
        
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${yahooSymbol}`
        const data = await this.callYahooAPI(url)
        
        console.log(`🔍 Yahoo 응답 데이터 (${yahooSymbol}):`, JSON.stringify(data, null, 2))
        
        if (data.quoteResponse?.result && data.quoteResponse.result.length > 0) {
          const quote = data.quoteResponse.result[0]
          
          const stockInfo: StockInfo = {
            symbol: symbol, // 원래 6자리 코드로 반환
            name: quote.longName || quote.shortName || quote.displayName || '종목명 없음',
            currentPrice: quote.regularMarketPrice || quote.bid || quote.ask,
            currency: 'KRW',
            exchange: 'KRX',
            marketCap: quote.marketCap,
            volume: quote.regularMarketVolume,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent
          }

          console.log(`✅ 한국 주식 조회 성공: ${stockInfo.name} (${yahooSymbol})`)
          return stockInfo
        }
      } catch (error) {
        console.warn(`❌ ${symbol}${suffix} 조회 실패:`, error.message)
        continue
      }
    }

    console.log(`❌ 한국 주식 ${symbol} 조회 실패 - 모든 시장에서 찾을 수 없음`)
    
    // 마지막 시도: Yahoo Finance 검색 API로 종목 찾기
    console.log(`🔍 Yahoo 검색 API로 ${symbol} 다시 시도`)
    try {
      const searchResults = await this.searchSuggestions(symbol)
      console.log(`🔍 검색 결과:`, searchResults)
      
      // 한국 관련 결과 찾기
      const koreanResult = searchResults.find(result => 
        result.symbol.includes('.KS') || 
        result.symbol.includes('.KQ') ||
        result.symbol.includes(symbol)
      )
      
      if (koreanResult) {
        console.log(`✅ 검색에서 발견: ${koreanResult.symbol} - ${koreanResult.name}`)
        
        // 발견된 심볼로 직접 Yahoo API 호출 (한국 주식 전용 로직)
        try {
          const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${koreanResult.symbol}`
          const data = await this.callYahooAPI(url)
          
          console.log(`🔍 검색된 종목 응답 데이터:`, JSON.stringify(data, null, 2))
          
          if (data.quoteResponse?.result && data.quoteResponse.result.length > 0) {
            const quote = data.quoteResponse.result[0]
            
            const stockInfo: StockInfo = {
              symbol: symbol, // 원래 6자리 코드로 반환
              name: quote.longName || quote.shortName || quote.displayName || koreanResult.name,
              currentPrice: quote.regularMarketPrice || quote.bid || quote.ask,
              currency: 'KRW',
              exchange: 'KRX',
              marketCap: quote.marketCap,
              volume: quote.regularMarketVolume,
              change: quote.regularMarketChange,
              changePercent: quote.regularMarketChangePercent
            }

            console.log(`✅ 검색을 통한 한국 주식 조회 성공: ${stockInfo.name}`)
            return stockInfo
          }
        } catch (error) {
          console.warn(`검색된 종목 조회 실패:`, error.message)
        }
      }
    } catch (error) {
      console.warn('검색 API 실패:', error.message)
    }
    
    return null
  }

  // 미국/글로벌 주식 검색
  async searchGlobalStock(symbol: string): Promise<StockInfo | null> {
    console.log(`🌍 글로벌 주식 검색 시작: ${symbol}`)

    try {
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol.toUpperCase()}`
      const data = await this.callYahooAPI(url)
      
      console.log(`🔍 글로벌 주식 응답 데이터 (${symbol}):`, JSON.stringify(data, null, 2))
      
      if (data.quoteResponse?.result && data.quoteResponse.result.length > 0) {
        const quote = data.quoteResponse.result[0]
        
        const stockInfo: StockInfo = {
          symbol: quote.symbol || symbol.toUpperCase(),
          name: quote.longName || quote.shortName || quote.displayName || '종목명 없음',
          currentPrice: quote.regularMarketPrice || quote.bid || quote.ask,
          currency: quote.currency || 'USD',
          exchange: quote.fullExchangeName || quote.exchange || 'Unknown',
          marketCap: quote.marketCap,
          volume: quote.regularMarketVolume,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent
        }

        console.log(`✅ 글로벌 주식 조회 성공: ${stockInfo.name} (${stockInfo.exchange})`)
        return stockInfo
      }

      console.log(`❌ 글로벌 주식 ${symbol} - Yahoo Finance에서 찾을 수 없음`)
      return null

    } catch (error) {
      console.error(`❌ 글로벌 주식 ${symbol} 검색 오류:`, error.message)
      throw error
    }
  }

  // 통합 검색 메소드
  async searchStock(symbol: string): Promise<StockInfo | null> {
    if (!symbol || symbol.trim().length === 0) {
      throw new Error('종목 코드가 비어있습니다')
    }

    const cleanSymbol = symbol.trim().toUpperCase()
    console.log(`🔍 주식 검색 시작: ${cleanSymbol}`)

    try {
      // 한국 주식 코드인지 확인 (6자리 숫자)
      if (/^\d{6}$/.test(cleanSymbol)) {
        return await this.searchKoreanStock(cleanSymbol)
      } else {
        // 미국/글로벌 주식
        return await this.searchGlobalStock(cleanSymbol)
      }
    } catch (error) {
      console.error(`💥 ${cleanSymbol} 검색 중 오류 발생:`, error.message)
      throw new Error(`주식 검색 실패: ${error.message}`)
    }
  }

  // 실시간 멀티 종목 조회
  async getMultipleQuotes(symbols: string[]): Promise<StockInfo[]> {
    if (!symbols || symbols.length === 0) {
      return []
    }

    console.log(`📊 다중 종목 조회: ${symbols.join(', ')}`)

    try {
      // 한국 주식과 글로벌 주식을 분리
      const koreanSymbols = symbols.filter(s => /^\d{6}$/.test(s))
      const globalSymbols = symbols.filter(s => !/^\d{6}$/.test(s))
      
      const results: StockInfo[] = []

      // 한국 주식 처리 (개별 조회 필요)
      for (const symbol of koreanSymbols) {
        try {
          const stock = await this.searchKoreanStock(symbol)
          if (stock) results.push(stock)
        } catch (error) {
          console.warn(`한국 주식 ${symbol} 개별 조회 실패:`, error.message)
        }
      }

      // 글로벌 주식 일괄 조회
      if (globalSymbols.length > 0) {
        try {
          const symbolsStr = globalSymbols.join(',')
          const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsStr}`
          const data = await this.callYahooAPI(url)

          if (data.quoteResponse?.result) {
            for (const quote of data.quoteResponse.result) {
              results.push({
                symbol: quote.symbol,
                name: quote.longName || quote.shortName || quote.displayName,
                currentPrice: quote.regularMarketPrice,
                currency: quote.currency || 'USD',
                exchange: quote.fullExchangeName || quote.exchange,
                marketCap: quote.marketCap,
                volume: quote.regularMarketVolume,
                change: quote.regularMarketChange,
                changePercent: quote.regularMarketChangePercent
              })
            }
          }
        } catch (error) {
          console.warn(`글로벌 주식 일괄 조회 실패:`, error.message)
        }
      }

      console.log(`✅ 다중 조회 완료: ${results.length}개 종목`)
      return results

    } catch (error) {
      console.error('다중 종목 조회 오류:', error.message)
      throw error
    }
  }

  // 검색 제안 (자동완성)
  async searchSuggestions(query: string): Promise<StockInfo[]> {
    if (!query || query.length < 2) {
      return []
    }

    console.log(`🔎 검색 제안: ${query}`)

    try {
      const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&lang=en-US&region=US&quotesCount=10&newsCount=0`
      const data = await this.callYahooAPI(url)
      
      if (data.quotes && data.quotes.length > 0) {
        return data.quotes.map((quote: any) => ({
          symbol: quote.symbol,
          name: quote.longname || quote.shortname,
          exchange: quote.exchDisp,
          currency: quote.currency || 'USD'
        })).filter((stock: StockInfo) => stock.symbol && stock.name)
      }

      return []
    } catch (error) {
      console.warn('검색 제안 실패:', error.message)
      return []
    }
  }
}

export const yahooFinanceService = new YahooFinanceService()