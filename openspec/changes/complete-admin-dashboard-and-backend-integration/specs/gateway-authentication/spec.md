## MODIFIED Requirements

### Requirement: Validate JWT Tokens
The API Gateway SHALL validate Authorization JWT tokens on protected routes before forwarding them to downstream services.

#### Scenario: Valid Token Provided
- **WHEN** a client provides a valid JWT in the `Authorization: Bearer <token>` header for a protected route
- **THEN** the gateway allows the request to pass through, appends the decoded user ID to a custom header, and preserves downstream auth context

#### Scenario: Missing or Invalid Token
- **WHEN** a client provides an invalid, expired, or missing JWT on a protected route
- **THEN** the gateway returns a `401 Unauthorized` response immediately and does not forward the request

## ADDED Requirements

### Requirement: Admin routes require admin authorization
The API Gateway SHALL require admin-level authorization for all `/api/v1/admin/...` routes exposed to the admin frontend.

#### Scenario: Non-admin token accesses admin route
- **WHEN** a client with a valid non-admin token calls an `/api/v1/admin/...` route
- **THEN** the gateway rejects the request with a forbidden or unauthorized response and does not forward it downstream
