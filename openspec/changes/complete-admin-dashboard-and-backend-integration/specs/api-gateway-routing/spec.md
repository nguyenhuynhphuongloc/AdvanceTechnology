## MODIFIED Requirements

### Requirement: Route Requests to Target Microservices
The API Gateway SHALL route incoming HTTP requests to the appropriate downstream microservice based on the URL path prefix.

#### Scenario: Proxy standard request
- **WHEN** a client sends a request to `/api/v1/users/...`
- **THEN** the gateway forwards the request to the `USER_SERVICE` and returns the response to the client

#### Scenario: Proxy unauthenticated request
- **WHEN** a client sends a request to `/api/v1/products/...`
- **THEN** the gateway forwards the request to the `PRODUCT_SERVICE` without verifying the token for public catalog routes

#### Scenario: Proxy authenticated admin request
- **WHEN** an authenticated admin sends a request to `/api/v1/admin/products`, `/api/v1/admin/categories`, `/api/v1/admin/inventory`, `/api/v1/admin/branches`, `/api/v1/admin/orders`, `/api/v1/admin/payments`, `/api/v1/admin/carts`, `/api/v1/admin/users`, `/api/v1/admin/store-settings`, `/api/v1/admin/notifications`, or `/api/v1/admin/logs`
- **THEN** the gateway forwards the request to the owning downstream service and preserves the protected admin path contract for the frontend
