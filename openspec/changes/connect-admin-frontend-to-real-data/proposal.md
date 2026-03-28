## Why

The admin frontend currently presents hardcoded demo data and bypasses authentication even though the backend already exposes real database-backed admin auth, product, and inventory APIs. That leaves the admin experience misleading: parts of the UI look functional, but they are not actually reading or mutating real backend state.

## What Changes

- Replace the fake admin login flow with real authentication using the existing admin API client and backend endpoints.
- Require a valid admin session before rendering protected admin pages.
- Refactor the admin dashboard to load real product and inventory data through the existing admin API layer instead of hardcoded arrays.
- Derive dashboard stats only from real backend-supported data and clearly mark unsupported sections as unavailable rather than showing fake numbers.
- Add loading, error, and empty states for each real admin data section.

## Capabilities

### New Capabilities
- `real-admin-frontend-data`: Defines the requirement that the admin frontend uses real backend auth and real DB-backed product/inventory data instead of demo content.

### Modified Capabilities
- `gateway-authentication`: Extend the authenticated admin workflow so protected admin pages require a real validated admin session instead of a client-side bypass.

## Impact

- Admin frontend pages and components under `my-app/app/admin` and `my-app/components/admin`.
- Shared admin API helpers in `my-app/lib/admin/api.ts` and related frontend session utilities.
- Existing admin-auth, product, and inventory flows through `api-gateway`, `authentication-service`, `product-service`, and `inventory-service`.
