## Why

The storefront currently splits product browsing across two overlapping route families: `/products` already serves the live catalog and `/products/[slug]` serves detail, while `/product` reimplements listing behavior with a different UI/component stack and falls back to local sample data. This duplication makes navigation confusing, weakens the route contract, and risks showing non-database catalog content in the main shopping flow.

## What Changes

- Consolidate the public product browsing flow so one canonical route family owns catalog listing and product detail.
- Promote the existing `/product` experience to the primary storefront listing surface while preserving its current visual direction, Cart, Login, and Logout entry points.
- Reuse the working live catalog logic from `/products` in the canonical listing flow, including gateway-backed fetches, search, category filtering, sorting, and product-card navigation.
- Define a consistent detail route for product pages and update links, redirects, navbar actions, and product cards to follow that structure.
- Remove or repurpose the duplicate `/products` usage so it no longer competes with the canonical storefront product flow.
- Eliminate catalog-listing fallback behavior that can substitute local mock/sample data when live product APIs fail.

## Capabilities

### New Capabilities

### Modified Capabilities
- `product-catalog-api`: The frontend product browsing contract changes from the current mixed `/products` and `/product` split to a single canonical listing/detail route family backed only by the gateway and product-service catalog APIs.

## Impact

- Affected frontend routes and components under `my-app/app/product`, `my-app/app/products`, `my-app/components/products`, `my-app/components/search`, `my-app/components/shopping`, and `my-app/lib/shopping`
- Existing catalog client and routing logic under `my-app/lib/products/api.ts`, `my-app/lib/products/storefront.ts`, and route-linked UI surfaces
- Public API flow `my-app` -> API gateway `/api/v1/products` -> `product-service` -> database-backed catalog tables
- Shared storefront styling in `my-app/app/globals.css` and any product-page-specific component styling that must be preserved while consolidating routes
