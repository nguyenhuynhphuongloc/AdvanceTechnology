## Why

The current local workflow requires starting the API gateway, eight NestJS microservices, and the Next.js frontend in separate terminals. Containerizing the stack with Docker Compose will reduce setup friction, keep service wiring consistent, and make local onboarding and debugging much faster.

## What Changes

- Add Dockerfiles for every NestJS microservice and for the Next.js frontend.
- Add a root `docker-compose.yml` that starts the full local stack with one command.
- Configure service-to-service communication over Docker networking using service names instead of `localhost`.
- Preserve the current port layout for local access and update environment handling for containerized development.
- Add development-friendly Docker setup, including bind mounts and hot reload where feasible.

## Capabilities

### New Capabilities
- `docker-compose-orchestration`: Start the full local microservice and frontend stack with `docker compose up --build`.
- `containerized-dev-runtime`: Run each service in a Dockerized development environment with env-file support, service-name networking, and hot reload oriented volume mounts.

### Modified Capabilities
<!-- None. -->

## Impact

- Root infrastructure files such as `docker-compose.yml`.
- Dockerfiles and `.dockerignore` files across all microservices and `my-app`.
- Per-service environment variables, especially gateway downstream service URLs.
- Local development workflow, onboarding, and run commands.
