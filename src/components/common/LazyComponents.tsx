import React, { lazy, Suspense } from 'react'
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton'

// Lazy로드된 컴포넌트들
export const LazyAssetChart = lazy(() =>
  import('@/components/dashboard/AssetChart').then(module => ({
    default: module.AssetChart,
  }))
)

export const LazyAssetAllocationChart = lazy(() =>
  import('@/components/dashboard/AssetAllocationChart').then(module => ({
    default: module.AssetAllocationChart,
  }))
)

export const LazyMarketOverview = lazy(() =>
  import('@/components/dashboard/MarketOverview').then(module => ({
    default: module.MarketOverview,
  }))
)

export const LazyBackupManager = lazy(() =>
  import('@/components/ui/BackupManager').then(module => ({
    default: module.BackupManager,
  }))
)

// 로딩 스켈레톤 컴포넌트들
export const ChartSkeleton = () => (
  <div className="mobile-card">
    <div className="mobile-card-header">
      <div className="h-5 w-1/3 skeleton"></div>
      <div className="h-4 w-1/2 skeleton mt-2"></div>
    </div>
    <div className="h-64 skeleton rounded-lg"></div>
  </div>
)

export const MetricsSkeleton = () => (
  <div className="mobile-stat-grid">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="mobile-card mobile-stat-card">
        <div className="skeleton-avatar mx-auto mb-3"></div>
        <div className="h-6 w-20 skeleton mx-auto mb-2"></div>
        <div className="h-4 w-16 skeleton mx-auto"></div>
      </div>
    ))}
  </div>
)

export const MarketOverviewSkeleton = () => <SkeletonCard className="h-48" />

// HOC for lazy loading with skeleton
interface LazyWrapperProps {
  fallback?: React.ComponentType
  children: React.ReactNode
}

export function LazyWrapper({ fallback: FallbackComponent = ChartSkeleton, children }: LazyWrapperProps) {
  return <Suspense fallback={<FallbackComponent />}>{children}</Suspense>
}

// 차트 전용 래퍼
export function ChartWrapper({ children }: { children: React.ReactNode }) {
  return <LazyWrapper fallback={ChartSkeleton}>{children}</LazyWrapper>
}

// 메트릭 전용 래퍼
export function MetricsWrapper({ children }: { children: React.ReactNode }) {
  return <LazyWrapper fallback={MetricsSkeleton}>{children}</LazyWrapper>
}

// 에러 바운더리와 함께 사용하는 안전한 래퍼
export class SafeLazyWrapper extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    console.error('LazyWrapper getDerivedStateFromError:', error)
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyWrapper componentDidCatch:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || ChartSkeleton
      return <FallbackComponent />
    }

    return (
      <Suspense fallback={React.createElement(this.props.fallback || ChartSkeleton)}>{this.props.children}</Suspense>
    )
  }
}
