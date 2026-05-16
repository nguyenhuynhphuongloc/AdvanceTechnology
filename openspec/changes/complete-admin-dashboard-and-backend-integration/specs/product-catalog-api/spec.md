## MODIFIED Requirements

### Requirement: Product creation API accepts catalog payloads
The product-service SHALL provide `POST /api/v1/products` and protected admin product routes that accept product fields including `name`, `slug`, `sku`, `description`, `categoryId`, optional `collectionId`, `base price`, `main image`, `gallery images`, and variant combinations.

#### Scenario: Create product with media and variants
- **WHEN** an authenticated admin submits a valid create-product payload
- **THEN** the product-service creates the product and returns a representation that includes its category linkage, media, and variants

### Requirement: Product detail API returns storefront-ready data
The product-service SHALL provide `GET /api/v1/products/:slug` and return product information, main image, gallery images, variants, available sizes, available colors, and related products.

#### Scenario: Product detail includes variant-derived options
- **WHEN** a client requests a product by slug
- **THEN** the response includes unique sizes and colors derived from the product's active variants along with related products and category linkage identifiers

## ADDED Requirements

### Requirement: Admin product CRUD supports variant management
The product-service SHALL provide protected admin product endpoints that support create, read, update, and delete workflows for products and their variant metadata.

#### Scenario: Admin updates variants on a product
- **WHEN** an authenticated admin updates a product with changed variants
- **THEN** the product-service persists variant additions, removals, metadata updates, and variant image associations as part of the product administration workflow

### Requirement: Admin product responses include management context
The product-service SHALL return admin product payloads with enough context for management UIs, including category linkage, variant records, media, and related product references.

#### Scenario: Admin opens product editor
- **WHEN** an authenticated admin requests a product detail by id from the admin route
- **THEN** the response contains the full product management payload needed to edit metadata, images, and variants without requiring mock defaults
