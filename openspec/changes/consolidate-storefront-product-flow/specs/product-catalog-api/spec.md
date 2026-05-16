## MODIFIED Requirements

### Requirement: Frontend product pages use real catalog APIs
The Next.js frontend SHALL support `/product` and `/product/[slug]` as the canonical public catalog routes, and those routes SHALL use the gateway-backed product APIs for product listing, detail, and related product display without substituting local mock or sample catalog data.

#### Scenario: Canonical product listing renders live catalog data
- **WHEN** a user opens `/product`
- **THEN** the frontend fetches the product listing through the API gateway from `GET /api/v1/products`
- **AND** the page renders catalog results, filters, sorting, and navigation from the live response instead of local fallback product data

#### Scenario: Canonical product detail page renders API data
- **WHEN** a user opens `/product/[slug]`
- **THEN** the frontend fetches product detail and related products from the gateway
- **AND** the page renders images, SKU, price, description, size options, color options, and related products from the live catalog response

## ADDED Requirements

### Requirement: Legacy duplicate product routes redirect to canonical catalog routes
The Next.js frontend SHALL treat `/products` and `/products/[slug]` as legacy compatibility routes that redirect users to the canonical `/product` and `/product/[slug]` catalog routes.

#### Scenario: Legacy listing route redirects to canonical listing
- **WHEN** a user opens `/products`
- **THEN** the frontend redirects the request to `/product`

#### Scenario: Legacy detail route redirects to canonical detail
- **WHEN** a user opens `/products/:slug`
- **THEN** the frontend redirects the request to `/product/:slug`
