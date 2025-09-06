# 📈 실시간 주식 API 설정 가이드 (Yahoo Finance 통합)

이 가이드는 **Yahoo Finance를 중심으로** 실제 주식 데이터를 조회하기 위한 무료 API 설정 방법을 안내합니다.

## 🚀 빠른 시작

### 1. 환경 변수 파일 생성
```bash
# .env 파일을 프로젝트 루트에 생성
cp .env.example .env
```

### 2. API 키 발급 및 설정

#### 🏆 **Yahoo Finance (1순위 추천)**
- **무료**: 제한 없음 (비공식 API)
- **가입**: 불필요
- **특징**: 전세계 모든 증시 지원
- **한국 주식**: .KS (코스피), .KQ (코스닥) 자동 처리
- **실시간 데이터**: 15초 간격 업데이트

#### 🇺🇸 미국 주식 백업 API

**A. IEX Cloud (2순위 추천)**
- 무료: 50,000회/월
- 가입: https://iexcloud.io/
- .env에 추가: `VITE_IEX_TOKEN=your_token_here`

**B. Finnhub (3순위)**
- 무료: 60회/분
- 가입: https://finnhub.io/
- .env에 추가: `VITE_FINNHUB_KEY=your_key_here`

**C. Alpha Vantage (4순위)**
- 무료: 500회/일, 5회/분
- 가입: https://www.alphavantage.co/support/#api-key
- .env에 추가: `VITE_ALPHA_VANTAGE_KEY=your_key_here`

**D. Polygon.io (5순위)**
- 무료: 5회/분
- 가입: https://polygon.io/
- .env에 추가: `VITE_POLYGON_KEY=your_key_here`

#### 🇰🇷 한국 주식 API

**한국투자증권 API (KIS)**
- 가입: https://apiportal.koreainvestment.com/
- 월 10,000건 무료
- .env에 추가:
```bash
VITE_KIS_APP_KEY=your_app_key
VITE_KIS_SECRET_KEY=your_secret_key
```

## 🔧 CORS 우회 설정

브라우저 CORS 제한을 우회하기 위한 3가지 방법:

### 방법 1: 무료 CORS 프록시 (권장)
```bash
# .env 파일에 추가
VITE_USE_CORS_PROXY=true
VITE_PREFERRED_PROXY=https://cors-anywhere.herokuapp.com/
```

### 방법 2: 로컬 프록시 서버
```bash
# 별도 터미널에서 실행
npx cors-anywhere
```

### 방법 3: 브라우저 설정 (개발용)
```bash
# Chrome을 CORS 없이 실행
chrome.exe --user-data-dir=/tmp/chrome_dev --disable-web-security
```

## 📊 지원 기능

### 실시간 조회 가능 종목
- **한국 주식**: 코스피, 코스닥 전 종목 (예: 005930, 035420)
- **미국 주식**: NYSE, NASDAQ 전 종목 (예: AAPL, GOOGL)
- **실시간 데이터**: 현재가, 등락률, 거래량, 시가총액

### 🔄 API 우선순위 (업데이트)
1. **한국 주식**: 6자리 숫자 → **Yahoo Finance (.KS/.KQ)** → 한국투자증권 API (백업)
2. **미국 주식**: 알파벳 심볼 → **Yahoo Finance** → IEX Cloud → Finnhub → Alpha Vantage → Polygon
3. **글로벌 주식**: 모든 심볼 → **Yahoo Finance** (전세계 증시 지원)

## 💡 사용법

### 주식 검색 테스트
```javascript
// 개발자 도구 콘솔에서 테스트
import { stockApiService } from './services/stockApi'

// 한국 주식 테스트
const samsung = await stockApiService.searchStock('005930')
console.log(samsung) // 삼성전자 정보

// 미국 주식 테스트
const apple = await stockApiService.searchStock('AAPL')
console.log(apple) // 애플 정보
```

### UI에서 확인
1. 주식 거래 기록 버튼 클릭
2. 종목 코드 입력 (예: 005930, AAPL)
3. 자동으로 종목명과 현재가 조회됨

## 🚫 제한사항 및 해결책

### API 제한
| API | 무료 한도 | 초과시 대응 |
|-----|----------|------------|
| Alpha Vantage | 500회/일 | 다음 API로 대체 |
| IEX Cloud | 50,000회/월 | Mock 데이터 사용 |
| Finnhub | 60회/분 | 1분 대기 후 재시도 |
| KIS API | 10,000회/월 | 기본 데이터 사용 |

### CORS 에러 해결
```bash
# 1. 프록시 서버 사용 (권장)
VITE_USE_CORS_PROXY=true

# 2. 개발 서버에 프록시 설정
# vite.config.ts에 프록시 설정 추가
```

### 느린 응답 속도
```bash
# 캐싱 활성화
VITE_ENABLE_CACHE=true
VITE_CACHE_TTL=300 # 5분 캐시
```

## 🔍 디버깅

### 로그 활성화
```bash
# .env에 추가
VITE_DEBUG_API=true
```

### 콘솔 출력 예시
```
🔍 주식 검색 시작: 005930
📈 한국 주식으로 인식, Korean API 시도
✅ Korean Investment에서 조회 성공: {symbol: "005930", name: "삼성전자", ...}
```

### 문제 해결
1. **API 키 오류**: .env 파일 확인 및 재발급
2. **CORS 오류**: 프록시 설정 확인
3. **종목 조회 실패**: 심볼 정확성 확인
4. **느린 응답**: 네트워크 상태 확인

## 📈 고급 설정

### 실시간 추적
```javascript
// 관심 종목 실시간 추적
const symbols = ['005930', 'AAPL', 'GOOGL']
stockApiService.startPriceTracking(symbols, (updates) => {
  console.log('실시간 업데이트:', updates)
})
```

### 배치 조회
```javascript
// 여러 종목 동시 조회
const symbols = ['005930', '000660', 'AAPL', 'MSFT']
const results = await Promise.all(
  symbols.map(symbol => stockApiService.searchStock(symbol))
)
```

## 🎯 최적화 팁

1. **API 키 로테이션**: 여러 키를 순환 사용
2. **캐싱 활용**: 같은 종목 재조회 방지
3. **배치 처리**: 한 번에 여러 종목 조회
4. **오류 처리**: 실패시 다른 API 자동 사용
5. **속도 제한**: API 제한 준수로 안정성 확보

이제 실제 주식 데이터를 실시간으로 조회할 수 있습니다! 🚀