# Phase 5.5 Plan — Admin Runtime Verification & API Contract Fixes

## 1. Current Status

### Services Running (post-rebuild)
All 14 containers are healthy:
- api-gateway (3000) ✅
- authentication-service (3008) ✅
- user-service (3002) ✅
- product-service (3001) ✅
- order-service (3004) ✅
- cart-service (3007) ✅
- inventory-service (3006) ✅
- payment-service (3003) ✅
- notification-service (3005) ✅
- logging-service (3011) ✅
- store-service (3012) ⚠️ **DB ISSUE** — requires Neon PostgreSQL (neondb_owner)
- my-app (3009) ✅
- mongodb ✅, redis ✅, rabbitmq ✅

### Known Infrastructure Issues (out of scope for this phase)
- `store-service` connects to external Neon PostgreSQL (neondb_owner) — not available in Docker environment. Affects: `/admin/store-settings`, `/admin/shops`, `/admin/sellers`
- These routes will return 502 until Neon credentials are provided or store-service is migrated to local MongoDB.

## 2. API Route Mapping for Phase 5 Pages

| Admin Page | Gateway Route | Backend Service | Guards | Status |
|---|---|---|---|---|
| `/admin/seller-profiles` | `GET /api/v1/admin/seller-profiles` | user-service | JwtAuth + AdminRole | Testable |
| `/admin/shop-approvals` | `GET /api/v1/admin/shops?status=pending` | store-service | JwtAuth + AdminRole | ⚠️ 502 (store-service down) |
| `/admin/product-approvals` | `GET /api/v1/admin/products?approvalStatus=pending` | product-service | JwtAuth + AdminRole | Testable |
| `/admin/users/[id]` | `GET /api/v1/admin/users/:id` | auth-service | JwtAuth + AdminRole | Testable |
| `/admin/analytics` | Multiple API calls | various | varies | Partial |
| `/admin/sellers` | `GET /api/v1/admin/sellers` | store-service | JwtAuth + AdminRole | ⚠️ 502 (store-service down) |
| `/admin/refunds` | Placeholder page | — | — | Already placeholder |
| `/admin/commissions` | Placeholder page | — | — | Already placeholder |
| `/admin/settings` | Redirects to `/admin/store-settings` | store-service | JwtAuth + AdminRole | ⚠️ 502 |

## 3. Testing Strategy (No Browser/UI Login)

Since we cannot do browser-based login in this environment, we will test APIs by:

1. **Authenticate directly** against auth-service to get a token
2. **Use the token** in Authorization header for admin-protected routes
3. **Verify response shape** matches frontend TypeScript types
4. **Check for contract mismatches**: missing fields, wrong field names, unexpected nulls

### Test Sequence
1. Login as admin → get access token
2. Test each admin route with token
3. Compare response with `lib/admin/types.ts`
4. Document working vs broken APIs
5. Fix frontend code where runtime bugs are found
6. Update known issues

## 4. Known Contract Issues (Pre-Test)

From Phase 5 analysis:
1. `SellerProfileResponse` may be missing `email` / `contactEmail` field
2. Shop approval filter parameter: `status=pending` vs `approvalStatus=pending` — need to verify
3. Product approval filter: `approvalStatus=pending` vs `status=pending` — need to verify
4. `AdminUserDetailResponse` needs to be verified against real response
5. Analytics computed from orders/products — partial data expected

## 5. Expected Deliverables

- Code fixes in `my-app/` for any runtime bugs found
- Updated `docs/phase-5b-test-checklist.md` (runtime results)
- Updated `docs/phase-5b-known-issues.md`
- Updated `docs/phase-5b-api-usage.md` if any endpoint/param changes
- **No** new pages, no redesign, no backend implementation

## 6. Out of Scope

- Fixing store-service PostgreSQL connection (infrastructure)
- Implementing refund/commission backend
- Implementing seller detail backend
- Creating new admin pages
- Changing UI design
- Modifying backend microservices beyond minor frontend-facing fixes
