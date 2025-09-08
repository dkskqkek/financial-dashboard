import React from 'react'
import { Button } from '@/components/ui/button'
import { AddTransactionForm } from '@/components/forms/AddTransactionForm'
import { RefreshCw, Download } from 'lucide-react'

interface TransactionHeaderProps {
  onRefresh: () => void
  isLoading: boolean
}

export const TransactionHeader: React.FC<TransactionHeaderProps> = ({ onRefresh, isLoading }) => {
  return (
    <div className="flex flex-col space-y-2 sm:space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
      <div className="space-y-1">
        <h1 className="mobile-title">거래 내역</h1>
        <p className="mobile-subtitle mobile-text-wrap">모든 거래를 추적하고 분석하세요</p>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3">
        <Button variant="outline" onClick={onRefresh} disabled={isLoading} className="mobile-button">
          <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="mobile-hide">새로고침</span>
          <span className="mobile-only">새로고침</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => alert('데이터 내보내기 기능은 준비 중입니다.')}
          className="mobile-button mobile-hide"
        >
          <Download className="h-3 w-3 mr-1" />
          내보내기
        </Button>
        <AddTransactionForm />
      </div>
    </div>
  )
}
