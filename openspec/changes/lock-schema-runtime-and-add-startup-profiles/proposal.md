## Why

The current local runtime still lets several NestJS services mutate PostgreSQL schema on boot through TypeORM synchronization, which is unsafe for shared development databases and hides schema drift behind startup side effects. At the same time, the root Docker Compose workflow starts the entire stack for every task, which wastes local resources and makes it harder to work on isolated feature flows.

## What Changes

- Disable runtime schema mutation in every backend service so local and non-test startup operates against the existing database structure only.
- Audit all backend service bootstraps for schema-changing behavior and remove or disable any automatic table creation, column synchronization, or migrations-on-boot paths.
- Introduce explicit on-demand startup groups for core product work, cart work, checkout work, and full-stack development using short, repeatable local commands.
- Document the feature-to-service dependency map so developers know exactly which services, Redis usage, and RabbitMQ usage are required for each workflow.
- Preserve the existing architecture, service boundaries, ports, and full-stack startup path while adding smaller development startup options.

## Capabilities

### New Capabilities
- `schema-safe-service-runtime`: Guarantees that backend services never create or alter database schema during non-test startup.
- `feature-scoped-dev-startup`: Defines explicit local startup groups and a feature-to-service dependency map for on-demand development workflows.

### Modified Capabilities
- `docker-compose-orchestration`: Extend the compose-based local workflow so developers can start either the full stack or explicit feature-scoped service groups with simple commands.

## Impact

- Backend service database configuration in `microservices/authentication-service`, `microservices/user-service`, `microservices/product-service`, `microservices/inventory-service`, `microservices/cart-service`, `microservices/order-service`, `microservices/payment-service`, and `microservices/notification-service`.
- Root local orchestration in `docker-compose.yml`, root scripts, and developer documentation in `README.md`.
- Verification coverage for schema-safe startup and feature-scoped service boot combinations.
