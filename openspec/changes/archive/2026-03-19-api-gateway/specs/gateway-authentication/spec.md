## ADDED Requirements

### Requirement: Validate JWT Tokens
The API Gateway SHALL validate Authorization JWT tokens on protected routes before forwarding them to downstream services.

#### Scenario: Valid Token Provided
- **WHEN** a client provides a valid JWT in the `Authorization: Bearer <token>` header for a protected route
- **THEN** the gateway allows the request to pass through and appends the decoded user ID to a custom header (e.g., `X-User-Id`)

#### Scenario: Missing or Invalid Token
- **WHEN** a client provides an invalid, expired, or missing JWT on a protected route
- **THEN** the gateway returns a `401 Unauthorized` response immediately and does not forward the request
