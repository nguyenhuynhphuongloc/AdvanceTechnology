### Requirement: Variant Stock Management via Inventory Service
The `inventory-service` SHALL automatically track physical stock for all variants using their unique Variant UUID from `product-service`.

#### Scenario: Variant creation triggers inventory initialization
- **WHEN** `product-service` emits a ProductCreated or VariantsCreated event containing Variant UUIDs
- **THEN** `inventory-service` automatically creates a new `inventory_items` record for each Variant UUID with 0 stock in the default branch.
