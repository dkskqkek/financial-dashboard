import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import yahooFinance from 'yahoo-finance2'
import multer from 'multer'
import XLSX from 'xlsx'
import Papa from 'papaparse'
import * as cheerio from 'cheerio'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3007

// 네트워크 인터페이스 IP 자동 감지
import { networkInterfaces } from 'os'

function getLocalIPs() {
  const interfaces = networkInterfaces()
  const ips = ['localhost', '127.0.0.1']
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address)
      }
    }
  }
  
  return ips
}

// 동적 CORS origin 생성
function generateCORSOrigins() {
  const localIPs = getLocalIPs()
  const ports = [3000, 3001, 3002, 3003, 3004, 3005, 5173]
  const origins = []
  
  // 모든 로컬 IP와 포트 조합 생성
  for (const ip of localIPs) {
    for (const port of ports) {
      origins.push(`http://${ip}:${port}`)
    }
  }
  
  console.log('🌐 CORS 허용 Origins:', origins.slice(0, 10), origins.length > 10 ? `... (총 ${origins.length}개)` : '')
  
  return origins
}

// CORS 설정 - 동적 IP 감지 및 모든 네트워크 접속 허용
app.use(cors({
  origin: generateCORSOrigins(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Accept',
    'Accept-Language',
    'Content-Language',
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Origin',
    'Cache-Control',
    'Pragma',
    'Expires',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}))

// OPTIONS 요청에 대한 명시적 처리
app.options('*', cors())

app.use(express.json())

// 파일 업로드 설정
const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB 제한
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'text/html', // .html
      'application/octet-stream' // 일반 파일
    ]
    
    const allowedExtensions = ['.xlsx', '.xls', '.csv', '.html']
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'))
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true)
    } else {
      cb(new Error('지원되지 않는 파일 형식입니다. (.xlsx, .xls, .csv, .html만 가능)'), false)
    }
  }
})

// yahoo-finance2 라이브러리 사용 (개선된 에러 처리)
async function getStockQuote(symbol) {
  try {
    console.log(`🌐 yahoo-finance2로 주식 조회: ${symbol}`)
    
    const quote = await yahooFinance.quote(symbol, {
      modules: ['price', 'summaryDetail']  // 필요한 모듈만 요청
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
    console.error('❌ yahoo-finance2 오류:', error.name, error.message)
    
    // yahoo-finance2 특정 오류 처리
    if (error.name === 'FailedYahooValidationError') {
      console.error('Yahoo 데이터 검증 실패')
    } else if (error.name === 'HTTPError') {
      console.error('Yahoo Finance HTTP 오류')
    }
    
    throw new Error(`주식 조회 실패: ${error.message}`)
  }
}

// 한국 주식 검색 API
app.get('/api/stock/korean/:symbol', async (req, res) => {
  const { symbol } = req.params
  
  if (!/^\d{6}$/.test(symbol)) {
    return res.status(400).json({ 
      error: '한국 주식 코드는 6자리 숫자여야 합니다' 
    })
  }

  console.log(`🇰🇷 한국 주식 검색: ${symbol}`)
  
  // 코스피(.KS)와 코스닥(.KQ) 순서로 시도
  const suffixes = ['.KS', '.KQ']
  
  for (const suffix of suffixes) {
    try {
      const yahooSymbol = symbol + suffix
      const data = await getStockQuote(yahooSymbol)
      
      if (data.quoteResponse?.result && data.quoteResponse.result.length > 0) {
        const quote = data.quoteResponse.result[0]
        
        const stockInfo = {
          symbol: symbol, // 원래 6자리 코드
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

        console.log(`✅ 한국 주식 조회 성공: ${stockInfo.name} (${yahooSymbol})`)
        return res.json({ success: true, data: stockInfo })
      }
    } catch (error) {
      console.warn(`❌ ${symbol}${suffix} 조회 실패:`, error.message)
      continue
    }
  }

  console.log(`❌ 한국 주식 ${symbol} 조회 실패`)
  res.status(404).json({ 
    success: false, 
    error: `주식 ${symbol}을 찾을 수 없습니다` 
  })
})

// 글로벌 주식 검색 API
app.get('/api/stock/global/:symbol', async (req, res) => {
  const { symbol } = req.params
  
  console.log(`🌍 글로벌 주식 검색: ${symbol}`)

  try {
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

      console.log(`✅ 글로벌 주식 조회 성공: ${stockInfo.name} (${stockInfo.exchange})`)
      res.json({ success: true, data: stockInfo })
    } else {
      console.log(`❌ 글로벌 주식 ${symbol} - Yahoo Finance에서 찾을 수 없음`)
      res.status(404).json({ 
        success: false, 
        error: `주식 ${symbol}을 찾을 수 없습니다` 
      })
    }

  } catch (error) {
    console.error(`❌ 글로벌 주식 ${symbol} 검색 오류:`, error.message)
    res.status(500).json({ 
      success: false, 
      error: `주식 검색 중 오류 발생: ${error.message}` 
    })
  }
})

// 통합 주식 검색 API
app.get('/api/stock/search/:symbol', async (req, res) => {
  const { symbol } = req.params
  
  if (!symbol || symbol.trim().length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: '종목 코드가 비어있습니다' 
    })
  }

  const cleanSymbol = symbol.trim().toUpperCase()
  console.log(`🔍 주식 검색: ${cleanSymbol}`)

  try {
    // 한국 주식 코드인지 확인 (6자리 숫자)
    if (/^\d{6}$/.test(cleanSymbol)) {
      // 한국 주식 API로 리다이렉트
      const koreanResult = await fetch(`http://localhost:${PORT}/api/stock/korean/${cleanSymbol}`)
      const koreanData = await koreanResult.json()
      return res.json(koreanData)
    } else {
      // 글로벌 주식 API로 리다이렉트
      const globalResult = await fetch(`http://localhost:${PORT}/api/stock/global/${cleanSymbol}`)
      const globalData = await globalResult.json()
      return res.json(globalData)
    }
  } catch (error) {
    console.error(`💥 ${cleanSymbol} 검색 중 오류 발생:`, error.message)
    res.status(500).json({ 
      success: false, 
      error: `주식 검색 실패: ${error.message}` 
    })
  }
})

