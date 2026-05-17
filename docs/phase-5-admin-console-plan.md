# Phase 5 Plan

## 1. Current Admin UI Findings

### Admin Routes Current State
| Route | Page File | Status | Notes |
|-------|----------|--------|-------|
| `/admin` | `admin/page.tsx` | ✅ Done | Server-side dashboard with real API |
| `/admin/login` | `admin/login/page.tsx` | ✅ Done | Cookie-based auth |
| `/admin/products` | `admin/products/page.tsx` | ✅ Done | AdminProductsManager (1468 lines) |
| `/admin/categories` | `admin/categories/page.tsx` | ✅ Needs verify | — |
| `/admin/inventory` | `admin/inventory/page.tsx` | ✅ Needs verify | — |
| `/admin/media-library` | `admin/media-library/page.tsx` | ✅ Needs verify | — |
| `/admin/orders` | `admin/orders/page.tsx` | ✅ Done | Phase 4A |
| `/admin/orders/[id]` | `admin/orders/[id]/page.tsx` | ✅ Done | Phase 4A |
| `/admin/shop-orders` | `admin/shop-orders/page.tsx` | ✅ Done | Phase 4A |
| `/admin/shop-orders/[id]` | `admin/shop-orders/[id]/page.tsx` | ✅ Done | Phase 4A |
| `/admin/users` | `admin/users/page.tsx` | ✅ Done | Real API |
| `/admin/carts` | `admin/carts/page.tsx` | ✅ Needs verify | — |
| `/admin/payments` | `admin/payments/page.tsx` | ✅ Needs verify | — |
| `/admin/store-settings` | `admin/store-settings/page.tsx` | ✅ Needs verify | — |
| `/admin/logs` | `admin/logs/page.tsx` | ✅ Needs verify | — |
| `/admin/notifications` | `admin/notifications/page.tsx` | ✅ Needs verify | — |
| `/admin/sellers` | **MISSING** | ❌ No page | No UI |
| `/admin/seller-profiles` | **MISSING** | ❌ No page | No UI |
| `/admin/shop-approvals` | **MISSING** | ❌ No page | No UI |
| `/admin/product-approvals` | **MISSING** | ❌ No page | No UI |
| `/admin/users/[id]` | **MISSING** | ❌ No page | No UI |
| `/admin/refunds` | **MISSING** | ❌ No page | No UI |
| `/admin/commissions` | **MISSING** | ❌ No page | No UI |
| `/admin/settings` | **MISSING** | ❌ No page | No UI |
| `/admin/analytics` | **MISSING** | ❌ No page | No UI |

### UI Issues
- AdminShell has 4 nav groups: Overview, Catalog, Commerce, Customers, System
- Missing: Seller Management, Moderation, Finance, Analytics groups
- AdminProductsManager.tsx (1468 lines) is monolithic — too large, needs split
- No shared admin components (PageHeader, StatCard, StatusBadge, etc.)

---

## 2. Admin API Verification

### Verified in Source Code

All backend controllers and services verified. Gateway routes verified in `api-gateway/src/modules/routes/v1/routes.controller.ts`.

