## ADDED Requirements

### Requirement: Route admin order requests to the order service
The API Gateway SHALL forward admin order requests to the order-service using the `/api/v1/admin/orders` path prefix.

#### Scenario: Proxy admin orders request
- **WHEN** a client sends a request to `/api/v1/admin/orders/...`
- **THEN** the gateway forwards the request to the order service and returns the downstream response

### Requirement: Route admin user requests to the account source service
The API Gateway SHALL forward admin user requests to the service that owns the current account records using the `/api/v1/admin/users` path prefix.

#### Scenario: Proxy admin users request
- **WHEN** a client sends a request to `/api/v1/admin/users/...`
- **THEN** the gateway forwards the request to the account source service and returns the downstream response
