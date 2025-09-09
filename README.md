# FinanceDash - 개인 금융 대시보드 ✨

**완전한 개인 자산 관리 솔루션** (자동화 시스템 테스트)

React + TypeScript + Tailwind CSS + shadcn/ui + Recharts를 사용하여 구축된 현대적인 금융 대시보드 웹 애플리케이션입니다.

## 🎯 주요 기능

### 📊 종합 대시보드
- **핵심 지표**: 총자산, 순자산, YTD 수익률, 목표 달성률
- **자산 구성 도넛 차트**: 현금/주식/채권/부동산 분산 현황
- **자산 성장 추이**: 시간별 총자산/순자산 변화와 수익/손실 분석
- **리밸런싱 제안**: AI 기반 포트폴리오 최적화 권장사항
- **시장 개요**: KOSPI, S&P500, 환율 실시간 모니터링

### 💰 자산 상세 관리
- **현금성 자산**: 은행별/계좌별 잔액 관리
- **계좌 마스킹**: 보안을 위한 계좌번호 부분 암호화
- **다중 통화**: 원화/외화 자산 통합 관리
- **은행별 분산 분석**: 위험 분산 현황 시각화

### 📈 거래 내역 추적
- **통합 거래 관리**: 수입/지출/이체 내역 통합 관리
- **고급 필터링**: 날짜/계좌/거래유형/금액 범위별 검색
- **카테고리별 분석**: 지출 패턴 파이차트
- **월별 트렌드**: 수입/지출 변화 추이 분석
- **예산 대비 분석**: 계획 대비 실제 지출 비교

### 📈 주식 포트폴리오
- **실시간 시세**: WebSocket 기반 주가 업데이트
- **종목별 상세**: 보유수량/평가손익/수익률/일간변동
- **섹터 분석**: 업종별 분산 투자 현황
- **거래소별 분산**: 국내/해외 시장 분산 현황
- **포트폴리오 분석**: 집중도 위험/리밸런싱 제안
- **배당 관리**: 배당 일정/수익률 추적

### 🏦 예적금 관리
- **상품별 관리**: 정기예금/적금/CMA 통합 관리
- **만기 알림**: 만기일 도래 상품 추적
- **이자 계산**: 자동 이자 산출 및 수익률 분석
- **은행별 분산**: 금융기관별 예치 현황

### 🏠 부동산 & 대출
- **부동산 자산**: 매입가/현재시세/평가손익 관리
- **대출 관리**: 원금/잔액/이자율/상환 스케줄
- **순자산 계산**: 부동산 가치 - 대출잔액
- **임대 수익**: 월세 수익 추적

### 📅 월별 요약
- **월별 통계**: 수입/지출/순자산 변화
- **주요 이벤트**: 배당지급/대출상환/만기도래 등
- **성장 추이**: 자산 증감 시각화
- **목표 추적**: 월별 목표 달성률 모니터링

### ⚙️ 설정 & 관리
- **사용자 설정**: 개인정보/테마/언어/통화
- **알림 관리**: 가격알림/배당알림/목표달성 알림
- **데이터 관리**: Excel 내보내기/가져오기/백업
- **API 연동**: 증권사 API 연결 관리
- **보안 설정**: 2단계 인증/로그인 기록

## 🛠️ 기술 스택

### Frontend
- **React 18** - 모던 리액트 훅스 기반 개발
- **TypeScript** - 타입 안전성 보장
- **Vite** - 빠른 개발 서버 및 번들링
- **React Router Dom** - SPA 라우팅
- **Zustand** - 경량 상태 관리
- **React Query** - 서버 상태 관리 및 캐싱

### UI & 스타일링
- **Tailwind CSS** - 유틸리티 퍼스트 CSS 프레임워크
- **shadcn/ui** - 재사용 가능한 컴포넌트 라이브러리
- **Radix UI** - 접근성이 보장된 헤드리스 컴포넌트
- **Lucide React** - 모던 아이콘 라이브러리
- **class-variance-authority** - 타입 안전 클래스 변형

