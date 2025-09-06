# 📱 실시간 금융 데이터 PWA 앱 만들기

## 🎯 목표
현재 웹에서 작동하는 **실시간 환율 & 주식 시세** 기능을 그대로 스마트폰 앱으로 구현

## ⚡ **핵심 포인트**

✅ **기존 실시간 기능 100% 유지**
- Yahoo Finance API 연동
- 환율 자동 업데이트 (5분마다)
- USD → KRW 실시간 환산
- StockDisplayCell 컴포넌트 그대로 사용

✅ **모바일 최적화 추가**
- 백그라운드에서도 데이터 업데이트
- 푸시 알림으로 급등락 알림
- 오프라인 시 캐시된 데이터 표시

## 🚀 **단계별 구현**

### 1️⃣ PWA 플러그인 설치 (실시간 데이터 지원)
```bash
npm install vite-plugin-pwa workbox-window -D
```

### 2️⃣ 실시간 데이터용 vite.config.ts 설정
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Financial Dashboard - 실시간 주식',
        short_name: 'FinDash',
        description: '실시간 환율 및 주식 시세 확인',
        theme_color: '#1f2937',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png', 
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        // 🔥 실시간 데이터를 위한 캐시 전략
        runtimeCaching: [
          {
            // Yahoo Finance API - 짧은 캐시
            urlPattern: /^https:\/\/query.*\.finance\.yahoo\.com\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'yahoo-finance-realtime',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 // 1분만 캐시
              }
            }
          },
          {
            // 환율 API - 5분 캐시 (exchangeRateService와 동일)
            urlPattern: /^https:\/\/api\.exchangerate-api\.com\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'exchange-rate-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 300 // 5분 캐시
              }
            }
          },
          {
            // 백엔드 API - 실시간 우선
            urlPattern: /^http:\/\/localhost:3007\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'backend-realtime-cache',
              networkTimeoutSeconds: 5
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    open: true,
  },
})
```

### 3️⃣ 실시간 데이터 업데이트 서비스 (모바일 최적화)
```typescript
// src/services/realtimeService.ts
import { useAppStore } from '@/stores'
import { exchangeRateService } from '@/services/exchangeRateService'

export class RealtimeService {
  private intervalIds: NodeJS.Timeout[] = []
  private isBackground = false

  // 페이지가 백그라운드로 갔을 때
  handleVisibilityChange = () => {
    if (document.hidden) {
      this.isBackground = true
      this.startBackgroundSync()
    } else {
      this.isBackground = false
      this.startForegroundSync()
    }
  }

  // 포그라운드: 실시간 업데이트 (기존과 동일)
  startForegroundSync() {
    this.clearAllIntervals()
    
    // 환율 5분마다 업데이트 (기존 로직 유지)
    const exchangeRateInterval = setInterval(async () => {
      const { updateExchangeRate } = useAppStore.getState()
      await updateExchangeRate()
    }, 5 * 60 * 1000)
    
    // 주식 시세 30초마다 업데이트
    const stockPriceInterval = setInterval(async () => {
      await this.updateStockPrices()
    }, 30 * 1000)
    
    this.intervalIds.push(exchangeRateInterval, stockPriceInterval)
  }

  // 백그라운드: 배터리 절약 모드
  startBackgroundSync() {
    this.clearAllIntervals()
    
    // 백그라운드에서는 5분마다만 업데이트
    const backgroundInterval = setInterval(async () => {
      const { updateExchangeRate } = useAppStore.getState()
      await updateExchangeRate()
      await this.updateStockPrices()
    }, 5 * 60 * 1000)
    
    this.intervalIds.push(backgroundInterval)
  }

  async updateStockPrices() {
    const { stocks, updateStock } = useAppStore.getState()
    
    for (const stock of stocks) {
      try {
        // 현재 사용 중인 Yahoo Finance API 그대로 사용
        const response = await fetch(`/api/stock/${stock.symbol}`)
        const data = await response.json()
        
        if (data.currentPrice) {
          const oldPrice = stock.currentPrice
          const newPrice = data.currentPrice
          const changePercent = ((newPrice - oldPrice) / oldPrice) * 100
          
          // 5% 이상 변동시 푸시 알림
          if (Math.abs(changePercent) >= 5) {
            await this.sendPriceAlert(stock, changePercent)
          }
          
          updateStock(stock.id, {
            currentPrice: newPrice,
            marketValue: stock.quantity * newPrice
          })
        }
      } catch (error) {
        console.error(`${stock.symbol} 시세 업데이트 실패:`, error)
      }
    }
  }

  async sendPriceAlert(stock: any, changePercent: number) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const direction = changePercent > 0 ? '📈 급등' : '📉 급락'
      const change = `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%`
      
