import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatNumber, formatPercent } from '@/lib/utils'
import type { MarketData } from '@/types'

interface MarketOverviewProps {
  marketData: MarketData
}

export function MarketOverview({ marketData }: MarketOverviewProps) {
  const markets = [
    {
      name: 'KOSPI',
      value: marketData.kospi.value,
      change: marketData.kospi.change,
      changePercent: marketData.kospi.changePercent,
      description: '한국 종합주가지수',
    },
    {
      name: 'S&P 500',
      value: marketData.sp500.value,
      change: marketData.sp500.change,
      changePercent: marketData.sp500.changePercent,
      description: '미국 대형주 지수',
    },
    {
      name: 'USD/KRW',
      value: marketData.usdKrw.value,
      change: marketData.usdKrw.change,
      changePercent: marketData.usdKrw.changePercent,
      description: '달러-원 환율',
      isExchangeRate: true,
    },
  ]

  return (
    <Card className="mobile-card">
      <CardHeader className="px-3 pt-3 pb-2">
        <CardTitle className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <span className="text-base sm:text-lg">시장 개요</span>
          <Badge variant="outline" className="text-xs self-start sm:self-center">
            실시간
          </Badge>
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground mobile-text">
          주요 지수 및 환율 현황
        </p>
      </CardHeader>
      
      <CardContent className="px-3 pb-3">
        <div className="space-y-3">
          {markets.map((market) => (
            <div
              key={market.name}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 p-2 sm:p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-sm sm:text-base">{market.name}</h4>
                  {market.changePercent > 0 ? (
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-success flex-shrink-0" />
                  ) : (
                    <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-destructive flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 mobile-text">
                  {market.description}
                </p>
              </div>
              
              <div className="text-left sm:text-right">
                <div className="text-base sm:text-lg font-bold currency break-all">
                  {market.isExchangeRate
                    ? `₩${formatNumber(market.value)}`
                    : formatNumber(market.value, 2)}
                </div>
                
                <div className="flex items-center sm:justify-end space-x-1 mt-1 flex-wrap">
                  <Badge
                    variant={market.changePercent > 0 ? 'success' : 'destructive'}
                    className="text-xs whitespace-nowrap"
                  >
                    {market.changePercent > 0 ? '+' : ''}
                    {formatNumber(market.change, 2)}
                  </Badge>
                  <Badge
                    variant={market.changePercent > 0 ? 'success' : 'destructive'}
                    className="text-xs whitespace-nowrap"
                  >
                    {formatPercent(market.changePercent)}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 시장 요약 */}
        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
          <div className="text-xs sm:text-sm text-muted-foreground mb-2 mobile-text">
            시장 상황 요약
          </div>
          <div className="text-xs sm:text-sm space-y-1">
            {marketData.kospi.changePercent > 0 && marketData.sp500.changePercent > 0 && (
              <p className="text-success mobile-text">
                ✓ 국내외 주식시장 모두 상승세
              </p>
            )}
            {marketData.kospi.changePercent < 0 && marketData.sp500.changePercent < 0 && (
              <p className="text-destructive mobile-text">
                ⚠ 국내외 주식시장 모두 하락세
              </p>
            )}
            {marketData.usdKrw.changePercent > 2 && (
              <p className="text-warning mobile-text">
                ⚠ 환율 급등 (2%↑)
              </p>
            )}
            {marketData.usdKrw.changePercent < -2 && (
              <p className="text-success mobile-text">
                ✓ 원화 강세 (2%↓)
              </p>
            )}
            {Math.abs(marketData.kospi.changePercent) < 1 && 
             Math.abs(marketData.sp500.changePercent) < 1 && (
              <p className="text-muted-foreground mobile-text">
                ≡ 주식시장 보합세 유지
              </p>
            )}
          </div>
        </div>
        
        {/* 마지막 업데이트 시간 */}
        <div className="mt-3 sm:mt-4 text-xs text-muted-foreground text-center mobile-text">
          {marketData.kospi.isRealTime || marketData.sp500.isRealTime ? (
            <span className="text-green-600">● 실시간 데이터</span>
          ) : (
            <span className="text-orange-500">● 마지막 거래일 데이터</span>
          )}
          <br />
          업데이트: {new Date().toLocaleTimeString('ko-KR')}
        </div>
      </CardContent>
    </Card>
  )
}