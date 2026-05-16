## MODIFIED Requirements

### Requirement: Local runtime documentation is deterministic for QA
The project documentation SHALL describe the local containerized runtime in a way that produces repeatable QA setup.

#### Scenario: Tester prepares the environment
- **WHEN** a tester follows the documented local runtime setup
- **THEN** they can identify required env files, service ports, frontend URL, gateway URL, and external test credentials

#### Scenario: Optional debugging paths exist
- **WHEN** a tester needs to debug a downstream service directly
- **THEN** direct service URLs may be documented as debugging aids while the canonical test path remains gateway-first
