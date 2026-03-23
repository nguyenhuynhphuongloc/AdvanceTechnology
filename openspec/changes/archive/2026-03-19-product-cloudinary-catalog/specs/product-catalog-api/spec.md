## ADDED Requirements

### Requirement: Product catalog schema supports clothing products and variants
The product-service SHALL persist clothing catalog data with product identity, main image, gallery images, variants, and related product links in a schema suitable for listing and detail APIs.

#### Scenario: Product with variants is stored
- **WHEN** a product is created with size and color combinations
- **THEN** the product-service stores the product, its variants, and its media references so they can be queried independently

### Requirement: Product creation API accepts catalog payloads
The product-service SHALL provide `POST /api/v1/products` that accepts product fields including `name`, `slug`, `sku`, `description`, `category`, `base price`, `main image`, `gallery images`, and variant combinations.

#### Scenario: Create product with media and variants
- **WHEN** a client submits a valid create-product payload
- **THEN** the product-service creates the product and returns a representation that includes its media and variants

### Requirement: Product listing API supports storefront filtering
The product-service SHALL provide `GET /api/v1/products` with pagination, category filtering, search, and sorting for storefront use.

#### Scenario: Filter and sort product list
- **WHEN** a client requests the product list with category, search, and sort parameters
- **THEN** the product-service returns a paginated list of matching products in the requested order

### Requirement: Product detail API returns storefront-ready data
The product-service SHALL provide `GET /api/v1/products/:slug` and return product information, main image, gallery images, variants, available sizes, available colors, and related products.

#### Scenario: Product detail includes variant-derived options
- **WHEN** a client requests a product by slug
- **THEN** the response includes unique sizes and colors derived from the product's active variants along with related products

### Requirement: Related products API is available independently
The product-service SHALL provide `GET /api/v1/products/:slug/related` for product detail pages and related-product sections.

#### Scenario: Related products are retrieved by slug
- **WHEN** a client requests related products for a product slug
- **THEN** the product-service returns a list of related catalog items suitable for the storefront

### Requirement: API gateway continues to proxy product routes
The API gateway SHALL continue to proxy `/api/v1/products` requests to the product-service.

#### Scenario: Frontend requests products through gateway
- **WHEN** the frontend calls `/api/v1/products` through the API gateway
- **THEN** the request is forwarded to product-service and the response is returned without exposing service-local URLs

### Requirement: Frontend product pages use real catalog APIs
The Next.js frontend SHALL support `/products` and `/products/[slug]` using the gateway-backed product APIs for product listing, detail, and related product display.

#### Scenario: Product detail page renders API data
- **WHEN** a user opens `/products/[slug]`
- **THEN** the frontend fetches product detail and related products from the gateway and renders images, SKU, price, description, size options, and color options
