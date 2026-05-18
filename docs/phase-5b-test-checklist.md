# Phase 5.5 Test Checklist — Admin Runtime Verification & API Contract Fixes

> Created before coding. Updated with actual test results.

## Pre-flight: Services Health

- [x] All 14 Docker containers running ✅
- [x] API Gateway reachable at http://localhost:3000 ✅
- [x] Frontend reachable at http://localhost:3009 ✅

## Infrastructure Notes

- store-service requires Neon PostgreSQL — returns 502 in Docker env
- Routes depending on store-service: `/admin/shops`, `/admin/sellers`, `/admin/settings`
- Routes depending on order-service: `/admin/orders`, `/admin/shop-orders`, `/admin/analytics` (orders section)

## Step 1: Authentication — Get Admin Token

- [x] POST /api/v1/auth/login with admin credentials → receive access_token ✅
- [x] Use token as `Authorization: Bearer <token>` for all subsequent requests ✅

## Step 2: Seller Profiles (`/admin/seller-profiles`)

- [x] `GET /api/v1/admin/seller-profiles` → returns 200 ✅
- [x] Response shape: `{ items: SellerProfile[], total }` (direct array, no pagination wrapper)
- [x] SellerProfile fields: `id`, `userId`, `businessName`, `phone`, `status`, `createdAt`, `updatedAt`
- [x] No `email` field — by design. Seller email is in auth-service. Cross-reference via `userId`.
- [x] `PATCH /api/v1/admin/seller-profiles/:id/status` → gateway → user-service ✅
- [x] **BUG FIX**: Changed `sellerId` → `userId` in `AdminSellerProfile` type (backend uses `userId`)
- [x] **UI ENHANCEMENT**: Added `Seller ID` and `Phone` columns to table ✅
- [x] Build passes after fix ✅

## Step 3: Product Approvals (`/admin/product-approvals`)

- [x] `GET /api/v1/admin/products?approvalStatus=pending` → returns 200 ✅
- [x] Filter parameter `approvalStatus=pending` is correct ✅ (NOT `status=pending`)
- [x] Response shape: `{ items: Product[], page, limit, total }` ✅
- [x] Product fields: `id`, `name`, `sku`, `basePrice`, `imageUrl`, `approvalStatus`, `status`, etc.
- [x] **CRITICAL BUG FIX**: Frontend checked `status === "pending"` for action buttons but API uses `approvalStatus`.
  Fixed to `(product.approvalStatus ?? product.status) === "pending"` — actions were NEVER appearing before.
- [x] Status badge updated to display `approvalStatus` instead of `status` ✅
- [x] `PATCH /api/v1/admin/products/moderation/:id/approve` → route exists in product-service ✅
- [x] `PATCH /api/v1/admin/products/moderation/:id/reject` → route exists in product-service ✅
- [x] `PATCH /api/v1/admin/products/moderation/:id/hide` → route exists in product-service ✅
- [x] Build passes after fix ✅

## Step 4: User Detail (`/admin/users/[id]`)

- [x] `GET /api/v1/admin/users/:id` → returns 200 ✅
- [x] Response shape: `AuthUser` — `id`, `email`, `role`, `isActive`, `createdAt`, `updatedAt`
- [x] **BUG FIX**: `name` field does NOT exist in auth-service response. Changed `name: string` to `name?: string | null` ✅
- [x] Page already handles missing name gracefully with `{user.name || "—"}` ✅
- [x] `PATCH /api/v1/admin/users/:id/status` → route exists ✅
- [x] `PATCH /api/v1/admin/users/:id/role` → route exists ✅
- [x] Build passes after fix ✅

## Step 5: Analytics (`/admin/analytics`)

- [x] `GET /api/v1/admin/orders` → ❌ 500 (order-service Neon PostgreSQL issue)
- [x] `GET /api/v1/products?limit=1` → ✅ 200
- [x] `GET /api/v1/admin/users` → ✅ 200
- [x] Analytics page loads without crash — uses `Promise.allSettled()` with error tracking ✅
- [x] Computed stats displayed — orders show "Unavailable" when API fails ✅
- [x] Graceful degradation when data is unavailable ✅

## Step 6: Shop Approvals (`/admin/shop-approvals`) — ⚠️ 502

