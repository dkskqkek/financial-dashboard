import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, Award, Target } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// TODO: 실제 데이터 타입을 정의하고 props로 받아야 함
const mockAlerts = [
  {
    id: 1,
    type: 'warning',
    icon: <Bell className="h-3 w-3 sm:h-4 sm:w-4 text-warning mt-0.5 flex-shrink-0" />,
    title: '리밸런싱 필요',
    description: '현금 비중이 목표치를 15%p 초과',
  },
  {
    id: 2,
    type: 'success',
    icon: <Award className="h-3 w-3 sm:h-4 sm:w-4 text-success mt-0.5 flex-shrink-0" />,
    title: '배당금 수령',
    description: `삼성전자 배당금 ${formatCurrency(125000)}`,
  },
  {
    id: 3,
    type: 'info',
    icon: <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary mt-0.5 flex-shrink-0" />,
    title: '목표 달성',
    description: '연간 수익률 목표의 78% 달성',
  },
]

const alertBgClasses = {
  warning: 'bg-warning/10',
  success: 'bg-success/10',
  info: 'bg-primary/10',
}

export const InvestmentAlertsCard: React.FC = () => {
  return (
    <Card className="mobile-card">
      <CardHeader className="mobile-card-header">
        <CardTitle className="mobile-card-title">투자 알림</CardTitle>
        <p className="mobile-text text-muted-foreground mobile-hide">포트폴리오 관련 중요 알림</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-3">
          {mockAlerts.map(alert => (
            <div
              key={alert.id}
              className={`flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg ${alertBgClasses[alert.type]}`}
            >
              {alert.icon}
              <div className="min-w-0 flex-1">
                <p className="mobile-text font-medium mobile-text-wrap">{alert.title}</p>
                <p className="text-xs text-muted-foreground mobile-text-wrap">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
