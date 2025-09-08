import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { PWAInstaller } from '@/components/ui/PWAInstaller'
import { useAppStore } from '@/stores'
import { cn } from '@/lib/utils'

export function Layout() {
  const { sidebarOpen, setSidebarOpen, isDarkMode } = useAppStore()

  // 다크모드 적용
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // 모바일에서 라우트 변경시 사이드바 닫기
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setSidebarOpen])

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      <Sidebar />

      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto bg-muted/20 mobile-scroll">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* PWA 설치 및 네트워크 상태 */}
      <PWAInstaller />
    </div>
  )
}
