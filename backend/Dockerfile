# ./backend/Dockerfile.dev
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# Copy Maven wrapper, configuration, and source
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
COPY src src

# Ensure the wrapper is executable
RUN chmod +x mvnw

# Expose the Spring Boot port
EXPOSE 8080

# Run Spring Boot in development mode (DevTools will monitor for changes)
CMD ["./mvnw", "spring-boot:run"]
