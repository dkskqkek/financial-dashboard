import React, { useEffect, useState } from 'react'
import { useAppStore } from '@/stores'
import { apiService } from '@/services/api'
import { exchangeRateService } from '@/services/exchangeRateService'
import { yahooFinanceService } from '@/services/yahooFinance'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  RefreshCw,
  Edit,
  Trash2,
} from 'lucide-react'
import { AddStockTransactionForm } from '@/components/forms/AddStockTransactionForm'
import { StockDisplayCell } from '@/components/StockDisplayCell'
import { StockWeightDisplay } from '@/components/StockWeightDisplay'
import { StockWeightCell } from '@/components/StockWeightCell'
import { formatCurrency, formatPercent, getColorByValue } from '@/lib/utils'
import type { Stock } from '@/types'

export function StocksPage() {
  const {
    stocks,
    setStocks,
    deleteStock,
    updateStock,
    isLoading,
    setIsLoading,
    exchangeRate,
    updateExchangeRate,
    convertStockValueToKrw,
  } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExchange, setSelectedExchange] = useState<string>('all')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingStock, setEditingStock] = useState<Stock | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: '',
    quantity: '',
    averagePrice: '',
    sector: '',
  })
  const [selectedSector, setSelectedSector] = useState<string>('all')
  const [totalMarketValueKrw, setTotalMarketValueKrw] = useState<number>(0)
  const [totalUnrealizedPnLKrw, setTotalUnrealizedPnLKrw] = useState<number>(0)
  const [sortedStocksKrw, setSortedStocksKrw] = useState<{ stock: Stock; krwValue: number }[]>([])

  // 페이지 로드 시 환율 업데이트 및 총 금액 계산
  useEffect(() => {
    const initializeData = async () => {
      // 환율 업데이트
      if (!exchangeRate) {
        await updateExchangeRate()
      }

      // 총 금액 계산 (환율 변환 적용)
      updateStockTotals(stocks)
    }

    initializeData()
  }, [])

  const updateStockTotals = React.useCallback(
    async (stocksToCalculate: Stock[]) => {
      if (!stocksToCalculate || stocksToCalculate.length === 0) {
        setTotalMarketValueKrw(0)
        setTotalUnrealizedPnLKrw(0)
        return
      }

      try {
        let totalMarketValue = 0
        let totalUnrealizedPnL = 0

        for (const stock of stocksToCalculate) {
          const marketValueKrw = await convertStockValueToKrw(stock)
          totalMarketValue += marketValueKrw

          // 손익도 환율 적용
          if (stock.currency === 'USD') {
            const unrealizedPnLKrw = await exchangeRateService.convertUsdToKrw(stock.unrealizedPnL)
            totalUnrealizedPnL += unrealizedPnLKrw
          } else {
            totalUnrealizedPnL += stock.unrealizedPnL
          }
        }

        setTotalMarketValueKrw(totalMarketValue)
        setTotalUnrealizedPnLKrw(totalUnrealizedPnL)
      } catch (error) {
        console.error('총액 계산 실패:', error)
      }
    },
    [convertStockValueToKrw]
  )

  // 주식 데이터가 변경될 때마다 총 금액 재계산 (디바운싱)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const filteredStocks = (stocks || []).filter(stock => {
        const matchesSearch =
          stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesExchange = selectedExchange === 'all' || stock.exchange === selectedExchange
        const matchesSector = selectedSector === 'all' || stock.sector === selectedSector

        return matchesSearch && matchesExchange && matchesSector
      })
      updateStockTotals(filteredStocks)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [stocks, searchTerm, selectedExchange, selectedSector, updateStockTotals])

  // 개별 주식 시세 업데이트 함수
  const updateIndividualStockPrices = async () => {
    console.log('🔄 개별 주식 시세 업데이트 시작')
    const updatedStocks = [...stocks]
    let updateCount = 0

    for (let i = 0; i < updatedStocks.length; i++) {
      const stock = updatedStocks[i]
      try {
        // Yahoo Finance API로 현재 주가 조회
        const quotes = await yahooFinanceService.getQuotes([stock.symbol])
        if (quotes && quotes.length > 0 && quotes[0].regularMarketPrice) {
          const oldPrice = stock.currentPrice
          const currentPrice = quotes[0].regularMarketPrice
          updatedStocks[i] = {
            ...stock,
            currentPrice: currentPrice,
            marketValue: stock.quantity * currentPrice,
            unrealizedPnL: (currentPrice - stock.averagePrice) * stock.quantity,
            lastUpdated: new Date().toISOString(),
          }
          console.log(`✅ ${stock.symbol}: ${oldPrice} → ${currentPrice}`)
          updateCount++
        }
      } catch (error) {
        console.warn(`❌ ${stock.symbol} 시세 업데이트 실패:`, error)
      }
    }

    if (updateCount > 0) {
      setStocks(updatedStocks)
      console.log(`✅ ${updateCount}개 주식 시세 업데이트 완료`)
      alert(`${updateCount}개 주식의 시세가 업데이트되었습니다.`)
    } else {
      console.warn('⚠️ 시세 업데이트된 주식이 없습니다')
      alert('시세를 업데이트할 수 없었습니다.')
    }
  }

  const loadStocks = async () => {
    setIsLoading(true)
    try {
      const stockData = await apiService.getStocks()
      console.log('📊 API에서 받은 주식 데이터:', stockData)

      // API에서 유효한 데이터를 받았을 때만 업데이트
      if (stockData && stockData.length > 0) {
        console.log('✅ 유효한 주식 데이터로 업데이트:', stockData.length, '개')
        setStocks(stockData)
      } else {
        console.warn('⚠️ API에서 빈 데이터 반환 - 기존 데이터의 시세만 개별 업데이트')
        // 기존 주식들의 시세를 개별로 업데이트
        await updateIndividualStockPrices()
      }
    } catch (error) {
      console.error('❌ 시세 업데이트 실패:', error)
      alert('시세 업데이트에 실패했습니다. 기존 데이터를 유지합니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 주식 수정 모달 열기
  const handleEditStock = (stock: Stock) => {
    setEditingStock(stock)
    setEditFormData({
      name: stock.name,
      quantity: stock.quantity.toString(),
      averagePrice: stock.averagePrice.toString(),
      sector: stock.sector,
    })
    setEditModalOpen(true)
  }

  // 주식 수정 저장
  const handleSaveEdit = () => {
    if (!editingStock) {
      return
    }

    const updatedStock = {
      ...editingStock,
      name: editFormData.name,
      quantity: Number(editFormData.quantity),
      averagePrice: Number(editFormData.averagePrice),
      sector: editFormData.sector,
      marketValue: Number(editFormData.quantity) * editingStock.currentPrice,
      unrealizedPnL: (editingStock.currentPrice - Number(editFormData.averagePrice)) * Number(editFormData.quantity),
    }

    updateStock(editingStock.id, updatedStock)
    setEditModalOpen(false)
    setEditingStock(null)
  }

  // 수정 모달 닫기
  const handleCancelEdit = () => {
    setEditModalOpen(false)
    setEditingStock(null)
    setEditFormData({
      name: '',
      quantity: '',
      averagePrice: '',
      sector: '',
    })
  }

  const filteredStocks = (stocks || []).filter(stock => {
    const matchesSearch =
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesExchange = selectedExchange === 'all' || stock.exchange === selectedExchange
    const matchesSector = selectedSector === 'all' || stock.sector === selectedSector

    return matchesSearch && matchesExchange && matchesSector
  })

  // 포트폴리오 통계 계산 (KRW 변환 적용)
  const totalCost = totalMarketValueKrw - totalUnrealizedPnLKrw
  const totalReturn = totalCost !== 0 ? (totalUnrealizedPnLKrw / totalCost) * 100 : 0

  // 섹터별 분석 (환율 변환 적용)
  const [sectorData, setSectorData] = useState<Record<string, number>>({})
  const [exchangeData, setExchangeData] = useState<Record<string, number>>({})

  // 섹터/거래소별 데이터 계산 (환율 변환 적용) - 디바운싱 적용
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const filteredStocks = (stocks || []).filter(stock => {
        const matchesSearch =
          stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesExchange = selectedExchange === 'all' || stock.exchange === selectedExchange
        const matchesSector = selectedSector === 'all' || stock.sector === selectedSector

        return matchesSearch && matchesExchange && matchesSector
      })

      if (filteredStocks.length === 0) {
        setSectorData({})
        setExchangeData({})
        setSortedStocksKrw([])
        return
      }

      try {
        const newSectorData: Record<string, number> = {}
        const newExchangeData: Record<string, number> = {}
        const stocksWithKrwValue: { stock: Stock; krwValue: number }[] = []

        for (const stock of filteredStocks) {
          const stockValueKrw = await convertStockValueToKrw(stock)

          // 정렬용 데이터 저장
          stocksWithKrwValue.push({ stock, krwValue: stockValueKrw })

          // 섹터별 합계
          newSectorData[stock.sector] = (newSectorData[stock.sector] || 0) + stockValueKrw

          // 거래소별 합계
          newExchangeData[stock.exchange] = (newExchangeData[stock.exchange] || 0) + stockValueKrw
        }

        // KRW 가치 기준으로 정렬
        stocksWithKrwValue.sort((a, b) => b.krwValue - a.krwValue)
        setSortedStocksKrw(stocksWithKrwValue)

        setSectorData(newSectorData)
        setExchangeData(newExchangeData)
      } catch (error) {
        console.error('섹터/거래소 데이터 계산 실패:', error)
      }
    }, 200) // 200ms 디바운싱

    return () => clearTimeout(timeoutId)
  }, [stocks, searchTerm, selectedExchange, selectedSector, exchangeRate?.USD_KRW, convertStockValueToKrw])

  const sectorChartData = Object.entries(sectorData).map(([sector, value]) => ({
    name: sector,
    value,
  }))

  const COLORS = ['#1E3A8A', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  const sectors = Array.from(new Set(stocks.map(s => s.sector)))
  const exchanges = Array.from(new Set(stocks.map(s => s.exchange)))

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">주식 포트폴리오</h1>
          <p className="text-muted-foreground">보유 주식과 투자 성과를 관리하세요</p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadStocks} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            시세 업데이트
          </Button>
          <Button
            variant="outline"
            onClick={updateExchangeRate}
            title={`현재 환율: ${exchangeRate?.USD_KRW ? `$1 = ₩${exchangeRate.USD_KRW.toFixed(0)}` : '로딩중'}`}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            환율 새로고침
          </Button>
          <AddStockTransactionForm />
        </div>
      </div>

      {/* 포트폴리오 요약 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 평가금액</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold currency">{formatCurrency(totalMarketValueKrw)}</div>
            <p className="text-xs text-muted-foreground">{filteredStocks.length}개 종목</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평가손익</CardTitle>
            {totalUnrealizedPnLKrw > 0 ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold currency ${getColorByValue(totalUnrealizedPnLKrw)}`}>
              {formatCurrency(totalUnrealizedPnLKrw)}
            </div>
            <p className={`text-xs ${getColorByValue(totalReturn)}`}>{formatPercent(totalReturn)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">투자원금</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold currency">{formatCurrency(totalCost)}</div>
            <p className="text-xs text-muted-foreground">매수 기준</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">수익률</CardTitle>
            <PieIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getColorByValue(totalReturn)}`}>{formatPercent(totalReturn)}</div>
            <p className="text-xs text-muted-foreground">연환산 기준</p>
          </CardContent>
        </Card>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>섹터별 분산</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sectorChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {sectorChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={value => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>보유 비중 Top 5</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedStocksKrw.slice(0, 5).map(({ stock }) => {
                return (
                  <div key={stock.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">{stock.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{stock.name}</p>
                        <p className="text-xs text-muted-foreground">{stock.symbol}</p>
                      </div>
                    </div>
                    <StockWeightDisplay
                      stock={stock}
                      totalMarketValueKrw={totalMarketValueKrw}
                      convertStockValueToKrw={convertStockValueToKrw}
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 보유 종목 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>보유 종목</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="종목명, 심볼로 검색..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedExchange}
                onChange={e => setSelectedExchange(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">모든 거래소</option>
                {exchanges.map(exchange => (
                  <option key={exchange} value={exchange}>
                    {exchange}
                  </option>
                ))}
              </select>

              <select
                value={selectedSector}
                onChange={e => setSelectedSector(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">모든 섹터</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>종목명</TableHead>
                <TableHead className="text-right">보유수량</TableHead>
                <TableHead className="text-right">평균매수가</TableHead>
                <TableHead className="text-right">현재가</TableHead>
                <TableHead className="text-right">평가금액</TableHead>
                <TableHead className="text-right">평가손익</TableHead>
                <TableHead className="text-right">수익률</TableHead>
                <TableHead className="text-right">비중</TableHead>
                <TableHead>섹터</TableHead>
                <TableHead>거래소</TableHead>
                <TableHead className="text-center">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(sortedStocksKrw.length > 0 ? sortedStocksKrw.map(({ stock }) => stock) : filteredStocks).map(stock => {
                const returnRate = ((stock.currentPrice - stock.averagePrice) / stock.averagePrice) * 100
                // weight 계산은 StockWeightCell에서 처리

                return (
                  <TableRow key={stock.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{stock.name}</p>
                        <p className="text-xs text-muted-foreground">{stock.symbol}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{stock.quantity.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">
                      <StockDisplayCell value={stock.averagePrice} currency={stock.currency} />
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <div>
                        <p>
                          <StockDisplayCell value={stock.currentPrice} currency={stock.currency} />
                        </p>
                        <p className={`text-xs ${getColorByValue(stock.dailyChange)}`}>
                          {stock.dailyChange > 0 ? '+' : ''}
                          <StockDisplayCell value={stock.dailyChange} currency={stock.currency} />(
                          {formatPercent(stock.dailyChangePercent)})
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <StockDisplayCell value={stock.marketValue} currency={stock.currency} />
                    </TableCell>
                    <TableCell className={`text-right font-mono ${getColorByValue(stock.unrealizedPnL)}`}>
                      <StockDisplayCell value={stock.unrealizedPnL} currency={stock.currency} />
                    </TableCell>
                    <TableCell className={`text-right font-mono ${getColorByValue(returnRate)}`}>
                      {formatPercent(returnRate)}
                    </TableCell>
                    <TableCell className="text-right">
                      <StockWeightCell
                        stock={stock}
                        totalMarketValueKrw={totalMarketValueKrw}
                        convertStockValueToKrw={convertStockValueToKrw}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{stock.sector}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stock.exchange === 'KRX' ? 'default' : 'secondary'}>{stock.exchange}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditStock(stock)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (window.confirm(`${stock.name} 주식을 삭제하시겠습니까?`)) {
                              deleteStock(stock.id)
                            }
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredStocks.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium text-muted-foreground">보유 주식이 없습니다</p>
              <p className="text-sm text-muted-foreground">첫 번째 주식 투자를 시작해보세요</p>
              <Button
                className="mt-4"
                onClick={() => {
                  // AddStockTransactionForm의 트리거 버튼을 찾아서 클릭
                  const addButton = document.querySelector('[data-testid="add-stock-trigger"]') as HTMLButtonElement
                  if (addButton) {
                    addButton.click()
                  } else {
                    // 대안: 직접 알림
                    alert('주식 추가 기능을 사용하려면 상단의 "매매 기록" 버튼을 클릭하세요.')
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                매수 기록 추가
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 포트폴리오 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>거래소별 분산</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(exchangeData).map(([exchange, value]) => {
                const percentage = totalMarketValueKrw > 0 ? (value / totalMarketValueKrw) * 100 : 0
                return (
                  <div key={exchange} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="font-medium">{exchange}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{percentage.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground currency">{formatCurrency(value)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>수익률 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['20% 이상', '10-20%', '0-10%', '0% 미만'].map((range, index) => {
                let count = 0
                if (range === '20% 이상') {
                  count = filteredStocks.filter(s => {
                    const rate = ((s.currentPrice - s.averagePrice) / s.averagePrice) * 100
                    return rate >= 20
                  }).length
                } else if (range === '10-20%') {
                  count = filteredStocks.filter(s => {
                    const rate = ((s.currentPrice - s.averagePrice) / s.averagePrice) * 100
                    return rate >= 10 && rate < 20
                  }).length
                } else if (range === '0-10%') {
                  count = filteredStocks.filter(s => {
                    const rate = ((s.currentPrice - s.averagePrice) / s.averagePrice) * 100
                    return rate >= 0 && rate < 10
                  }).length
                } else {
                  count = filteredStocks.filter(s => {
                    const rate = ((s.currentPrice - s.averagePrice) / s.averagePrice) * 100
                    return rate < 0
                  }).length
                }

                return (
                  <div key={range} className="flex items-center justify-between">
                    <span className="text-sm">{range}</span>
                    <Badge variant="outline">{count}종목</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>리밸런싱 제안</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-warning/10 rounded-lg">
                <p className="font-medium text-warning">⚠ 집중도 위험</p>
                <p className="text-xs text-muted-foreground mt-1">상위 3종목이 포트폴리오의 60% 이상을 차지합니다</p>
              </div>

              <div className="p-3 bg-success/10 rounded-lg">
                <p className="font-medium text-success">✓ 섹터 분산 양호</p>
                <p className="text-xs text-muted-foreground mt-1">다양한 섹터에 고르게 분산되어 있습니다</p>
              </div>

              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="font-medium text-primary">💡 추천</p>
                <p className="text-xs text-muted-foreground mt-1">해외 주식 비중을 늘려 지역 분산을 고려해보세요</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 주식 수정 모달 */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>주식 정보 수정</DialogTitle>
            <DialogDescription>보유 주식의 정보를 수정할 수 있습니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="stockName" className="text-sm font-medium">
                종목명
              </label>
              <Input
                id="stockName"
                value={editFormData.name}
                onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="종목명을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="quantity" className="text-sm font-medium">
                보유 수량
              </label>
              <Input
                id="quantity"
                type="number"
                value={editFormData.quantity}
                onChange={e => setEditFormData({ ...editFormData, quantity: e.target.value })}
                placeholder="보유 수량을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="averagePrice" className="text-sm font-medium">
                평균 매입가
              </label>
              <Input
                id="averagePrice"
                type="number"
                value={editFormData.averagePrice}
                onChange={e => setEditFormData({ ...editFormData, averagePrice: e.target.value })}
                placeholder="평균 매입가를 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="sector" className="text-sm font-medium">
                섹터
              </label>
              <select
                id="sector"
                value={editFormData.sector}
                onChange={e => setEditFormData({ ...editFormData, sector: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value="">선택안함</option>
                <option value="기술">기술</option>
                <option value="반도체">반도체</option>
                <option value="자동차">자동차</option>
                <option value="금융">금융</option>
                <option value="바이오">바이오</option>
                <option value="에너지">에너지</option>
                <option value="소비재">소비재</option>
                <option value="패시브">패시브</option>
                <option value="채권">채권</option>
                <option value="리츠">리츠</option>
                <option value="원자재">원자재</option>
                <option value="헬스케어">헬스케어</option>
                <option value="통신">통신</option>
                <option value="유틸리티">유틸리티</option>
                <option value="가상화폐">가상화폐</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancelEdit}>
              취소
            </Button>
            <Button type="button" onClick={handleSaveEdit}>
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
