## ADDED Requirements

### Requirement: Enforce admin role on admin orders and admin users routes
The API Gateway SHALL require both a valid JWT and an admin role before forwarding requests to `/api/v1/admin/orders/...` or `/api/v1/admin/users/...`.

#### Scenario: Admin token accesses admin data route
- **WHEN** a client provides a valid admin JWT for `/api/v1/admin/orders/...` or `/api/v1/admin/users/...`
- **THEN** the gateway forwards the request to the downstream service

#### Scenario: Non-admin token accesses admin data route
- **WHEN** a client provides a valid non-admin JWT for `/api/v1/admin/orders/...` or `/api/v1/admin/users/...`
- **THEN** the gateway returns a forbidden response and does not forward the request
