// 다양한 무료 주식 API를 통합하는 서비스
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
  source?: string
}

class StockApiService {
  // 여러 API 소스를 순서대로 시도
  private apiSources = [
    { name: 'Yahoo Finance', enabled: true },
    { name: 'IEX Cloud', enabled: true },
    { name: 'Finnhub', enabled: true },
    { name: 'Alpha Vantage', enabled: true },
    { name: 'Polygon', enabled: true },
    { name: 'Korean Investment', enabled: true },
  ]

  // 1. Yahoo Finance API (무료, 제한 없음)
  private async searchYahooFinance(symbol: string): Promise<ApiResponse> {
    try {
      // Yahoo Finance의 비공식 API 엔드포인트들
      const endpoints = [
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
        `https://query2.finance.yahoo.com/v1/finance/quoteType/${symbol}`,
        `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`
      ]

      // 먼저 기본 정보 조회
      const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`
      const response = await this.fetchWithProxy(quoteUrl)
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
          changePercent: quote.regularMarketChangePercent
        }

        // 한국 주식인지 확인하여 통화 설정
        if (quote.exchange === 'KSC' || quote.exchange === 'KOE' || quote.symbol.endsWith('.KS') || quote.symbol.endsWith('.KQ')) {
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

  // 2. Alpha Vantage API (무료 5회/분)
  private async searchAlphaVantage(symbol: string): Promise<ApiResponse> {
    const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY || 'demo'
    
    try {
      // 먼저 심볼 검색으로 정확한 종목명 확인
      const searchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${symbol}&apikey=${API_KEY}`
      
      const response = await this.fetchWithProxy(searchUrl)
      const data = await response.json()
      
      if (data['bestMatches'] && data['bestMatches'].length > 0) {
        const match = data['bestMatches'][0]
        const stockInfo: StockInfo = {
          symbol: match['1. symbol'],
          name: match['2. name'],
          currency: match['8. currency'] === 'KRW' ? 'KRW' : 'USD',
          exchange: match['4. type'].includes('KRX') ? 'KRX' : 'NYSE'
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

  // 2. Polygon.io API (무료 5회/분)
  private async searchPolygon(symbol: string): Promise<ApiResponse> {
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
          marketCap: result.market_cap
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

  // 3. IEX Cloud API (무료 50,000회/월)
  private async searchIEXCloud(symbol: string): Promise<ApiResponse> {
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
          changePercent: quote.changePercent
        }

        return { success: true, data: stockInfo, source: 'IEX Cloud' }
      }
    } catch (error) {
      console.warn('IEX Cloud API failed:', error)
    }
    
    return { success: false, error: 'IEX Cloud API failed' }
  }

  // 4. Finnhub API (무료 60회/분)
  private async searchFinnhub(symbol: string): Promise<ApiResponse> {
    const API_KEY = import.meta.env.VITE_FINNHUB_KEY || 'demo'
    
    try {
      // 종목 정보 조회
      const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol.toUpperCase()}&token=${API_KEY}`
      const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${API_KEY}`
      
      const [profileResponse, quoteResponse] = await Promise.all([
        fetch(profileUrl),
        fetch(quoteUrl)
      ])
      
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
          changePercent: quote.dp
        }

        return { success: true, data: stockInfo, source: 'Finnhub' }
      }
    } catch (error) {
      console.warn('Finnhub API failed:', error)
    }
    
