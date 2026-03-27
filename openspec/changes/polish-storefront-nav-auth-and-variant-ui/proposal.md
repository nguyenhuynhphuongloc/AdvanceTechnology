## Why

The storefront shell is mostly unified now, but a few high-friction UI details still break the experience: the main header has a redundant Cart text nav item, auth entry links still rely on fragile route wiring, and the product detail selector styling still looks like a browser default instead of part of the storefront. This follow-up change closes those gaps so navigation, auth entry points, and product detail interactions feel intentional and consistent.

## What Changes

- Remove the standalone Cart text button from the primary header navigation and make the cart icon the main cart entry point.
- Audit the existing storefront auth pages and establish stable working routes for Login and Register from the shared header.
- Refine the canonical `/product` listing and `/product/[slug]` detail styling so they fully match the shared dark storefront system.
- Replace or restyle the current variant selector so its closed, open, hover, focus, and selected states are visually consistent with the storefront theme.
- Preserve guest add-to-cart behavior, current cart-page functionality, and existing live catalog/backend integrations.

## Capabilities

### New Capabilities
- `storefront-header-entrypoints`: Shared storefront header behavior for cart access and stable Login/Register entry routes.
- `storefront-product-polish`: Product-listing and product-detail polish requirements, including premium dark-theme variant selection behavior.

### Modified Capabilities

## Impact

- Affected frontend code under `my-app/components/storefront`, `my-app/components/shopping`, and the `/product` route family in `my-app/app`
- Shared storefront styling in `my-app/app/globals.css`
- Current account-entry routing and any lightweight alias routes needed for storefront auth entry points
- No expected backend API changes; existing cart and catalog integrations remain in place
