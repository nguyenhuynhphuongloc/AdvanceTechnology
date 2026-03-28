## ADDED Requirements

### Requirement: Admins can list orders from the order service
The system SHALL expose a read-only admin orders endpoint backed by persisted order records so the admin dashboard can render real order data.

#### Scenario: Admin retrieves the order list
- **WHEN** an authenticated admin requests the admin orders list
- **THEN** the backend returns persisted order records with identifiers, status, totals, and timestamps from the order data store

### Requirement: Admins can inspect an order detail
The system SHALL expose a read-only admin order detail endpoint so the admin dashboard can inspect a specific order without using customer-scoped APIs.

#### Scenario: Admin retrieves an order detail
- **WHEN** an authenticated admin requests a specific order by its identifier
- **THEN** the backend returns the persisted order and its items if that order exists

#### Scenario: Requested order does not exist
- **WHEN** an authenticated admin requests an unknown order identifier
- **THEN** the backend returns a not-found response and does not fabricate a placeholder order
