import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/stores'
import { apiService } from '@/services/api'
import { setupAutoBackup } from '@/utils/dataBackup'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { AssetChart } from '@/components/dashboard/AssetChart'
import { AssetAllocationChart } from '@/components/dashboard/AssetAllocationChart'
import { MarketOverview } from '@/components/dashboard/MarketOverview'
import { BackupManager } from '@/components/ui/BackupManager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wallet, TrendingUp, Target, Award, RefreshCw, Bell } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils'
import type { ChartDataPoint, TimeRange } from '@/types'

export function Dashboard() {
  const navigate = useNavigate()
  const {
    assetSummary,
    assetAllocation,
    marketData,
    selectedTimeRange,
    isLoading,
    setAssetSummary,
    setAssetAllocation,
    setMarketData,
    setSelectedTimeRange,
    setIsLoading,
    // 실제 로컬 데이터
    cashAccounts,
    stocks,
    realEstate,
    loans,
    savings,
    // 업로드된 금융 데이터
    financialData,
    // 환율 변환 함수들
    convertToKrwTotal,
    convertStockValueToKrw,
  } = useAppStore()

  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())

  // 빠른 액션 핸들러들
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'transaction':
        navigate('/transactions')
        break
      case 'portfolio':
        navigate('/stocks')
        break
      case 'goals':
        navigate('/settings')
        break
      case 'analysis':
        navigate('/assets')
        break
      default:
        console.log(`빠른 액션: ${action}`)
    }
  }

  // 로컬 데이터로부터 실제 자산 요약 계산
  const calculateRealAssetSummary = React.useCallback(async () => {
    // 현금 계좌 총액 (환율 변환 적용)
    const totalCash = await convertToKrwTotal(cashAccounts)
    
    // 주식 총액 (환율 변환 적용)
    let totalStocks = 0
    for (const stock of stocks) {
      totalStocks += await convertStockValueToKrw(stock)
    }
    
    const totalRealEstate = realEstate.reduce((sum, property) => sum + property.currentValue, 0)
    const totalSavings = savings.reduce((sum, saving) => sum + saving.currentValue, 0)
    const totalDebt = loans.reduce((sum, loan) => sum + loan.currentBalance, 0)
    
    let totalAssets = totalCash + totalStocks + totalRealEstate + totalSavings
    let netWorth = totalAssets - totalDebt
    let monthlyChange = { amount: 0, percentage: 0 }
    
    // 뱅크샐러드 데이터가 있으면 사용
    if (financialData?.summary) {
      const bankSaladSummary = financialData.summary
      totalAssets += bankSaladSummary.totalIncome || 0
      netWorth = totalAssets - (bankSaladSummary.totalExpense || 0) - totalDebt
      
      // 월별 데이터가 있으면 최근 변화량 계산
      if (financialData.monthly?.length >= 2) {
        const recent = financialData.monthly[financialData.monthly.length - 1]
        const previous = financialData.monthly[financialData.monthly.length - 2]
        monthlyChange.amount = recent.netIncome - previous.netIncome
        if (previous.netIncome !== 0) {
          monthlyChange.percentage = (monthlyChange.amount / Math.abs(previous.netIncome)) * 100
        }
      }
    }
    
    return {
      totalAssets,
      netWorth,
      monthlyChange,
      ytdReturn: 0, // TODO: 실제 연간 수익률 계산
      goalAchievement: 0 // TODO: 목표 대비 달성률 계산
    }
  }, [cashAccounts, stocks, realEstate, savings, loans, financialData, convertToKrwTotal, convertStockValueToKrw])

  // 로컬 데이터로부터 자산 배분 계산
  const calculateRealAssetAllocation = React.useCallback(async () => {
    // 현금 계좌 총액 (환율 변환 적용)
    const totalCash = await convertToKrwTotal(cashAccounts)
    
    // 주식 총액 (환율 변환 적용)
    let totalStocks = 0
    for (const stock of stocks) {
      totalStocks += await convertStockValueToKrw(stock)
    }
    
    const totalRealEstate = realEstate.reduce((sum, property) => sum + property.currentValue, 0)
    const totalSavings = savings.reduce((sum, saving) => sum + saving.currentValue, 0)
    const totalDebt = loans.reduce((sum, loan) => sum + loan.currentBalance, 0)
    
    const totalAssets = totalCash + totalStocks + totalRealEstate + totalSavings
    
    if (totalAssets === 0) {
      return {
        cash: 0,
        stocks: 0,
        bonds: 0,
        gold: 0,
        crypto: 0,
        realEstate: 0,
        debt: 0,
        domesticStocks: 0,
        foreignStocks: 0
      }
    }
    
    // 자산 유형별 분류 (7개 카테고리로 단순화)
    let stocksTotal = 0
    let bondsTotal = 0
    let goldTotal = 0
    let cryptoTotal = 0
    
    for (const stock of stocks) {
      const stockValue = await convertStockValueToKrw(stock)
      
      // 가상화폐 판별
      if (stock.sector === '가상화폐' || 
          ['BINANCE', 'BITHUMB'].includes(stock.exchange) ||
          stock.name.includes('비트코인') ||
          stock.name.includes('Bitcoin') ||
          stock.name.includes('BTC') ||
          stock.name.includes('이더리움') ||
          stock.name.includes('Ethereum') ||
          stock.name.includes('ETH')) {
        cryptoTotal += stockValue
      }
      // 금 판별  
      else if (stock.name.includes('금') ||
               stock.name.includes('Gold') ||
               stock.name.includes('GOLD') ||
               stock.name.includes('골드') ||
               stock.symbol.includes('GLD') ||
               stock.sector === '원자재') {
        goldTotal += stockValue
      }
      // 채권 판별
      else if (stock.sector === '채권' ||
               stock.name.includes('채권') ||
               stock.name.includes('Bond') ||
               stock.name.includes('BOND') ||
               stock.name.includes('회사채') ||
               stock.name.includes('국고채') ||
               stock.name.includes('TIPS') ||
               stock.name.includes('Treasury')) {
        bondsTotal += stockValue
      }
      // 나머지는 모두 주식 (ETF 포함)
      else {
        stocksTotal += stockValue
      }
    }
    
    // 총 자산 기준으로 비율 계산 (부채는 별도 표시)
    const totalPositiveAssets = totalCash + totalSavings + stocksTotal + bondsTotal + goldTotal + cryptoTotal + totalRealEstate
    
    if (totalPositiveAssets <= 0) {
      return {
        cash: 0,
        stocks: 0,
        bonds: 0,
        gold: 0,
        crypto: 0,
        realEstate: 0,
        domesticStocks: 0,
        foreignStocks: 0
      }
    }
    
    return {
      cash: (totalCash + totalSavings) / totalPositiveAssets * 100,
      stocks: stocksTotal / totalPositiveAssets * 100,
      bonds: bondsTotal / totalPositiveAssets * 100,
      gold: goldTotal / totalPositiveAssets * 100,
      crypto: cryptoTotal / totalPositiveAssets * 100,
      realEstate: totalRealEstate / totalPositiveAssets * 100,
      domesticStocks: stocksTotal / totalPositiveAssets * 100 * 0.6, // 예시: 60% 국내
      foreignStocks: stocksTotal / totalPositiveAssets * 100 * 0.4   // 예시: 40% 해외
    }
  }, [cashAccounts, stocks, realEstate, savings, loans, convertToKrwTotal, convertStockValueToKrw])

  // 데이터 로딩
  const loadDashboardData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      // 로컬 데이터로부터 실제 자산 요약 계산
      const realSummary = await calculateRealAssetSummary()
      const realAllocation = await calculateRealAssetAllocation()
      
      console.log('💡 계산된 실제 자산 요약:', realSummary)
      console.log('💡 계산된 실제 자산 배분:', realAllocation)
      
      // 로컬 계산 데이터 우선 설정
      setAssetSummary(realSummary)
      setAssetAllocation(realAllocation)
      
      // API에서 시장 데이터와 차트 데이터 가져오기
      const [marketDataResponse, chartDataResponse] = await Promise.all([
        apiService.getMarketData(),
        apiService.getChartData(selectedTimeRange)
      ])

      setMarketData(marketDataResponse)
      
      // 뱅크샐러드 월별 데이터가 있으면 차트 데이터로 변환
      if (financialData?.monthly) {
        const bankSaladChartData = financialData.monthly.map((month: any) => ({
          date: month.date,
          totalAssets: month.income,
          netWorth: month.netIncome,
          target: 0,
          income: month.income,
          expense: month.expense
        }))
        setChartData(bankSaladChartData)
      } else {
        setChartData(chartDataResponse)
      }
      setLastUpdateTime(new Date())
      
      console.log('✅ Dashboard data loaded successfully')
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // API 실패시에도 로컬 데이터는 표시
      const realSummary = await calculateRealAssetSummary()
      const realAllocation = await calculateRealAssetAllocation()
      setAssetSummary(realSummary)
      setAssetAllocation(realAllocation)
    } finally {
      setIsLoading(false)
    }
  }, [selectedTimeRange, setAssetSummary, setAssetAllocation, setMarketData, setIsLoading, calculateRealAssetSummary, calculateRealAssetAllocation, financialData])

  // 초기 데이터 로드 및 실시간 업데이트
  useEffect(() => {
    console.log('🔄 Loading dashboard data...')
    loadDashboardData()

    // 자동 백업 시스템 활성화
    setupAutoBackup()

    // 5분마다 데이터 새로고침
    const interval = setInterval(() => {
      console.log('🔄 Refreshing dashboard data...')
      loadDashboardData()
    }, 5 * 60 * 1000)

    return () => {
      console.log('🧹 Cleaning up dashboard interval')
      clearInterval(interval)
    }
  }, [loadDashboardData])

  // 로컬 데이터 변경시 자동 업데이트
  useEffect(() => {
    const updateLocalData = async () => {
      console.log('📊 로컬 데이터 변경 감지 - 자산 요약 재계산')
      const realSummary = await calculateRealAssetSummary()
      const realAllocation = await calculateRealAssetAllocation()
      setAssetSummary(realSummary)
      setAssetAllocation(realAllocation)
      setLastUpdateTime(new Date())
    }
    updateLocalData()
  }, [cashAccounts, stocks, realEstate, savings, loans, financialData, calculateRealAssetSummary, calculateRealAssetAllocation, setAssetSummary, setAssetAllocation])

  // WebSocket 연결 (실시간 주가) - 개발환경에서는 비활성화
  useEffect(() => {
    // WebSocket이 활성화된 경우에만 연결
    if (import.meta.env.VITE_ENABLE_WEBSOCKET === 'true') {
      const ws = apiService.connectWebSocket((data) => {
        if (data.type === 'market_update') {
          setMarketData(data.payload)
        }
      })

      return () => {
        ws.close()
      }
    }
  }, [setMarketData])

  if (!assetSummary || !assetAllocation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="mobile-container space-y-3 sm:space-y-4 lg:space-y-6">
      {/* 헤더 - 모바일 최적화 */}
      <div className="flex flex-col space-y-2 sm:space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="space-y-1">
          <h1 className="mobile-title">자산 현황</h1>
          <p className="mobile-subtitle mobile-text-wrap">
            포트폴리오 종합 관리
          </p>
        </div>
        
        {/* 모바일 헤더 버튼들 */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Badge variant="outline" className="mobile-hide text-xs px-2 py-1">
            {lastUpdateTime.toLocaleTimeString('ko-KR')}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            disabled={isLoading}
            className="mobile-button flex-shrink-0"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="mobile-only">새로고침</span>
            <span className="mobile-hide">새로고침</span>
          </Button>
          <div className="mobile-hide">
            <BackupManager />
          </div>
          <Button 
            size="sm"
            onClick={() => alert('알림 설정 기능은 준비 중입니다.')}
            className="mobile-button mobile-hide"
          >
            <Bell className="h-3 w-3 mr-1" />
            알림
          </Button>
        </div>
      </div>

      {/* 핵심 지표 카드 */}
      <div className="mobile-grid gap-3 sm:gap-6">
        <MetricCard
          title="총 자산"
          value={assetSummary.totalAssets}
          change={assetSummary.monthlyChange}
          format="currency"
          icon={<Wallet className="h-4 w-4" />}
          subtitle="모든 자산의 합계"
        />
        
        <MetricCard
          title="순 자산"
          value={assetSummary.netWorth}
          format="currency"
          icon={<TrendingUp className="h-4 w-4" />}
          subtitle="총자산 - 총부채"
        />
        
        <MetricCard
          title="연간 수익률"
          value={assetSummary.ytdReturn}
          format="percent"
          icon={<Award className="h-4 w-4" />}
          subtitle="올해 누적 수익률"
        />
        
        <MetricCard
          title="목표 달성률"
          value={assetSummary.goalAchievement}
          format="percent"
          icon={<Target className="h-4 w-4" />}
          subtitle="연간 목표 대비"
        />
      </div>

      {/* 차트 섹션 - 모바일 최적화 */}
      <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
        <div className="lg:col-span-2">
          <AssetChart
            data={chartData}
            selectedRange={selectedTimeRange}
            onRangeChange={setSelectedTimeRange}
          />
        </div>
        
        <div className="space-y-4 lg:space-y-6">
          <AssetAllocationChart
            allocation={assetAllocation}
            summary={assetSummary}
          />
          
          <MarketOverview marketData={marketData || { kospi: { value: 0, change: 0, changePercent: 0 }, sp500: { value: 0, change: 0, changePercent: 0 }, usdKrw: { value: 0, change: 0, changePercent: 0 } }} />
        </div>
      </div>

      {/* 빠른 액션 - 모바일 최적화 */}
      <Card className="mobile-card">
        <CardHeader className="mobile-card-header">
          <CardTitle className="mobile-card-title">빠른 액션</CardTitle>
          <p className="mobile-text text-muted-foreground mobile-hide">
            자주 사용하는 기능들을 바로 실행하세요
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <Button 
              variant="outline" 
              className="mobile-button h-16 sm:h-20 flex-col hover:bg-primary/10 transition-colors touch-target"
              onClick={() => handleQuickAction('transaction')}
            >
              <Wallet className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm mobile-text-wrap">거래 입력</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="mobile-button h-16 sm:h-20 flex-col hover:bg-primary/10 transition-colors touch-target"
              onClick={() => handleQuickAction('portfolio')}
            >
              <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm mobile-text-wrap">포트폴리오</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="mobile-button h-16 sm:h-20 flex-col hover:bg-primary/10 transition-colors touch-target"
              onClick={() => handleQuickAction('goals')}
            >
              <Target className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm mobile-text-wrap">목표 설정</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="mobile-button h-16 sm:h-20 flex-col hover:bg-primary/10 transition-colors touch-target"
              onClick={() => handleQuickAction('analysis')}
            >
              <Award className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm mobile-text-wrap">성과 분석</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 최근 활동 요약 - 모바일 최적화 */}
      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <Card className="mobile-card">
          <CardHeader className="mobile-card-header">
            <CardTitle className="mobile-card-title">최근 거래</CardTitle>
            <p className="mobile-text text-muted-foreground mobile-hide">
              최근 7일간의 주요 거래 내역
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mobile-text font-medium mobile-text-wrap">삼성전자 매수</p>
                      <p className="text-xs text-muted-foreground">2024.01.1{i}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="mobile-number font-medium text-success">
                      +{formatCurrency(Math.random() * 1000000 + 500000)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mobile-card">
          <CardHeader className="mobile-card-header">
            <CardTitle className="mobile-card-title">투자 알림</CardTitle>
            <p className="mobile-text text-muted-foreground mobile-hide">
              포트폴리오 관련 중요 알림
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-warning/10 rounded-lg">
                <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-warning mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="mobile-text font-medium mobile-text-wrap">리밸런싱 필요</p>
                  <p className="text-xs text-muted-foreground mobile-text-wrap">
                    현금 비중이 목표치를 15%p 초과
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-success/10 rounded-lg">
                <Award className="h-3 w-3 sm:h-4 sm:w-4 text-success mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="mobile-text font-medium mobile-text-wrap">배당금 수령</p>
                  <p className="text-xs text-muted-foreground mobile-text-wrap">
                    삼성전자 배당금 {formatCurrency(125000)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-primary/10 rounded-lg">
                <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="mobile-text font-medium mobile-text-wrap">목표 달성</p>
                  <p className="text-xs text-muted-foreground mobile-text-wrap">
                    연간 수익률 목표의 78% 달성
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}