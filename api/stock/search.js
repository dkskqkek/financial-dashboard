import yahooFinance from 'yahoo-finance2'

// CORS 헤더 설정 함수
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
}

// Yahoo Finance API 호출 함수
async function getStockQuote(symbol) {
  try {
    const quote = await yahooFinance.quote(symbol, {
      modules: ['price', 'summaryDetail']
    })
    
    if (quote) {
      return {
        quoteResponse: {
          result: [quote]
        }
      }
    }
    
    throw new Error('주식 정보를 찾을 수 없습니다')

  } catch (error) {
    throw new Error(`주식 조회 실패: ${error.message}`)
  }
}

export default async function handler(req, res) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 두 가지 방식 지원:
  // 1. 쿼리 파라미터: /api/stock/search?query=GOOGL
  // 2. 경로 파라미터: /api/stock/search/GOOGL
  let symbol = req.query.query

  if (!symbol) {
    // 경로 파라미터에서 추출 시도
    const urlParts = req.url.split('/')
    const searchIndex = urlParts.indexOf('search')
    if (searchIndex >= 0 && searchIndex < urlParts.length - 1) {
      symbol = urlParts[searchIndex + 1].split('?')[0] // 쿼리 스트링 제거
    }
  }

  if (!symbol || symbol.trim().length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: '검색할 주식 심볼을 입력해주세요' 
    })
  }

  try {
    symbol = symbol.trim().toUpperCase()
    console.log(`🔍 주식 검색 요청: ${symbol} (URL: ${req.url})`)
    
    // 한국 주식 (6자리 숫자)
    if (/^\d{6}$/.test(symbol)) {
      const suffixes = ['.KS', '.KQ']
      
      for (const suffix of suffixes) {
        try {
          const yahooSymbol = symbol + suffix
          const data = await getStockQuote(yahooSymbol)
          
          if (data.quoteResponse?.result && data.quoteResponse.result.length > 0) {
            const quote = data.quoteResponse.result[0]
            
            const stockInfo = {
              symbol: symbol,
              name: quote.longName || quote.shortName || quote.displayName || '종목명 없음',
              currentPrice: quote.regularMarketPrice || quote.bid || quote.ask,
              currency: 'KRW',
              exchange: 'KRX',
              marketCap: quote.marketCap,
              volume: quote.regularMarketVolume,
              change: quote.regularMarketChange,
              changePercent: quote.regularMarketChangePercent,
              yahooSymbol: yahooSymbol,
              isRealTime: !!quote.regularMarketTime,
              marketTime: quote.regularMarketTime ? new Date(quote.regularMarketTime * 1000).toISOString() : null
            }

            return res.json({ success: true, data: stockInfo })
          }
        } catch (error) {
          continue
        }
      }
      
      return res.status(404).json({ 
        success: false, 
        error: `주식 ${symbol}을 찾을 수 없습니다` 
      })
    } else {
      // 글로벌 주식
      const data = await getStockQuote(symbol)
      
      if (data.quoteResponse?.result && data.quoteResponse.result.length > 0) {
        const quote = data.quoteResponse.result[0]
        
        const stockInfo = {
          symbol: quote.symbol || symbol,
          name: quote.longName || quote.shortName || quote.displayName || '종목명 없음',
          currentPrice: quote.regularMarketPrice || quote.bid || quote.ask,
          currency: quote.currency || 'USD',
          exchange: quote.fullExchangeName || quote.exchange || 'Unknown',
          marketCap: quote.marketCap,
          volume: quote.regularMarketVolume,
          change: quote.regularMarketChange,
          changePercent: quote.regularMarketChangePercent,
          isRealTime: !!quote.regularMarketTime,
          marketTime: quote.regularMarketTime ? new Date(quote.regularMarketTime * 1000).toISOString() : null
        }

        return res.json({ success: true, data: stockInfo })
      } else {
        return res.status(404).json({ 
          success: false, 
          error: `주식 ${symbol}을 찾을 수 없습니다` 
        })
      }
    }

  } catch (error) {
    console.error('Stock search error:', error)
    return res.status(500).json({ 
      success: false, 
      error: `주식 검색 실패: ${error.message}` 
    })
  }
}