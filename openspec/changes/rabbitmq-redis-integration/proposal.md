## Why

The repository already has a gateway-fronted microservice topology, but all inter-service coordination is still synchronous HTTP and most non-product services are only database-connected scaffolds. Adding RabbitMQ and Redis selectively now creates a safe path for asynchronous order workflows and low-latency read/state handling without pushing unnecessary infrastructure into every service.

## What Changes

- Add RabbitMQ as the event backbone for order lifecycle coordination between `order-service`, `inventory-service`, `payment-service`, and `notification-service`.
- Add Redis where the current architecture benefits from fast read-through caching or short-lived state, specifically product catalog caching, cart/session-like temporary cart state, and checkout stock reservation state.
- Keep `api-gateway`, `authentication-service`, and `user-service` on their current synchronous patterns unless a concrete use case emerges.
- Define a staged migration that preserves existing HTTP entry points and allows RabbitMQ/Redis adoption behind existing APIs.
- Document queue/topic responsibilities, Redis key strategy, retry handling, and rollout order before implementation starts.

## Capabilities

### New Capabilities
- `async-order-workflows`: RabbitMQ-backed event contracts and processing flow for order creation, inventory reservation, payment processing, and notification delivery.
- `redis-cache-and-state`: Redis-backed caching and ephemeral state management for product catalog reads, carts, and short-lived checkout reservation data.

### Modified Capabilities
<!-- None. -->

## Impact

- `docker-compose.yml` and local environment configuration for RabbitMQ and Redis infrastructure.
- `microservices/order-service`, `microservices/inventory-service`, `microservices/payment-service`, and `microservices/notification-service` for message publishing/consumption.
- `microservices/product-service` and `microservices/cart-service` for Redis-backed cache/state integration.
- Shared operational behavior around retries, dead-letter handling, cache invalidation, and rollout safety.