// 다중 종목 조회 API
app.post('/api/stock/multiple', async (req, res) => {
  const { symbols } = req.body
  
  if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
    return res.status(400).json({ 
      success: false, 
      error: '종목 코드 배열이 필요합니다' 
    })
  }

  console.log(`📊 다중 종목 조회: ${symbols.join(', ')}`)

  try {
    const results = []
    
    // 각 종목을 개별적으로 조회 (병렬 처리)
    const promises = symbols.map(async (symbol) => {
      try {
        const response = await fetch(`http://localhost:${PORT}/api/stock/search/${symbol}`)
        const data = await response.json()
        if (data.success) {
          return data.data
        }
        return null
      } catch (error) {
        console.warn(`다중 조회 중 ${symbol} 실패:`, error.message)
        return null
      }
    })

    const settledResults = await Promise.allSettled(promises)
    
    settledResults.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        results.push(result.value)
      }
    })

    console.log(`✅ 다중 조회 완료: ${results.length}/${symbols.length}개 성공`)
    res.json({ 
      success: true, 
      data: results,
      total: results.length,
      requested: symbols.length
    })

  } catch (error) {
    console.error('다중 종목 조회 오류:', error.message)
    res.status(500).json({ 
      success: false, 
      error: `다중 종목 조회 실패: ${error.message}` 
    })
  }
})

// 검색 제안 API
app.get('/api/stock/suggestions/:query', async (req, res) => {
  const { query } = req.params
  
  if (!query || query.length < 2) {
    return res.json({ success: true, data: [] })
  }

  console.log(`🔎 검색 제안: ${query}`)

  try {
    // yahoo-finance2를 사용한 검색은 직접 지원하지 않으므로 간단한 검색 구현
    console.log(`🔎 검색 제안 기능은 현재 제한적입니다: ${query}`)
    const suggestions = []
    
    // 기본적인 주식 심볼 검색 로직 (예시)
    const commonStocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
      { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ' },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
      { symbol: '005930', name: '삼성전자', exchange: 'KRX' },
      { symbol: '000660', name: 'SK하이닉스', exchange: 'KRX' },
      { symbol: '035420', name: 'NAVER', exchange: 'KRX' }
    ]
    
    const filtered = commonStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    )
    
    const data = { quotes: filtered }
    
    if (data.quotes && data.quotes.length > 0) {
      const suggestions = data.quotes.map((quote) => ({
        symbol: quote.symbol,
        name: quote.longname || quote.shortname,
        exchange: quote.exchDisp,
        currency: quote.currency || 'USD'
      })).filter((stock) => stock.symbol && stock.name)

      res.json({ success: true, data: suggestions })
    } else {
      res.json({ success: true, data: [] })
    }

  } catch (error) {
    console.warn('검색 제안 실패:', error.message)
    res.json({ success: true, data: [] })
  }
})

