# 📈 Stock API Backend Server

Yahoo Finance API를 프록시하는 Express.js 백엔드 서버

## 🚀 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 모드 실행
npm run dev

# 프로덕션 모드 실행
npm start
```

## 📡 API 엔드포인트

### 1. 통합 주식 검색
```
GET /api/stock/search/{symbol}
```
- 한국 주식: 6자리 숫자 (예: 005930)
- 글로벌 주식: 알파벳 (예: AAPL)

### 2. 한국 주식 전용
```
GET /api/stock/korean/{symbol}
```

### 3. 글로벌 주식 전용  
```
GET /api/stock/global/{symbol}
```

### 4. 다중 종목 조회
```
POST /api/stock/multiple
{
  "symbols": ["005930", "AAPL", "MSFT"]
}
```

### 5. 검색 제안
```
GET /api/stock/suggestions/{query}
```

### 6. 헬스 체크
```
GET /api/health
```

## 📊 응답 형식

```json
{
  "success": true,
  "data": {
    "symbol": "005930",
    "name": "삼성전자",
    "currentPrice": 71000,
    "currency": "KRW",
    "exchange": "KRX",
    "marketCap": 426000000000000,
    "volume": 15234567,
    "change": -500,
    "changePercent": -0.70
  }
}
```

## 🔧 환경 설정

`.env` 파일에서 포트 및 CORS 설정 가능:
```
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

## 🛡️ 보안

- CORS 설정으로 특정 도메인만 허용
- Rate limiting 구현 권장
- API 키 인증 추가 가능

## 🐛 문제 해결

1. **포트 충돌**: PORT 환경변수 변경
2. **CORS 오류**: CORS_ORIGIN에 프론트엔드 URL 추가
3. **Yahoo Finance 오류**: 로그 확인 후 재시도