import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Edit, Trash2, Plus, TrendingUp } from 'lucide-react'
import { StockDisplayCell } from '@/components/StockDisplayCell'
import { StockWeightCell } from '@/components/StockWeightCell'
import { formatPercent, getColorByValue } from '@/lib/utils'
import { calculateReturnRate } from '../utils/stockCalculations'
import type { Stock, StockKrwValue } from '../types/stock.types'

interface StockListProps {
  filteredStocks: Stock[]
  sortedStocksKrw: StockKrwValue[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedExchange: string
  setSelectedExchange: (exchange: string) => void
  selectedSector: string
  setSelectedSector: (sector: string) => void
  sectors: string[]
  exchanges: string[]
  totalMarketValueKrw: number
  convertStockValueToKrw: (stock: Stock) => Promise<number>
  onEditStock: (stock: Stock) => void
  onDeleteStock: (stockId: string) => void
}

export function StockList({
  filteredStocks,
  sortedStocksKrw,
  searchTerm,
  setSearchTerm,
  selectedExchange,
  setSelectedExchange,
  selectedSector,
  setSelectedSector,
  sectors,
  exchanges,
  totalMarketValueKrw,
  convertStockValueToKrw,
  onEditStock,
  onDeleteStock
}: StockListProps) {
  // 정렬된 주식이 있으면 그것을 사용하고, 없으면 필터된 주식을 사용
  const displayStocks = sortedStocksKrw.length > 0 
    ? sortedStocksKrw.map(({ stock }) => stock) 
    : filteredStocks

  return (
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
            {displayStocks.map(stock => {
              const returnRate = calculateReturnRate(stock.currentPrice, stock.averagePrice)

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
                      <Button variant="ghost" size="sm" onClick={() => onEditStock(stock)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`${stock.name} 주식을 삭제하시겠습니까?`)) {
                            onDeleteStock(stock.id)
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
  )
}