// 기본 데이터 API들 (빈 배열 반환)
app.get('/api/cash/accounts', (req, res) => {
  res.json([])
})

app.get('/api/transactions', (req, res) => {
  res.json([])
})

app.get('/api/stocks', (req, res) => {
  console.log('⚠️ /api/stocks 요청: 데이터 소스 없음, 프론트엔드에서 로컬 데이터 사용하도록 404 반환')
  res.status(404).json({ 
    error: 'No stock data source configured',
    message: '백엔드에 주식 데이터 소스가 설정되지 않았습니다. 프론트엔드의 로컬 데이터를 사용하세요.'
  })
})

app.get('/api/assets/summary', (req, res) => {
  res.json({
    totalAssets: 0,
    netWorth: 0,
    monthlyChange: { amount: 0, percentage: 0 },
    ytdReturn: 0,
    goalAchievement: 0
  })
})

app.get('/api/assets/allocation', (req, res) => {
  res.json({
    cash: 0,
    domesticStocks: 0,
    foreignStocks: 0,
    bonds: 0,
    realEstate: 0,
    debt: 0
  })
})

app.get('/api/market/data', async (req, res) => {
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
        value: quote.regularMarketPrice || quote.previousClose || 2450,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        isRealTime: !!quote.regularMarketTime,
        marketTime: quote.regularMarketTime ? new Date(quote.regularMarketTime * 1000).toISOString() : null,
        previousClose: quote.previousClose
      }
      console.log('✅ 코스피 데이터 조회 성공:', kospi)
    } else {
      console.warn('❌ 코스피 데이터 조회 실패, 기본 데이터 사용')
      kospi = { value: 2450, change: 0, changePercent: 0, isRealTime: false, marketTime: null }
    }
    
    // S&P 500 데이터 처리
    let sp500 = { value: 0, change: 0, changePercent: 0, isRealTime: false }
    if (sp500Data.status === 'fulfilled' && sp500Data.value?.quoteResponse?.result?.[0]) {
      const quote = sp500Data.value.quoteResponse.result[0]
      sp500 = {
        value: quote.regularMarketPrice || quote.previousClose || 4800,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        isRealTime: !!quote.regularMarketTime,
        marketTime: quote.regularMarketTime ? new Date(quote.regularMarketTime * 1000).toISOString() : null,
        previousClose: quote.previousClose
      }
      console.log('✅ S&P 500 데이터 조회 성공:', sp500)
    } else {
      console.warn('❌ S&P 500 데이터 조회 실패, 기본 데이터 사용')
      sp500 = { value: 4800, change: 0, changePercent: 0, isRealTime: false, marketTime: null }
    }
    
    // USD/KRW 환율 데이터 처리
    let usdKrw = { value: 1300, change: 0, changePercent: 0, isRealTime: false }
    if (usdKrwData.status === 'fulfilled' && usdKrwData.value?.quoteResponse?.result?.[0]) {
      const quote = usdKrwData.value.quoteResponse.result[0]
      usdKrw = {
        value: quote.regularMarketPrice || quote.previousClose || 1300,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        isRealTime: !!quote.regularMarketTime,
        marketTime: quote.regularMarketTime ? new Date(quote.regularMarketTime * 1000).toISOString() : null,
        previousClose: quote.previousClose
      }
      console.log('✅ USD/KRW 데이터 조회 성공:', usdKrw)
    } else {
      console.warn('❌ USD/KRW 데이터 조회 실패, 기본 데이터 사용')
      usdKrw = { value: 1300, change: 0, changePercent: 0, isRealTime: false, marketTime: null }
    }
    
    const marketData = { kospi, sp500, usdKrw }
    console.log('🎯 시장 데이터 응답:', marketData)
    
    res.json(marketData)
    
  } catch (error) {
    console.error('💥 시장 데이터 조회 오류:', error.message)
    
    // 에러 발생시 합리적인 Mock 데이터 반환
    const fallbackData = {
      kospi: { 
        value: 2450 + Math.random() * 100 - 50, 
        change: Math.random() * 20 - 10, 
        changePercent: (Math.random() * 2 - 1) 
      },
      sp500: { 
        value: 4800 + Math.random() * 200 - 100, 
        change: Math.random() * 40 - 20, 
        changePercent: (Math.random() * 1.5 - 0.75) 
      },
      usdKrw: { 
        value: 1300 + Math.random() * 40 - 20, 
        change: Math.random() * 10 - 5, 
        changePercent: (Math.random() * 1 - 0.5) 
      }
    }
    
    console.log('🔄 Fallback 데이터 사용:', fallbackData)
    res.json(fallbackData)
  }
})

