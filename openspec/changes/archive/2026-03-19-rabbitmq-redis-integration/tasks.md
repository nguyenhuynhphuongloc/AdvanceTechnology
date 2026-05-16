## 1. Infrastructure And Configuration

- [x] 1.1 Add RabbitMQ and Redis services to `docker-compose.yml` with persistent-ready local defaults
- [x] 1.2 Add `RABBITMQ_*`, `REDIS_*`, `RABBITMQ_ENABLED`, and `REDIS_ENABLED` environment configuration to the affected services
- [x] 1.3 Add shared startup validation so services only require RabbitMQ or Redis when the corresponding feature flag is enabled

## 2. Redis Cache And Ephemeral State

- [x] 2.1 Add Redis client dependencies and a minimal Redis integration module to `product-service`
- [x] 2.2 Implement read-through Redis caching for `GET /api/v1/products` and `GET /api/v1/products/:slug` in `product-service`
- [x] 2.3 Implement cache invalidation in `product-service` for any product write path that affects cached list or detail responses
- [x] 2.4 Add Redis client dependencies and a minimal Redis integration module to `cart-service`
- [x] 2.5 Implement TTL-backed Redis cart storage for authenticated and guest cart keys in `cart-service`
- [x] 2.6 Add Redis client dependencies and reservation-hold storage to `inventory-service`
- [x] 2.7 Implement TTL-backed `inventory:hold:{orderId}:{variantId}` reservation keys with cleanup on failure, cancellation, or success

## 3. RabbitMQ Workflow Integration

- [x] 3.1 Add RabbitMQ client dependencies and messaging configuration to `order-service`, `inventory-service`, `payment-service`, and `notification-service`
- [x] 3.2 Implement `order-service` order event publishing for durable `order.created` messages after order persistence
- [x] 3.3 Implement `inventory-service` consumer logic for `order.created` and publish `inventory.reserved` or `inventory.reservation_failed`
- [x] 3.4 Implement `payment-service` consumer logic for `inventory.reserved` and publish `payment.succeeded` or `payment.failed`
- [x] 3.5 Implement `order-service` consumers for inventory and payment outcome events to finalize order state
- [x] 3.6 Implement `notification-service` consumers for order and payment outcome events
- [x] 3.7 Configure durable queues, bounded retries, and dead-letter queues for each workflow consumer

## 4. Verification And Rollout

- [x] 4.1 Add tests for product-service Redis cache hit, miss, and invalidation behavior
- [x] 4.2 Add tests for cart-service Redis TTL-backed cart persistence and cleanup behavior
- [x] 4.3 Add tests for inventory-service reservation hold creation, expiration handling, and cleanup
- [x] 4.4 Add integration tests or scripts that verify the RabbitMQ order workflow from `order.created` through payment and notification outcomes
- [x] 4.5 Verify all affected services still start correctly with feature flags disabled
- [x] 4.6 Document the service decision matrix, event routing keys, Redis key strategy, and staged rollout procedure
