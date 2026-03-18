## ADDED Requirements

### Requirement: Admin can query inventory by product and variant identity
The system SHALL provide authenticated inventory lookup for admins by product, SKU, and variant so stock can be inspected without direct database access.

#### Scenario: Admin views inventory for a product
- **WHEN** an authenticated admin requests inventory for a product
- **THEN** the system returns stock records for the product's variants including product, variant, and SKU identifiers

#### Scenario: Admin searches inventory by SKU
- **WHEN** an authenticated admin searches inventory using a SKU or variant identifier
- **THEN** the system returns the matching inventory record or records needed for stock management

### Requirement: Inventory responses expose stock status
The system SHALL expose inventory status for admin workflows based on stock data so admins can distinguish available, low-stock, and out-of-stock items.

#### Scenario: Low-stock status is returned
- **WHEN** an authenticated admin requests inventory for a variant whose quantity is below the configured threshold but above zero
- **THEN** the inventory response includes a low-stock status for that record

#### Scenario: Out-of-stock status is returned
- **WHEN** an authenticated admin requests inventory for a variant whose available quantity is zero
- **THEN** the inventory response includes an out-of-stock status for that record

### Requirement: Admin can update inventory quantity
The system SHALL allow authenticated admins to update inventory quantities for a product variant through the gateway-backed inventory-service.

#### Scenario: Admin updates stock quantity
- **WHEN** an authenticated admin submits a valid quantity update for an existing inventory record
- **THEN** the inventory-service persists the new quantity and returns the updated stock state

#### Scenario: Inventory update for missing variant is rejected
- **WHEN** an authenticated admin attempts to update inventory for a non-existent product or variant
- **THEN** the system returns a not-found error and no stock change is applied
