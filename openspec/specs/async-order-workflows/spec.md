## ADDED Requirements

### Requirement: Order Creation Publishes a Durable Workflow Event
The system SHALL persist a new order in `order-service` before publishing an `order.created` event to RabbitMQ, and the published event SHALL include an order identifier and correlation metadata required by downstream consumers.

#### Scenario: Order is accepted for asynchronous processing
- **WHEN** a client creates an order through the existing HTTP API
- **THEN** `order-service` persists the order with a pending workflow status and publishes `order.created` to the durable `commerce.events` exchange

#### Scenario: Event publication is unavailable
- **WHEN** `order-service` cannot publish `order.created` after persisting the order
- **THEN** the order remains in a recoverable pending/error state and the failure is logged with the order identifier for retry or operator intervention

### Requirement: Inventory Reservation Is Processed Asynchronously
The system SHALL have `inventory-service` consume `order.created`, validate stock against durable inventory records, create temporary reservation state, and publish either `inventory.reserved` or `inventory.reservation_failed`.

#### Scenario: Inventory reservation succeeds
- **WHEN** `inventory-service` receives an `order.created` event for an order with sufficient stock
- **THEN** it stores reservation state for the affected variants and publishes `inventory.reserved`

#### Scenario: Inventory reservation fails
- **WHEN** `inventory-service` receives an `order.created` event for an order with insufficient stock or invalid variants
- **THEN** it publishes `inventory.reservation_failed` and does not leave an active reservation for the failed order

### Requirement: Payment Processing Waits for Reserved Inventory
The system SHALL have `payment-service` consume `inventory.reserved` before attempting payment processing, and it SHALL publish either `payment.succeeded` or `payment.failed` after persisting transaction state.

#### Scenario: Payment is processed after reservation
- **WHEN** `payment-service` receives `inventory.reserved`
- **THEN** it records payment work in durable storage and publishes the payment outcome event for `order-service` and `notification-service`

#### Scenario: Payment is not attempted before reservation
- **WHEN** an order has not produced `inventory.reserved`
- **THEN** `payment-service` does not begin payment processing for that order

### Requirement: Order State Is Finalized From Workflow Outcomes
The system SHALL have `order-service` consume inventory and payment outcome events and update the persisted order status without requiring synchronous calls to downstream services.

#### Scenario: Order is confirmed after successful payment
- **WHEN** `order-service` receives `payment.succeeded`
- **THEN** it updates the corresponding order to a confirmed/paid state in PostgreSQL

#### Scenario: Order is cancelled after a failed workflow step
- **WHEN** `order-service` receives `inventory.reservation_failed` or `payment.failed`
- **THEN** it updates the corresponding order to a failed or cancelled state and records the failure reason

### Requirement: Workflow Queues Support Retry and Dead-Letter Handling
The system SHALL configure durable consumer queues with bounded retries and dead-letter queues so failed messages are not lost or retried indefinitely.

#### Scenario: Transient consumer failure is retried
- **WHEN** a workflow consumer encounters a transient processing error
- **THEN** the message is retried according to the configured retry policy before it is dead-lettered

#### Scenario: Non-recoverable message is isolated
- **WHEN** a workflow message exceeds the retry limit or is structurally invalid
- **THEN** the message is routed to the queue-specific dead-letter queue and logged with correlation metadata
