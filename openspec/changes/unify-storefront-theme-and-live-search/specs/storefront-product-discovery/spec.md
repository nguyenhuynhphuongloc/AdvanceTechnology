## ADDED Requirements

### Requirement: Search page uses database-backed catalog data
The storefront SHALL implement `/search` using real product data loaded through the existing frontend-to-gateway-to-product-service flow instead of mock or hardcoded product data.

#### Scenario: Search page loads catalog results from the backend
- **WHEN** a user opens `/search` with or without a search query
- **THEN** the frontend fetches catalog results from the gateway-backed product API and renders those results without relying on mock product fixtures

### Requirement: Search and listing state is URL-driven and shareable
The storefront SHALL preserve search, category or collection filtering, sorting, and pagination in query parameters so catalog result states are bookmarkable and shareable.

#### Scenario: Result state survives refresh and sharing
- **WHEN** a user applies search text, filters, sorting, or pagination on the search or listing experience
- **THEN** the resulting page state is represented in the URL and the same result set is restored on refresh or direct navigation

### Requirement: Product listing and search experiences handle result states consistently
The storefront SHALL provide consistent loading, empty, and error states for product listing and search pages while using the real catalog APIs.

#### Scenario: No matching products
- **WHEN** a search or filter combination returns no matching products
- **THEN** the storefront renders a dark-themed empty state with a clear explanation and a recovery path such as clearing filters or changing the query

### Requirement: Product detail continues to load the selected catalog item by slug
The storefront SHALL load product detail pages using the route slug and the existing catalog APIs so the displayed content reflects the database-backed product record and related items.

#### Scenario: Product detail route resolves through real catalog data
- **WHEN** a user opens `/products/:slug`
- **THEN** the frontend fetches the product detail and related products from the gateway-backed catalog APIs and renders the returned product fields, media, and variant data

### Requirement: Storefront product media comes from persisted catalog image fields
The storefront SHALL render product imagery from the database-backed image fields already used by the catalog system and only use a graceful fallback when an expected product image is missing.

#### Scenario: Catalog card uses persisted image URL
- **WHEN** a product card or detail page is rendered for a product with a stored image URL
- **THEN** the storefront displays that persisted image URL instead of a hardcoded demo asset
