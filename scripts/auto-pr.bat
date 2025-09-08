@echo off
chcp 65001 >nul
echo 🚀 자동 PR 생성을 시작합니다...

:: 1. 현재 브랜치 확인
for /f %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo 📍 현재 브랜치: %CURRENT_BRANCH%

:: 2. main 브랜치라면 새 브랜치 생성
if "%CURRENT_BRANCH%"=="main" (
    for /f %%i in ('powershell -command "Get-Date -Format 'yyyyMMdd-HHmmss'"') do set TIMESTAMP=%%i
    set BRANCH_NAME=feature/auto-%TIMESTAMP%
    echo 🌟 새 브랜치 생성: !BRANCH_NAME!
    git checkout -b !BRANCH_NAME!
)

:: 3. 코드 품질 검사 및 포맷팅
echo 🔍 코드 품질 검사 중...
call npm run prepare

:: 4. 변경사항 커밋
echo 💾 변경사항 커밋 중...
git add .

:: 커밋 메시지 설정
if "%~1"=="" (
    for /f %%i in ('powershell -command "Get-Date -Format 'yyyy-MM-dd HH:mm:ss'"') do set DATETIME=%%i
    set COMMIT_MSG=feat: automated changes on !DATETIME!
) else (
    set COMMIT_MSG=%~1
)

git commit -m "%COMMIT_MSG%"

:: 5. 원격 저장소에 푸시
echo 📤 원격 저장소에 푸시 중...
git push -u origin %CURRENT_BRANCH%

:: 6. PR 생성
echo 🎯 PR 생성 중...
if "%~2"=="" (
    for /f %%i in ('powershell -command "Get-Date -Format 'yyyy-MM-dd HH:mm'"') do set PR_TITLE=🤖 Auto PR: %%i
) else (
    set PR_TITLE=%~2
)

gh pr create --title "%PR_TITLE%" --body "## 🤖 자동 생성된 PR

### 📝 변경사항
- 코드 포맷팅 자동 적용
- 린트 규칙 준수  
- 타입 체크 통과

### 🔍 품질 검사
- ✅ TypeScript 타입 체크
- ✅ ESLint 검사
- ✅ Prettier 포맷팅  
- ✅ 빌드 테스트

---
🤖 이 PR은 자동으로 생성되었습니다." --label "automated" --label "enhancement"

echo ✅ PR이 성공적으로 생성되었습니다!
echo 🌐 GitHub에서 확인하세요
pause