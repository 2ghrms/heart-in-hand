# sg25-7 
## 노트 필기를 디지털로! 스마트 텍스트 변환
### note-web-app (Web Application) & spring-server (Web server) & flask-server (AI server) 
# 설치 및 실행방법
## IDE
- Cursor

  https://cursor.com/downloads
  
- Intellij Ultimate

  https://www.jetbrains.com/idea/download/?section=windows
  
## 필수 Downloads
- Git

  https://git-scm.com/downloads/win

- Docker

  https://www.docker.com/

## Docker 사용 시, Settings
  1. `git clone`을 통해 레포지토리 파일을 가져옴
  2. Spring 서버 환경변수 설정: `spring-server/src/main/resources/application.yml`에 사용될 다음 항목을 **로컬 DB 정보에 맞게 프로젝트 루트에 .env를 생성하여 직접 입력**하여 DB(값유지), MQ(값유지), Flask(값유지), gpt(키 발급), jwt(키 발급) 등 연동 
  ```ini
  MARIA_DB_USERNAME=sg25_user
  MARIA_DB_PASSWORD=sg25_pass
  MARIA_DB_URL=jdbc:mariadb://mariadb:3306/mydb
  RABBIT_MQ_HOST=rabbitmq
  RABBIT_MQ_PORT=5672
  RABBIT_MQ_USERNAME=guest
  RABBIT_MQ_PASSWORD=guest
  FLASK_URL=http://flask-app:5000
  OPENAI_API_KEY=your-dummy-api-key
  JWT_KEY=your-dummy-jwt-key
  ```
  4. Web 환경변수 설정: `./note-web-app/`에 사용될 다음 항목을 **디렉토리 루트에 .env를 생성하여 직접 해당 값 입력**
  ```ini
  SERVER_API_BASE_URL=http://spring-server:8080
  ```
  5. `docker-compose up --build` 로 미리 설정된 컨테이너 구성 실행
  6. `http://localhost:8080` 에서 API 가용
  7. `http://localhost:3000`를 통해서 웹 서비스 가용

## Docker 미사용 시, Downloads & Settings

### download etc (docker 미사용 시)
- nodejs

  https://nodejs.org/ko/download
  
- java 17

  https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html

- Gradle 8+

    따로 설치할 필요 없이, 프로젝트에 Gradle Wrapper (`gradlew`)가 포함된 경우 `./gradlew bootRun`으로 실행 가능, 이 후 Build.gradle 의존성은 Gradle이 다운로드
  
- maria db (download 후 실행 필요)

  https://mariadb.com/docs/platform/post-download/mariadb-server-11.7.2
  
- RabbitMQ (download 후 실행 필요)

  https://www.rabbitmq.com/docs/download  
  → 설치 전에 **Erlang 설치 필요**: https://www.erlang.org/downloads

- Python (3.10 이상 권장)  

  https://www.python.org/downloads/  
  ※ 설치 시 "Add Python to PATH" 체크 → `pip` 자동 설치
  
### settings (docker 미사용 시)
  1. `git clone`을 통해 레포지토리 파일을 가져옴
  2.  Spring 서버 설정: `spring-server/src/main/resources/application.yml`에서 다음 항목을 **로컬 DB 정보에 맞게 직접 입력하거나 환경변수로 주입**하여 DB, MQ, gpt(키 발급), jwt(키 발급) (Maria DB와 Rabbit MQ는 로컬 실행 후 계정 세팅 필요)

    - MARIA_DB_URL
    - MARIA_DB_USERNAME
    - MARIA_DB_PASSWORD 

    - RABBIT_MQ_HOST
    - RABBIT_MQ_PORT
    - RABBIT_MQ_USERNAME
    - RABBIT_MQ_PASSWORD

    - FLASK_URL

    - JWT_KEY

    - OPEN_AI_KEY

  3. Web 환경변수 설정: `./note-web-app/`에 사용될 다음 항목을 **디렉토리 루트에 .env를 생성하여 직접 해당 값 입력**
    
  ```ini
  SERVER_API_BASE_URL=http://localhost:8080
  ```  
  4. Flask 서버 설정: Flask 서버 디렉토리로 이동 후 라이브러리 설치

     - 'pip install -r requirements.txt'
    
  5. spring-server 실행 (spring-server 디렉토리 루트에서)

     - '.\gradlew bootRun'
     
  6. flask-server 실행 (gunicorn 사용; flask-server 디렉토리 루트에서)

     - 'gunicorn --bind 0.0.0.0:5000 app:app --workers 4 --threads 2'

  7. `localhost:8080`을 통해서 API 가용

  8. web application을 위해서 의존성 설치 및 실행

     - 'npm install'
     - 'npm run dev'
    
  9. `http://localhost:3000`를 통해서 웹 서비스 가용

