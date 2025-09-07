# 🔔 슬랙 알림 시스템 설정 가이드

## 빠른 설정 (5분 완료)

### 1단계: 슬랙 앱 생성 (2분)
1. **https://api.slack.com/apps** 접속
2. **"Create New App"** → **"From scratch"** 선택
3. **App Name**: `Claude-Code-Assistant`
4. **Workspace**: 기존 워크스페이스 선택 또는 새로 생성

### 2단계: Incoming Webhooks 활성화 (2분)
1. 생성된 앱에서 **"Incoming Webhooks"** 클릭
2. **"Activate Incoming Webhooks"** 토글 ON
3. **"Add New Webhook to Workspace"** 클릭
4. **채널 선택**: `#general` 또는 새 채널 `#claude-alerts` 생성
5. **"Allow"** 클릭
6. **Webhook URL 복사** (예: `https://hooks.slack.com/services/T.../B.../...`)

### 3단계: Claude Code에서 테스트 (1분)
다음 명령어로 바로 테스트:
```bash
curl -X POST -H 'Content-type: application/json' --data '{"text":"🤖 Claude Code 알림 시스템 테스트 완료!"}' YOUR_WEBHOOK_URL
```

---

## 🚀 자동 알림 규칙 (Claude용)

### 알림 발송 조건
- ⏰ **긴 작업 시작 시**: 예상 소요시간 5분 이상
- ✅ **작업 완료 시**: 결과 요약과 함께
- ❌ **에러 발생 시**: 즉시 알림
- 📊 **빌드/배포 완료 시**: 성공/실패 상태

### 메시지 템플릿
```json
{
  "text": "🤖 Claude Code 알림",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*작업명*: 프론트엔드 배포\n*상태*: ✅ 완료\n*소요시간*: 5분 30초"
      }
    }
  ]
}
```

---

## 💡 사용법

### 작업 시작 시 알림
```bash
curl -X POST -H 'Content-type: application/json' --data '{"text":"🔄 작업 시작: 백엔드 API 개발 (예상 15분)"}' YOUR_WEBHOOK_URL
```

### 작업 완료 시 알림  
```bash
curl -X POST -H 'Content-type: application/json' --data '{"text":"✅ 작업 완료: 백엔드 API 개발\n• 3개 엔드포인트 구현\n• 테스트 통과\n• 배포 준비 완료"}' YOUR_WEBHOOK_URL
```

### 에러 발생 시 알림
```bash
curl -X POST -H 'Content-type: application/json' --data '{"text":"❌ 에러 발생: CORS 정책 오류\n확인 필요: backend/server.js:42"}' YOUR_WEBHOOK_URL
```

---

## 🎵 맞춤 알림음 설정 (선택사항)

### 11Labs로 음성 생성
1. **https://elevenlabs.io** 접속
2. 음성 생성: **"코딩이 완료되었습니다"**
3. MP3 다운로드

### 안드로이드 설정
1. 다운로드한 MP3 → **`/storage/emulated/0/Notifications/`** 폴더 복사
2. **슬랙 앱 → 설정 → 알림 → 알림음 → 맞춤 알림음 선택**

### iOS 설정  
1. **GarageBand** 앱으로 MP3 → M4R 변환
2. **설정 → 사운드 및 햅틱 → 새로운 메일 → 맞춤 알림음**

---

## 🔧 Claude 규칙 파일 통합

이 내용을 Claude 규칙에 추가:

```markdown
## 슬랙 알림 규칙
- 코딩 작업 5분 이상 소요 예상 시 시작 알림 발송
- 작업 완료 시 결과 요약과 함께 완료 알림 발송  
- 빌드/배포 성공 시 성공 알림 발송
- 에러 발생 시 즉시 에러 내용과 함께 알림 발송
- 슬랙 웹훅 URL: [설정 완료 후 입력]
```

---

## ✅ 완료 체크리스트
- [ ] 슬랙 앱 생성 완료
- [ ] Webhook URL 생성 완료  
- [ ] Claude Code에서 테스트 메시지 발송 성공
- [ ] 맞춤 알림음 설정 (선택사항)
- [ ] AI 규칙 파일에 웹훅 URL 등록

**🎯 Webhook URL을 받으시면 바로 테스트해보겠습니다!**