app.get('/api/analytics/chart', (req, res) => {
  const { range } = req.query
  const months = range === '1M' ? 1 : range === '3M' ? 3 : range === '6M' ? 6 : 12
  const data = []
  
  for (let i = months; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    
    data.push({
      date: date.toISOString().split('T')[0],
      totalAssets: 0,
      netWorth: 0,
      target: 0,
      income: 0,
      expense: 0
    })
  }
  
  res.json(data)
})

// CSV 데이터 파싱 함수
function parseCSVData(csvText) {
  const result = Papa.parse(csvText, { 
    header: true, 
    skipEmptyLines: true,
    encoding: 'UTF-8'
  })
  
  console.log('📊 CSV 데이터 행 수:', result.data.length)
  
  // 기본적인 월별 데이터 구조로 변환
  const monthlyData = []
  const months = ['2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02']
  
  // CSV에서 날짜, 수입, 지출 컬럼을 찾아서 처리
  months.forEach(month => {
    const monthData = result.data.filter(row => {
      return Object.values(row).some(value => 
        typeof value === 'string' && value.includes(month)
      )
    })
    
    let income = 0
    let expense = 0
    
    monthData.forEach(row => {
      Object.entries(row).forEach(([key, value]) => {
        const numValue = parseFloat(String(value).replace(/[^\d.-]/g, '')) || 0
        if (numValue > 0) {
          if (key.includes('수입') || key.includes('급여') || key.includes('소득')) {
            income += numValue
          } else if (key.includes('지출') || key.includes('비용') || key.includes('식비')) {
            expense += numValue
          }
        }
      })
    })
    
    monthlyData.push({
      date: month + '-01',
      income,
      expense,
      netIncome: income - expense
    })
  })
  
  return {
    monthly: monthlyData,
    summary: {
      totalIncome: monthlyData.reduce((sum, m) => sum + m.income, 0),
      totalExpense: monthlyData.reduce((sum, m) => sum + m.expense, 0)
    },
    categories: {},
    totalAssets: monthlyData.reduce((sum, m) => sum + m.netIncome, 0)
  }
}

