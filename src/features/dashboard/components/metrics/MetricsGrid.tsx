import React from 'react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { Wallet, TrendingUp, Target, Award } from 'lucide-react'
import type { AssetSummary } from '../../utils/assetCalculator'

interface MetricsGridProps {
  summary: AssetSummary
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ summary }) => {
  return (
    <div className="mobile-grid gap-3 sm:gap-6">
      <MetricCard
        title="총 자산"
        value={summary.totalAssets}
        change={summary.monthlyChange}
        format="currency"
        icon={<Wallet className="h-4 w-4" />}
        subtitle="모든 자산의 합계"
      />
      <MetricCard
        title="순 자산"
        value={summary.netWorth}
        format="currency"
        icon={<TrendingUp className="h-4 w-4" />}
        subtitle="총자산 - 총부채"
      />
      <MetricCard
        title="연간 수익률"
        value={summary.ytdReturn}
        format="percent"
        icon={<Award className="h-4 w-4" />}
        subtitle="올해 누적 수익률"
      />
      <MetricCard
        title="목표 달성률"
        value={summary.goalAchievement}
        format="percent"
        icon={<Target className="h-4 w-4" />}
        subtitle="연간 목표 대비"
      />
    </div>
  )
}
