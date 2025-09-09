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
    console.log(`🌐 yahoo-finance2로 주식 조회: ${symbol}`)
    
    const quote = await yahooFinance.quote(symbol, {
      modules: ['price', 'summaryDetail']
    })
    
    if (quote) {
      console.log('✅ yahoo-finance2 조회 성공')
      return {
        quoteResponse: {
          result: [quote]
        }
      }
    }
    
    throw new Error('주식 정보를 찾을 수 없습니다')

  } catch (error) {
    console.error('❌ yahoo-finance2 오류:', error.message)
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

  // Catch-all 라우팅: /api/stock/search/SYMBOL 처리
  const { params } = req.query
  const symbol = Array.isArray(params) ? params[0] : params

  if (!symbol || symbol.trim().length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: '종목 코드가 비어있습니다' 
    })
  }

  try {
    const cleanSymbol = symbol.trim().toUpperCase()
    console.log(`🔍 Catch-all 주식 검색: ${cleanSymbol} (params: ${JSON.stringify(params)})`)
    
    // 한국 주식 (6자리 숫자)
    if (/^\d{6}$/.test(cleanSymbol)) {
      console.log(`🇰🇷 한국 주식 검색: ${cleanSymbol}`)
      
      const suffixes = ['.KS', '.KQ']
      
      for (const suffix of suffixes) {
        try {
          const yahooSymbol = cleanSymbol + suffix
          const data = await getStockQuote(yahooSymbol)
          
          if (data.quoteResponse?.result && data.quoteResponse.result.length > 0) {
            const quote = data.quoteResponse.result[0]
            
            const stockInfo = {
              symbol: cleanSymbol,
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

            console.log(`✅ 한국 주식 조회 성공: ${stockInfo.name} (${yahooSymbol})`)
            return res.json({ success: true, data: stockInfo })
          }
        } catch (error) {
          console.warn(`❌ ${cleanSymbol}${suffix} 조회 실패:`, error.message)
          continue
        }
      }
      
      console.log(`❌ 한국 주식 ${cleanSymbol} 조회 실패`)
      return res.status(404).json({ 
        success: false, 
        error: `주식 ${cleanSymbol}을 찾을 수 없습니다` 
      })
    } else {
      // 글로벌 주식
      console.log(`🌍 글로벌 주식 검색: ${cleanSymbol}`)
      
      const data = await getStockQuote(cleanSymbol)
      
      if (data.quoteResponse?.result && data.quoteResponse.result.length > 0) {
        const quote = data.quoteResponse.result[0]
        
        const stockInfo = {
          symbol: quote.symbol || cleanSymbol,
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

        console.log(`✅ 글로벌 주식 조회 성공: ${stockInfo.name} (${stockInfo.exchange})`)
        return res.json({ success: true, data: stockInfo })
      } else {
        console.log(`❌ 글로벌 주식 ${cleanSymbol} - Yahoo Finance에서 찾을 수 없음`)
        return res.status(404).json({ 
          success: false, 
          error: `주식 ${cleanSymbol}을 찾을 수 없습니다` 
        })
      }
    }

  } catch (error) {
    console.error(`💥 ${symbol} 검색 중 오류 발생:`, error.message)
    return res.status(500).json({ 
      success: false, 
      error: `주식 검색 실패: ${error.message}` 
    })
  }
}