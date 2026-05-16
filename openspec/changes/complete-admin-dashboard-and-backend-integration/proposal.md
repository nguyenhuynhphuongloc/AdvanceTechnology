## Why

The admin experience is only partially real: categories work, but the rest of the dashboard mixes placeholders, thin read-only tables, hardcoded storefront branding, and missing admin API contracts. That leaves operators unable to manage the business end-to-end even though the microservice architecture already contains most of the domain ownership needed to support a complete admin system.

## What Changes

- Complete the admin dashboard as a real operations surface backed by protected gateway APIs instead of unavailable placeholders or frontend-only previews.
- Finish product administration so admins can create, edit, delete, and review products, product media, related products, and product variants from the admin UI.
- Align variant ownership so `product-service` manages variant metadata (`size`, `color`, `priceOverride`, image linkage) while `inventory-service` remains the source of truth for stock and branch availability.
- Add missing admin-facing API contracts for payments, carts, branches, notifications, logs, and store settings, with consistent REST paths, validation, auth guards, and response handling through the gateway.
- Introduce a dedicated store identity/settings backend contract so store name, logo, contact information, and related presentation settings are persisted and then consumed by storefront header/footer/home surfaces.
- Remove remaining hardcoded or mock-like frontend data paths in admin and storefront modules where real backend ownership already exists or will be added in this change.
- **BREAKING**: Storefront brand/logo rendering will no longer rely on the local `storefrontBranding` config as the primary source of truth; that config becomes fallback/bootstrap data until store settings are available.

## Capabilities

### New Capabilities
- `admin-payment-operations`: Admin payment visibility and actions for payment records exposed through protected gateway APIs and admin UI modules.
- `admin-cart-oversight`: Admin list/detail access to user and guest cart state for support and operations workflows.
- `admin-store-identity`: Persisted store settings for brand name, logo, contact details, and storefront identity synchronization.
- `admin-operational-observability`: Admin access to notification history and application logs through protected operational views.

### Modified Capabilities
- `admin-dashboard`: Expand the existing dashboard requirements from basic layout and product listing into a complete operations workspace with real modules and stats.
- `admin-ux-redesign`: Replace placeholder-only admin modules with connected, backend-driven management surfaces and remove “API pending” states for supported domains.
- `api-gateway-routing`: Add and standardize protected admin routes for payments, carts, branches, notifications, logs, and store settings across the gateway.
- `gateway-authentication`: Require admin authorization consistently across all admin module routes rather than only a subset of current resources.
- `product-catalog-api`: Strengthen admin product CRUD and variant management expectations so the admin UI can fully manage catalog metadata and media.
- `inventory-branch-management`: Extend inventory administration to cover branch CRUD, branch-aware stock workflows, and branch integration in admin surfaces.
- `storefront-ux-redesign`: Replace hardcoded storefront name/logo/contact rendering with live store settings data while preserving the storefront layout requirements.

## Impact

- Frontend admin routes and components under `my-app/app/admin`, `my-app/components/admin`, and `my-app/lib/admin`.
- Storefront branding consumers under `my-app/components/storefront`, `my-app/components/shopping`, `my-app/app`, and `my-app/lib/storefront`.
- API gateway route mapping and admin guard coverage in `microservices/api-gateway`.
- Domain services: `product-service`, `inventory-service`, `payment-service`, `cart-service`, `authentication-service`, `notification-service`, `logging-service`, and a new `store-service` or equivalent store-settings backend module.
- Backend DTOs, validation, response contracts, and service ownership boundaries for product variants, inventory stock, branch operations, and store identity.
