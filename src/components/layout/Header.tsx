import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { NotificationDropdown } from '@/components/ui/NotificationDropdown'
import { useAppStore } from '@/stores'
import {
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  Settings,
  LogOut,
} from 'lucide-react'

export function Header() {
  const { sidebarOpen, setSidebarOpen, isDarkMode, toggleDarkMode } = useAppStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    // 실제 구현에서는 로그아웃 로직 추가 (세션 초기화, 토큰 제거 등)
    if (window.confirm('로그아웃 하시겠습니까?')) {
      // 로그인 페이지로 리다이렉트 (현재는 대시보드로)
      navigate('/')
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 lg:px-6">
        {/* 사이드바 토글 (모바일) */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-2"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* 검색 */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="거래 내역, 종목명 등을 검색하세요..."
              className="pl-10 pr-4 h-9 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* 우측 액션들 */}
        <div className="flex items-center space-x-2 ml-4">
          {/* 알림 */}
          <NotificationDropdown />

          {/* 다크모드 토글 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* 설정 */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* 로그아웃 */}
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}