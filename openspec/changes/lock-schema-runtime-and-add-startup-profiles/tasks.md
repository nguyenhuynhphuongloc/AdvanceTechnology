## 1. Harden schema-safe runtime

- [x] 1.1 Audit `authentication-service`, `user-service`, `product-service`, `inventory-service`, `cart-service`, `order-service`, `payment-service`, and `notification-service` for `synchronize`, `migrationsRun`, `dropSchema`, raw DDL bootstrap logic, and any startup schema mutation paths
- [x] 1.2 Update each affected TypeORM-backed service so non-test PostgreSQL runtime uses `synchronize: false`, `migrationsRun: false`, and `dropSchema: false` without changing test-only in-memory setup
- [x] 1.3 Remove or disable any remaining runtime bootstrap code that can create or alter schema objects automatically outside tests

## 2. Add feature-scoped startup workflow

- [x] 2.1 Refactor the root `docker-compose.yml` to define explicit startup groups for `core`, `product-flow`, `cart-flow`, `checkout-flow`, and `full-stack`
- [x] 2.2 Add short root-level commands or helper scripts for each startup group that work cleanly in local Windows development
- [x] 2.3 Ensure smaller startup groups exclude unrelated services while preserving the existing full-stack startup path

## 3. Document service ownership and operator workflow

- [x] 3.1 Update root developer documentation with the schema-safety guarantee, affected services, and the exact settings that prevent runtime schema mutation
- [x] 3.2 Add a feature-to-service dependency map covering browse products, view product detail, admin product CRUD, add to cart, checkout COD, checkout online payment, and notification sending
- [x] 3.3 Document the exact commands for `core`, `product-flow`, `cart-flow`, `checkout-flow`, and `full-stack`, including when Redis and RabbitMQ are required

## 4. Validate behavior

- [x] 4.1 Verify no backend service creates or alters database schema at startup after the configuration changes
- [x] 4.2 Verify `product-flow` starts only product-related services and supports product browsing/admin product management
- [x] 4.3 Verify `cart-flow` requires `cart-service` and does not start checkout-only services
- [x] 4.4 Verify `checkout-flow` starts the required order, payment, notification, RabbitMQ, and Redis dependencies
- [x] 4.5 Verify `full-stack` mode still starts the entire local platform successfully
