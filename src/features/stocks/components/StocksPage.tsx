import React, { useState, useEffect } from 'react'
import { useAppStore } from '@/stores'
import { apiService } from '@/services/api'
import { Button } from '@/components/ui/button'
import { RefreshCw, DollarSign } from 'lucide-react'
import { AddStockTransactionForm } from '@/components/forms/AddStockTransactionForm'

// 새로 분리된 컴포넌트들
import { StockMetrics, StockCharts, StockList, StockAnalytics, StockEditModal } from './index'

// 훅과 서비스
import { useStockPrices } from '../hooks/useStockPrices'
import { useStockCalculations } from '../hooks/useStockCalculations'
import { StockService, createUpdatedStock } from '../services/stockService'

// 타입
import type { Stock, StockFormData } from '../types/stock.types'

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

  // 상태 관리
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExchange, setSelectedExchange] = useState<string>('all')
  const [selectedSector, setSelectedSector] = useState<string>('all')
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingStock, setEditingStock] = useState<Stock | null>(null)
  const [editFormData, setEditFormData] = useState<StockFormData>({
    name: '',
    quantity: '',
    averagePrice: '',
    sector: '',
  })

  // 커스텀 훅 사용
  const { updateStockPricesWithFeedback } = useStockPrices()

  const stockCalculations = useStockCalculations({
    stocks: stocks || [],
    searchTerm,
    selectedExchange,
    selectedSector,
    convertStockValueToKrw,
  })

  // 페이지 로드 시 환율 업데이트
  useEffect(() => {
    const initializeData = async () => {
      if (!exchangeRate) {
        await updateExchangeRate()
      }
    }
    initializeData()
  }, [exchangeRate, updateExchangeRate])

  // 주식 로딩
  const loadStocks = async () => {
    setIsLoading(true)
    try {
      const stockData = await apiService.getStocks()
      console.log('📊 API에서 받은 주식 데이터:', stockData)

      if (stockData && stockData.length > 0) {
        console.log('✅ 유효한 주식 데이터로 업데이트:', stockData.length, '개')
        setStocks(stockData)
      } else {
        console.warn('⚠️ API에서 빈 데이터 반환 - 기존 데이터의 시세만 개별 업데이트')
        await updateStockPricesWithFeedback(stocks || [], setStocks)
      }
    } catch (error) {
      console.error('❌ 시세 업데이트 실패:', error)
      alert('시세 업데이트에 실패했습니다. 기존 데이터를 유지합니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 주식 수정 모달 관리
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

  const handleSaveEdit = () => {
    if (!editingStock) return

    const updatedStock = createUpdatedStock(editingStock, editFormData)
    updateStock(editingStock.id, updatedStock)
    setEditModalOpen(false)
    setEditingStock(null)
  }

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

  const handleDeleteStock = (stockId: string) => {
    deleteStock(stockId)
  }

  // 기존 데이터 가공
  const sectors = Array.from(new Set(stocks?.map(s => s.sector) || []))
  const exchanges = Array.from(new Set(stocks?.map(s => s.exchange) || []))

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
      <StockMetrics
        totalMarketValueKrw={stockCalculations.totalMarketValueKrw}
        totalUnrealizedPnLKrw={stockCalculations.totalUnrealizedPnLKrw}
        totalCost={stockCalculations.totalCost}
        totalReturn={stockCalculations.totalReturn}
        filteredStocksCount={stockCalculations.filteredStocks.length}
      />

      {/* 차트 섹션 */}
      <StockCharts
        sectorData={stockCalculations.sectorData}
        sortedStocksKrw={stockCalculations.sortedStocksKrw}
        totalMarketValueKrw={stockCalculations.totalMarketValueKrw}
        convertStockValueToKrw={convertStockValueToKrw}
      />

      {/* 보유 종목 목록 */}
      <StockList
        filteredStocks={stockCalculations.filteredStocks}
        sortedStocksKrw={stockCalculations.sortedStocksKrw}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedExchange={selectedExchange}
        setSelectedExchange={setSelectedExchange}
        selectedSector={selectedSector}
        setSelectedSector={setSelectedSector}
        sectors={sectors}
        exchanges={exchanges}
        totalMarketValueKrw={stockCalculations.totalMarketValueKrw}
        convertStockValueToKrw={convertStockValueToKrw}
        onEditStock={handleEditStock}
        onDeleteStock={handleDeleteStock}
      />

      {/* 포트폴리오 분석 */}
      <StockAnalytics
        exchangeData={stockCalculations.exchangeData}
        totalMarketValueKrw={stockCalculations.totalMarketValueKrw}
        filteredStocks={stockCalculations.filteredStocks}
      />

      {/* 주식 수정 모달 */}
      <StockEditModal
        isOpen={editModalOpen}
        onOpenChange={setEditModalOpen}
        editingStock={editingStock}
        formData={editFormData}
        setFormData={setEditFormData}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    </div>
  )
}
