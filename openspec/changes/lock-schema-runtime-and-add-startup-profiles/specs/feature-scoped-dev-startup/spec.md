## ADDED Requirements

### Requirement: Local development startup groups must be explicit
The system SHALL define explicit local startup groups for `core`, `product-flow`, `cart-flow`, `checkout-flow`, and `full-stack`, and each group SHALL have a documented command that starts only the services required for that workflow.

#### Scenario: Developer starts product-focused work
- **WHEN** a developer runs the documented `product-flow` command
- **THEN** only the services and infrastructure required for product browsing and admin product management are started, while unrelated checkout services remain stopped

#### Scenario: Developer starts checkout-focused work
- **WHEN** a developer runs the documented `checkout-flow` command
- **THEN** the stack starts the services and infrastructure required for product browsing, cart, order processing, payment handling, and notifications

#### Scenario: Developer needs the entire local platform
- **WHEN** a developer runs the documented `full-stack` command
- **THEN** the full local stack still starts with all currently supported services and the frontend

### Requirement: Feature-to-service dependency mapping must be published
The system SHALL document, for each supported feature workflow, which service owns the data, which services must be running, and whether Redis or RabbitMQ is required.

#### Scenario: Developer checks cart dependencies
- **WHEN** a developer reads the local development workflow documentation for add-to-cart behavior
- **THEN** they can identify the owning service, required running services, and required Redis or RabbitMQ dependencies without inferring them from code

#### Scenario: Developer checks online checkout dependencies
- **WHEN** a developer reads the local development workflow documentation for online payment checkout
- **THEN** they can identify the owning service, required running services, and required Redis or RabbitMQ dependencies for that workflow

### Requirement: Smaller startup groups must avoid unrelated services
The system SHALL allow developers to start a smaller workflow group without automatically booting unrelated business services.

#### Scenario: Cart flow excludes checkout-only services
- **WHEN** a developer starts the `cart-flow` group
- **THEN** `order-service`, `payment-service`, and `notification-service` are not started unless the developer selects a checkout-capable group
