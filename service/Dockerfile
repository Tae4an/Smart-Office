# Use the official OpenJDK 17 base image
FROM openjdk:17-jdk-slim

# Set the working directory in the container
WORKDIR /app

# Copy the jar file from the target directory to the working directory
COPY build/libs/*.jar service.jar

# Run the jar file
ENTRYPOINT ["java","-jar", "/app/service.jar"]