## ADDED Requirements

### Requirement: Every application has a Docker build definition
The system SHALL include a Dockerfile for each NestJS microservice and for the Next.js frontend.

#### Scenario: Service-local image build definition exists
- **WHEN** a developer inspects an application directory
- **THEN** they find a Dockerfile that can build and run that application in local development

### Requirement: Services support env-file driven container runtime
The containerized setup SHALL load per-service environment variables from each application’s existing `.env` file, with compose-level overrides only where container networking requires them.

#### Scenario: Service container loads its configuration
- **WHEN** a service starts in Docker Compose
- **THEN** it receives configuration from its env file and any compose overrides required for container-to-container communication

### Requirement: Development containers support source-mounted iteration
The Docker-based development runtime SHALL support bind-mounted source code and a hot-reload oriented command for the NestJS and Next.js applications where feasible.

#### Scenario: Developer edits source while compose stack is running
- **WHEN** a developer changes application source mounted into a running container
- **THEN** the application reloads or restarts using its development command without requiring a full image rebuild

### Requirement: Ignore files prevent unnecessary Docker build context
The system SHALL include `.dockerignore` files that exclude dependencies, build output, and other non-essential local files from Docker build contexts.

#### Scenario: Docker build context stays focused
- **WHEN** Docker builds an application image
- **THEN** local directories such as `node_modules` and build artifacts are excluded from the build context by `.dockerignore`
