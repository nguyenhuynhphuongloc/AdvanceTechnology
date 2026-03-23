## Why

The system now has a storefront-facing product catalog and an API gateway, but there is still no operational admin surface for product and inventory management, and the authentication service does not yet issue JWTs for real protected workflows. This change fills that gap so the existing microservices can support authenticated back-office product and stock administration without bypassing the current architecture.

## What Changes

- Add an authenticated admin UI/module for product management with list, detail, create, edit, delete, and search/filter flows.
- Add authenticated inventory management views and actions for stock lookup by product, SKU, and variant, plus stock quantity updates and inventory status display.
- Implement JWT-based admin login/logout in `authentication-service` and wire authenticated admin requests through the API gateway.
- Extend `product-service` with the minimum admin CRUD endpoints needed beyond the current create/list/detail APIs.
- Build the missing `inventory-service` API surface needed for admin inventory lookup and stock updates while preserving the current service boundary between catalog data and stock data.
- Add environment-variable based configuration for admin-side API access and JWT settings where needed.
- Update `.gitignore` so the admin module path is excluded from Git tracking without ignoring unrelated project files.
- Define and run mandatory verification for login/logout, protected requests, product CRUD, inventory update, and end-to-end admin-to-service integration.

## Capabilities

### New Capabilities
- `admin-auth-session`: Admin login, logout, JWT issuance, token persistence, and route protection across the admin experience.
- `admin-product-management`: Admin-facing product listing, detail, create, update, delete, and search/filter flows backed by the existing product-service and gateway.
- `admin-inventory-management`: Variant-aware inventory lookup, status display, and stock update workflows backed by inventory-service and gateway.

### Modified Capabilities
<!-- None. -->

## Impact

- `my-app` admin pages, auth state handling, API client configuration, and route protection.
- `microservices/authentication-service` JWT issuance, login/logout endpoints, persistence, and tests.
- `microservices/product-service` admin CRUD endpoints and supporting DTO/service changes.
- `microservices/inventory-service` inventory entities, controllers, services, update flows, and tests.
- `microservices/api-gateway` authenticated routing behavior for admin-facing product and inventory requests.
- Root `.gitignore` and environment-variable documentation/configuration.
