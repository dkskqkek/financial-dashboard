import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { QuickActionButton } from './QuickActionButton'
import { Wallet, TrendingUp, Target, Award } from 'lucide-react'

export const QuickActionsGrid: React.FC = () => {
  const navigate = useNavigate()

  const handleQuickAction = useCallback(
    (path: string) => {
      navigate(path)
    },
    [navigate]
  )

  const actions = [
    {
      label: '거래 입력',
      icon: <Wallet className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />,
      path: '/transactions',
    },
    {
      label: '포트폴리오',
      icon: <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />,
      path: '/stocks',
    },
    {
      label: '목표 설정',
      icon: <Target className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />,
      path: '/settings',
    },
    {
      label: '성과 분석',
      icon: <Award className="h-4 w-4 sm:h-6 sm:w-6 mb-1 sm:mb-2" />,
      path: '/assets',
    },
  ]

  return (
    <Card className="mobile-card">
      <CardHeader className="mobile-card-header">
        <CardTitle className="mobile-card-title">빠른 액션</CardTitle>
        <p className="mobile-text text-muted-foreground mobile-hide">자주 사용하는 기능들을 바로 실행하세요</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
          {actions.map(action => (
            <QuickActionButton
              key={action.label}
              onClick={() => handleQuickAction(action.path)}
              icon={action.icon}
              label={action.label}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
