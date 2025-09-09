import React from 'react'
import { useAssetMetrics } from '@/features/dashboard/hooks/useAssetMetrics'
import { useMarketData } from '@/features/dashboard/hooks/useMarketData'
import { Header } from '@/features/dashboard/components/Header'
import { MetricsGrid } from '@/features/dashboard/components/metrics/MetricsGrid'
import { QuickActionsGrid } from '@/features/dashboard/components/actions/QuickActionsGrid'
import { RecentTransactionsCard } from '@/features/dashboard/components/activity/RecentTransactionsCard'
import { InvestmentAlertsCard } from '@/features/dashboard/components/activity/InvestmentAlertsCard'
import {
  LazyAssetChart,
  LazyAssetAllocationChart,
  LazyMarketOverview,
  SafeLazyWrapper,
  ChartSkeleton,
} from '@/components/common/LazyComponents'
// import { setupAutoBackup } from '@/utils/dataBackup' // 임시 비활성화

export function Dashboard() {
  // Custom hooks for data and logic
  const { metrics, isLoading: isMetricsLoading } = useAssetMetrics()
  const {
    marketData,
    chartData,
    isLoading: isMarketLoading,
    lastUpdateTime,
    selectedTimeRange,
    refreshData,
    handleRangeChange,
  } = useMarketData()

  // Setup auto backup once - 임시 비활성화
  // React.useEffect(() => {
  //   setupAutoBackup()
  // }, [])

  // Combined loading state
  const isLoading = isMetricsLoading || isMarketLoading

  if (isMetricsLoading) {
    // Initial loading state
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="mobile-container space-y-3 sm:space-y-4 lg:space-y-6">
      <Header lastUpdateTime={lastUpdateTime} isLoading={isLoading} onRefresh={refreshData} />

      <MetricsGrid summary={metrics.summary} />

      {/* Chart Section */}
      <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
        <div className="lg:col-span-2">
          <SafeLazyWrapper fallback={ChartSkeleton}>
            <LazyAssetChart data={chartData} selectedRange={selectedTimeRange} onRangeChange={handleRangeChange} />
          </SafeLazyWrapper>
        </div>
        <div className="space-y-4 lg:space-y-6">
          <SafeLazyWrapper fallback={ChartSkeleton}>
            <LazyAssetAllocationChart allocation={metrics.allocation} summary={metrics.summary} />
          </SafeLazyWrapper>
          <SafeLazyWrapper fallback={ChartSkeleton}>
            <LazyMarketOverview marketData={marketData} />
          </SafeLazyWrapper>
        </div>
      </div>

      <QuickActionsGrid />

      {/* Recent Activity Section */}
      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <RecentTransactionsCard />
        <InvestmentAlertsCard />
      </div>
    </div>
  )
}