| Feature | Expected API | Source File | Gateway Route | Status |
|---------|-------------|-------------|--------------|--------|
| List users | `GET /api/v1/admin/users` | `auth/admin-users.controller.ts` | ✅ AdminUserController | **EXISTS** |
| Get user detail | `GET /api/v1/admin/users/:id` | `auth/admin-users.controller.ts` | ✅ AdminUserController | **EXISTS** |
| Update user status | `PATCH /api/v1/admin/users/:id/status` | `auth/admin-users.controller.ts` | ✅ AdminUserController | **EXISTS** |
| Update user role | `PATCH /api/v1/admin/users/:id/role` | `auth/admin-users.controller.ts` | ✅ AdminUserController | **EXISTS** |
| List seller profiles | `GET /api/v1/admin/seller-profiles` | `user-service/users.controller.ts` | ✅ AdminSellerProfilesController | **EXISTS** |
| Get seller profile | `GET /api/v1/admin/seller-profiles/:id` | `user-service/users.controller.ts` | ✅ AdminSellerProfilesController | **EXISTS** |
| Update seller profile status | `PATCH /api/v1/admin/seller-profiles/:id/status` | `user-service/users.controller.ts` | ✅ AdminSellerProfilesController | **EXISTS** |
| List all shops | `GET /api/v1/admin/shops` | `store-service/shops.controller.ts` | ✅ AdminShopsController | **EXISTS** |
| Get shop detail | `GET /api/v1/admin/shops/:id` | `store-service/shops.controller.ts` | ✅ AdminShopsController | **EXISTS** |
| Approve shop | `PATCH /api/v1/admin/shops/:id/approve` | `store-service/shops.controller.ts` | ✅ AdminShopsController | **EXISTS** |
| Reject shop | `PATCH /api/v1/admin/shops/:id/reject` | `store-service/shops.controller.ts` | ✅ AdminShopsController | **EXISTS** |
| Suspend shop | `PATCH /api/v1/admin/shops/:id/suspend` | `store-service/shops.controller.ts` | ✅ AdminShopsController | **EXISTS** |
| Restore shop | `PATCH /api/v1/admin/shops/:id/restore` | `store-service/shops.controller.ts` | ✅ AdminShopsController | **EXISTS** |
| List admin products | `GET /api/v1/admin/products` | `product-service/product.controller.ts` | ✅ AdminProductController | **EXISTS** |
| Get product detail | `GET /api/v1/admin/products/:id` | `product-service/product.controller.ts` | ✅ AdminProductController | **EXISTS** |
| Approve product | `PATCH /api/v1/admin/products/moderation/:id/approve` | `product-service/product.controller.ts` | ✅ AdminProductModerationProxyController | **EXISTS** |
| Reject product | `PATCH /api/v1/admin/products/moderation/:id/reject` | `product-service/product.controller.ts` | ✅ AdminProductModerationProxyController | **EXISTS** |
| Hide product | `PATCH /api/v1/admin/products/moderation/:id/hide` | `product-service/product.controller.ts` | ✅ AdminProductModerationProxyController | **EXISTS** |
| List orders | `GET /api/v1/admin/orders` | order-service | ✅ AdminOrderController | **EXISTS** |
| List shop orders | `GET /api/v1/admin/shop-orders` | order-service | ✅ AdminShopOrderProxyController | **EXISTS** |
| List inventory | `GET /api/v1/admin/inventory` | inventory-service | ✅ AdminInventoryController | **EXISTS** |
| List payments | `GET /api/v1/admin/payments` | payment-service | ✅ AdminPaymentController | **EXISTS** |
| List categories | `GET /api/v1/admin/categories` | product-service | ✅ AdminCategoryController | **EXISTS** |
| Get store settings | `GET /api/v1/admin/store-settings` | store-service | ✅ AdminStoreSettingsController | **EXISTS** |
| Update store settings | `PATCH /api/v1/admin/store-settings` | store-service | ✅ AdminStoreSettingsController | **EXISTS** |
| List logs | `GET /api/v1/admin/logs` | logging-service | ✅ AdminLogController | **EXISTS** |
| List notifications | `GET /api/v1/admin/notifications` | notification-service | ✅ AdminNotificationController | **EXISTS** |
| List branches | `GET /api/v1/admin/branches` | inventory-service | ✅ AdminBranchController | **EXISTS** |

### Missing Backend APIs (Not Implementing in Phase 5)

| API | Status | Decision |
|-----|--------|-----------|
| `GET /api/v1/admin/sellers` | No dedicated endpoint | Use `fetchAdminUsers` filtered by role='seller' + seller profiles for seller list |
| `GET /api/v1/admin/sellers/:id` | No dedicated endpoint | Placeholder — cannot create full seller detail without API |
| `GET /api/v1/admin/refunds` | **MISSING** | Placeholder page only |
| `GET /api/v1/admin/commissions` | **MISSING** | Placeholder page only |
| `GET /api/v1/admin/analytics` | **MISSING** | Compute from existing APIs |

---

## 3. Phase 5 Scope

### Phase 5A — Admin Layout & Navigation Foundation
- Redesign AdminShell with new nav groups
- Create shared admin components
- Add missing nav items to sidebar

