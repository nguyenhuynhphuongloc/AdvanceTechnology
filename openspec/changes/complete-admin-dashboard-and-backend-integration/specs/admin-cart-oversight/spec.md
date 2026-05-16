## ADDED Requirements

### Requirement: Admin can browse cart records
The system SHALL provide protected admin cart APIs and UI screens for browsing cart records owned by users or guests according to available service ownership.

#### Scenario: Admin opens carts module
- **WHEN** an authenticated admin navigates to the carts page
- **THEN** the UI loads cart summaries from a protected admin cart endpoint with owner context, item counts, and last-updated timestamps

### Requirement: Admin can inspect carts in relation to users
The admin UI SHALL link cart records to the owning user or guest support context rather than treating carts as isolated resources.

#### Scenario: Admin reviews a user-linked cart
- **WHEN** an authenticated admin opens a cart detail from a user or carts page
- **THEN** the system shows the cart items together with the related account context when that account exists
