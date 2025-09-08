import { yahooFinanceApi } from './yahooFinanceApi'
import type { StockInfo, RealTimeTracker } from './types'

export class RealTimeTrackerService implements RealTimeTracker {
  private intervals: Set<NodeJS.Timeout> = new Set()
  private isTracking = false

  async start(symbols: string[], callback: (data: StockInfo[]) => void): Promise<() => void> {
    const updatePrices = async () => {
      try {
        // Yahoo Finance로 다중 심볼 조회
        const stockInfos = await yahooFinanceApi.getMultipleQuotes(symbols)

        if (stockInfos.length > 0) {
          callback(stockInfos)
        }
      } catch (error) {
        console.error('Real-time price update failed:', error)
      }
    }

    // 초기 로드
    await updatePrices()

    // 10초마다 업데이트 (실시간성 향상)
    const interval = setInterval(updatePrices, 10000)
    this.intervals.add(interval)
    this.isTracking = true

    return () => {
      clearInterval(interval)
      this.intervals.delete(interval)

      if (this.intervals.size === 0) {
        this.isTracking = false
      }
    }
  }

  async startPollingTracker(symbols: string[], callback: (updates: StockInfo[]) => void): Promise<() => void> {
    const updatePrices = async () => {
      const updates: StockInfo[] = []

      for (const symbol of symbols) {
        try {
          // 개별 심볼 조회 (백엔드 API 활용)
          const result = await yahooFinanceApi.searchStock(symbol)
          if (result.success && result.data) {
            updates.push(result.data)
          }
        } catch (error) {
          console.warn(`Failed to update price for ${symbol}:`, error)
        }
      }

      if (updates.length > 0) {
        callback(updates)
      }
    }

    // 초기 로드
    await updatePrices()

    // 10초마다 업데이트
    const interval = setInterval(updatePrices, 10000)
    this.intervals.add(interval)

    return () => {
      clearInterval(interval)
      this.intervals.delete(interval)

      if (this.intervals.size === 0) {
        this.isTracking = false
      }
    }
  }

  stop(): void {
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals.clear()
    this.isTracking = false
  }

  isActive(): boolean {
    return this.isTracking
  }

  getActiveTrackersCount(): number {
    return this.intervals.size
  }
}

export const realTimeTracker = new RealTimeTrackerService()