### 데이터 시각화
- **Recharts** - React 기반 차트 라이브러리
- **도넛/파이 차트** - 자산 구성 시각화
- **라인/바 차트** - 시계열 데이터 표현
- **복합 차트** - 다중 데이터 레이어 표현

### 개발 도구
- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포맷팅
- **PostCSS** - CSS 후처리
- **Autoprefixer** - 브라우저 호환성

## 🏗️ 프로젝트 구조

```
financial-dashboard/
├── public/                 # 정적 파일
├── src/
│   ├── components/        # 재사용 가능한 컴포넌트
│   │   ├── ui/           # shadcn/ui 베이스 컴포넌트
│   │   ├── dashboard/    # 대시보드 전용 컴포넌트
│   │   └── layout/       # 레이아웃 컴포넌트
│   ├── pages/            # 페이지 컴포넌트
│   ├── stores/           # Zustand 스토어
│   ├── services/         # API 서비스
│   ├── types/            # TypeScript 타입 정의
│   ├── lib/              # 유틸리티 함수
│   └── hooks/            # 커스텀 훅스
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 18.0 이상
- npm 9.0 이상

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

애플리케이션이 `http://localhost:3000`에서 실행됩니다.

## 🎨 주요 컴포넌트

### MetricCard
```typescript
<MetricCard
  title="총 자산"
  value={850000000}
  change={{ amount: 45000000, percentage: 5.6 }}
  format="currency"
  icon={<Wallet />}
/>
```

### AssetChart
```typescript
<AssetChart
  data={chartData}
  selectedRange="1Y"
  onRangeChange={setRange}
/>
```

### AssetAllocationChart
```typescript
<AssetAllocationChart
  allocation={allocationData}
  summary={summaryData}
/>
```

## 📊 데이터 모델

### Asset Summary
```typescript
interface AssetSummary {
  totalAssets: number
  netWorth: number
  monthlyChange: { amount: number; percentage: number }
  ytdReturn: number
  goalAchievement: number
}
```

### Stock
```typescript
interface Stock {
  symbol: string
  name: string
  quantity: number
  averagePrice: number
  currentPrice: number
  marketValue: number
  unrealizedPnL: number
  dailyChange: number
  sector: string
  exchange: string
}
```

## 🔧 설정

### 환경 변수
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001/ws
```

### Tailwind 테마 커스터마이징
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: "#1E3A8A",
      success: "#10B981",
      destructive: "#EF4444",
      warning: "#F59E0B"
    }
  }
}
```

## 🔌 API 연동

### Mock Data
개발 환경에서는 `src/services/api.ts`의 mock data를 사용합니다.

### Real API 연동
실제 API 서버 연결 시 다음과 같이 설정:

```typescript
// .env
VITE_API_BASE_URL=https://your-api-server.com/api

// API 호출 예시
const response = await apiService.getAssetSummary()
```

### WebSocket 실시간 데이터
```typescript
const ws = apiService.connectWebSocket((data) => {
  if (data.type === 'market_update') {
    setMarketData(data.payload)
  }
})
```

## 🎯 주요 기능 설명

### 1. 대시보드 핵심 지표
- 총자산, 순자산 실시간 계산
- 전월 대비 증감률 및 금액
- YTD(연초 대비) 수익률
- 개인 목표 대비 달성률

### 2. 자산 구성 분석
- 자산군별 비중 (현금/주식/채권/부동산)
- 목표 포트폴리오와 현재 비중 비교
- 리밸런싱 필요 자산 제안
- 위험 분산도 평가

### 3. 거래 내역 관리
- 수입/지출/이체 통합 관리
- 카테고리별 지출 분석
- 월별 현금흐름 트렌드
- 예산 대비 실제 지출 비교

### 4. 주식 포트폴리오 분석
- 종목별 손익 실시간 계산
- 섹터별/거래소별 분산 분석
- 포트폴리오 집중도 위험 평가
- 배당 수익률 및 일정 관리

## 🔐 보안

