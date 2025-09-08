import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { debugCacheInfo, clearAllCache } from '@/utils/cacheUtils'
import './index.css'

// PWA 서비스 워커 캐시 강제 업데이트
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
      }

      // 캐시 스토리지 삭제
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
      }

      console.log('Service worker and caches cleared')

      // 새로운 서비스 워커 등록
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('New service worker registered:', registration)
    } catch (error) {
      console.log('Service worker registration failed:', error)
    }
  })
}

// 개발 모드에서 캐시 디버깅
if (import.meta.env.DEV) {
  // 전역 캐시 디버깅 함수 등록
  ;(window as any).debugCache = async () => await debugCacheInfo()
  ;(window as any).clearCache = async () => await clearAllCache()

  console.log('🛠️ 개발 모드: 캐시 디버깅 도구 활성화')
  console.log('💡 브라우저 콘솔에서 사용 가능:')
  console.log('  - debugCache(): 캐시 정보 확인')
  console.log('  - clearCache(): 모든 캐시 초기화')

  // 초기 캐시 정보 출력
  setTimeout(async () => {
    await debugCacheInfo()
  }, 2000)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