# 기술 명세     
## API 명세서
**📌 기본 URL 프리픽스**
  /api/v1
  로그인·회원·필기(노트) 기능은 이 경로 밑에서 분리

**📌 인증 API**
| 메서드    | URL                    | 설명               |
| ------ | ---------------------- | ---------------- |
| `POST` | `/api/v1/auth/login`   | 로그인              |
| `POST` | `/api/v1/auth/logout`  | 로그아웃             |
| `POST` | `/api/v1/auth/refresh` | Access Token 재발급 |

**📌 회원 API**
| 메서드      | URL                       | 설명          |
| -------- | ------------------------- | ----------- |
| `GET`    | `/api/v1/members/{id}`    | 특정 회원 정보 조회 |
| `GET`    | `/api/v1/members/my-info` | 내 정보 조회     |
| `PATCH`  | `/api/v1/members/{id}`    | 회원 정보 수정    |
| `DELETE` | `/api/v1/members/{id}`    | 회원 삭제       |


📌 노트 API
| 메서드      | URL                      | 설명         |
| -------- | ------------------------ | ---------- |
| `POST`   | `/api/v1/notes`          | 노트 생성      |
| `GET`    | `/api/v1/notes/{noteId}` | 노트 상세 조회   |
| `DELETE` | `/api/v1/notes/{noteId}` | 노트 삭제      |
| `GET`    | `/api/v1/notes/my-notes` | 내 노트 목록 조회 |

## Security 구현 방식

본 프로젝트에서는 **JWT(JSON Web Token)**를 이용한 인증을 구현하며, 토큰은 HTTP-Only 쿠키로 저장 및 전송됩니다. 이는 보안성과 Spring Security와의 호환성을 고려한 선택입니다.

**🔐 인증 방식**
모든 인증된 요청은 초기에 JWT 기반 인증 사용 후, 세션을 통해 토큰을 Stateful하게 사용합니다.

JWT 인증: Authorization: Bearer <ACCESS_TOKEN>

이후, 일정 시간(30분) 동안 HttpSession 기반 인증 (memberId 세션으로 전달됨)

인증 방식: JWT 쿠키 기반 인증

**✅ 인증 절차**

- 로그인 요청

  클라이언트(Next.js)는 /api/v1/auth/login으로 이메일/비밀번호 POST 요청을 보냅니다.
  
  서버(Spring Boot)는 Access Token과 Refresh Token을 HttpOnly 쿠키로 응답합니다.
  
  Set-Cookie: access_token=...; HttpOnly; Path=/; Max-Age=900
  Set-Cookie: refresh_token=...; HttpOnly; Path=/; Max-Age=604800

- 이후 요청 인증

  클라이언트는 별도의 설정 없이 쿠키를 자동 전송합니다.
  
  서버에서는 쿠키에서 access_token을 추출하여 인증합니다.
  
  클라이언트 측 fetch 또는 axios 요청에는 반드시 다음을 명시합니다:

    credentials: "include"

- 토큰 만료 시 재발급

  Access Token이 만료되면 클라이언트는 /api/v1/auth/refresh로 요청을 보내고,
  
  Refresh Token 쿠키를 통해 새로운 Access Token을 발급받습니다.