// 지능형 HTML 데이터 파싱 함수 (실제 프로젝트 데이터 모델에 매핑)
function parseHTMLData(htmlText) {
  const $ = cheerio.load(htmlText)
  
  console.log('🧠 지능형 HTML 파싱 시작')
  
  // 프로젝트 데이터 구조에 맞게 초기화
  const result = {
    transactions: [],
    cashAccounts: [],
    stocks: [],
    monthly: [],
    summary: { totalIncome: 0, totalExpense: 0 },
    categories: {},
    totalAssets: 0
  }
  
  // 1. 테이블에서 거래 내역 추출
  const tables = $('table')
  let transactionId = 1
  let accountId = 1
  
  tables.each((tableIndex, table) => {
    const tableElement = $(table)
    console.log(`📋 테이블 ${tableIndex + 1} 분석 중...`)
    
    // 테이블 헤더에서 컬럼 구조 파악
    const headers = tableElement.find('tr').first().find('td, th').map((i, el) => $(el).text().trim()).get()
    console.log('📑 발견된 헤더:', headers)
    
    tableElement.find('tr').each((rowIndex, row) => {
      if (rowIndex === 0) return // 헤더 스킵
      
      const cells = $(row).find('td').map((i, cell) => $(cell).text().trim()).get()
      if (cells.length === 0) return
      
      console.log(`📝 행 ${rowIndex} 데이터:`, cells.slice(0, 5))
      
      // 거래 데이터로 인식되는 패턴 찾기
      let date = null, description = '', amount = 0, type = 'expense'
      
      cells.forEach((cell, cellIndex) => {
        const cellText = cell.toString().trim()
        
        // 날짜 패턴 찾기 (더 정교하게)
        if (cellText.match(/^\d{4}-\d{1,2}-\d{1,2}$/) && cellIndex === 0) {
          date = cellText
          console.log(`📅 날짜 발견: ${date}`)
        }
        
        // 금액 패턴 찾기 (더 정교한 필터링)
        if (!cellText.match(/^\d{1,2}:\d{2}$/) && // 시간 패턴 제외 (14:43)
            !cellText.match(/^\d{4}$/) && // 연도 제외 (2025)  
            !cellText.match(/^\d{4}-\d{1,2}-\d{1,2}$/) && // 날짜 제외
            !cellText.match(/^\d{2}:\d{2}:\d{2}$/) && // 시간:분:초 제외
            cellText.match(/^-?\d{1,3}(,\d{3})*$|^-?\d+$/) && // 숫자 또는 콤마가 있는 숫자
            cellIndex > 1) { // 처음 2개 컬럼(날짜,시간) 제외
          
          // 콤마 제거 후 숫자 변환
          const cleanedText = cellText.replace(/,/g, '')
          const numValue = Math.abs(parseFloat(cleanedText)) || 0
          
          // 합리적인 금액 범위만 처리 (100원 이상, 100억원 미만)
          if (numValue >= 100 && numValue < 10000000000) {
            // 수입/지출 분류를 더 정확히 판단
            const rowType = cells[2] || '' // 3번째 컬럼의 타입 정보
            const categoryInfo = cells[3] || cells[4] || '' // 카테고리 정보
            const description = cells[5] || cells[6] || '' // 설명
            
            // 주식, 보험 등은 별도 처리 (지출로 분류하지 않음)
            if (categoryInfo.includes('주식') || description.includes('주식') ||
                categoryInfo.includes('투자') || description.includes('투자') ||
                categoryInfo.includes('보험') || description.includes('보험')) {
              console.log(`📈 투자/보험 상품 발견: ${numValue} - 거래내역에서 제외`)
              return // 일반 거래내역에서 제외
            }
            
            amount = numValue
            
            // 타입 판단 로직 개선
            if (rowType.includes('수입') || rowType.includes('입금') || 
                categoryInfo.includes('급여') || categoryInfo.includes('금융수입') ||
                description.includes('급여') || description.includes('입금')) {
              type = 'income'
              result.summary.totalIncome += numValue
              console.log(`💰 수입 발견: ${numValue} (타입: ${rowType}, 카테고리: ${categoryInfo})`)
            } else if (rowType.includes('지출') || rowType.includes('출금') || 
                       cellText.startsWith('-')) {
              type = 'expense'  
              result.summary.totalExpense += numValue
              console.log(`💳 지출 발견: ${numValue} (타입: ${rowType}, 카테고리: ${categoryInfo})`)
            }
          }
        }
        
        // 설명 찾기 (거래처 이름 등) - 더 정교하게
        if (cellText.length > 2 && 
            !cellText.match(/^\d{4}-\d{1,2}-\d{1,2}$/) && // 날짜 아님
            !cellText.match(/^\d{1,2}:\d{2}$/) && // 시간 아님
            !cellText.match(/^\d{2}:\d{2}:\d{2}$/) && // 시:분:초 아님
            !cellText.match(/^-?\d{1,3}(,\d{3})*$|^-?\d+$/) && // 숫자 아님
            !cellText.match(/^\d{4}$/) && // 연도 아님
            cellText !== '이체' && cellText !== '지출' && cellText !== '수입' &&
            cellText !== '현금' && cellText !== '카드' && cellText !== '계좌이체' &&
            cellText.length < 50) { // 너무 긴 텍스트 제외
          
          // 가장 의미있는 설명 선택 (길이와 내용 고려)
          if (!description || (cellText.length > description.length && cellText.length > 3)) {
            description = cellText
          }
        }
      })
      
      // 유효한 거래 데이터가 있으면 추가
      if (date && amount > 0) {
        const transaction = {
          id: `tx_${transactionId++}`,
          date: date,
          type: type,
          account: '업로드계좌',
          description: description || `거래내역 ${transactionId}`,
          amount: amount,
          balance: 0, // 계산 필요
          category: categorizeTransaction(description, type),
          memo: `HTML 파일에서 가져옴`
        }
        
        result.transactions.push(transaction)
        console.log(`✅ 거래 추가:`, { date, type, amount, description })
      }
    })
  })
  
  // 2. 계좌 정보 생성 (업로드된 데이터 기준)
  if (result.transactions.length > 0) {
    const cashAccount = {
      id: `acc_${accountId++}`,
      bankName: '업로드 데이터',
      accountType: '일반',
      accountNumber: '***-***-****',
      currency: 'KRW',
      balance: result.summary.totalIncome - result.summary.totalExpense,
      lastTransactionDate: result.transactions[result.transactions.length - 1].date,
      memo: 'HTML 파일에서 가져온 계좌'
    }
    
    result.cashAccounts.push(cashAccount)
    console.log(`🏦 계좌 생성:`, cashAccount.bankName, cashAccount.balance)
  }
  
  // 3. 월별 데이터 생성
  const months = ['2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02']
  months.forEach(month => {
    const monthTransactions = result.transactions.filter(tx => tx.date.startsWith(month))
    const monthIncome = monthTransactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0)
    const monthExpense = monthTransactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0)
    
    result.monthly.push({
      date: month + '-01',
      income: monthIncome,
      expense: monthExpense,
      netIncome: monthIncome - monthExpense
    })
  })
  
  result.totalAssets = result.summary.totalIncome - result.summary.totalExpense
  
  console.log(`🎯 파싱 완료: 거래 ${result.transactions.length}개, 계좌 ${result.cashAccounts.length}개`)
  console.log(`💼 총 수입: ${result.summary.totalIncome}, 총 지출: ${result.summary.totalExpense}`)
  
  return result
}