### 데이터 보안
- 계좌번호 마스킹 처리
- 민감 정보 암호화 저장
- API 토큰 보안 관리

### 접근 제어
- JWT 기반 인증
- 역할 기반 권한 관리
- 2단계 인증 지원

## 📱 반응형 디자인

- **모바일 우선**: 모바일부터 데스크톱까지 최적화
- **적응형 레이아웃**: 화면 크기별 최적 UI
- **터치 친화적**: 모바일 터치 인터페이스 지원

## 🌟 고급 기능

### 자동화
- 실시간 주가 업데이트
- 자동 리밸런싱 제안
- 만기 알림 시스템
- 목표 달성 알림

### 분석
- 포트폴리오 성과 분석
- 위험도 평가
- 수익률 벤치마킹
- 세금 최적화 제안

### 내보내기/가져오기
- Excel 형식 데이터 내보내기
- CSV 파일 가져오기
- 자동 백업 기능
- 다중 포맷 지원

## 🎨 UI/UX 특징

### 디자인 시스템
- **일관된 색상**: Primary, Success, Warning, Destructive
- **타이포그래피**: 계층적 텍스트 스타일
- **간격 시스템**: 일관된 여백과 패딩
- **컴포넌트 라이브러리**: 재사용 가능한 UI 요소

### 사용성
- **직관적 네비게이션**: 사이드바 기반 메뉴
- **빠른 액션**: 자주 사용하는 기능 바로가기
- **검색 및 필터**: 강력한 데이터 검색 기능
- **키보드 단축키**: 파워 유저를 위한 단축키

### 접근성
- **스크린 리더 지원**: ARIA 레이블 완벽 지원
- **키보드 네비게이션**: 마우스 없이도 모든 기능 사용
- **고대비 모드**: 시각 장애인을 위한 고대비 테마
- **다국어 지원**: 한국어/영어 인터페이스

## 🚀 성능 최적화

### 번들 최적화
- **코드 스플리팅**: 페이지별 지연 로딩
- **Tree Shaking**: 미사용 코드 제거
- **압축**: gzip/brotli 압축 지원

### 렌더링 최적화
- **메모이제이션**: React.memo, useMemo 활용
- **가상화**: 대용량 리스트 가상 스크롤
- **이미지 최적화**: WebP 포맷 지원

### 데이터 관리
- **캐싱**: React Query 기반 스마트 캐싱
- **상태 관리**: Zustand 경량 상태 관리
- **로컬 스토리지**: 사용자 설정 로컬 저장

## 🎁 추가 기능

### 고급 차트
- **줌/팬 지원**: 차트 확대/이동 기능
- **툴팁**: 상세 정보 호버 표시
- **애니메이션**: 부드러운 차트 전환

### 알림 시스템
- **브라우저 알림**: Web Push API 활용
- **이메일 알림**: 중요 이벤트 이메일 발송
- **모바일 알림**: PWA 푸시 알림

### 데이터 분석
- **AI 추천**: 머신러닝 기반 투자 제안
- **예측 모델**: 자산 성장 예측
- **벤치마킹**: 시장 지수와 성과 비교

## 📈 향후 로드맵

### 단기 (1-3개월)
- [ ] PWA(Progressive Web App) 지원
- [ ] 오프라인 모드
- [ ] 모바일 앱 (React Native)

### 중기 (3-6개월)
- [ ] 암호화폐 포트폴리오
- [ ] 소셜 트레이딩 기능
- [ ] 고급 백테스팅

### 장기 (6-12개월)
- [ ] AI 포트폴리오 매니저
- [ ] 다중 사용자 지원
- [ ] 기관 투자자용 대시보드

## 🤝 기여 방법

1. 이 저장소를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원 및 문의

- **GitHub Issues**: 버그 리포트 및 기능 요청
- **Discussion**: 일반적인 질문과 토론
- **Email**: finance-dash@example.com

---

**FinanceDash** - 당신의 재정적 자유를 위한 완벽한 도구 🚀

*Made with ❤️ by Claude*