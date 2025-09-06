# Financial Dashboard - Claude AI 코딩 가이드

## 🎯 프로젝트 개요

**주식 데이터 대시보드** - React + TypeScript 프론트엔드와 Node.js 백엔드로 구성된 금융 데이터 시각화 애플리케이션

### 🏗️ 기술 스택
- **프론트엔드**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand
- **백엔드**: Node.js + Express + Yahoo Finance API  
- **포트 설정**: Frontend(3003), Backend(3007)
- **테스트**: ESLint + TypeScript 검증
- **배포**: 로컬 개발 환경

---

## 🚨 절대 규칙 (Claude AI 준수 필수)

### 1. **한 번에 하나의 기능만 수정하기**
   - 여러 파일을 동시에 수정하지 마세요
   - A를 고치다가 B가 망가지면 즉시 중단
   - **예시**: CORS 문제 해결 중에 동시에 UI 컴포넌트 수정 금지

### 2. **작동하는 코드는 즉시 저장** 
   - 뭔가 작동하면 바로 `git commit -m "작동함"`
   - 나중에 망가져도 되돌릴 수 있습니다
   - **중요**: PR 크기는 최대 200 LOC (lines of code)

### 3. **테스트 먼저 만들기**
   - "이게 작동해야 해"를 먼저 정의
   - 그 다음에 코드 작성
   - **현재 프로젝트**: TypeScript 타입 체크 + ESLint 검증

---

## 📋 작업 순서 (무조건 이 순서대로)

### 새 기능 추가할 때:
1. **현재 상태 저장**: `git add . && git commit -m "작업 시작 전"`
2. **테스트 작성**: "이 기능이 뭘 해야 하는지" 먼저 정의
3. **기능 구현**: 테스트를 통과하는 최소한의 코드만
4. **확인**: 모든 게 작동하는지 체크 (`npm run dev` + `npm start`)
5. **저장**: `git commit -m "기능 A 완성"`

### 버그 수정할 때:
1. **문제 재현**: 버그가 언제 발생하는지 정확히 파악
2. **테스트 작성**: 버그를 재현하는 테스트 만들기  
3. **수정**: 그 테스트만 통과시키기
4. **다른 것 확인**: 다른 기능이 망가지지 않았는지 체크
5. **저장**: `git commit -m "버그 수정"`

---

## 🔧 현재 프로젝트 의존성 관계

### 핵심 파일들 (수정 주의):
```
frontend/
├── src/
│   ├── stores/index.ts          # 전역 상태 관리 (Zustand)
│   ├── services/api.ts          # API 서비스 계층
│   ├── types/index.ts           # TypeScript 타입 정의
│   ├── components/ui/           # 기본 UI 컴포넌트
│   └── pages/                   # 페이지 컴포넌트
├── package.json                 # 프론트엔드 의존성
└── vite.config.ts              # Vite 설정

backend/
├── server.js                    # Express 서버 메인
├── .env                         # 환경 변수 설정
└── package.json                 # Node.js 의존성
```

### 연결 관계:
```
Dashboard.tsx
├── stores/index.ts (상태 관리)
│     └── types/index.ts (타입)
├── services/api.ts (API 호출)
│     └── backend/server.js (백엔드)
└── components/ (UI 컴포넌트들)
```

---

## 🤖 AI PR 자동 생성 안전 운영 (문외한용)

### Draft PR → 자동 검증 → 리뷰 → Merge 프로세스

#### 1. **자동 검증 확인** (관리자용 체크리스트)
- ✅ **초록불**(Green check) = 모든 테스트 통과 → 다음 단계 진행
- ❌ **빨간불**(Red X) = 테스트 실패 → AI에게 "테스트 통과하도록 수정해줘"

#### 2. **현재 프로젝트 자동 검증 항목**
```bash
# 프론트엔드 검증
npm install && npm run build && npm run lint

# 백엔드 검증  
cd backend && npm install && npm start (포트 3005에서 정상 시작)

# CORS 테스트
curl -X OPTIONS "http://localhost:3005/api/health"
```

#### 3. **리뷰어 체크 포인트**
- CORS 설정 변경 여부
- API 엔드포인트 변경 여부  
- 스토어 상태 구조 변경 여부
- 타입 정의 변경 여부

---

## 🚦 문외한용 체크리스트 (간단 버전)

### Claude가 PR을 만들면:
1. **PR 화면에서 불빛 확인**
   - ✅ 초록불 = OK, 다음 단계
   - ❌ 빨간불 = Claude에게 "테스트 통과하게 고쳐줘"

2. **초록불이면 리뷰어에게 확인 요청**
   - 개발자/프리랜서에게 "이 PR 괜찮은지 봐주세요"
   - 리뷰어가 "OK"하면 다음 단계

3. **Merge 버튼 클릭**
   - 리뷰어 OK + 초록불 = 안전하게 Merge 가능

### 🔴 절대 하지 말 것:
- 빨간불 상태에서 Merge 금지
- 리뷰어 확인 없이 Merge 금지  
- AI가 10개 이상 파일을 한꺼번에 수정했을 때 바로 승인 금지

---

## 🔄 현재 해결된 문제들 (참고용)

1. **CORS 문제**: 백엔드 포트 3005, 프론트엔드 포트 3000으로 통일
2. **데이터 동기화**: 로컬 스토어 → 대시보드 실시간 반영 구현
3. **API 에러 처리**: 재시도 로직 + 타임아웃 설정 완료

---

## ⚠️ 주의사항

### 절대 동시 수정 금지:
- 백엔드 API 수정 + 프론트엔드 컴포넌트 수정
- CORS 설정 + 데이터베이스 스키마 변경
- UI 컴포넌트 + 상태 관리 로직

### 안전한 작업 패턴:
1. 백엔드 API 수정 → 테스트 → 커밋
2. 프론트엔드 연동 → 테스트 → 커밋  
3. UI 개선 → 테스트 → 커밋

---

## 📝 PR 템플릿

Claude가 생성하는 PR은 다음 형식을 따라야 합니다:

```markdown
## [Claude] 기능 설명

### 변경 사항
- 수정된 파일 목록
- 주요 변경 내용 요약

### 테스트
- [ ] 프론트엔드: npm run dev 정상 실행
- [ ] 백엔드: npm start (포트 3005) 정상 실행  
- [ ] CORS 테스트 통과
- [ ] TypeScript 타입 체크 통과

### 영향 범위
- 영향받는 컴포넌트/모듈 명시
- 예상 리스크 수준: Low/Medium/High

### 체크리스트
- [ ] PR 크기 200 라인 이하
- [ ] 단일 기능/버그 수정만 포함
- [ ] 모든 자동 검증 통과 (초록불)
```

---

**최종 업데이트**: 2024-09-02  
**버전**: 1.0  
**개발 환경**: Node.js 20+, React 18, TypeScript 5, Windows 11  
**포트 설정**: Frontend(3003), Backend(3007)


 4️⃣ 접속

  - 브라우저에서 http://localhost:3000 접속

  📝 참고사항

  - 백엔드는 포트 3005에서 실행
  - 프론트엔드는 포트 3000에서 실행
  - 두 서버 모두 실행되어야 정상 작동
  - 종료할 때는 각 터미널에서 Ctrl + C

  ⚡ 빠른 실행 팁

  VS Code를 사용한다면:
  1. 프로젝트 폴더 열기
  2. 터미널에서 npm run dev (프론트엔드)
  3. 새 터미널 열어서 cd backend && npm start (백엔드) 