// 거래 카테고리 자동 분류 함수
function categorizeTransaction(description, type) {
  const desc = description.toLowerCase()
  
  if (type === 'income') {
    if (desc.includes('급여') || desc.includes('월급')) return '급여'
    if (desc.includes('용돈') || desc.includes('수당')) return '기타수입'
    return '기타수입'
  } else {
    if (desc.includes('식') || desc.includes('음식') || desc.includes('카페')) return '식비'
    if (desc.includes('교통') || desc.includes('버스') || desc.includes('지하철')) return '교통비'
    if (desc.includes('쇼핑') || desc.includes('의류')) return '쇼핑'
    if (desc.includes('병원') || desc.includes('의료')) return '의료비'
    if (desc.includes('통신') || desc.includes('휴대폰')) return '통신비'
    return '기타'
  }
}

// 뱅크샐러드 데이터 파싱 함수 (엑셀용)
function parseBankSaladData(workbook) {
  const worksheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
  
  console.log('📊 엑셀 데이터 행 수:', data.length)
  
  // 월별 데이터 찾기 (2024-09부터 2025-02까지)
  const monthlyData = []
  const months = ['2024-09', '2024-10', '2024-11', '2024-12', '2025-01', '2025-02']
  
  // 수입/지출 카테고리별 데이터 추출
  const categories = {
    '생활비': { income: [], expense: [] },
    '급여': { income: [], expense: [] },
    '기타소득': { income: [], expense: [] },
    '투자수익': { income: [], expense: [] },
    '대출': { income: [], expense: [] },
    '대출상환': { income: [], expense: [] },
    '식비': { income: [], expense: [] },
    '교통': { income: [], expense: [] },
    '기타': { income: [], expense: [] }
  }
  
  // 데이터 행 검색 (10번째 행부터 시작, 실제 인덱스는 10)
  for (let i = 10; i < data.length && i < 50; i++) {
    const row = data[i]
    if (row && row[1]) { // 카테고리가 있는 행
      const category = row[1].toString().trim()
      console.log(`📝 처리중인 카테고리: ${category}, 행 ${i}`)
      
      // 카테고리 매핑 확장
      let mappedCategory = category
      if (category.includes('생활')) mappedCategory = '생활비'
      else if (category === '급여') mappedCategory = '급여'
      else if (category.includes('소득')) mappedCategory = '기타소득'
      else if (category.includes('수익')) mappedCategory = '투자수익'
      else if (category.includes('대출')) mappedCategory = '대출'
      else if (category.includes('식')) mappedCategory = '식비'
      else if (category.includes('교통')) mappedCategory = '교통'
      else mappedCategory = '기타'
      
      if (categories[mappedCategory]) {
        for (let j = 0; j < months.length; j++) {
          // 컬럼 인덱스: 4부터 시작 (0:공백, 1:카테고리, 2:전체, 3:분류, 4:2024-09...)
          const value = parseFloat(row[4 + j]) || 0
          console.log(`  월 ${months[j]}: ${value}`)
          
          if (value > 0) {
            // 수입/지출 분류 (급여, 기타소득, 투자수익은 수입)
            if (['급여', '기타소득', '투자수익'].includes(mappedCategory)) {
              categories[mappedCategory].income.push({ month: months[j], amount: value })
              console.log(`    → 수입으로 분류: ${value}`)
            } else {
              categories[mappedCategory].expense.push({ month: months[j], amount: value })
              console.log(`    → 지출로 분류: ${value}`)
            }
          }
        }
      }
    }
  }
  
  // 월별 요약 데이터 생성
  months.forEach(month => {
    let totalIncome = 0
    let totalExpense = 0
    
    Object.values(categories).forEach(cat => {
      cat.income.forEach(item => {
        if (item.month === month) totalIncome += item.amount
      })
      cat.expense.forEach(item => {
        if (item.month === month) totalExpense += item.amount
      })
    })
    
    monthlyData.push({
      date: month + '-01',
      income: totalIncome,
      expense: totalExpense,
      netIncome: totalIncome - totalExpense
    })
    
    console.log(`📅 ${month}: 수입 ${totalIncome}, 지출 ${totalExpense}, 순수입 ${totalIncome - totalExpense}`)
  })
  
  const result = {
    monthly: monthlyData,
    categories: categories,
    totalAssets: monthlyData.reduce((sum, m) => sum + m.netIncome, 0),
    summary: {
      totalIncome: monthlyData.reduce((sum, m) => sum + m.income, 0),
      totalExpense: monthlyData.reduce((sum, m) => sum + m.expense, 0)
    }
  }
  
  console.log('✅ 파싱 결과:', {
    totalIncome: result.summary.totalIncome,
    totalExpense: result.summary.totalExpense,
    totalAssets: result.totalAssets
  })
  
  return result
}

