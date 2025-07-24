FROM node:20-alpine

# 작업 디렉토리
WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 종속성 설치
COPY package.json pnpm-lock.yaml ./    
RUN pnpm install

# 앱 소스 복사
COPY . .

# 빌드
RUN pnpm run build

# 포트 노출
EXPOSE 3000

# 시작 명령
CMD ["pnpm", "start"]
