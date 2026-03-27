## ADDED Requirements

### Requirement: Admin and storefront must share one Next.js runtime
The system SHALL serve the storefront routes and the admin routes from the same `my-app` Next.js application runtime, and local admin access SHALL use `http://localhost:3009/admin` instead of a separate admin-specific port.

#### Scenario: Developer opens admin locally
- **WHEN** the shared `my-app` runtime is running on port `3009`
- **THEN** the admin interface is reachable at `/admin` from the same frontend origin as the storefront

#### Scenario: Shared runtime serves storefront and admin
- **WHEN** a developer accesses `/`, a product route, and `/admin`
- **THEN** all of those routes are compiled and served by the same Next.js application instance

### Requirement: Frontend scripts must not require a separate admin server
The system SHALL not require a dedicated admin-specific development script or a legacy port `3010` runtime for local admin access.

#### Scenario: Developer inspects frontend package scripts
- **WHEN** a developer reads `my-app/package.json`
- **THEN** they do not find a required separate admin dev server command based on port `3010`