      new Notification(`${direction}: ${stock.name}`, {
        body: `${change} 변동 | 현재가: ${stock.currentPrice?.toLocaleString()}`,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: `stock-${stock.symbol}`, // 중복 알림 방지
        requireInteraction: true
      })
    }
  }

  clearAllIntervals() {
    this.intervalIds.forEach(id => clearInterval(id))
    this.intervalIds = []
  }

  init() {
    // 페이지 가시성 변경 감지
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    
    // 푸시 알림 권한 요청
    if ('Notification' in window) {
      Notification.requestPermission()
    }
    
    // 초기 실행
    this.startForegroundSync()
  }

  destroy() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    this.clearAllIntervals()
  }
}

export const realtimeService = new RealtimeService()
```

### 4️⃣ 기존 컴포넌트 모바일 최적화
```tsx
// src/components/MobileStockCard.tsx
import { StockDisplayCell } from '@/components/StockDisplayCell'

export function MobileStockCard({ stock }: { stock: Stock }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg">{stock.symbol}</h3>
          <p className="text-sm text-gray-600">{stock.name}</p>
        </div>
        <div className="text-right">
          {/* 기존 StockDisplayCell 그대로 사용 - 환율 자동 반영 */}
          <StockDisplayCell 
            value={stock.currentPrice} 
            currency={stock.currency}
            className="text-lg font-bold"
          />
          <p className="text-sm text-gray-500">
            {stock.quantity}주 보유
          </p>
        </div>
      </div>
      
      {/* 수익률 표시 */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <span className="text-sm text-gray-600">평가금액</span>
        <StockDisplayCell 
          value={stock.marketValue} 
          currency={stock.currency}
          className="font-semibold"
        />
      </div>
    </div>
  )
}
```

### 5️⃣ App.tsx에 실시간 서비스 연결
```tsx
// src/App.tsx 수정
import { useEffect } from 'react'
import { realtimeService } from '@/services/realtimeService'
import { PWAUpdatePrompt } from '@/components/PWAUpdatePrompt'

function App() {
  useEffect(() => {
    // 실시간 서비스 초기화
    realtimeService.init()
    
    return () => {
      realtimeService.destroy()
    }
  }, [])

  return (
    <div className="app">
      {/* 기존 컴포넌트들 */}
      <Dashboard />
      
      {/* PWA 업데이트 알림 */}
      <PWAUpdatePrompt />
    </div>
  )
}
```

### 6️⃣ 모바일 환율 표시 개선
```tsx
// src/components/MobileExchangeRate.tsx
import { useAppStore } from '@/stores'

export function MobileExchangeRate() {
  const { exchangeRate } = useAppStore()
  
  return (
    <div className="bg-blue-50 p-3 rounded-lg mb-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-blue-800">실시간 환율</span>
        {exchangeRate && (
          <span className="text-lg font-bold text-blue-900">
            $1 = ₩{exchangeRate.USD_KRW.toFixed(0)}
          </span>
        )}
      </div>
      {exchangeRate?.lastUpdated && (
        <p className="text-xs text-blue-600 mt-1">
          {new Date(exchangeRate.lastUpdated).toLocaleTimeString()} 업데이트
        </p>
      )}
    </div>
  )
}
```

## 📱 **모바일 특화 기능**

### 7️⃣ 진동 알림 (급등락 시)
```typescript
// 푸시 알림과 함께 진동
if ('vibrate' in navigator) {
  navigator.vibrate([200, 100, 200]) // 진동 패턴
}
```

### 8️⃣ 네트워크 상태 감지
```typescript
// src/hooks/useNetworkStatus.ts
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return isOnline
}
```

## 🚀 **설치 및 사용법**

### 1. PWA 설정 적용
```bash
npm install vite-plugin-pwa workbox-window -D
npm run build
npm run preview
```

### 2. 스마트폰에서 설치
1. 크롬에서 `localhost:4173` (또는 배포 URL) 접속
2. 주소창 → "홈 화면에 추가"
3. 앱 아이콘이 홈화면에 생성됨

### 3. 실시간 기능 확인
- ✅ 환율이 5분마다 자동 업데이트
- ✅ USD 주식이 실시간 원화로 표시
- ✅ 주식 5% 이상 변동시 푸시 알림
- ✅ 백그라운드에서도 데이터 업데이트
- ✅ 오프라인시 캐시된 데이터 표시

## 🔧 **기존 코드 변경 최소화**

- ✅ `exchangeRateService.ts` 그대로 사용
- ✅ `StockDisplayCell.tsx` 그대로 사용  
- ✅ Zustand 스토어 그대로 사용
- ✅ Yahoo Finance API 연동 그대로 사용

**단지 PWA 설정과 모바일 최적화만 추가하면 됩니다!**

## 🎯 **최종 결과**

웹에서 보던 그 실시간 데이터를 스마트폰 앱에서도 동일하게:
- 📈 실시간 주식 시세
- 💱 실시간 환율 (USD→KRW)  
- 🔔 급등락 푸시 알림
- 📱 네이티브 앱처럼 부드러운 동작
- 🔄 백그라운드 자동 업데이트