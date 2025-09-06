# 📱 Financial Dashboard PWA 변환 가이드

## 🎯 목표
현재 React 웹앱을 **Progressive Web App**으로 변환하여 스마트폰에서 네이티브 앱처럼 사용하기

## 📋 필요한 작업 단계

### 1️⃣ Vite PWA 플러그인 설치
```bash
npm install vite-plugin-pwa workbox-window -D
```

### 2️⃣ vite.config.ts 수정
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
        name: 'Financial Dashboard',
        short_name: 'FinDash',
        description: '개인 금융 자산 관리 대시보드',
        theme_color: '#000000',
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
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.yahoo\.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'yahoo-finance-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5분 캐싱
              }
            }
          },
          {
            urlPattern: /^http:\/\/localhost:3007\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'backend-api-cache'
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

### 3️⃣ 앱 아이콘 생성
```bash
# public 폴더에 아이콘들 추가
public/
├── icon-192.png    # 192x192
├── icon-512.png    # 512x512
├── apple-touch-icon.png  # iOS용
└── favicon.ico
```

### 4️⃣ 메인 컴포넌트에 PWA 업데이트 훅 추가
```typescript
// src/hooks/usePWAUpdate.ts
import { useRegisterSW } from 'virtual:pwa-register/react'

export function usePWAUpdate() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW 등록됨:', r)
    },
    onRegisterError(error) {
      console.log('SW 등록 오류:', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return {
    offlineReady,
    needRefresh,
    updateServiceWorker,
    close
  }
}
```

### 5️⃣ PWA 업데이트 알림 컴포넌트
```tsx
// src/components/PWAUpdatePrompt.tsx
import { usePWAUpdate } from '@/hooks/usePWAUpdate'

export function PWAUpdatePrompt() {
  const { offlineReady, needRefresh, updateServiceWorker, close } = usePWAUpdate()

  if (!offlineReady && !needRefresh) return null

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-blue-600 text-white rounded-lg shadow-lg">
      <div className="flex items-center gap-3">
        <div>
          {offlineReady ? (
            <span>앱이 오프라인에서 사용할 준비가 되었습니다!</span>
          ) : (
            <span>새 버전이 있습니다. 업데이트하시겠습니까?</span>
          )}
        </div>
        <div className="flex gap-2">
          {needRefresh && (
            <button
              onClick={() => updateServiceWorker(true)}
              className="px-3 py-1 bg-white text-blue-600 rounded text-sm"
            >
              업데이트
            </button>
          )}
          <button
            onClick={close}
            className="px-3 py-1 bg-blue-700 rounded text-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
```

## 📱 스마트폰 기능 추가

### 6️⃣ 화면 회전 제어
```css
/* src/index.css에 추가 */
@media (orientation: landscape) and (max-height: 500px) {
  .mobile-landscape-hide {
    display: none;
  }
}

/* 스마트폰 최적화 */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .mobile-scroll {
    overflow-x: auto;
    white-space: nowrap;
  }
}
```

### 7️⃣ 터치 제스처 지원
```bash
npm install @use-gesture/react
```

```tsx
// src/components/TouchOptimized.tsx
import { useGesture } from '@use-gesture/react'
import { useSpring, animated } from 'react-spring'

export function TouchOptimizedCard({ children, ...props }) {
  const [style, api] = useSpring(() => ({
    transform: 'scale(1)',
    config: { tension: 300, friction: 10 }
  }))

  const bind = useGesture({
    onTouchStart: () => api.start({ transform: 'scale(0.95)' }),
    onTouchEnd: () => api.start({ transform: 'scale(1)' })
  })

  return (
    <animated.div {...bind()} style={style} {...props}>
      {children}
    </animated.div>
  )
}
```

### 8️⃣ 푸시 알림 (주식 시세 알림)
```typescript
// src/services/notifications.ts
export class NotificationService {
  static async requestPermission() {
    if ('Notification' in window) {
      return await Notification.requestPermission()
    }
    return 'denied'
  }

  static async sendStockAlert(stock: Stock, changePercent: number) {
    if (Math.abs(changePercent) > 5) { // 5% 이상 변동시
      new Notification(`${stock.name} 급등락 알림`, {
        body: `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}% 변동`,
        icon: '/icon-192.png',
        badge: '/icon-192.png'
      })
    }
  }
}
```

## 🚀 배포 및 설치

### 9️⃣ 빌드 및 배포
```bash
# 빌드
npm run build

# 로컬 테스트
npm run preview

# Netlify/Vercel 배포
# 또는 GitHub Pages
```

### 🔟 스마트폰에서 설치
1. **Android Chrome**: 주소창 → 메뉴 → "홈 화면에 추가"
2. **iOS Safari**: 공유 버튼 → "홈 화면에 추가"
3. **설치 후**: 일반 앱처럼 사용 가능

## 📈 고급 기능

### 백그라운드 동기화
```typescript
// 오프라인 상태에서도 데이터 동기화
if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
  navigator.serviceWorker.ready.then(registration => {
    registration.sync.register('background-sync')
  })
}
```

### 디바이스 기능 활용
```typescript
// 카메라로 영수증 스캔
async function scanReceipt() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true })
  // OCR 처리...
}

// 지문/얼굴 인식 로그인
if (window.PublicKeyCredential) {
  // WebAuthn API 사용
}
```

## 🎯 예상 결과

✅ **스마트폰 홈화면에서 앱 실행**  
✅ **오프라인에서도 데이터 확인 가능**  
✅ **푸시 알림으로 주식 변동 알림**  
✅ **터치 최적화된 UI**  
✅ **빠른 로딩 및 캐싱**  
✅ **앱스토어 없이도 설치 가능**  

## ⚠️ 주의사항

1. **HTTPS 필수**: PWA는 HTTPS에서만 동작
2. **아이콘 준비**: 다양한 크기의 앱 아이콘 필요
3. **테스트**: 실제 스마트폰에서 충분한 테스트 필요
4. **백엔드 CORS**: 모바일에서도 API 접근 가능하도록 설정

## 🔧 즉시 적용 가능

현재 프로젝트에 위 설정들을 추가하면:
- **당장 오늘부터** 스마트폰에서 앱처럼 사용 가능
- **기존 코드 변경 최소화**
- **점진적 기능 추가** 가능

PWA로 시작해서 나중에 필요하면 React Native로 완전 네이티브 전환도 가능합니다!