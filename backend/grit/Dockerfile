FROM eclipse-temurin:25-jdk-noble AS builder

WORKDIR /workspace

COPY gradlew settings.gradle build.gradle gradle.properties ./
COPY gradle ./gradle
RUN chmod +x gradlew

COPY src ./src
RUN ./gradlew clean bootJar --no-daemon

FROM eclipse-temurin:25-jre-noble

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system grit \
    && useradd --system --gid grit --home-dir /app --shell /usr/sbin/nologin grit

WORKDIR /app

COPY --from=builder --chown=grit:grit /workspace/build/libs/grit-*.jar /app/grit.jar

USER grit

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/grit.jar"]
