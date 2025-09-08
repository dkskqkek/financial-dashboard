import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/stores'
import { Bell, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Notification {
  id: string
  type: 'price_alert' | 'dividend' | 'goal_achieved' | 'market_update'
  title: string
  message: string
  time: string
  read: boolean
  icon: React.ReactNode
  priority: 'high' | 'medium' | 'low'
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'price_alert',
    title: '주가 급등 알림',
    message: '삼성전자가 설정한 목표가 85,000원을 달성했습니다.',
    time: '5분 전',
    read: false,
    icon: <TrendingUp className="h-4 w-4 text-green-500" />,
    priority: 'high',
  },
  {
    id: '2',
    type: 'dividend',
    title: '배당금 지급',
    message: 'SK하이닉스 배당금 1,000원이 내일 지급됩니다.',
    time: '1시간 전',
    read: false,
    icon: <CheckCircle className="h-4 w-4 text-blue-500" />,
    priority: 'medium',
  },
  {
    id: '3',
    type: 'market_update',
    title: '시장 하락',
    message: 'KOSPI가 2% 이상 하락했습니다. 포트폴리오를 확인해보세요.',
    time: '2시간 전',
    read: true,
    icon: <TrendingDown className="h-4 w-4 text-red-500" />,
    priority: 'high',
  },
]

export function NotificationDropdown() {
  const unreadCount = mockNotifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    // 실제 구현에서는 Zustand store를 통해 상태를 업데이트
    console.log('Mark notification as read:', id)
  }

  const markAllAsRead = () => {
    // 모든 알림을 읽음 처리
    console.log('Mark all notifications as read')
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={5}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">알림</CardTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="text-xs h-auto p-1 px-2" onClick={markAllAsRead}>
                  모두 읽음
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {mockNotifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">새로운 알림이 없습니다.</div>
              ) : (
                <div className="space-y-1">
                  {mockNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 ${
                        !notification.read ? 'bg-muted/30' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">{notification.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}
                            >
                              {notification.title}
                            </p>
                            <div className="flex items-center space-x-2">
                              {notification.priority === 'high' && (
                                <AlertTriangle className="h-3 w-3 text-orange-500" />
                              )}
                              {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            {mockNotifications.length > 0 && (
              <div className="p-3 border-t">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  모든 알림 보기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
