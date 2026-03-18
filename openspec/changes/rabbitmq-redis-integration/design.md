## Context

The current repository is a gateway-fronted e-commerce workspace with a Next.js storefront in `my-app`, a NestJS API gateway in `microservices/api-gateway`, and eight NestJS backend services. In the actual implementation state, the gateway is active and proxies HTTP traffic to downstream services, and `product-service` is the only backend with meaningful business endpoints (`GET/POST /api/v1/products`, image upload, slug detail, related products). The remaining backend services are mostly Nest scaffolds with PostgreSQL configuration and default `GET /` handlers.

Current architecture summary:

- **Services**
  - `my-app`: storefront UI
  - `api-gateway`: single HTTP entry point, JWT validation, proxy routing
  - `authentication-service`: auth domain scaffold with DB config
  - `user-service`: profile domain scaffold with DB config
  - `product-service`: live catalog APIs, TypeORM persistence, Cloudinary integration
  - `cart-service`: cart domain scaffold with DB config
  - `inventory-service`: inventory domain scaffold with DB config
  - `order-service`: order domain scaffold with DB config
  - `payment-service`: payment domain scaffold with DB config
  - `notification-service`: notification domain scaffold with DB config
- **Current communication flow**
  - `my-app -> api-gateway -> downstream service` over synchronous HTTP
  - `api-gateway` injects `X-User-Id` and `X-User-Role` for authenticated routes
  - No implemented event bus or direct service-to-service async messaging exists today
- **Current database usage**
  - Each backend service is configured for its own PostgreSQL connection via `TypeOrmModule`
  - `product-service` also uses `sql.js` in tests
  - Repository documentation includes per-domain schemas for auth, user, product, inventory, cart, order, payment, and notification tables
- **Performance-sensitive operations**
  - Product catalog listing and slug detail reads are the only clearly live read-heavy flows today
  - Image upload is externally dependent on Cloudinary and can be latency-sensitive
  - Future checkout flow across order, inventory, payment, and notification will become a synchronous bottleneck if kept as chained HTTP calls
- **Potential failure points**
  - Gateway timeout is fixed at 2 seconds, so long synchronous chains will fail quickly
  - Product reads always hit the database today and are fetched from the frontend with `cache: "no-store"`
  - Any future payment, stock reservation, or notification work done synchronously would couple service availability tightly

These constraints argue for a minimal integration:
- introduce RabbitMQ only for the order-processing workflow that naturally spans multiple services and background side effects
- introduce Redis only for read-heavy catalog data and short-lived operational state that should not live exclusively in PostgreSQL

## Goals / Non-Goals

**Goals:**
- Preserve the current gateway-first HTTP API while adding internal asynchronous coordination where it reduces coupling.
- Use RabbitMQ only for order-domain event flow across `order-service`, `inventory-service`, `payment-service`, and `notification-service`.
- Use Redis only for product read caching, cart/session-like temporary cart state, and inventory reservation state.
- Define queue topology, retry behavior, Redis keys, and rollout order in a way that can be implemented incrementally.
- Keep PostgreSQL as the durable source of truth for business records.

**Non-Goals:**
- Rebuild every service around RabbitMQ or Redis.
- Replace the API gateway with message-driven request handling.
- Move authentication tokens or user profile data into Redis without a concrete need.
- Make Redis the source of truth for products, orders, inventory, or payments.
- Refactor unrelated modules or force immediate domain completion for currently scaffolded services.

## Decisions

- **Keep external client traffic on HTTP through the API gateway**
  - The current system already has a clear entry point and route protection model. RabbitMQ and Redis should sit behind that boundary, not replace it.
  - Alternative: expose message-driven entry points or direct service calls. Rejected because the storefront already depends on gateway-routed HTTP and the repo does not contain infrastructure for client-side messaging.

