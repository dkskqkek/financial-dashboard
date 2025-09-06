import React, { useEffect, useState } from 'react'
import { Button } from './button'
import { Card, CardContent } from './card'
import { Download, X, Smartphone, Wifi, WifiOff } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    // PWA 설치 프롬프트 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    // 앱 설치 완료 이벤트 리스너  
    const handleAppInstalled = () => {
      console.log('PWA 설치 완료')
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    // 네트워크 상태 변경 이벤트 리스너
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // 이벤트 리스너 등록
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // 이미 설치되었는지 확인
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('사용자가 PWA 설치를 승인했습니다')
    } else {
      console.log('사용자가 PWA 설치를 거부했습니다')
    }

    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // 24시간 후 다시 보여주기
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // 24시간 내에 이미 거부했으면 보여주지 않음
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const now = Date.now()
      if (now - dismissedTime < 24 * 60 * 60 * 1000) { // 24시간
        setShowInstallPrompt(false)
      }
    }
  }, [])

  return (
    <>
      {/* 오프라인 상태 표시 */}
      {!isOnline && (
        <div className="offline-indicator">
          <WifiOff className="inline-block w-4 h-4 mr-2" />
          오프라인 모드 - 일부 기능이 제한됩니다
        </div>
      )}

      {/* PWA 설치 프롬프트 */}
      {showInstallPrompt && !isInstalled && (
        <Card className="pwa-notification animate-slide-in">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">
                    앱으로 설치하기
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    홈 화면에 추가하여 더 빠르게 접근하세요
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleInstallClick}
                      size="sm"
                      className="pwa-install-button text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      설치
                    </Button>
                    <Button 
                      onClick={handleDismiss}
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                    >
                      나중에
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 네트워크 상태 표시 (우상단) */}
      <div className="fixed top-4 right-4 z-40">
        <div className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${
          isOnline 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3" />
              <span>온라인</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3" />
              <span>오프라인</span>
            </>
          )}
        </div>
      </div>
    </>
  )
}