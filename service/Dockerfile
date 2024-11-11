# Base image
FROM openjdk:17-jdk-alpine

# Set working directory
WORKDIR /service

# Copy the jar file from the target directory to the container
COPY ./build/libs/service-0.0.1-SNAPSHOT-plain.jar service.jar

# Run the application
ENTRYPOINT ["java", "-jar", "service.jar"]