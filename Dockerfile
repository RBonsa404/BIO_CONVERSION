# Image unique : le backend Spring Boot embarque et sert le frontend Angular.
# Utilisée telle quelle par Railway et par docker-compose.

# ── 1. Frontend Angular ──────────────────────────────────────────────────────
FROM node:24-slim AS frontend

WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

# ── 2. Backend Spring Boot ───────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17-alpine AS build

WORKDIR /workspace
COPY pom.xml .
COPY src ./src
# Le build Angular devient les ressources statiques du jar
COPY --from=frontend /frontend/dist/frontend/browser ./src/main/resources/static
RUN mvn -B -DskipTests package

# ── 3. Exécution ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=build --chown=spring:spring /workspace/target/bioconversion-backend-0.1.0-SNAPSHOT.jar app.jar
USER spring

ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0"

# Le port réel est celui de la variable PORT (8080 par défaut)
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
