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

// Mock 차트 데이터 생성
function generateMockChartData(range = '1Y') {
  const dataPoints = range === '1M' ? 30 : range === '3M' ? 90 : range === '6M' ? 180 : 365
  const chartData = []
  
  let baseValue = 2600 // 기본 KOSPI 값
  const today = new Date()
  
  for (let i = dataPoints; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // 간단한 랜덤 워크 시뮬레이션
    const change = (Math.random() - 0.5) * 50 // -25 ~ +25 변동
    baseValue = Math.max(2000, Math.min(3500, baseValue + change)) // 2000~3500 범위
    
    chartData.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(baseValue * 100) / 100,
      volume: Math.floor(Math.random() * 1000000000), // 거래량
    })
  }
  
  return chartData
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
    const { range = '1Y', symbol = 'KOSPI' } = req.query
    
    console.log('📊 차트 데이터 요청:', { range, symbol })
    
    // Mock 데이터 생성
    const chartData = generateMockChartData(range)
    
    const response = {
      success: true,
      data: {
        symbol: symbol,
        range: range,
        data: chartData,
        lastUpdated: new Date().toISOString(),
        dataPoints: chartData.length
      }
    }
    
    res.json(response)
    
  } catch (error) {
    console.error('💥 차트 데이터 조회 오류:', error.message)
    
    res.status(500).json({ 
      success: false, 
      error: `차트 데이터 조회 실패: ${error.message}` 
    })
  }
}