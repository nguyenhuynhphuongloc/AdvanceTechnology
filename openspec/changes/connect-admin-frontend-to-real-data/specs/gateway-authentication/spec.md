## MODIFIED Requirements

### Requirement: Validate JWT Tokens
The API Gateway SHALL validate Authorization JWT tokens on protected routes before forwarding them to downstream services, and the admin frontend SHALL present protected admin pages only when a real validated admin session token is available.

#### Scenario: Valid Token Provided
- **WHEN** a client provides a valid JWT in the `Authorization: Bearer <token>` header for a protected route
- **THEN** the gateway allows the request to pass through and appends the decoded user ID to a custom header (e.g., `X-User-Id`)

#### Scenario: Missing or Invalid Token
- **WHEN** a client provides an invalid, expired, or missing JWT on a protected route
- **THEN** the gateway returns a `401 Unauthorized` response immediately and does not forward the request

#### Scenario: Admin page is opened without a valid session
- **WHEN** a browser requests a protected `/admin` page without a valid admin session token that passes frontend session validation
- **THEN** the frontend redirects the user to `/admin/login` instead of rendering the protected admin content
