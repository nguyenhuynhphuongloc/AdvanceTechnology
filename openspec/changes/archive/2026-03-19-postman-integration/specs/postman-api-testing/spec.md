## ADDED Requirements

### Requirement: Repository-hosted Postman artifacts
The system SHALL store Postman collections and environments in-repo under a `postman/` directory for team collaboration and review.

#### Scenario: Artifact location is discoverable
- **WHEN** a developer inspects the repository structure
- **THEN** they find Postman collections and environments under `postman/` with descriptive names

### Requirement: Gateway-first collection structure
The Postman workspace SHALL include a primary collection organized by API Gateway route groups with service-specific subfolders for debugging.

#### Scenario: Gateway route coverage
- **WHEN** a tester opens the main collection
- **THEN** requests are grouped by gateway route areas (e.g., auth, users, products, orders)

### Requirement: Standard environments with JWT automation
The Postman workspace SHALL provide at least `local` and `shared` environments with base URL variables and a workflow to populate a JWT access token for protected routes.

#### Scenario: Protected route request uses stored token
- **WHEN** a tester runs the login request in an environment
- **THEN** the access token is stored and used automatically for subsequent protected requests

### Requirement: Debugging support for direct service calls
The Postman workspace SHALL include optional service-level requests that target individual microservices for debugging.

#### Scenario: Service debugging request is available
- **WHEN** a tester selects a service debugging folder
- **THEN** they can send requests directly to that microservice using service base URL variables
