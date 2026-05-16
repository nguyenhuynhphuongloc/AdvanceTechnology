## ADDED Requirements

### Requirement: Route Requests to Target Microservices
The API Gateway SHALL route incoming HTTP requests to the appropriate downstream microservice based on the URL path prefix.

#### Scenario: Proxy standard request
- **WHEN** a client sends a request to `/api/v1/users/...`
- **THEN** the gateway forwards the request to the `USER_SERVICE` and returns the response to the client

#### Scenario: Proxy unauthenticated request
- **WHEN** a client sends a request to `/api/v1/products/...`
- **THEN** the gateway forwards the request to the `PRODUCT_SERVICE` without verifying the token (if public route)

### Requirement: Handle Downstream Failures
The API Gateway SHALL handle downstream service unavailability gracefully.

#### Scenario: Service is down
- **WHEN** the targeted microservice is unreachable or times out
- **THEN** the gateway returns a `502 Bad Gateway` or `504 Gateway Timeout` JSON error response
