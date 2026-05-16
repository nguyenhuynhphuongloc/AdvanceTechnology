## Context

The repository currently documents several Docker startup groups. QA documentation now requires a reliable baseline environment, so the Docker runtime should be optimized for repeatable test execution rather than partial-service experimentation.

## Goals

- One command starts the stable website test environment.
- The API Gateway can reach every downstream service it routes to.
- The frontend can reach the gateway consistently.
- Testers do not need to choose between `core`, `product-flow`, `cart-flow`, `checkout-flow`, and `full-stack`.

## Proposed Runtime Shape

```text
docker compose up -d --build
  |
  |-- my-app :3009
  |-- api-gateway :3000
  |-- authentication-service :3008
  |-- product-service :3001
  |-- inventory-service :3006
  |-- cart-service :3007
  |-- user-service :3002
  |-- order-service :3004
  |-- payment-service :3003
  |-- notification-service :3005
  |-- logging-service if currently supported by compose
  |-- redis :6379
  |-- rabbitmq :5672 / :15672
  |-- mongodb :27017
```

## Decisions

### Decision: Prefer one broad stable stack

The stable runtime should include the services needed for product browsing, cart, checkout, admin, inventory, orders, payments, notifications, and auth.

Rationale:
- The testing plan spans the full website.
- Partial flows hide missing dependencies.
- One canonical startup path reduces QA setup error.

### Decision: Keep direct service ports for local debugging unless explicitly removed later

Direct ports are useful for API debugging and Postman service isolation, but the canonical test path should remain gateway-first.

Rationale:
- The current Postman workspace includes gateway-first and service-debugging requests.
- Security testing needs to detect direct-service bypass risk.

### Decision: Update documentation alongside Compose

The Docker change is incomplete if README still tells testers to choose profiles.

Rationale:
- The primary problem is operational ambiguity.
- QA must be able to reproduce the same runtime from documentation.

## Risks

- Starting the full stack may require more RAM/CPU than smaller profiles.
- Some services may have config drift or missing env values that partial flows avoided.
- External integrations such as Stripe, Cloudinary, or n8n may still need test credentials.

## Rollback

- Restore profile-based startup if the full stable stack is too heavy.
- Keep the stable command documented as the recommended QA path even if developer-only profiles return later.
