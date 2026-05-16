## ADDED Requirements

### Requirement: Admin-created MongoDB products populate public catalog
The storefront catalog SHALL read products from the MongoDB-backed product-service and display products created through the Admin product flow.

#### Scenario: Admin-created product appears in public list
- **WHEN** an authenticated Admin creates an active product with required media and variant data
- **THEN** `GET /api/v1/products` returns that product in `items`

#### Scenario: Empty MongoDB catalog remains a valid state
- **WHEN** MongoDB contains no active products
- **THEN** `GET /api/v1/products` returns `items: []` with a successful status and the frontend displays an empty catalog state

### Requirement: Admin product creation produces storefront-ready data
The Admin product creation flow SHALL collect and persist all data required for public list and detail rendering.

#### Scenario: Created product has required storefront fields
- **WHEN** an authenticated Admin creates a product
- **THEN** the persisted product data includes identity, slug, SKU, description, category, price, active status, main image, gallery image records, and at least one variant

#### Scenario: Product detail renders after Admin creation
- **WHEN** a public user opens the detail page for an Admin-created active product
- **THEN** `GET /api/v1/products/:slug` returns product details with main image, gallery images, variants, sizes, colors, and related product data where available