- **Use RabbitMQ only for order lifecycle orchestration**
  - RabbitMQ provides clear value where work is cross-service, durable, and latency-tolerant: order creation, stock reservation, payment processing, notification dispatch, retries, and dead-letter handling.
  - Services using RabbitMQ:
    - `order-service`: publishes order lifecycle events and consumes downstream outcome events
    - `inventory-service`: consumes order-created events, reserves/releases stock, publishes reservation outcomes
    - `payment-service`: consumes inventory-reserved events, performs payment work, publishes payment outcomes
    - `notification-service`: consumes order/payment outcome events and sends notifications asynchronously
  - Services not using RabbitMQ:
    - `product-service`: catalog reads/writes do not require asynchronous fan-out today
    - `cart-service`: cart operations are interactive and local to one service
    - `api-gateway`, `authentication-service`, `user-service`: no current repository evidence justifies event-driven behavior here
  - Alternative: integrate RabbitMQ into every service. Rejected because the current implementation would absorb a lot of infrastructure without immediate architectural gain.

- **Use Redis only for cache and ephemeral operational state**
  - Redis provides value where the data is read-heavy or intentionally short-lived.
  - Services using Redis:
    - `product-service`: read-through caching for `GET /api/v1/products` and `GET /api/v1/products/:slug`
    - `cart-service`: temporary active-cart storage keyed by user or guest token with TTL
    - `inventory-service`: short-lived stock reservation holds keyed by order/variant with TTL
  - Services using both RabbitMQ and Redis:
    - `inventory-service`: it participates in the async order workflow and needs reservation state that expires automatically if checkout stalls
  - Services using neither:
    - `api-gateway`, `authentication-service`, `user-service`
  - Alternative: use Redis for JWT/session storage, payment state, or broad shared caching. Rejected because the gateway already validates stateless JWTs and the current codebase does not need a cross-service session store.

- **Model the async flow as choreography over a shared topic exchange**
  - Use one durable topic exchange, `commerce.events`, with explicit domain routing keys. This keeps topology simple while still allowing consumer-specific queues.
  - Core routing keys:
    - `order.created`
    - `inventory.reserved`
    - `inventory.reservation_failed`
    - `payment.succeeded`
    - `payment.failed`
    - `order.cancelled`
  - Consumer queues:
    - `inventory.order-created`
    - `payment.inventory-reserved`
    - `order.inventory-failed`
    - `order.payment-results`
    - `notification.order-events`
  - Dead-letter queues:
    - `<queue>.dlq` for every durable queue
  - Alternative: request/reply RPC over RabbitMQ or a central orchestrator service. Rejected because the workflow is linear enough for domain events and a new orchestrator service would add unnecessary moving parts.

- **Keep PostgreSQL authoritative and use Redis as a derived layer**
  - Product records, carts that must survive checkout, inventory counts, orders, and payment transactions remain durable in PostgreSQL.
  - Redis caches or holds are derived copies and can be rebuilt or expired safely.
  - Alternative: move hot-path inventory or cart truth into Redis first. Rejected because the current codebase is already structured around service-owned relational persistence.

- **Use explicit cache invalidation instead of broad pub/sub invalidation**
  - `product-service` can delete or refresh its own cache keys after product mutations without introducing extra invalidation infrastructure.
  - Cart and inventory reservation keys are naturally bounded by TTL and workflow outcomes.
  - Alternative: distribute cache invalidation over RabbitMQ. Rejected because only one live service currently benefits from catalog caching and local invalidation is simpler.

## Risks / Trade-offs

- **[Order workflow becomes eventually consistent] -> Mitigation:** keep user-facing HTTP responses explicit about `pending` states and persist durable order/payment state before publishing events.
- **[Message delivery succeeds but consumer processing fails repeatedly] -> Mitigation:** durable queues, bounded retry policy, and per-queue DLQs with operational logging.
- **[Redis reservations drift from PostgreSQL inventory counts] -> Mitigation:** treat Redis holds as temporary overlays, confirm or release them through `inventory-service`, and reconcile against PostgreSQL before final stock deduction.
- **[Catalog cache serves stale product data] -> Mitigation:** short TTLs plus explicit invalidation on product create/update/delete paths.
- **[Infrastructure complexity increases for mostly scaffolded services] -> Mitigation:** phase the work behind `RABBITMQ_ENABLED` and `REDIS_ENABLED` flags and only modify services with a defined use case.

## Migration Plan

