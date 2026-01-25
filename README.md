# Online Banking Microservices

This is a comprehensive microservices-based banking application built with Spring Boot, React, and MySQL.

## Architecture

The project follows a standard microservices architecture:
- **Discovery Service**: Eureka Server for service registration and discovery.
- **API Gateway**: Spring Cloud Gateway for centralized routing and security.
- **Authentication Service**: Handles user login, registration, and JWT token management.
- **Accounts Service**: Manages bank account information and operations.
- **Customer Service**: Handles customer profiles and data.
- **Transaction Service**: Processes financial transactions.
- **Email Service**: Handles email notifications and OTPs.
- **Config Service**: Centralized configuration management.
- **Client Service**: React-based frontend application.

## Getting Started

### Prerequisites
- Java 17
- Node.js & Yarn
- MySQL
- Docker & Docker Compose

### Local Development

1. **Start Infrastructure**: Run MySQL and the Config Service.
2. **Start Discovery Service**: Start the Eureka Server in `Discovery-Service`.
3. **Start Services**: Start each microservice using `mvn spring-boot:run`.
4. **Start Frontend**: Run `yarn start` in the `Client-Service` directory.

### Running with Docker

Use the root `docker-compose.yml` to start the entire system:
```bash
docker-compose up --build
```

## API Documentation

Each service provides Swagger UI documentation. Once running, access the API Gateway docs at `http://localhost:8080/swagger-ui.html`.
