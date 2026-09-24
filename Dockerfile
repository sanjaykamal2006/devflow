# ==============================================================================
# DEVFLOW BACKEND - ROOT DOCKERFILE FOR RAILWAY / CLOUD DEPLOYMENTS
# Stage 1: Build JAR using Maven and Eclipse Temurin JDK 21
# Stage 2: Minimal JRE runtime
# ==============================================================================

# Build Stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Cache dependencies
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Compile and package application
COPY backend/src ./src
RUN mvn clean package -DskipTests -B

# Runtime Stage
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

# Run as non-root user for container security
RUN addgroup -S devflow && adduser -S devflow -G devflow
USER devflow:devflow

# Copy compiled JAR
COPY --from=builder /build/target/devflow-backend-*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS="-XX:+UseG1GC -XX:+UseStringDeduplication -Xms256m -Xmx512m -XX:MaxRAMPercentage=75.0"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT:-8080}/api/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
