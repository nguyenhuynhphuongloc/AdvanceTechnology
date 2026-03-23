## ADDED Requirements

### Requirement: Admin login issues a JWT session
The authentication-service SHALL provide an admin login endpoint that validates credentials and returns a signed JWT containing the authenticated user's identity and role.

#### Scenario: Successful admin login
- **WHEN** an admin submits valid credentials to the login endpoint
- **THEN** the authentication-service returns a JWT payload that includes the user's `id`, `email`, and `role`

#### Scenario: Invalid admin login is rejected
- **WHEN** a client submits invalid credentials to the login endpoint
- **THEN** the authentication-service returns an authentication error and no JWT is issued

### Requirement: Admin session state is persisted for authenticated requests
The admin UI SHALL persist the issued JWT in a session mechanism that can be attached to subsequent authenticated admin requests and cleared on logout.

#### Scenario: Authenticated admin request sends token
- **WHEN** an authenticated admin performs a protected product or inventory action
- **THEN** the admin request includes the stored JWT so the gateway can authorize it

#### Scenario: Logout clears admin session state
- **WHEN** an authenticated admin logs out
- **THEN** the stored JWT and related admin session state are cleared before the user is redirected away from protected admin pages

### Requirement: Admin routes and admin APIs require a valid admin JWT
The system SHALL deny access to admin pages and admin product or inventory APIs unless the request is authenticated with a valid JWT carrying admin privileges.

#### Scenario: Unauthenticated admin page access is redirected
- **WHEN** a browser requests a protected admin page without an authenticated admin session
- **THEN** the UI redirects the user to the admin login flow

#### Scenario: Non-admin token cannot access admin APIs
- **WHEN** a request to an admin product or inventory API is made with a valid JWT whose role is not `admin`
- **THEN** the system rejects the request with an authorization error
