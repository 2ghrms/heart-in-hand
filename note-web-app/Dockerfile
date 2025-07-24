FROM node:20-alpine

# 작업 디렉토리
WORKDIR /app

# 종속성 설치
COPY package.json pnpm-lock.yaml ./    
RUN npm install --legacy-peer-deps   

# 앱 소스 복사
COPY . .

# 빌드
RUN npm run build

# 포트 노출
EXPOSE 3000

# 시작 명령
CMD ["npm", "start"]
