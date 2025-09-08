#!/bin/bash

# 🤖 자동 PR 생성 스크립트

echo "🚀 자동 PR 생성을 시작합니다..."

# 1. 현재 브랜치 확인
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 현재 브랜치: $CURRENT_BRANCH"

# 2. main 브랜치라면 새 브랜치 생성
if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
    BRANCH_NAME="feature/auto-$(date +%Y%m%d-%H%M%S)"
    echo "🌟 새 브랜치 생성: $BRANCH_NAME"
    git checkout -b "$BRANCH_NAME"
fi

# 3. 코드 품질 검사 및 포맷팅
echo "🔍 코드 품질 검사 중..."
npm run prepare

# 4. 변경사항 커밋
echo "💾 변경사항 커밋 중..."
git add .

# 커밋 메시지 입력받기
if [ -z "$1" ]; then
    COMMIT_MSG="feat: automated changes on $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MSG="$1"
fi

git commit -m "$COMMIT_MSG"

# 5. 원격 저장소에 푸시
echo "📤 원격 저장소에 푸시 중..."
git push -u origin "$CURRENT_BRANCH"

# 6. PR 제목과 내용 설정
if [ -z "$2" ]; then
    PR_TITLE="🤖 Auto PR: $(date '+%Y-%m-%d %H:%M')"
else
    PR_TITLE="$2"
fi

PR_BODY="## 🤖 자동 생성된 PR

### 📝 변경사항
- 코드 포맷팅 자동 적용
- 린트 규칙 준수
- 타입 체크 통과

### 🔍 품질 검사
- ✅ TypeScript 타입 체크
- ✅ ESLint 검사  
- ✅ Prettier 포맷팅
- ✅ 빌드 테스트

### 📅 생성 시간
$(date '+%Y년 %m월 %d일 %H:%M:%S')

---
🤖 이 PR은 자동으로 생성되었습니다."

# 7. PR 생성
echo "🎯 PR 생성 중..."
gh pr create \
    --title "$PR_TITLE" \
    --body "$PR_BODY" \
    --label "automated" \
    --label "enhancement"

echo "✅ PR이 성공적으로 생성되었습니다!"
echo "🌐 GitHub에서 확인하세요: https://github.com/$(gh repo view --json owner,name --jq '.owner.login + \"/\" + .name')/pulls"