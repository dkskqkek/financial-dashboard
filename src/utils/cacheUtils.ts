// 브라우저 캐시 완전 초기화 유틸리티

export const clearAllCache = async () => {
  try {
    // 1. localStorage 클리어
    localStorage.clear()

    // 2. sessionStorage 클리어
    sessionStorage.clear()

    // 3. Service Worker 캐시 클리어
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const registration of registrations) {
        await registration.unregister()
      }
    }

    // 4. Cache API 클리어
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
    }

    console.log('✅ 모든 캐시가 초기화되었습니다')

    // 5. 페이지 새로고침
    window.location.reload()
  } catch (error) {
    console.error('❌ 캐시 초기화 실패:', error)
  }
}

// 개발 모드에서만 자동 캐시 클리어
export const devCacheClear = () => {
  if (import.meta.env.DEV) {
    const lastClearTime = localStorage.getItem('last-cache-clear')
    const now = Date.now()

    // 1시간마다 캐시 클리어 (개발 모드)
    if (!lastClearTime || now - parseInt(lastClearTime) > 60 * 60 * 1000) {
      console.log('🧹 개발 모드 캐시 자동 초기화')
      localStorage.setItem('last-cache-clear', now.toString())

      // API 캐시만 클리어 (페이지 새로고침 없이)
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            if (cacheName.includes('api') || cacheName.includes('runtime')) {
              caches.delete(cacheName)
              console.log(`🗑️ API 캐시 삭제: ${cacheName}`)
            }
          })
        })
      }
    }
  }
}

// 강제 API 요청 (캐시 우회)
export const fetchWithoutCache = async (url: string, options?: RequestInit) => {
  // URL에 이미 타임스탬프가 있으면 추가하지 않음
  let finalUrl = url
  if (!url.includes('_t=')) {
    const timestamp = Date.now()
    const separator = url.includes('?') ? '&' : '?'
    finalUrl = `${url}${separator}_t=${timestamp}&_cache=bust`
  }

  return fetch(finalUrl, {
    ...options,
    headers: {
      ...options?.headers,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
    cache: 'no-cache',
  })
}

// 디버깅용 캐시 정보 출력
export const debugCacheInfo = async () => {
  console.log('🔍 캐시 디버그 정보:')

  // localStorage
  console.log('📦 localStorage 크기:', Object.keys(localStorage).length)

  // sessionStorage
  console.log('📦 sessionStorage 크기:', Object.keys(sessionStorage).length)

  // Cache API
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    console.log('📦 브라우저 캐시:', cacheNames)

    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const requests = await cache.keys()
      console.log(`  - ${cacheName}: ${requests.length}개 항목`)
    }
  }

  // Service Worker
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    console.log('🔧 Service Worker:', registrations.length, '개 등록됨')
  }
}
