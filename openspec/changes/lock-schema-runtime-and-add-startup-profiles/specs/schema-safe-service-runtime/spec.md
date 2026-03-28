## ADDED Requirements

### Requirement: Backend services must not mutate schema during non-test startup
The system SHALL configure every backend service to treat the existing database schema as a prerequisite in non-test runtime, and no service SHALL create tables, add columns, rename columns, change constraints, synchronize entities, or otherwise mutate the real database structure during startup.

#### Scenario: TypeORM-backed service starts against PostgreSQL
- **WHEN** `authentication-service`, `user-service`, `product-service`, `inventory-service`, `cart-service`, `order-service`, `payment-service`, or `notification-service` starts in a non-test environment
- **THEN** its runtime database configuration disables automatic schema synchronization, disables automatic schema drops, and does not execute migrations automatically on boot

#### Scenario: Existing schema is incomplete or mismatched
- **WHEN** a backend service starts against a database whose schema does not match its entities
- **THEN** the service does not attempt to patch the schema automatically and any failure is surfaced as a normal runtime/configuration error

### Requirement: Runtime bootstrap must not contain hidden schema-creation paths
The system SHALL not include bootstrap code paths in non-test runtime that execute raw DDL, query-runner schema helpers, or equivalent schema creation/update logic during application startup.

#### Scenario: Service bootstrap is audited for startup DDL
- **WHEN** a developer inspects backend startup code and database bootstrap paths
- **THEN** they do not find any non-test startup logic that creates tables, alters columns, changes constraints, or silently reconciles schema drift

### Requirement: Test-only schema setup remains isolated from live runtime
The system SHALL allow test-specific in-memory database setup to keep using automatic schema creation only when it is isolated from real PostgreSQL environments.

#### Scenario: Automated tests use in-memory SQL.js setup
- **WHEN** a service runs in a test environment that uses SQL.js or another isolated ephemeral datastore
- **THEN** test-only schema synchronization remains allowed without changing the schema safety guarantees for non-test runtime
