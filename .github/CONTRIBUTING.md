# 🤝 Contributing Guide

**Financial Dashboard** 프로젝트에 기여해주셔서 감사합니다! 

## 🚀 빠른 시작

### 1. 개발 환경 설정
```bash
# 저장소 클론
git clone https://github.com/your-username/financial-dashboard.git
cd financial-dashboard

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 2. 개발 워크플로우
```bash
# 새 브랜치 생성
git checkout -b feature/your-feature-name

# 개발 진행
# ... 코드 작성 ...

# 코드 포맷팅 및 린팅
npm run prepare

# 빌드 테스트
npm run ci

# 커밋 및 푸시
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

## 📋 PR 제출 프로세스

### 1. 브랜치 이름 규칙
- `feature/기능명` - 새로운 기능
- `fix/버그명` - 버그 수정
- `refactor/리팩토링명` - 코드 리팩토링
- `docs/문서명` - 문서 업데이트
- `style/스타일명` - UI/스타일 변경
- `test/테스트명` - 테스트 추가/수정

### 2. 커밋 메시지 규칙
```
타입(스코프): 설명

- feat: 새로운 기능 추가
- fix: 버그 수정
- docs: 문서 변경
- style: 코드 formatting, 세미콜론 누락 등 (코드 변경 없음)
- refactor: 코드 리팩토링
- test: 테스트 코드, 리팩토링 테스트 코드 추가
- chore: 빌드 업무, 패키지 매니저 설정 등
```

**예시:**
- `feat(dashboard): 다크 모드 토글 기능 추가`
- `fix(chart): 차트 데이터 로딩 오류 수정`
- `docs(readme): 설치 가이드 업데이트`

### 3. PR 체크리스트
PR을 제출하기 전에 다음 사항들을 확인해주세요:

- [ ] 🔍 **자체 코드 리뷰 완료**
- [ ] 🧪 **`npm run ci` 명령어 성공**
- [ ] 📱 **모바일 환경에서 테스트 (해당시)**
- [ ] 🌐 **Chrome, Firefox, Safari에서 테스트 (해당시)**
- [ ] 📝 **관련 문서 업데이트**
- [ ] ✨ **PR 템플릿 작성 완료**

## 🛠️ 개발 가이드라인

### 1. 코드 스타일
- **ESLint + Prettier** 자동 적용
- **TypeScript** 타입 안전성 준수
- **함수형 컴포넌트 + Hooks** 사용
- **CSS-in-JS (Tailwind CSS)** 스타일링

### 2. 파일/폴더 구조
```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── ui/             # 기본 UI 컴포넌트
│   ├── dashboard/      # 대시보드 특화 컴포넌트
│   └── common/         # 공통 컴포넌트
├── pages/              # 페이지 컴포넌트
├── hooks/              # 커스텀 훅
├── services/           # API 서비스
├── stores/             # 상태 관리 (Zustand)
├── types/              # TypeScript 타입 정의
├── utils/              # 유틸리티 함수
└── lib/                # 라이브러리 설정
```

### 3. 네이밍 규칙
- **컴포넌트**: PascalCase (`UserProfile.tsx`)
- **함수/변수**: camelCase (`getUserData`)
- **상수**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **CSS 클래스**: kebab-case (`user-profile`)

### 4. 성능 고려사항
- **Lazy Loading** 적용 (큰 컴포넌트)
- **useMemo/useCallback** 적절히 사용
- **번들 크기** 최적화 고려
- **이미지 최적화** (WebP, 압축)

## 🧪 테스트 가이드

### 1. 테스트 실행
```bash
# 전체 테스트
npm test

# 특정 파일 테스트
npm test Dashboard.test.tsx

# 커버리지 확인
npm test -- --coverage
```

### 2. 테스트 작성 가이드
- **단위 테스트**: 각 함수/컴포넌트별
- **통합 테스트**: 주요 사용자 플로우
- **E2E 테스트**: 핵심 기능 시나리오

## 🐛 버그 리포트

버그를 발견하셨나요? [Bug Report 템플릿](./ISSUE_TEMPLATE/bug_report.yml)을 사용해주세요.

### 필수 정보
- 재현 방법
- 예상 결과 vs 실제 결과
- 브라우저/OS 정보
- 콘솔 에러 메시지
- 스크린샷 (가능하다면)

## ✨ 기능 제안

새로운 기능을 제안하고 싶으시나요? [Feature Request 템플릿](./ISSUE_TEMPLATE/feature_request.yml)을 사용해주세요.

### 좋은 제안을 위한 팁
- **문제점 명확히 정의**
- **해결책 구체적으로 제시**
- **사용자 가치 설명**
- **UI/UX 목업 첨부** (가능하다면)

## 📚 추가 자료

### 주요 라이브러리 문서
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Recharts](https://recharts.org/)
- [Vite](https://vitejs.dev/)

### 프로젝트 관련
- [CLAUDE.md](../CLAUDE.md) - Claude AI 코딩 가이드
- [README.md](../README.md) - 프로젝트 개요
- [GitHub Actions](.github/workflows/) - CI/CD 파이프라인

## 🏷️ 라벨 시스템

### 타입 라벨
- 🐛 `bug` - 버그 
- ✨ `enhancement` - 기능 개선
- 📝 `documentation` - 문서
- 🎨 `UI/UX` - 디자인
- ⚡ `performance` - 성능
- 🔒 `security` - 보안

### 우선순위 라벨
- 🔴 `priority: high` - 높음
- 🟡 `priority: medium` - 보통  
- 🟢 `priority: low` - 낮음

### 상태 라벨
- 📋 `triage` - 검토 필요
- 🔄 `in progress` - 진행 중
- 👀 `needs review` - 리뷰 필요
- ✅ `ready to merge` - 머지 준비

## 🤔 질문이나 도움이 필요하신가요?

- **GitHub Issues**: 버그 리포트, 기능 제안
- **GitHub Discussions**: 일반적인 질문, 아이디어 공유
- **Email**: 민감한 보안 이슈

---

**다시 한번 기여해주셔서 감사합니다!** 🙏 

여러분의 기여가 이 프로젝트를 더욱 발전시킵니다.