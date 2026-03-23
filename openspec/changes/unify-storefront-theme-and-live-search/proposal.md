## Why

The storefront currently mixes multiple visual directions and data strategies: `/products` and product detail already use gateway-backed catalog data, while `/search` still relies on mock data and legacy UI components. This creates an inconsistent user experience and makes the public storefront diverge from the actual database-backed product system.

## What Changes

- Standardize the public storefront on a shared dark premium theme system instead of page-by-page inline styling and conflicting light legacy surfaces.
- Refactor storefront listing and search flows to use the existing frontend -> API gateway -> product-service -> database path instead of mock product data.
- Align product listing, search, and product detail pages around shared catalog UI components, loading states, empty states, and error handling.
- Rework user-facing home and shared layout elements to match the same storefront theme tokens and reusable component patterns.
- Keep existing microservice ownership boundaries intact and only extend backend APIs if a real gap is confirmed during implementation.

## Capabilities

### New Capabilities
- `storefront-theme-system`: Unified dark theme tokens and shared storefront presentation rules for public pages and reusable UI surfaces.
- `storefront-product-discovery`: Database-backed storefront listing, search, and detail discovery flows through the existing API gateway and product-service contracts.

### Modified Capabilities

## Impact

- Affected frontend code under `my-app/app`, `my-app/components`, `my-app/lib/products`, and `my-app/lib/search`
- Existing API gateway-backed catalog routes under `/api/v1/products`
- Possible targeted updates in `product-service` only if the current catalog contract is insufficient for storefront search/listing UX
- Shared styling strategy in `my-app/app/globals.css` and related reusable storefront components
