# Implementation Notes

## Admin Route Matrix Audit

| Domain | Admin UI | Admin API Helper | Gateway Admin Route | Downstream Admin Contract | Notes |
| --- | --- | --- | --- | --- | --- |
| Products | Present | Present | Present | Present | Two overlapping admin surfaces exist: table page and `AdminProductsManager`. |
| Categories | Present | Present | Present | Present | Working baseline for the rest of the admin architecture. |
| Orders | Present | Present | Present | Present | Read-first page; no richer detail workflow yet. |
| Users | Present | Present | Present | Present | Read-first page; user edit helper exists but page does not expose it. |
| Inventory | Present | Present | Present | Present | Branch-aware admin flow still missing; page still shows placeholder branch action. |
| Branches | Missing | Missing | Missing | Public-only | Inventory service exposes `/api/v1/branches`, but not protected admin-facing paths. |
| Payments | Placeholder | Missing | Missing | Public-only | Payment service exposes public transaction reads and create-intent only. |
| Carts | Placeholder | Missing | Missing | Public-only | Cart service only supports current-user and guest cart workflows. |
| Store Settings | Preview-only | Missing | Missing | Missing | Frontend reads hardcoded `storefrontBranding` config. |
| Notifications | Placeholder | Missing | Missing | Public-only/authenticated | Notification log exists but no admin contract or UI. |
| Logs | Placeholder | Missing | Missing | Missing | Logging service is still boilerplate only. |

## Confirmed Service Ownership

- `product-service`: product metadata, categories, variants, media, related products.
- `inventory-service`: stock, reserved stock, branch CRUD, inventory-by-branch state.
- `authentication-service`: admin auth and admin user reads.
- `order-service`: order visibility and lifecycle.
- `payment-service`: payment transactions and payment state.
- `cart-service`: cart state for users and guests.
- `notification-service`: notification history and delivery events.
- `logging-service`: operational log browsing.
- `store-service`: persisted store identity/settings introduced by this change.

## Repo-Specific Migration Constraints

1. The repo is polyglot at the persistence layer:
   - `product-service` uses MongoDB.
   - most other operational services use Postgres via TypeORM.
   - `store-service` should follow the Postgres/TypeORM path to stay consistent with admin-oriented operational modules.
2. `api-gateway` currently validates a fixed service URL set and will fail fast unless new `STORE_SERVICE_URL` and `LOGGING_SERVICE_URL` env keys are added.
3. `logging-service` currently lacks TypeORM and config dependencies, so adding a real log contract requires bootstrapping persistence rather than only adding a controller.
4. `AdminProductsManager.tsx` already contains the richer product editor workflow; the server-rendered `/admin/products` page is the duplicate surface that should defer to it rather than evolve independently.
5. Storefront identity is still read from `my-app/lib/storefront/config.ts` in multiple rendering paths, so backend store settings must land before those components can stop using hardcoded values.
