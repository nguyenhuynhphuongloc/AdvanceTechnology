## 1. Add backend admin order APIs

- [x] 1.1 Audit the active `order-service` module and choose the existing persisted order path that should back admin list/detail reads
- [x] 1.2 Implement read-only admin order list and order detail endpoints in `order-service`
- [x] 1.3 Normalize the admin order response shape so the frontend can render ids, status, totals, timestamps, and items consistently

## 2. Add backend admin user APIs

- [x] 2.1 Audit the current account source of truth and confirm `authentication-service` as the owner for admin user listing in the current architecture
- [x] 2.2 Implement read-only admin user list and user detail endpoints against persisted account records
- [x] 2.3 Return admin user fields needed by the dashboard, including id, email, role, active state, and timestamps

## 3. Expose admin routes through the gateway

- [x] 3.1 Add `/api/v1/admin/orders` gateway routing to the order-service
- [x] 3.2 Add `/api/v1/admin/users` gateway routing to the account source service
- [x] 3.3 Protect both admin route groups with JWT and admin-role enforcement

## 4. Connect the admin frontend

- [x] 4.1 Extend `my-app/lib/admin/api.ts` and related types with admin orders and admin users helpers
- [x] 4.2 Replace the admin orders unavailable section with real loading, error, empty, and success states
- [x] 4.3 Replace the admin users unavailable section with real loading, error, empty, and success states
- [x] 4.4 Update overview/dashboard messaging so orders and users no longer appear as unsupported once the APIs exist

## 5. Validate the end-to-end admin workflow

- [x] 5.1 Verify an authenticated admin can load orders through `/api/v1/admin/orders`
- [x] 5.2 Verify an authenticated admin can load users through `/api/v1/admin/users`
- [x] 5.3 Verify non-admin or unauthenticated access is rejected for both new admin route groups
- [x] 5.4 Verify the dashboard shows real data when records exist and clear empty states when no orders or users exist
