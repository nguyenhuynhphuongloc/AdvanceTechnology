## Context
The system currently consists of multiple detached microservices (Auth, User, Product, Inventory, Cart, Order, Payment, Notification) running independently. Clients need to interact with various services directly, increasing client complexity, exposing internal service details, and requiring each service to independently handle cross-cutting concerns (like token validation).

## Goals / Non-Goals

**Goals:**
- Provide a single entry point for all client requests.
- Implement robust request routing to corresponding backend services.
- Centralize authentication (JWT validation) to simplify downstream services.

**Non-Goals:**
- Consolidating microservice databases.
- Replacing the Auth service's role in *issuing* tokens.
- Implementing business logic in the API Gateway.

## Decisions

- **Gateway Technology**: Use NestJS with `@nestjs/microservices` or a lightweight proxy library like `http-proxy-middleware` for the gateway because the team is already using Node.js/NestJS (as indicated by the `app.module.js` structure in `authentication-service`). 
- **Authentication Location**: Validate tokens at the API Gateway. It minimizes redundant checks in downstream services. The Auth service still issues the tokens.
- **Routing Strategy**: Direct path-based mapping (/api/v1/auth -> Auth Service, /api/v1/users -> User Service).
- **Module Organization**:
  - `auth.module`: Centralized JWT validation using `@nestjs/passport` and `@nestjs/jwt`. Validates token signature and expiration, but does *not* issue tokens. Provides `JwtAuthGuard` to protect routes.
  - `proxy.module`: Encapsulates proxy logic (e.g., using `http-proxy-middleware`). Responsible for forwarding requests and injecting `X-User-Id` headers into downstream requests for authenticated users.
  - `routes.module`: Contains controllers mapped to API prefixes (e.g., `/api/v1/orders`). These controllers enforce authentication (via `JwtAuthGuard`) and delegate the actual request forwarding to the `proxy.module`.

## Risks / Trade-offs

- Single point of failure -> Mitigation: Run multiple instances of the API Gateway behind a load balancer.
- Increased latency -> Mitigation: The overhead of JWT verification and proxying is minimal in the same network, keep the gateway lightweight.