- [x] `GET /api/v1/admin/shops?status=pending` → ⚠️ 502 (store-service Neon PostgreSQL)
- [x] Frontend shows appropriate error state when API returns 502 ✅
- [x] No crash in frontend when backend returns 502 ✅
- [x] Documented in phase-5b-known-issues.md

## Step 7: Sellers (`/admin/sellers`) — ⚠️ No Route

- [x] `GET /api/v1/admin/sellers` → ⚠️ No gateway route (no such endpoint in backend)
- [x] Frontend shows placeholder page correctly ✅
- [x] Clear message: "Not yet implemented" ✅

## Step 8: Refunds (`/admin/refunds`) — Placeholder ✅

- [x] Page loads with placeholder message ✅
- [x] No API calls made ✅
- [x] Clear "Not yet implemented" message ✅

## Step 9: Commissions (`/admin/commissions`) — Placeholder ✅

- [x] Page loads with placeholder message ✅
- [x] No API calls made ✅
- [x] Clear "Not yet implemented" message ✅

## Step 10: Settings (`/admin/settings`) — ⚠️ 502

- [x] Page redirects to `/admin/store-settings` (502 from store-service) ✅
- [x] No crash in frontend ✅

## Step 11: Other Admin Routes (Verification Only)

- [x] `/admin/users` (existing page) still works — no regression ✅
- [x] `/admin/products` (existing page) still works — no regression ✅
- [x] `/admin/orders` → ❌ 500 (order-service Neon PostgreSQL — infrastructure issue)

## Build Verification

- [x] `npm run build` passes in my-app after fixes ✅
- [x] No new TypeScript errors introduced ✅
- [x] No new ESLint errors introduced ✅

## Documentation Updates

- [x] `docs/phase-5b-plan.md` created ✅
- [x] `docs/phase-5b-test-checklist.md` this file updated ✅
- [x] `docs/phase-5b-known-issues.md` updated with runtime findings ✅
- [x] `docs/phase-5b-api-usage.md` — no endpoint changes needed ✅

## Summary Table

| Route | Expected | Actual | Issue | Fixed |
|---|---|---|---|---|
| `GET /api/v1/admin/seller-profiles` | 200 | ✅ 200 | No email field (by design) | ✅ `sellerId`→`userId` |
| `PATCH /api/v1/admin/seller-profiles/:id/status` | 200 | ✅ Proxied | — | — |
| `GET /api/v1/admin/products?approvalStatus=pending` | 200 | ✅ 200 | — | — |
| `PATCH /api/v1/admin/products/moderation/:id/approve` | 200 | ✅ Route exists | — | — |
| `PATCH /api/v1/admin/products/moderation/:id/reject` | 200 | ✅ Route exists | — | — |
| `GET /api/v1/admin/users/:id` | 200 | ✅ 200 | Missing `name` field | ✅ Fixed type |
| `PATCH /api/v1/admin/users/:id/status` | 200 | ✅ Route exists | — | — |
| `PATCH /api/v1/admin/users/:id/role` | 200 | ✅ Route exists | — | — |
| `GET /api/v1/admin/orders` | 200 | ❌ 500 | order-service Neon PG | — |
| `GET /api/v1/products?limit=1` | 200 | ✅ 200 | — | — |
| `GET /api/v1/admin/users` | 200 | ✅ 200 | — | — |
| `GET /api/v1/admin/shops?status=pending` | ⚠️ 502 | ⚠️ 502 | store-service Neon PG | — |
| `GET /api/v1/admin/sellers` | ⚠️ No route | ❌ 404 | No gateway route | — |
| `GET /api/v1/admin/store-settings` | ⚠️ 502 | ⚠️ 502 | store-service Neon PG | — |

## Files Changed in Phase 5.5

| File | Change |
|---|---|
| `my-app/lib/admin/types.ts` | Fixed `AdminSellerProfile.sellerId`→`userId`, `AdminUserDetail.name` optional |
| `my-app/app/admin/product-approvals/page.tsx` | Fixed `approvalStatus` vs `status` for actions + badge |
| `my-app/app/admin/seller-profiles/page.tsx` | Added `Seller ID` + `Phone` columns, fixed `userId` reference |
| `docs/phase-5b-plan.md` | Created |
| `docs/phase-5b-test-checklist.md` | Created + filled with results |
| `docs/phase-5b-known-issues.md` | Created with all findings |