### Phase 5B — Admin Marketplace Core Pages
- `/admin/seller-profiles` — Real API ✅
- `/admin/shop-approvals` — Real API ✅
- `/admin/product-approvals` — Real API ✅
- `/admin/sellers` — Computed from users + profiles (no dedicated API) ⚠️

### Phase 5C — Admin User & Commerce Pages
- `/admin/users/[id]` — Real API ✅
- `/admin/orders/[id]` — Enhancement ✅
- `/admin/shop-orders/[id]` — Enhancement ✅
- `/admin/inventory` — Verify ⚠️
- `/admin/payments` — Verify ⚠️
- `/admin/categories` — Verify ⚠️

### Phase 5D — Admin Reports & System
- `/admin/analytics` — Computed from existing APIs (placeholder) ⚠️
- `/admin/refunds` — Placeholder page ⚠️
- `/admin/commissions` — Placeholder page ⚠️
- `/admin/settings` — Redirect to `/admin/store-settings` ✅

---

## 4. Files Planned to Change

| Area | File | Change |
|------|------|--------|
| API | `lib/admin/api.ts` | Add: fetchAdminSellerProfiles, updateSellerProfileStatus, fetchAdminShops, approveShop, rejectShop, suspendShop, restoreShop, fetchAdminProductApprovals, approveProduct, rejectProduct, hideProduct |
| API | `lib/admin/types.ts` | Add: AdminSellerProfile, AdminShop, AdminProductModeration types |
| Layout | `components/admin/AdminShell.tsx` | Redesign nav groups |
| Component | `components/admin/AdminPageHeader.tsx` | **NEW** — Consistent page header |
| Component | `components/admin/AdminStatCard.tsx` | **NEW** — Stat card |
| Component | `components/admin/AdminStatusBadge.tsx` | **NEW** — Status badge |
| Component | `components/admin/AdminEmptyState.tsx` | **NEW** — Empty state |
| Component | `components/admin/AdminLoadingState.tsx` | **NEW** — Loading spinner |
| Component | `components/admin/AdminActionBar.tsx` | **NEW** — Search + filter + actions |
| Component | `components/admin/AdminModal.tsx` | **NEW** — Modal for approve/reject |
| Page | `app/admin/seller-profiles/page.tsx` | **NEW** — Seller profile management |
| Page | `app/admin/shop-approvals/page.tsx` | **NEW** — Shop approval queue |
| Page | `app/admin/product-approvals/page.tsx` | **NEW** — Product approval queue |
| Page | `app/admin/sellers/page.tsx` | **NEW** — Seller list (computed) |
| Page | `app/admin/users/[id]/page.tsx` | **NEW** — User detail |
| Page | `app/admin/analytics/page.tsx` | **NEW** — Computed analytics |
| Page | `app/admin/refunds/page.tsx` | **NEW** — Placeholder |
| Page | `app/admin/commissions/page.tsx` | **NEW** — Placeholder |
| Page | `app/admin/settings/page.tsx` | **NEW** — Redirect to store-settings |

---

## 5. Implementation Steps

1. Add missing admin API functions to `lib/admin/api.ts`
2. Add missing admin types to `lib/admin/types.ts`
3. Create shared admin components (AdminPageHeader, AdminStatCard, AdminStatusBadge, AdminEmptyState, AdminLoadingState, AdminActionBar, AdminModal)
4. Redesign AdminShell with new nav groups (Seller Management, Moderation, Commerce, Analytics)
5. Create `/admin/seller-profiles` page with approve/reject/suspend
6. Create `/admin/shop-approvals` page with approve/reject
7. Create `/admin/product-approvals` page with approve/reject/hide
8. Create `/admin/sellers` page using computed data from users + profiles
9. Create `/admin/users/[id]` page with status/role toggle
10. Create `/admin/analytics` page (computed from existing APIs)
11. Create `/admin/refunds` placeholder page
12. Create `/admin/commissions` placeholder page
13. Create `/admin/settings` redirect to store-settings
14. Build and fix errors
15. Create output documentation

---

## 6. Out of Scope

- Refund backend (not implemented)
- Commission backend (not implemented)
- Buyer UI redesign
- Seller UI redesign (Phase 4B complete)
- Payment split / settlement
- Notification infrastructure
- Email system
- Shipping provider integration
- Major database schema redesign