1. Add RabbitMQ and Redis containers to `docker-compose.yml`, plus service-specific environment variables without changing any public endpoints.
2. Add lightweight infrastructure modules or adapters to the exact services that need them:
   - Redis in `product-service`, `cart-service`, `inventory-service`
   - RabbitMQ in `order-service`, `inventory-service`, `payment-service`, `notification-service`
3. Implement `product-service` Redis cache first because it is the lowest-risk improvement and affects an already live API.
4. Implement `cart-service` Redis cart state next, keeping PostgreSQL-compatible persistence behavior for checkout boundaries.
5. Implement `inventory-service` Redis reservation holds and RabbitMQ consumers/publishers.
6. Implement `order-service` event publishing and order state transitions.
7. Implement `payment-service` event consumption/publication.
8. Implement `notification-service` event consumers and retry/DLQ handling.
9. Enable the new infrastructure incrementally per service using environment flags so existing HTTP behavior remains functional during rollout.

Rollback strategy:
- Disable `RABBITMQ_ENABLED` or `REDIS_ENABLED` per service to return to DB-only and HTTP-only behavior.
- Keep HTTP endpoints unchanged so callers do not need to roll back with the infrastructure.
- Because PostgreSQL remains authoritative, Redis flushes or RabbitMQ shutdowns do not require destructive data migration.

## Open Questions

- Should the first implementation of `cart-service` persist every Redis cart write through to PostgreSQL immediately, or only at checkout/login merge boundaries?
- Should payment retries stay inside `payment-service` worker logic first, or should the first version rely only on queue redelivery and DLQ inspection?
- Is a separate `inventory.confirmed` event needed after payment success, or can stock finalization remain internal to `inventory-service` in the first rollout?

## Updated Interaction Flow

Read-heavy catalog flow:

1. `my-app` requests product data through `api-gateway`.
2. `product-service` checks Redis for cached list/detail data.
3. On cache miss, `product-service` loads from PostgreSQL, returns the response, and stores the cache entry with TTL.
4. On product write paths, `product-service` invalidates affected cache keys.

Checkout workflow:

1. Client creates an order through `api-gateway -> order-service`.
2. `order-service` persists the order in PostgreSQL with `pending` status, then publishes `order.created`.
3. `inventory-service` consumes `order.created`, places reservation holds in Redis, verifies against PostgreSQL inventory, and publishes either `inventory.reserved` or `inventory.reservation_failed`.
4. `payment-service` consumes `inventory.reserved`, processes payment, persists transaction state, and publishes `payment.succeeded` or `payment.failed`.
5. `order-service` consumes the inventory/payment outcomes and updates order state in PostgreSQL.
6. `notification-service` consumes order/payment outcome events and delivers notifications asynchronously.
7. `inventory-service` releases Redis reservation holds on failure/cancellation or finalizes the reservation on success.

## Event Topics / Queues

Exchange:

- `commerce.events` (topic, durable)

Routing keys:

- `order.created`
- `inventory.reserved`
- `inventory.reservation_failed`
- `payment.succeeded`
- `payment.failed`
- `order.cancelled`

Queues:

- `inventory.order-created`
- `payment.inventory-reserved`
- `order.inventory-failed`
- `order.payment-results`
- `notification.order-events`

Failure handling:

- Every queue SHALL have a dead-letter queue named `<queue>.dlq`.
- Consumers SHALL log correlation IDs, order IDs, and retry counts.
- Non-transient failures SHALL be dead-lettered after bounded retries instead of infinite requeue loops.

## Redis Key Strategy

- `catalog:list:{hash(query)}`: cached product listing responses, TTL 60-120 seconds
- `catalog:detail:{slug}`: cached product detail responses, TTL 300 seconds
- `cart:user:{userId}`: authenticated user active cart snapshot, TTL 30 minutes
- `cart:guest:{guestToken}`: guest cart snapshot, TTL 30 minutes
- `inventory:hold:{orderId}:{variantId}`: reserved quantity for a pending checkout, TTL 5-10 minutes

Key rules:

- Product cache keys MUST be invalidated by `product-service` after catalog writes.
- Cart keys MUST be refreshed on mutation and deleted after successful checkout or merge.
- Inventory hold keys MUST be deleted on reservation failure, order cancellation, or successful stock finalization.
