## Context

The admin frontend now uses real authentication, product data, and inventory data, but the orders and users sections still render unavailable placeholders because no matching admin APIs exist behind the gateway. The backend already has durable order data in `order-service`, and the current account records live in `authentication-service` via the `auth_users` table; by contrast, `user-service` does not yet expose a user domain model or read API.

This change crosses frontend, gateway, and backend service boundaries. It must keep the current architecture intact, avoid inventing new fake data sources, and prefer read-only admin visibility over broad redesign. The main consumers are local developers and admins who need the `/admin` dashboard to show real order and user data.

## Goals / Non-Goals

**Goals:**
- Add real admin order list/detail endpoints backed by persisted order data.
- Add real admin user list/detail endpoints backed by the current account source of truth.
- Add admin-only gateway routes for orders and users with JWT and admin-role enforcement.
- Extend the existing admin frontend API layer and dashboard so the orders and users tabs use real backend data.
- Show loading, error, and empty states for orders and users, including a clear empty state when no records exist.

**Non-Goals:**
- Redesign the admin dashboard layout.
- Add order mutation workflows such as refund, status override, or delete from the admin UI.
- Build a new standalone user profile service or migrate identity ownership in this change.
- Introduce schema-changing startup logic or runtime data bootstrapping.

## Decisions

### Decision: Keep admin orders and admin users read-only in this change

The change should expose list/detail visibility first, without editing or deleting orders or users.

Rationale:
- The current gap is visibility, not mutation.
- Read-only endpoints are enough to replace the unavailable placeholders in the admin dashboard.
- It keeps the scope compatible with the existing service contracts.

Alternatives considered:
- Add full admin CRUD. Rejected because there is no established admin workflow for order mutation or user lifecycle management yet.

### Decision: Source admin orders from `order-service`

Admin order data should come from the existing persisted order records in `order-service`, where order state already exists and is updated through workflow events.

Rationale:
- `order-service` is already the owner of persisted order data.
- Reusing that store avoids duplicate read models or cross-service joins.

Alternatives considered:
- Read orders from the gateway or notification flow. Rejected because neither owns the source of truth.

### Decision: Source admin user listing from the current account store in `authentication-service`

Until `user-service` has a real user domain, admin user visibility should be implemented against `authentication-service` account records and exposed through admin-only endpoints.

Rationale:
- `authentication-service` already persists `auth_users` with email, role, active state, and timestamps.
- `user-service` currently has no user entity, controller surface, or read model to support admin listing.
- This provides real admin user data now without inventing a second unfinished ownership model.

Alternatives considered:
- Force the feature through `user-service` immediately. Rejected because the service does not yet own any user data to list.
- Keep the admin users section unavailable. Rejected because the requested change is to make that section real.

### Decision: Extend the existing frontend admin API layer instead of fetching directly in UI components

Orders and users should be added to `my-app/lib/admin/api.ts`, and the dashboard should continue consuming that shared layer.

Rationale:
- The current admin frontend already follows that pattern for auth, products, and inventory.
- It keeps auth header handling and gateway URL resolution centralized.

Alternatives considered:
- Add one-off `fetch` calls inside the dashboard component. Rejected because it duplicates error handling and session behavior.

### Decision: Use explicit empty states when no orders or users exist

If the backend returns zero records, the dashboard should say there are no orders or no users yet, rather than showing blank tables or synthetic counts.

Rationale:
- This matches the current requirement to avoid fake data.
- It gives admins a clear interpretation of an empty system.

Alternatives considered:
- Seed demo rows. Rejected because the admin dashboard is now intended to reflect real database state only.

## Risks / Trade-offs

- [User ownership remains in `authentication-service` for now] -> Mitigation: document that admin users are account records, and revisit routing ownership once `user-service` has a real domain model.
- [Order payloads may differ between the legacy `order` and `orders` modules] -> Mitigation: implement against the currently active HTTP/order storage path used by the gateway and verify response shape before wiring the UI.
- [Admin dashboard will make two more backend requests] -> Mitigation: reuse the existing loading/error pattern already used for products and inventory.
- [Gateway proxy instability on POST auth requests may continue to affect admin login] -> Mitigation: keep this change focused on orders/users data flow and validate with the existing admin session pattern already in place.

## Migration Plan

1. Add admin order list/detail endpoints in `order-service`.
2. Add admin user list/detail endpoints in `authentication-service`.
3. Add admin-only gateway routes and guard coverage for `/api/v1/admin/orders` and `/api/v1/admin/users`.
4. Extend frontend admin API helpers and types for orders and users.
5. Replace the dashboard unavailable sections with real orders/users tables and empty states.
6. Validate that admin login still works and that the orders/users tabs show real data or honest empty states.

Rollback:
- Revert the new admin endpoints and frontend dashboard wiring.
- Restore the unavailable placeholders only if the backend/admin integration proves unstable.

## Open Questions

- Whether the admin orders view should expose only list/detail, or also surface workflow metadata such as payment failure reason and correlation IDs if those are already stored.
- Whether the admin users list should include admin accounts, customer accounts, or both by default.
- Whether the longer-term ownership for user listing should move to `user-service` once that service gains a real user model.
