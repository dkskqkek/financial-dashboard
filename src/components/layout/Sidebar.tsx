import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  Home,
  Wallet,
  Receipt,
  TrendingUp,
  PiggyBank,
  Building,
  Calendar,
  Settings,
  ChevronLeft,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAppStore } from '@/stores'

const navigation = [
  { name: '대시보드', href: '/', icon: Home },
  { name: '자산 상세', href: '/assets', icon: Wallet },
  { name: '계좌 관리', href: '/accounts', icon: Building },
  { name: '거래 내역', href: '/transactions', icon: Receipt },
  { name: '주식 포트폴리오', href: '/stocks', icon: TrendingUp },
  { name: '예적금', href: '/savings', icon: PiggyBank },
  { name: '부동산/대출', href: '/real-estate', icon: Building },
  { name: '월별 요약', href: '/monthly', icon: Calendar },
  { name: '설정', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, user } = useAppStore()
  const location = useLocation()

  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-card border-r transform transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0 lg:static lg:inset-0'
      )}
    >
      <div className="flex flex-col h-full">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">FinanceDash</h1>
              <p className="text-xs text-muted-foreground">개인 자산 관리</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* 사용자 정보 */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name || '사용자'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors group touch-target',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )
                }
              >
                <item.icon
                  className={cn(
                    'mr-3 h-4 w-4 transition-colors',
                    isActive
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground group-hover:text-accent-foreground'
                  )}
                />
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        {/* 푸터 */}
        <div className="p-4 border-t">
          <div className="text-xs text-muted-foreground text-center">
            <p>FinanceDash v1.0</p>
            <p className="mt-1">© 2024 Personal Finance</p>
          </div>
        </div>
      </div>
    </div>
  )
}