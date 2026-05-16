## ADDED Requirements

### Requirement: Root compose file starts the full stack
The system SHALL provide a root `docker-compose.yml` that starts `api-gateway`, all backend microservices, and `my-app` with a single `docker compose up --build` command.

#### Scenario: Full stack startup
- **WHEN** a developer runs `docker compose up --build` from the repository root
- **THEN** Docker Compose starts the gateway, all listed microservices, and the frontend as defined services

### Requirement: Host ports remain aligned with current local development
The compose setup SHALL expose host ports that match the project’s current local development ports for the gateway, frontend, and backend services.

#### Scenario: Existing local port expectations remain valid
- **WHEN** the compose stack is running
- **THEN** a developer can access each service through the same host port currently used in manual development

### Requirement: Gateway routing uses Docker service discovery
The compose setup SHALL configure the API gateway container to reach downstream services using Docker service names instead of `localhost`.

#### Scenario: Gateway resolves downstream service by compose service name
- **WHEN** the gateway proxies a request inside the compose network
- **THEN** the gateway targets the downstream service using its Docker Compose service hostname
