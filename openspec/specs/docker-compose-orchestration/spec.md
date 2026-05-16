## MODIFIED Requirements

### Requirement: Docker Compose starts one stable QA-ready runtime
The repository SHALL provide one canonical Docker Compose startup path that starts the services required for full website QA without requiring testers to choose a Compose profile.

#### Scenario: Tester starts the local stack
- **WHEN** a tester runs the documented Docker Compose startup command from the repository root
- **THEN** the frontend, API Gateway, backend services, cache, queue, and databases needed by the documented website flows are started together

#### Scenario: Gateway routes to downstream services
- **WHEN** the API Gateway receives requests for documented route groups
- **THEN** its downstream service URLs resolve to running containers on the Compose network

#### Scenario: Documentation describes the runtime
- **WHEN** a tester reads the runtime documentation
- **THEN** there is one primary startup command and one URL map for local QA
