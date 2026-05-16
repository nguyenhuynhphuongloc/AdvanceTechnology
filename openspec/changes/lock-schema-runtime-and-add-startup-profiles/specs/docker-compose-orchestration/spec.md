## MODIFIED Requirements

### Requirement: Root compose file starts the full stack
The system SHALL provide a root `docker-compose.yml` that supports both full-stack startup and explicit feature-scoped startup groups for local development.

#### Scenario: Full stack startup
- **WHEN** a developer runs the documented full-stack command from the repository root
- **THEN** Docker Compose starts the gateway, all listed microservices, and the frontend as defined services

#### Scenario: Feature-scoped startup through compose groups
- **WHEN** a developer runs a documented workflow group command from the repository root
- **THEN** Docker Compose starts only the services assigned to that group and any explicitly required infrastructure dependencies

## ADDED Requirements

### Requirement: Compose orchestration must expose reusable workflow groups
The compose setup SHALL expose reusable service groups that map to the supported local workflows instead of requiring developers to start every service all the time.

#### Scenario: Product flow group includes only product dependencies
- **WHEN** a developer starts the `product-flow` group
- **THEN** the started services include `api-gateway`, `authentication-service`, `product-service`, `inventory-service`, and any explicitly required shared infrastructure for that flow

#### Scenario: Checkout flow group includes async workflow dependencies
- **WHEN** a developer starts the `checkout-flow` group
- **THEN** the started services include the checkout business services plus RabbitMQ and Redis when those dependencies are required by the running workflow
