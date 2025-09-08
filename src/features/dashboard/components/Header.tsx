import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Bell } from 'lucide-react'
import { LazyBackupManager } from '@/components/common/LazyComponents'

interface DashboardHeaderProps {
  lastUpdateTime: Date | null
  isLoading: boolean
  onRefresh: () => void
}

export const Header: React.FC<DashboardHeaderProps> = ({ lastUpdateTime, isLoading, onRefresh }) => {
  return (
    <div className="flex flex-col space-y-2 sm:space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
      <div className="space-y-1">
        <h1 className="mobile-title">자산 현황</h1>
        <p className="mobile-subtitle mobile-text-wrap">포트폴리오 종합 관리</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {lastUpdateTime && (
          <Badge variant="outline" className="mobile-hide text-xs px-2 py-1">
            {lastUpdateTime.toLocaleTimeString('ko-KR')}
          </Badge>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="mobile-button flex-shrink-0"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="mobile-only">새로고침</span>
          <span className="mobile-hide">새로고침</span>
        </Button>
        <div className="mobile-hide">
          <LazyBackupManager />
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
  )
}
