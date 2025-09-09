// 🚨 긴급 API 수정 스크립트 - 캐시된 JS 파일의 잘못된 API 호출을 런타임에 수정

// 원본 fetch 함수 저장
const originalFetch = window.fetch;

// fetch 함수 오버라이드
window.fetch = function(url, options) {
  console.log('🔍 Fetch 호출 감지:', url);
  
  // 잘못된 API 형식을 올바른 형식으로 수정
  if (typeof url === 'string' && url.includes('/stock/search/')) {
    // /stock/search/GOOGL → /stock/search?query=GOOGL
    const match = url.match(/\/stock\/search\/([^?&]+)/);
    if (match) {
      const symbol = match[1];
      const baseUrl = url.substring(0, url.indexOf('/stock/search/'));
      const correctedUrl = `${baseUrl}/stock/search?query=${symbol}`;
      
      console.log('🛠️ API 형식 수정:');
      console.log('  이전:', url);
      console.log('  수정:', correctedUrl);
      
      return originalFetch(correctedUrl, options);
    }
  }
  
  // 수정이 필요없는 경우 원본 그대로 호출
  return originalFetch(url, options);
};

console.log('✅ API 수정 스크립트 로드됨 - 잘못된 API 호출을 자동으로 수정합니다');