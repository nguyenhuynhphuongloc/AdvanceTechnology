## Why

The admin dashboard still shows orders and users as unavailable because the backend does not expose admin-facing APIs for those sections. Products and inventory are already real, so the remaining gap is now concentrated in admin order visibility and admin user visibility.

## What Changes

- Add real admin order read APIs so the admin dashboard can list orders and inspect order details from the database-backed order service.
- Add real admin user read APIs so the admin dashboard can list user accounts from the current account store instead of showing an unavailable placeholder.
- Add admin-only API gateway routes for orders and users and protect them with JWT plus admin-role enforcement.
- Extend the admin frontend API layer and dashboard to load orders and users from the new backend endpoints with loading, error, and empty states.
- Replace the current unavailable placeholders in the admin orders and users sections with real data tables and honest empty states.

## Capabilities

### New Capabilities
- `admin-order-management`: Defines read-only admin order listing and detail access for the admin dashboard.
- `admin-user-management`: Defines read-only admin user account listing and detail access for the admin dashboard using the current account source of truth.

### Modified Capabilities
- `api-gateway-routing`: Add admin-only routes for `/api/v1/admin/orders` and `/api/v1/admin/users` to the correct downstream services.
- `gateway-authentication`: Require admin-role enforcement on admin orders and admin users routes before forwarding.

## Impact

- Frontend admin dashboard and API helpers under `my-app/app/admin`, `my-app/components/admin`, and `my-app/lib/admin`.
- API gateway admin routing and guard coverage in `microservices/api-gateway`.
- Read-only admin endpoints in `microservices/order-service` and `microservices/authentication-service`, or a compatible user-account source if implementation reveals a better existing owner.
