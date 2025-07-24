FROM gradle:8.4.0-jdk17 AS build

WORKDIR /app

# Gradle 설정 파일 먼저 복사 (Groovy DSL 기준)
COPY build.gradle settings.gradle ./
COPY gradle gradle
RUN gradle build --no-daemon -x test || return 0

# 전체 소스 복사 후 본격 빌드
COPY . .
RUN gradle build --no-daemon -x test

FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
