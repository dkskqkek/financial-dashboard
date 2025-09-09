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

  const { slug } = req.query
  const [action, ...params] = slug

  try {
    // /api/stock/korean/005930
    if (action === 'korean' && params[0]) {
      const symbol = params[0]
      
      if (!/^\d{6}$/.test(symbol)) {
        return res.status(400).json({ 
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
              yahooSymbol: yahooSymbol
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
    }

    // /api/stock/global/AAPL
    if (action === 'global' && params[0]) {
      const symbol = params[0]
      
      const data = await getStockQuote(symbol.toUpperCase())
      
      if (data.quoteResponse?.result && data.quoteResponse.result.length > 0) {
        const quote = data.quoteResponse.result[0]
        
        const stockInfo = {
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

        return res.json({ success: true, data: stockInfo })
      } else {
        return res.status(404).json({ 
          success: false, 
          error: `주식 ${symbol}을 찾을 수 없습니다` 
        })
      }
    }

    // /api/stock/search/005930 or /api/stock/search/AAPL
    if (action === 'search' && params[0]) {
      const symbol = params[0].trim().toUpperCase()
      
      if (/^\d{6}$/.test(symbol)) {
        // 한국 주식으로 리다이렉트
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
                yahooSymbol: yahooSymbol
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
        // 글로벌 주식으로 처리
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
            changePercent: quote.regularMarketChangePercent
          }

          return res.json({ success: true, data: stockInfo })
        } else {
          return res.status(404).json({ 
            success: false, 
            error: `주식 ${symbol}을 찾을 수 없습니다` 
          })
        }
      }
    }

    return res.status(404).json({ error: 'API endpoint not found' })

  } catch (error) {
    console.error('Stock API error:', error)
    return res.status(500).json({ 
      success: false, 
      error: `주식 검색 실패: ${error.message}` 
    })
  }
}