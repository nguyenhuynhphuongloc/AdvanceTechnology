## 1. Docker Build Definitions

- [x] 1.1 Create a Dockerfile for each NestJS service under `microservices/`
- [x] 1.2 Create a Dockerfile for `my-app`
- [x] 1.3 Add `.dockerignore` files for backend services and the frontend

## 2. Compose Orchestration

- [x] 2.1 Create root `docker-compose.yml` with all backend services and `my-app`
- [x] 2.2 Configure host port mappings to preserve the current local development ports
- [x] 2.3 Configure a shared Docker network and service-name based communication between containers
- [x] 2.4 Configure bind mounts and development commands to support hot reload where feasible

## 3. Environment And Gateway Wiring

- [x] 3.1 Configure compose env-file loading for each service using existing `.env` files
- [x] 3.2 Override API gateway downstream URLs to use Docker Compose service names instead of `localhost`
- [x] 3.3 Update any frontend or gateway environment references required for containerized local access

## 4. Verification And Documentation

- [x] 4.1 Verify the full stack starts with `docker compose up --build`
- [x] 4.2 Verify the API gateway can reach downstream services through Docker networking
- [x] 4.3 Document how containers communicate and how to start the full system
