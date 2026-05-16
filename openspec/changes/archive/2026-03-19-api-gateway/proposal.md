## Why
The current architecture consists of multiple independent microservices (Auth, User, Product, Inventory, Cart, Order, Payment, and Notification). To provide a unified entry point for client applications and to handle cross-cutting concerns like authentication, routing, and rate limiting seamlessly, an API Gateway is required. This solves the problem of clients needing to know the individual addresses and protocols of each microservice.

## What Changes
- Implement a centralized API Gateway service.
- Configure dynamic or static routing to redirect client requests to the appropriate downstream microservices.
- Ensure authentication and authorization verification at the gateway level.
- Link all existing services (Auth, User, Product, Inventory, Cart, Order, Payment, Notification) behind this API Gateway.

## Capabilities

### New Capabilities
- `api-gateway-routing`: Core capability for routing incoming HTTP requests to corresponding microservices based on URL paths.
- `gateway-authentication`: Validating user tokens at the gateway level before forwarding requests to protected microservice endpoints.

### Modified Capabilities

## Impact
- **APIs**: Clients will now point to a single API Gateway URL instead of individual service URLs.
- **Systems**: A new container/service will be added to the infrastructure.
- **Dependencies**: The API Gateway will depend on the network addresses of all other microservices. All services will remain independent but will be accessed primarily via the gateway.
