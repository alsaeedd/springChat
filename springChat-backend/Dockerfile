FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy maven wrapper files
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Fix line endings in the mvnw script (Windows issue)
RUN apt-get update && apt-get install -y dos2unix && dos2unix mvnw && chmod +x mvnw

# Install dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src/ src/

# Build the application
RUN ./mvnw package -DskipTests

# Final stage
FROM openjdk:17-jdk-slim

WORKDIR /app

# Create directory for file uploads
RUN mkdir -p /tmp/uploads

# Copy the built jar file
COPY --from=0 /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]