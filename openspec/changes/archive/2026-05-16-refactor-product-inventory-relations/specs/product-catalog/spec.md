## MODIFIED Requirements

### Requirement: Product Data Structure
The `products` database entity SHALL NOT store a `stock` field. It SHALL store references via `categoryId` and `collectionId`.

#### Scenario: Create Product without Stock
- **WHEN** creating a new product
- **THEN** no `stock` value is accepted, stored, or managed directly by the product database.

#### Scenario: Fetch Product Metadata
- **WHEN** fetching a product via `product-service`
- **THEN** the core product metadata is returned without direct inventory counts, expecting the caller or gateway to fetch real stock from `inventory-service`.
