# 📱 Financial Dashboard - 클라우드 배포 가이드

## 🎯 배포 완료 - 다음 단계

### ✅ 준비 완료된 사항
1. **프로젝트 빌드** - 프론트엔드/백엔드 모두 테스트 완료
2. **Git 저장소** - 모든 소스코드 커밋 완료
3. **배포 설정 파일** - vercel.json, render.yaml, railway.json 생성
4. **환경 변수 템플릿** - .env.production 파일 준비

---

## 🚀 단계별 배포 실행

### 1단계: GitHub 저장소 생성 및 푸시

```bash
# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/financial-dashboard.git
git branch -M main
git push -u origin main
```

### 2단계: Vercel 프론트엔드 배포

1. **Vercel 웹사이트 접속**: https://vercel.com
2. **GitHub 연동**: "Import Git Repository" 클릭
3. **저장소 선택**: financial-dashboard 선택
4. **환경 변수 설정**:
   ```
   VITE_API_BASE_URL=https://your-backend-app.onrender.com/api
   ```
5. **Deploy 클릭** - 자동 빌드 및 배포

### 3단계: Render 백엔드 배포

1. **Render 웹사이트 접속**: https://render.com
2. **New Web Service 클릭**
3. **GitHub 연동** 후 저장소 선택
4. **설정 입력**:
   - **Name**: financial-dashboard-api
   - **Root Directory**: backend
   - **Build Command**: npm install
   - **Start Command**: npm start
5. **환경 변수 설정**:
   ```
   NODE_ENV=production
   PORT=10000
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
6. **Create Web Service 클릭**

### 4단계: 상호 연결 설정

1. **백엔드 URL 확인** - Render에서 생성된 URL 복사
2. **Vercel 환경 변수 업데이트**:
   - `VITE_API_BASE_URL`을 실제 Render URL로 변경
   - 예: `https://financial-dashboard-api.onrender.com/api`
3. **Render 환경 변수 업데이트**:
   - `FRONTEND_URL`을 실제 Vercel URL로 변경
   - 예: `https://financial-dashboard.vercel.app`

---

## 🔧 배포 후 확인사항

### ✅ 프론트엔드 테스트
- [ ] https://your-app.vercel.app 접속 가능
- [ ] 대시보드 로딩 정상
- [ ] PWA 설치 가능 (휴대폰에서)

### ✅ 백엔드 테스트
- [ ] https://your-api.onrender.com/api/health 응답 확인
- [ ] https://your-api.onrender.com/api/market-overview 데이터 확인

### ✅ 연동 테스트
- [ ] 실시간 주식 데이터 표시
- [ ] 주식 검색 기능 작동
- [ ] 캐시 무효화 정상 동작

---

## 📱 모바일 PWA 설치

### Android
1. Chrome에서 배포된 URL 접속
2. 주소창 옆 "설치" 아이콘 클릭
3. "설치" 버튼 클릭
4. 홈 화면에 앱 아이콘 추가됨

### iOS
1. Safari에서 배포된 URL 접속
2. 하단 공유 버튼 클릭
3. "홈 화면에 추가" 선택
4. "추가" 클릭

---

## 🚨 트러블슈팅

### CORS 오류 발생시
```javascript
// backend/server.js에서 CORS 설정 확인
const corsOptions = {
  origin: ['https://your-vercel-app.vercel.app'],
  credentials: true,
  optionsSuccessStatus: 200
}
```

### API 호출 실패시
```typescript
// .env.production에서 URL 확인
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

### 첫 로딩이 느린 경우
- Render 무료 플랜은 15분 후 슬립 모드
- 첫 접속시 30초 정도 소요 가능
- 유료 플랜 업그레이드 권장

---

## 🎉 배포 완료!

### 🌐 접속 URL
- **웹앱**: https://your-app.vercel.app
- **API**: https://your-api.onrender.com
- **PWA**: 모바일 홈 화면에서 앱으로 실행

### 📊 실시간 기능
- ✅ 5분마다 주식 데이터 자동 갱신
- ✅ 캐시 무효화로 최신 정보 보장
- ✅ 오프라인 지원 (PWA)
- ✅ PC 없이 독립 실행

### 🔄 자동 배포
- GitHub에 푸시하면 자동 재배포
- 프론트엔드: Vercel 자동 배포
- 백엔드: Render 자동 배포

---

## 📈 다음 단계 (선택사항)

### 고급 기능 추가
- [ ] 사용자 인증 (Auth0, Firebase Auth)
- [ ] 데이터베이스 연동 (PostgreSQL, MongoDB)
- [ ] 푸시 알림 (웹 푸시)
- [ ] 실시간 WebSocket 연결

### 성능 최적화
- [ ] CDN 설정
- [ ] 이미지 최적화
- [ ] 코드 스플리팅
- [ ] 캐싱 전략 개선

---

**🎊 축하합니다! PC 없이도 작동하는 모바일 금융 대시보드 완성!**