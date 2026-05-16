## MODIFIED Requirements

### Requirement: Development containers support source-mounted iteration
The Docker-based development runtime SHALL support bind-mounted source code and a hot-reload oriented command for the NestJS and Next.js applications where feasible, and the Next.js runtime SHALL serve both storefront and admin routes from the same `my-app` container.

#### Scenario: Developer edits source while compose stack is running
- **WHEN** a developer changes application source mounted into a running container
- **THEN** the application reloads or restarts using its development command without requiring a full image rebuild

#### Scenario: Shared frontend container serves admin routes
- **WHEN** Docker Compose starts the `my-app` development container
- **THEN** both storefront routes and `/admin` are available through the same frontend container on the shared frontend port

## ADDED Requirements

### Requirement: Containerized frontend runtime must not expose a separate admin port
The containerized development setup SHALL use only the shared `my-app` frontend runtime for admin access and SHALL not require an additional admin-specific container or frontend port mapping.

#### Scenario: Developer inspects frontend services in Compose
- **WHEN** a developer reviews the Docker Compose frontend setup
- **THEN** they find one `my-app` service exposing the shared frontend port and no separate admin frontend runtime
