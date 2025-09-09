# Node.js 백엔드용 Dockerfile
FROM node:18-alpine

WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# 포트 설정
EXPOSE 8080

# 환경변수 설정 (Cloud Run은 PORT=8080 사용)
ENV PORT=8080

# 서버 시작
CMD ["npm", "start"]