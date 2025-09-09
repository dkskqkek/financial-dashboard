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

  const { symbol } = req.query

  if (!symbol) {
    return res.status(400).json({ 
      success: false, 
      error: '한국 주식 코드를 입력해주세요 (예: 005930)' 
    })
  }

  try {
    if (!/^\d{6}$/.test(symbol)) {
      return res.status(400).json({ 
        success: false,
        error: '한국 주식 코드는 6자리 숫자여야 합니다' 
      })
    }

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
            marketTime: quote.regularMarketTime ? new Date(quote.regularMarketTime * 1000).toISOString() : null,
            previousClose: quote.previousClose
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

  } catch (error) {
    console.error('Korean stock API error:', error)
    return res.status(500).json({ 
      success: false, 
      error: `한국 주식 조회 실패: ${error.message}` 
    })
  }
}