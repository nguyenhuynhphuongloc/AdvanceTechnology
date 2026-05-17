# Phase 5.5 Known Issues — Admin Runtime Verification & API Contract Fixes

## Infrastructure Issues (Out of Scope for Phase 5.5)

### 1. Store-Service PostgreSQL Connection Failure
**Severity:** High (blocks shop-related admin routes)
**Status:** Known infrastructure issue — requires Neon PostgreSQL credentials
**Affected Routes:**
- `GET /api/v1/admin/shops` → 502
- `GET /api/v1/admin/shops?status=pending` → 502
- `GET /api/v1/admin/sellers` → 502 (no such route exists in gateway)
- `GET /api/v1/admin/store-settings` → 502
- `PATCH /api/v1/admin/shops/:id/approve` → 502
- `PATCH /api/v1/admin/shops/:id/reject` → 502
- `PATCH /api/v1/admin/shops/:id/suspend` → 502

**Root Cause:** `store-service` uses Neon PostgreSQL (neondb_owner). The Docker environment cannot reach the external Neon cloud database. The service crashes on startup.

**Workaround:** Provide valid Neon PostgreSQL credentials via `microservices/store-service/.env`, or migrate store-service to use local MongoDB (which other services use).

**Impact on Frontend:** `/admin/shop-approvals`, `/admin/sellers`, `/admin/settings` pages will show error/placeholder UI.

---

### 2. Order-Service PostgreSQL Connection Failure
**Severity:** High (blocks admin orders and shop-orders)
**Status:** Known infrastructure issue — requires Neon PostgreSQL
**Affected Routes:**
- `GET /api/v1/admin/orders` → 500 (table "shop_orders" does not exist)
- `GET /api/v1/admin/shop-orders` → 500

**Root Cause:** `order-service` uses Neon PostgreSQL (neondb_owner) and needs a `shop_orders` table that doesn't exist in the database schema.

**Workaround:** Either provide valid Neon credentials or migrate order-service to use the existing local MongoDB.

**Impact on Frontend:** `/admin/orders`, `/admin/shop-orders`, and `/admin/analytics` (orders section) will show error UI.

---

## API Contract Issues (Fixed in Phase 5.5)

### 3. Product Approvals — Wrong Status Field Check (FIXED)
**Severity:** Critical (actions never appear)
**Page:** `/admin/product-approvals`
**Issue:** Frontend checked `product.status === "pending"` to show approve/reject buttons, but the product service uses `product.approvalStatus` for this purpose. `product.status` is a different field (active/inactive).

**Fix Applied:**
- Updated `app/admin/product-approvals/page.tsx` to check `(product.approvalStatus ?? product.status) === "pending"` for approve/reject buttons.
- Updated status badge to display `product.approvalStatus ?? product.status`.
- No change to backend required.

**Files Changed:**
- `my-app/app/admin/product-approvals/page.tsx` — lines 201, 207 (status badge + action buttons)

---

### 4. User Detail — Missing `name` Field (FIXED)
**Severity:** Medium (Name field always shows "—")
**Page:** `/admin/users/[id]`
**Issue:** `AdminUserDetail` type defined `name: string` as required, but the auth-service `toAdminUserResponse()` method never returns a `name` field. Auth users only have `id`, `email`, `role`, `isActive`, `createdAt`, `updatedAt`.

**Fix Applied:**
- Changed `name: string` to `name?: string | null` in `AdminUserDetail` interface.
- The page already handles the missing field with `{user.name || "—"}`.

**Files Changed:**
- `my-app/lib/admin/types.ts` — `AdminUserDetail` interface

---

### 5. Seller Profile — Wrong Field Name `sellerId` vs `userId` (FIXED)
**Severity:** Medium (data mismatch)
**Page:** `/admin/seller-profiles`
**Issue:** `AdminSellerProfile` type defined `sellerId: string`, but the backend `SellerProfile` entity uses `userId: string` (the column is `user_id`). The frontend was reading the wrong field.

**Fix Applied:**
- Changed `sellerId: string` to `userId: string` in `AdminSellerProfile` interface.
- Updated `app/admin/seller-profiles/page.tsx` to display `profile.userId`.
- Added `Seller ID` and `Phone` columns to the table for better admin visibility.

