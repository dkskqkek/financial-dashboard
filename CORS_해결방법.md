# 🔧 CORS 문제 해결 방법 (Yahoo Finance API 전용)

Yahoo Finance API를 사용할 때 CORS 오류가 발생하는 경우 아래 방법들을 시도해주세요.

## 🚀 방법 1: 브라우저 확장 프로그램 (가장 쉬움)

### Chrome 사용자
1. **CORS Unblock** 확장 프로그램 설치
   - Chrome 웹 스토어에서 "CORS Unblock" 검색
   - 설치 후 확장 프로그램 아이콘 클릭하여 활성화

2. **Disable CORS** 확장 프로그램 설치
   - "Disable CORS" 검색하여 설치
   - 개발 시에만 활성화

### Firefox 사용자
1. **CORS Everywhere** 확장 프로그램 설치

## 🛠️ 방법 2: Chrome 개발자 모드 실행

### Windows
```bash
# 기존 Chrome 완전 종료 후 실행
"C:\Program Files\Google\Chrome\Application\chrome.exe" --user-data-dir="C:/temp/chrome_dev_session" --disable-web-security --disable-features=VizDisplayCompositor
```

### Mac
```bash
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_session" --disable-web-security
```

### Linux
```bash
google-chrome --user-data-dir="/tmp/chrome_dev_session" --disable-web-security
```

## 🌐 방법 3: 로컬 프록시 서버 실행

### Node.js cors-anywhere 사용
```bash
# 새 터미널에서 실행
npx cors-anywhere

# 또는 글로벌 설치
npm install -g cors-anywhere
cors-anywhere
```

그 후 브라우저에서 `http://localhost:8080/corsdemo` 접속하여 활성화

### Python 간단 프록시 (Python 3.x)
```python
# proxy.py 파일 생성
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request
import json

class ProxyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        target_url = self.path[1:]  # Remove leading '/'
        if target_url.startswith('http'):
            try:
                with urllib.request.urlopen(target_url) as response:
                    self.send_response(200)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(response.read())
            except Exception as e:
                self.send_error(500, str(e))

if __name__ == '__main__':
    server = HTTPServer(('localhost', 8081), ProxyHandler)
    print("Proxy server running on http://localhost:8081")
    server.serve_forever()
```

```bash
python proxy.py
```

## 🔍 방법 4: 개발자 도구로 확인

1. **F12** 키로 개발자 도구 열기
2. **Console** 탭에서 오류 확인
3. 다음과 같은 로그가 보이는지 확인:
   ```
   🔍 주식 검색 시작: AAPL
   🌐 Yahoo API 호출 시도: allorigins...
   ✅ Yahoo API 호출 성공
   ✅ 글로벌 주식 조회 성공: Apple Inc. (NASDAQ)
   ```

## ⚡ 방법 5: 온라인 CORS 프록시 테스트

다음 프록시들이 작동하는지 테스트:

1. **allorigins.win** (우선 사용)
   ```
   https://api.allorigins.win/get?url=https://query1.finance.yahoo.com/v7/finance/quote?symbols=AAPL
   ```

2. **corsproxy.io** (백업)
   ```
   https://corsproxy.io/?https://query1.finance.yahoo.com/v7/finance/quote?symbols=AAPL
   ```

## 🚨 문제 해결

### 여전히 CORS 오류가 발생하는 경우

1. **모든 브라우저 탭 종료** 후 다시 시도
2. **캐시 및 쿠키 삭제**:
   - Chrome: Ctrl+Shift+Delete → 모든 항목 선택 후 삭제
3. **다른 브라우저**로 테스트 (Firefox, Edge 등)
4. **네트워크 상태 확인** (VPN, 방화벽 등)

### 개발자 콘솔 오류 메시지별 해결책

**"Failed to fetch"**
- 프록시 서버 상태 확인
- 인터넷 연결 확인

**"CORS policy blocked"**
- 브라우저 CORS 우회 설정 확인
- 확장 프로그램 활성화 상태 확인

**"Network error"**
- Yahoo Finance API 서버 상태 확인
- 다른 프록시 서버 시도

## 🎯 성공 확인 방법

다음 단계로 API 호출이 성공했는지 확인:

1. 개발자 도구 Console 탭 열기
2. 주식 코드 입력 (예: "005930", "AAPL")
3. 다음과 같은 성공 로그 확인:
   ```
   🔍 종목 검색 시작: AAPL
   ✅ Yahoo Finance에서 조회 성공: Apple Inc.
   ```

## 📞 추가 지원

위 방법들로도 해결되지 않는 경우:
1. 사용 중인 **운영체제와 브라우저 버전** 확인
2. **콘솔의 전체 오류 메시지** 복사
3. **네트워크 환경** (회사, 학교, 가정 등) 확인

---

**중요**: 이 설정들은 개발 목적으로만 사용하고, 실제 서비스 배포 시에는 백엔드 서버를 통해 API 호출하는 것을 권장합니다.