    return { success: false, error: 'Finnhub API failed' }
  }

  // 5. Yahoo Finance 한국 주식 검색
  private async searchYahooKoreanStock(symbol: string): Promise<ApiResponse> {
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
        
        const result = await this.searchYahooFinance(yahooSymbol)
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

  // 6. 한국투자증권 API (한국 주식 전용 - 백업용)
  private async searchKoreanStock(symbol: string): Promise<ApiResponse> {
    // 한국 주식 코드 패턴 확인 (6자리 숫자)
    if (!/^\d{6}$/.test(symbol)) {
      return { success: false, error: 'Not Korean stock symbol' }
    }
    
    try {
      // 백엔드 API 호출로 실제 Yahoo Finance 데이터 가져오기
      console.log(`🇰🇷 한국 주식 조회 시작: ${symbol}`)
      
      const response = await fetch(`http://localhost:3006/api/stock/korean/${symbol}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        console.log(`✅ 한국 주식 조회 성공: ${result.data.name}`)
        return { success: true, data: result.data, source: 'Yahoo Finance (Backend)' }
      } else {
        console.warn(`❌ 한국 주식 조회 실패: ${result.error}`)
        throw new Error(result.error || '한국 주식을 찾을 수 없습니다')
      }
    } catch (error) {
      console.warn('Korean Stock API failed:', error)
    }
    
    return { success: false, error: 'Korean stock not found' }
  }

  // 메인 검색 함수 - 여러 API를 순서대로 시도
  async searchStock(symbol: string): Promise<StockInfo | null> {
    console.log(`🔍 주식 검색 시작: ${symbol}`)
    
    // 한국 주식인지 먼저 확인
    if (/^\d{6}$/.test(symbol)) {
      console.log('📈 한국 주식으로 인식, Yahoo Finance 우선 시도')
      
      // 1. Yahoo Finance로 한국 주식 먼저 시도
      const yahooResult = await this.searchYahooKoreanStock(symbol)
      if (yahooResult.success && yahooResult.data) {
        console.log(`✅ ${yahooResult.source}에서 조회 성공:`, yahooResult.data)
        return yahooResult.data
      }
      
      // 2. 실패시 백업 데이터 사용
      console.log('🔄 Yahoo Finance 실패, 백업 데이터 사용')
      const backupResult = await this.searchKoreanStock(symbol)
      if (backupResult.success && backupResult.data) {
        console.log(`✅ ${backupResult.source}에서 조회 성공:`, backupResult.data)
        return backupResult.data
      }
    }

    // 글로벌 주식은 백엔드 API 호출
    try {
      console.log(`🌍 글로벌 주식 조회 시작: ${symbol}`)
      
      const response = await fetch(`http://localhost:3006/api/stock/global/${symbol}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        console.log(`✅ 글로벌 주식 조회 성공: ${result.data.name}`)
        return result.data
      } else {
        console.warn(`❌ 글로벌 주식 조회 실패: ${result.error}`)
        throw new Error(result.error || '글로벌 주식을 찾을 수 없습니다')
      }
    } catch (error) {
      console.error(`💥 글로벌 주식 API 호출 오류 (${symbol}):`, error)
      // 기존 API 방식으로 폴백하지 않고 오류 반환
    }

    console.log(`❌ 모든 API에서 ${symbol} 조회 실패`)
    return null
  }

  // Yahoo Finance 검색 기능 (심볼 자동완성)
  async searchYahooSymbols(query: string): Promise<StockInfo[]> {
    try {
      const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&lang=en-US&region=US&quotesCount=10&newsCount=0`
      const response = await this.fetchWithProxy(searchUrl)
      const data = await response.json()
      
      if (data.quotes && data.quotes.length > 0) {
        return data.quotes.map((quote: any) => ({
          symbol: quote.symbol,
          name: quote.longname || quote.shortname,
          exchange: quote.exchDisp,
          currency: quote.currency || 'USD'
        })).filter((stock: StockInfo) => stock.symbol && stock.name)
      }
    } catch (error) {
      console.warn('Yahoo Finance search failed:', error)
    }
    
    return []
  }

  // 야후 파이낸스 실시간 가격 추적
  async startYahooRealTimeTracking(symbols: string[], callback: (data: StockInfo[]) => void): Promise<() => void> {
    const updatePrices = async () => {
      try {
        // 여러 심볼을 한번에 조회
        const symbolsStr = symbols.join(',')
        const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolsStr}`
        const response = await this.fetchWithProxy(url)
        const data = await response.json()
        
        if (data.quoteResponse?.result) {
          const stockInfos: StockInfo[] = data.quoteResponse.result.map((quote: any) => ({
            symbol: quote.symbol,
            name: quote.longName || quote.shortName,
            currentPrice: quote.regularMarketPrice,
            currency: quote.currency,
            exchange: quote.exchange,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            volume: quote.regularMarketVolume,
            marketCap: quote.marketCap
          }))
          
          callback(stockInfos)
        }
      } catch (error) {
        console.error('Yahoo Finance real-time update failed:', error)
      }
    }

    // 초기 로드
    await updatePrices()
    
    // 10초마다 업데이트 (실시간성 향상)  
    const interval = setInterval(updatePrices, 10000)
    
    return () => {
      clearInterval(interval)
    }
  }

  // CORS 우회를 위한 안전한 프록시 전략
  private async fetchWithProxy(url: string): Promise<Response> {
    // 개발 환경에서만 프록시 사용
    if (import.meta.env.DEV) {
      console.log('🔧 개발 환경 감지: 프록시 서버 시도')
      
      // 안전한 프록시 서버들 (작동 확인됨)
      const safeProxies = [
        'https://api.allorigins.win/get?url=', // JSON 래핑
      ]

      for (const proxy of safeProxies) {
        try {
          const proxyUrl = proxy + encodeURIComponent(url)
          console.log(`🌐 프록시 시도: ${proxy.split('?')[0]}`)
          
          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(10000) // 10초 타임아웃
          })
          
          if (response.ok) {
            const data = await response.json()
            
            // allorigins의 경우 contents 필드에 실제 데이터가 있음
            if (data.contents) {
              console.log(`✅ 프록시 성공: allorigins`)
              return new Response(data.contents, {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              })
            }
          }
        } catch (error) {
          console.warn(`❌ 프록시 실패: ${proxy.split('?')[0]}`, error)
          continue
        }
      }
    }

    console.log('🚫 프록시 사용 불가 또는 실패 - 로컬 데이터 사용')
    throw new Error('CORS blocked - using fallback data')
  }

  // 실시간 주가 업데이트 (WebSocket 대신 폴링)
  async startPriceTracking(symbols: string[], callback: (updates: StockInfo[]) => void): Promise<() => void> {
    const updatePrices = async () => {
      const updates: StockInfo[] = []
      
      for (const symbol of symbols) {
        const stockInfo = await this.searchStock(symbol)
        if (stockInfo) {
          updates.push(stockInfo)
        }
      }
      
      if (updates.length > 0) {
        callback(updates)
      }
    }

    // 초기 로드
    await updatePrices()
    
    // 10초마다 업데이트 (실시간성 향상)
    const interval = setInterval(updatePrices, 10000)
    
    return () => {
      clearInterval(interval)
    }
  }
}

export const stockApiService = new StockApiService()