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

  try {
    console.log('📊 실시간 시장 데이터 조회 중...')
    
    // 병렬로 시장 데이터 조회
    const [kospiData, sp500Data, usdKrwData] = await Promise.allSettled([
      getStockQuote('^KS11'),  // 코스피 지수
      getStockQuote('^GSPC'),  // S&P 500
      getStockQuote('KRW=X')   // USD/KRW 환율
    ])
    
    // 코스피 데이터 처리
    let kospi = { value: 0, change: 0, changePercent: 0, isRealTime: false }
    if (kospiData.status === 'fulfilled' && kospiData.value?.quoteResponse?.result?.[0]) {
      const quote = kospiData.value.quoteResponse.result[0]
      kospi = {
        value: quote.regularMarketPrice || quote.previousClose || 2600,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        isRealTime: !!quote.regularMarketTime,
        marketTime: quote.regularMarketTime ? new Date(quote.regularMarketTime * 1000).toISOString() : null,
        previousClose: quote.previousClose
      }
      console.log('✅ 코스피 데이터 조회 성공:', kospi)
    } else {
      console.warn('❌ 코스피 데이터 조회 실패, 기본 데이터 사용')
      kospi = { value: 2600, change: 0, changePercent: 0, isRealTime: false, marketTime: null }
    }
    
    // S&P 500 데이터 처리
    let sp500 = { value: 0, change: 0, changePercent: 0, isRealTime: false }
    if (sp500Data.status === 'fulfilled' && sp500Data.value?.quoteResponse?.result?.[0]) {
      const quote = sp500Data.value.quoteResponse.result[0]
      sp500 = {
        value: quote.regularMarketPrice || quote.previousClose || 6000,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        isRealTime: !!quote.regularMarketTime,
        marketTime: quote.regularMarketTime ? new Date(quote.regularMarketTime * 1000).toISOString() : null,
        previousClose: quote.previousClose
      }
      console.log('✅ S&P 500 데이터 조회 성공:', sp500)
    } else {
      console.warn('❌ S&P 500 데이터 조회 실패, 기본 데이터 사용')
      sp500 = { value: 6000, change: 0, changePercent: 0, isRealTime: false, marketTime: null }
    }
    
    // USD/KRW 환율 데이터 처리
    let usdKrw = { value: 1380, change: 0, changePercent: 0, isRealTime: false }
    if (usdKrwData.status === 'fulfilled' && usdKrwData.value?.quoteResponse?.result?.[0]) {
      const quote = usdKrwData.value.quoteResponse.result[0]
      usdKrw = {
        value: quote.regularMarketPrice || quote.previousClose || 1380,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        isRealTime: !!quote.regularMarketTime,
        marketTime: quote.regularMarketTime ? new Date(quote.regularMarketTime * 1000).toISOString() : null,
        previousClose: quote.previousClose
      }
      console.log('✅ USD/KRW 데이터 조회 성공:', usdKrw)
    } else {
      console.warn('❌ USD/KRW 데이터 조회 실패, 기본 데이터 사용')
      usdKrw = { value: 1380, change: 0, changePercent: 0, isRealTime: false, marketTime: null }
    }
    
    const marketData = { kospi, sp500, usdKrw }
    console.log('🎯 시장 데이터 응답:', marketData)
    
    res.json(marketData)
    
  } catch (error) {
    console.error('💥 시장 데이터 조회 오류:', error.message)
    
    // 에러 발생시 합리적인 Mock 데이터 반환
    const fallbackData = {
      kospi: { 
        value: 2600 + Math.random() * 100 - 50, 
        change: Math.random() * 20 - 10, 
        changePercent: (Math.random() * 2 - 1) 
      },
      sp500: { 
        value: 6000 + Math.random() * 200 - 100, 
        change: Math.random() * 40 - 20, 
        changePercent: (Math.random() * 1.5 - 0.75) 
      },
      usdKrw: { 
        value: 1380 + Math.random() * 40 - 20, 
        change: Math.random() * 10 - 5, 
        changePercent: (Math.random() * 1 - 0.5) 
      }
    }
    
    console.log('🔄 Fallback 데이터 사용:', fallbackData)
    res.json(fallbackData)
  }
}