**Spring Security 설정**
/auth/** permitAll

나머지 authenticated

JWT 필터로 세션(STATELESS) 유지

## Spring <-> Flask 비지니스 로직
| 단계 | 동작                 | 설명                                |
| -- | ------------------ | --------------------------------- |
| 1  | 회원 인증 후, Spring 서버의 노트생성 API 실행 → 노트 생성  | 트랜잭션 내에서 노트와 이미지 객체를 DB에 저장       |
| 2  | 이미지 저장             | 파일 시스템에 이미지 저장 (로컬 경로 기준)         |
| 3  | Flask로 REST API 호출 | 비동기 방식으로 `WebClient`를 통해 분석 요청 전송 |
| 4  | 분석 결과는 별도 MQ(RabbitMQ) 수신    | 결과를 기다리지 않고 논블로킹 처리 → 확장성 확보      |


## 메시지 큐 (Rabbit MQ)

큐이름: note.analyze.result	
기능: Flask → Spring 등으로 분석 결과 전달용 큐

분석 이후 Spring 서버의 MQ listner가 분석 결과를 아래의 사진처럼 업데이트 해준다!

![image](https://github.com/user-attachments/assets/d32a6d9b-01c6-4932-8452-624afebc0c14)

## Docker Volume 설정
- 목적

  MariaDB의 데이터를 컨테이너 외부에 안전하게 저장하기 위해 Docker Volume을 사용하였습니다.
  컨테이너가 삭제되더라도 DB 데이터가 유지되도록 설정했습니다.

- 설정 내용

  volumes:
    mariadb-data:
    
  MariaDB 서비스에서는 다음과 같이 mariadb-data 볼륨을 사용합니다:

  ```yaml
  services:
    mariadb:
      ...
      volumes:
        - mariadb-data:/var/lib/mysql
  ```

- 효과
  
  docker compose down 실행 시에도 데이터 유지
  
  MariaDB의 실제 데이터 경로 /var/lib/mysql이 mariadb-data 볼륨에 매핑됨
  
  데이터가 Docker 엔진의 내부 볼륨 스토리지에 저장됨

- 기타 참고

  Docker가 생성한 볼륨은 docker volume ls로 확인 가능

## Docker-Compose 기반 멀티 컨테이너 아키텍처
본 프로젝트는 Docker Compose를 활용하여  Spring Boot (Web server), Flask (AI server), MariaDB, RabbitMQ 등 4개 주요 컴포넌트를 각각의 컨테이너로 분리하여 구성하였습니다.
컨테이너 간 네트워크는 Compose의 backend 네트워크를 통해 내부 서비스 이름으로 직접 접근 가능합니다 (flask-app:5000, mariadb:3306 등).

- 목적 및 효과

  1. 환경변수(.env) 및 Dockerfile 기반의 명확한 버전 관리

  2. 의존성 격리로 로컬 환경 오염 없이 일관된 실행 가능

  3. MQ, AI 서버, DB 등을 독립적으로 수평 확장하거나 교체 가능

## WSGI 서버 적용 (Flask + Gunicorn)
Flask 서버는 Gunicorn을 통해 실행됩니다. 이는 Python Flask 개발 서버가 아닌 WSGI(Web Server Gateway Interface) 호환 프로덕션 서버로, 다중 요청 처리와 성능 최적화에 특화되어 있습니다.

- Python WSGI 표준을 따르는 Gunicorn을 통해 안정적 실행

- 단일 프로세스 개발 서버와 달리 멀티 워커 기반 병렬 처리로 서비스 다운 최소화

## 📦 기술 스택
### Web Server
Spring Boot 3.2.5

Java 17

Gradle 8

Spring Security + JWT

Swagger (OpenAPI 2.5)

### AI Server
Python

Flask

Gunicorn

### DB / MQ
MariaDB

RabbitMQ

### Docker
Docker

Docker Compose (선택)

### Web Application

TypeScript

Next.js 15

## 🧪 테스트
Swagger UI를 통해 테스트 가능:

http://localhost:8080/swagger-ui/index.html

또는 Postman으로 직접 API 호출
  
# 향후 고려사항
## 서버 배포시 점검 사항:

Secure, SameSite, Domain 설정 추가

Exception Handling 구조 도입

nginx를 도입 하여 TLS 인증서 설정, 로드밸런싱, 도메인 기반 라우팅 가능

Redis 도입 시 jwt 인증 블랙리스트 외부 저장

## 서버 확장 고려사항

Flask 서버 다운 시 예외 처리	subscribe(..., error -> log.error(...)) 외에도 실패 시 retry 전략이 필요할 수도 있음

이미지 업로드 위치 분리	현재는 로컬 경로지만, S3 연동 시 storedPath를 URL로 확장할 수 있도록 구조 유지 가능

병렬 전송 고려	향후 이미지 수가 많아지면 Flux.fromIterable().flatMap(...)을 활용한 병렬 처리 가능

## 웹 개발 시 고려 사항

CORS 설정	브라우저가 쿠키를 주고받기 위해 withCredentials 사용해야 함 (Access-Control-Allow-Credentials: true)

SameSite 정책	Set-Cookie에 SameSite=None; Secure 설정 필요 (https 환경)

로그인 응답	쿠키 외에도 memberId, name 등의 정보를 body에 담아 반환하면 프론트에서 분기 로직 작성 용이