// 엑셀 파일 업로드 API
app.post('/api/data/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: '파일이 업로드되지 않았습니다' 
      })
    }

    console.log(`📁 파일 업로드: ${req.file.originalname}`)

    let parsedData
    const fileName = req.file.originalname.toLowerCase()
    const fileBuffer = req.file.buffer.toString('utf8')

    if (fileName.endsWith('.csv')) {
      // CSV 파일 파싱
      console.log('🔍 CSV 파일로 인식')
      parsedData = parseCSVData(fileBuffer)
    } else if (fileName.endsWith('.html')) {
      // HTML 파일 파싱
      console.log('🔍 HTML 파일로 인식')
      parsedData = parseHTMLData(fileBuffer)
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // 엑셀 파일 파싱
      console.log('🔍 엑셀 파일로 인식')
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' })
      parsedData = parseBankSaladData(workbook)
    } else {
      throw new Error('지원되지 않는 파일 형식입니다')
    }

    console.log(`✅ 데이터 파싱 완료: ${parsedData.monthly.length}개월 데이터`)
    
    res.json({
      success: true,
      message: '파일 업로드 및 파싱 완료',
      data: parsedData
    })

  } catch (error) {
    console.error('파일 처리 오류:', error)
    res.status(500).json({
      success: false,
      error: `파일 처리 실패: ${error.message}`
    })
  }
})

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Stock API Backend Server is running',
    timestamp: new Date().toISOString()
  })
})

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
  const localIPs = getLocalIPs()
  console.log(`🚀 Stock API Backend Server running on port ${PORT}`)
  console.log(`📍 Local access: http://localhost:${PORT}/api/health`)
  
  // 모든 네트워크 인터페이스에서 접근 가능한 URL 출력
  localIPs.forEach(ip => {
    if (ip !== 'localhost' && ip !== '127.0.0.1') {
      console.log(`🌐 Network access: http://${ip}:${PORT}/api/health`)
    }
  })
  
  console.log(`📊 Stock search: /api/stock/search/{symbol}`)
  console.log('📱 모바일/태블릿에서도 네트워크 IP로 접근 가능합니다!')
})

export default app