## ADDED Requirements

### Requirement: Security tests are safe and local/dev scoped
The QA process SHALL execute security tests only in approved local or development environments.

#### Scenario: Tester runs a security case
- **WHEN** a security test is executed
- **THEN** it uses bounded, non-destructive inputs and avoids production systems

### Requirement: High-risk auth and exposure cases are prioritized
The QA process SHALL prioritize authentication, authorization, direct service exposure, public mutation, CORS, and spoofing checks.

#### Scenario: Security testing begins
- **WHEN** the stable runtime is available
- **THEN** high-risk gateway and auth checks are executed before lower-priority header checks

### Requirement: Vulnerability evidence is recorded without secrets
The QA process SHALL record enough evidence to reproduce a vulnerability without exposing sensitive credentials or tokens.

#### Scenario: Vulnerability is confirmed
- **WHEN** a security case fails
- **THEN** the report captures sanitized request/response details, impact, priority, and follow-up recommendation
