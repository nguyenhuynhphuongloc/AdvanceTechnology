## ADDED Requirements

### Requirement: Product Catalog Reads Use Redis Read-Through Caching
The system SHALL have `product-service` use Redis as a read-through cache for product listing and product detail endpoints while keeping PostgreSQL as the source of truth.

#### Scenario: Product list is served from cache
- **WHEN** `product-service` receives a product list request and a matching cached response exists
- **THEN** it returns the cached response without querying PostgreSQL

#### Scenario: Product list cache is populated on miss
- **WHEN** `product-service` receives a product list request and no matching cache entry exists
- **THEN** it loads the response from PostgreSQL, returns it, and stores it in Redis with a bounded TTL

#### Scenario: Product detail cache is invalidated after a write
- **WHEN** `product-service` creates or updates a product that affects cached list or detail responses
- **THEN** it invalidates the affected Redis keys before subsequent reads are served

### Requirement: Cart Service Stores Active Carts in Redis
The system SHALL have `cart-service` store active cart snapshots in Redis for authenticated users and guest users using TTL-backed keys.

#### Scenario: Authenticated user cart is stored in Redis
- **WHEN** an authenticated user adds or removes cart items
- **THEN** `cart-service` updates the `cart:user:{userId}` Redis entry and refreshes its TTL

#### Scenario: Guest cart is stored in Redis
- **WHEN** a guest user mutates a cart
- **THEN** `cart-service` updates the `cart:guest:{guestToken}` Redis entry and refreshes its TTL

#### Scenario: Cart state is cleared after checkout or merge
- **WHEN** a cart is checked out successfully or merged into another cart
- **THEN** the corresponding Redis cart key is deleted

### Requirement: Inventory Reservations Use Expiring Redis Holds
The system SHALL have `inventory-service` store pending checkout reservations in Redis with per-order, per-variant TTL-backed keys.

#### Scenario: Reservation hold is created
- **WHEN** `inventory-service` accepts an order for reservation processing
- **THEN** it writes `inventory:hold:{orderId}:{variantId}` keys with the reserved quantity and expiration time

#### Scenario: Reservation hold expires
- **WHEN** a reservation hold reaches its TTL before the order is completed
- **THEN** the hold is no longer considered active for inventory allocation

#### Scenario: Reservation hold is removed after outcome
- **WHEN** an order is cancelled, payment fails, or stock is finalized successfully
- **THEN** `inventory-service` deletes the related reservation hold keys

### Requirement: Redis Is Optional Behind Feature Flags
The system SHALL allow services to run without Redis enabled so local development and staged rollout can preserve existing functionality.

#### Scenario: Redis is disabled for a service
- **WHEN** a service starts with Redis integration disabled by configuration
- **THEN** it continues serving requests using its non-Redis behavior without failing startup solely because Redis is unavailable
