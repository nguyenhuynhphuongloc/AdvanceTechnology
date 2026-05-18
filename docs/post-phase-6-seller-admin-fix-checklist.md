# Post Phase 6 Seller/Admin Fix Checklist

## Seller Register

- [ ] `/seller/register` does NOT call `/product/account`
- [ ] Form submits to `/api/v1/auth/register` via `registerSeller()`
- [x] Payload contains `name` field (not `fullName`)
- [ ] `businessName` from form is NOT sent to backend (no such field in backend)
- [ ] `shopName` → sent to shop API as `name` ✅
- [ ] `shopSlug` → sent to shop API as `slug` ✅
- [ ] `description` → sent to shop API as `description` ✅
- [ ] `address` → sent to shop API as `address` ✅
- [x] No longer getting `name should not be empty` error (fix applied)
- [ ] Register seller account succeeds
- [ ] Shop creation succeeds (or gracefully fails with redirect to `/seller/shop`)
- [ ] Shop created with `pending` status
- [ ] After register → redirect to `/seller/dashboard`
- [ ] After register failure (shop creation) → redirect to `/seller/shop` with warning banner

## Seller Login

- [ ] `/seller/login` does NOT use buyer account UI
- [ ] Login via `/api/v1/auth/login`
- [ ] Login seller account succeeds
- [ ] Login does NOT redirect to `/product/account`
- [ ] Login success → `/seller/dashboard`
- [ ] Customer account trying to login → backend returns error (handled by frontend)
- [ ] Admin account can login via seller login (per current logic — role check allows admin)
- [ ] Unauthenticated access to `/seller/dashboard` → redirects to `/seller/login`

## Seller Center Access

- [ ] `/seller/dashboard` opens after login
- [ ] `/seller/shop` opens after login
- [ ] `/seller/products` opens after login
- [ ] `/seller/inventory` opens after login
- [ ] `/seller/orders` opens after login
- [ ] Header/sidebar seller layout renders without errors
- [ ] Seller with no shop → sidebar shows "+ Setup your shop" link
- [ ] Seller with shop → sidebar shows shop name and status badge
- [ ] Seller with `pending` shop → dashboard still accessible, status shown
- [ ] Seller with `approved` shop → full access

## Seller Redirect Logic

- [ ] Unauthenticated → `/seller/dashboard` → `/seller/login`
- [ ] Customer role → `/seller/*` → `/` (home)
- [ ] Seller role + no shop → stays in Seller Center (sidebar links to `/seller/shop`)
- [ ] Seller role + has shop → full dashboard access
- [ ] Logout → clears session → `/seller/login`
- [ ] Login success → `/seller/dashboard`

## Admin Simplification

- [ ] `/admin/logs` removed from navigation (no page file exists)
- [ ] `Store Settings` renamed to `Platform Settings` or has correct description
- [ ] `Branches` stat removed or renamed to "Inventory Locations"
- [ ] Admin navigation groups are marketplace-appropriate:
  - Overview: Dashboard, Analytics
  - Users & Sellers: Users, Sellers (placeholder), Seller Profiles
  - Moderation: Shop Approvals, Product Approvals
  - Catalog: Products, Categories, Inventory, Media Library
  - Commerce: Orders, Shop Orders, Payments, Carts
  - Finance: Refunds (placeholder), Commissions (placeholder)
  - System: Platform Settings, Notifications
- [ ] Admin dashboard shows platform metrics (not single-store metrics)
- [x] Admin "Store identity" renamed to "Platform Identity" (already done in admin/page.tsx)
- [x] Admin CTA updated to marketplace-appropriate wording
- [ ] No old "single-store clothing" wording in admin
- [ ] `/admin/sellers` page shows placeholder with known issues link
- [ ] `/admin/commissions` page shows placeholder
- [ ] `/admin/refunds` page shows placeholder

## Admin Pages API Status

- [ ] `/admin/shop-approvals` → real API via `AdminShopsController` ✅
- [ ] `/admin/product-approvals` → real API via `AdminProductModerationProxyController` ✅
- [ ] `/admin/seller-profiles` → real API via `AdminSellerProfilesController` ✅
- [ ] `/admin/products` → real API via `AdminProductController` ✅
- [ ] `/admin/orders` → real API via `AdminOrderController` ✅
- [ ] `/admin/shop-orders` → real API via `AdminShopOrderProxyController` ✅
- [ ] `/admin/users` → real API via `AdminUserController` ✅
- [ ] `/admin/payments` → real API via `AdminPaymentController` ✅
- [ ] `/admin/inventory` → real API via `AdminInventoryController` ✅
- [ ] `/admin/notifications` → real API via `AdminNotificationController` ✅
- [ ] `/admin/store-settings` → real API via `AdminStoreSettingsController` ✅
- [ ] `/admin/categories` → real API via `AdminCategoryController` ✅
- [ ] `/admin/commissions` → placeholder only
- [ ] `/admin/refunds` → placeholder only
- [ ] `/admin/sellers` → placeholder only

## Build

- [x] `my-app npm run build` passes
- [ ] `microservices/api-gateway npm run build` passes (if route changes needed)

## Runtime Tests

### Seller Flow

1. Open `/seller/register`
2. Fill Step 1: email, password, full name
3. Click Continue
4. Fill Step 2: business name, shop name, shop URL, address
5. Submit
6. **Verify: no `name should not be empty` error**
7. **Verify: redirect to `/seller/dashboard`**
8. Or if shop creation fails: **verify: redirect to `/seller/shop` with warning**
9. Open `/seller/login`
10. Login with seller credentials
11. **Verify: redirect to `/seller/dashboard`**
12. **Verify: sidebar shows shop name and status**
13. Open `/seller/shop` — form pre-filled with shop data
14. Open `/seller/products`, `/seller/inventory`, `/seller/orders` — pages load
15. Logout
16. As customer, try accessing `/seller/dashboard` → redirect to `/seller/login`

### Admin Flow

1. Open `/admin` → redirects to login if not authenticated
2. Login as admin
3. **Verify: no `/admin/logs` link in navigation**
4. **Verify: "Platform Settings" in navigation (or renamed)**
5. **Verify: no "Branches" stat card or renamed correctly**
6. Open `/admin/shop-approvals` — page loads with real API
7. Open `/admin/product-approvals` — page loads with real API
8. Open `/admin/sellers` — shows placeholder
9. Open `/admin/commissions` — shows placeholder
10. Open `/admin/refunds` — shows placeholder
11. Open `/admin/store-settings` — platform identity form works

## Completion Criteria

- [ ] Seller register no longer errors with `name should not be empty`
- [ ] Seller can register → create shop → login → access Seller Center
- [ ] Seller login does not redirect to `/product/account`
- [ ] Seller with no shop has clear path to create one
- [ ] Admin navigation is marketplace-appropriate
- [ ] Admin dashboard reflects platform metrics
- [x] `my-app npm run build` passes
- [ ] Buyer Marketplace UI Phase 6 is not broken
- [ ] No Seller/Admin API regressions