**Files Changed:**
- `my-app/lib/admin/types.ts` — `AdminSellerProfile` interface
- `my-app/app/admin/seller-profiles/page.tsx` — table headers + body cells

---

### 6. Seller Profile — Missing `email` Field (By Design)
**Severity:** Low (expected limitation)
**Page:** `/admin/seller-profiles`
**Issue:** The `SellerProfile` entity has no `email` field. Seller email is stored in the `auth_users` table (auth-service), not in `seller_profiles` (user-service).

**Resolution:** No fix needed — this is by design. Admin should cross-reference `userId` with `/admin/users` to find seller email.

---

### 7. Admin Seller Detail — Route Missing in Gateway
**Severity:** Medium
**Page:** `/admin/users/[id]` (for seller users)
**Issue:** No `GET /api/v1/admin/seller-profiles/:id` route exists to fetch seller profile data by seller profile ID. The frontend's `fetchAdminSellerProfileDetail()` function would return 404 if called.

**Resolution:** Not fixed in Phase 5.5 (would require backend route addition). Currently documented as a known gap.

---

## Verification Results

### Routes with 200 OK Response (Working)
| Route | Response |
|---|---|
| `GET /api/v1/admin/seller-profiles` | ✅ 200 — returns `{ items: SellerProfile[], total }` |
| `PATCH /api/v1/admin/seller-profiles/:id/status` | ✅ Proxy works |
| `GET /api/v1/admin/products` | ✅ 200 — returns `{ items: [], page, limit, total }` |
| `GET /api/v1/admin/products?approvalStatus=pending` | ✅ 200 — `approvalStatus` param works |
| `PATCH /api/v1/admin/products/moderation/:id/approve` | ✅ Route exists in product-service |
| `PATCH /api/v1/admin/products/moderation/:id/reject` | ✅ Route exists in product-service |
| `PATCH /api/v1/admin/products/moderation/:id/hide` | ✅ Route exists in product-service |
| `GET /api/v1/admin/users` | ✅ 200 — returns `{ items: AuthUser[], total }` |
| `GET /api/v1/admin/users/:id` | ✅ 200 — returns AuthUser fields |
| `PATCH /api/v1/admin/users/:id/status` | ✅ Route exists in auth-service |
| `PATCH /api/v1/admin/users/:id/role` | ✅ Route exists in auth-service |
| `GET /api/v1/products?limit=1` | ✅ 200 |

### Routes with Errors
| Route | Error | Reason |
|---|---|---|
| `GET /api/v1/admin/orders` | 500 | order-service needs Neon PostgreSQL + `shop_orders` table |
| `GET /api/v1/admin/shop-orders` | 500 | Same as above |
| `GET /api/v1/admin/shops` | 502 | store-service needs Neon PostgreSQL |
| `GET /api/v1/admin/store-settings` | 502 | store-service needs Neon PostgreSQL |

### Routes Not in Gateway
| Route | Status |
|---|---|
| `GET /api/v1/admin/sellers` | No gateway route — no such backend endpoint |

---

## UI Placeholder Verification

| Page | Expected State | Status |
|---|---|---|
| `/admin/refunds` | Placeholder message | ✅ Placeholder exists |
| `/admin/commissions` | Placeholder message | ✅ Placeholder exists |
| `/admin/sellers` | Error/placeholder (API 502) | ⚠️ No placeholder — shows error |
| `/admin/settings` | Redirect to `/admin/store-settings` (502) | ⚠️ Will show error |
| `/admin/shop-approvals` | Error state on 502 | ✅ Error state exists |

---

## Summary

**Fixed (Phase 5.5):**
1. Product approvals — `approvalStatus` vs `status` field mismatch ✅
2. User detail — `name` field missing in response type ✅
3. Seller profile — `sellerId` vs `userId` field name mismatch ✅
4. Seller profile — added `Seller ID` and `Phone` columns ✅

**Not Fixed (infrastructure):**
1. Store-service PostgreSQL (blocks shops, settings, sellers routes) — needs Neon credentials
2. Order-service PostgreSQL (blocks orders, shop-orders routes) — needs Neon credentials + schema

**Not Fixed (would need backend changes):**
1. Missing `GET /api/v1/admin/seller-profiles/:id` route in gateway
2. Missing `GET /api/v1/admin/sellers` route in gateway and backend

**Build Status:** ✅ my-app build passes after fixes
