# Tasks: Admin Console Redesign — Phase 5

## 1. Shared Admin Components

- [x] 1.1 Create `components/admin/AdminPageHeader.tsx` — title, subtitle, optional description, optional actions slot
- [x] 1.2 Create `components/admin/AdminStatCard.tsx` — icon, value, label, optional trend
- [x] 1.3 Create `components/admin/AdminStatusBadge.tsx` — colored badge for status values (pending/approved/rejected/suspended/active/inactive)
- [x] 1.4 Create `components/admin/AdminEmptyState.tsx` — icon, title, description, optional CTA button
- [x] 1.5 Create `components/admin/AdminLoadingState.tsx` — centered spinner with optional label
- [x] 1.6 Create `components/admin/AdminActionBar.tsx` — search input, filter slots, action button slot
- [x] 1.7 Create `components/admin/AdminModal.tsx` — base modal wrapper with title, children, onClose
- [x] 1.8 Create `components/admin/AdminConfirmDialog.tsx` — pre-built confirm/cancel dialog for approve/reject actions

## 2. AdminShell Navigation Update

- [x] 2.1 Update `components/admin/AdminShell.tsx` — add "Seller Management" group with Sellers (placeholder), Seller Profiles, Shop Approvals
- [x] 2.2 Update `components/admin/AdminShell.tsx` — add "Moderation" group with Product Approvals
- [x] 2.3 Update `components/admin/AdminShell.tsx` — add "Finance" group with Refunds (placeholder), Commissions (placeholder)
- [x] 2.4 Update `components/admin/AdminShell.tsx` — add "Analytics" group with Analytics page link
- [x] 2.5 Update `components/admin/AdminShell.tsx` — update "Customers" group to "Users & Sellers" with Users, Sellers
- [x] 2.6 Update `lib/admin/constants.ts` — add path constants for all new admin routes

## 3. API Client Additions

- [x] 3.1 Add `fetchAdminSellerProfiles()` to `lib/admin/api.ts` — calls `GET /api/v1/admin/seller-profiles`
- [x] 3.2 Add `fetchAdminSellerProfileDetail()` to `lib/admin/api.ts` — calls `GET /api/v1/admin/seller-profiles/:id`
- [x] 3.3 Add `updateAdminSellerProfileStatus()` to `lib/admin/api.ts` — calls `PATCH /api/v1/admin/seller-profiles/:id/status`
- [x] 3.4 Add `fetchAdminShops()` to `lib/admin/api.ts` — calls `GET /api/v1/admin/shops` with status filter
- [x] 3.5 Add `approveShop()` to `lib/admin/api.ts` — calls `PATCH /api/v1/admin/shops/:id/approve`
- [x] 3.6 Add `rejectShop()` to `lib/admin/api.ts` — calls `PATCH /api/v1/admin/shops/:id/reject`
- [x] 3.7 Add `suspendShop()` to `lib/admin/api.ts` — calls `PATCH /api/v1/admin/shops/:id/suspend`
- [x] 3.8 Add `restoreShop()` to `lib/admin/api.ts` — calls `PATCH /api/v1/admin/shops/:id/restore`
- [x] 3.9 Add `fetchAdminModerationProducts()` to `lib/admin/api.ts` — calls `GET /api/v1/admin/products` with approvalStatus filter
- [x] 3.10 Add `approveProduct()` to `lib/admin/api.ts` — calls `PATCH /api/v1/admin/products/moderation/:id/approve`
- [x] 3.11 Add `rejectProduct()` to `lib/admin/api.ts` — calls `PATCH /api/v1/admin/products/moderation/:id/reject`
- [x] 3.12 Add `hideProduct()` to `lib/admin/api.ts` — calls `PATCH /api/v1/admin/products/moderation/:id/hide`
- [x] 3.13 Add `fetchAdminUserDetail()` to `lib/admin/api.ts` — calls `GET /api/v1/admin/users/:id`
- [x] 3.14 Add `updateAdminUserStatus()` to `lib/admin/api.ts` — calls `PATCH /api/v1/admin/users/:id/status`
- [x] 3.15 Add `updateAdminUserRole()` to `lib/admin/api.ts` — calls `PATCH /api/v1/admin/users/:id/role`
- [x] 3.16 Add types to `lib/admin/types.ts`: `AdminSellerProfile`, `AdminSellerProfileListResponse`, `AdminShopRecord`, `AdminShopListResponse`, `AdminModerationProduct`, `AdminModerationProductListResponse`, `AdminUserDetail`

## 4. Seller Profiles Page

- [x] 4.1 Create `app/admin/seller-profiles/page.tsx` — list page with table, filter by status, load data via `fetchAdminSellerProfiles()`
- [x] 4.2 Implement approve action on seller profile — call `updateAdminSellerProfileStatus()`
- [x] 4.3 Implement reject action on seller profile — call `updateAdminSellerProfileStatus()`
- [x] 4.4 Implement suspend action on seller profile — call `updateAdminSellerProfileStatus()`
- [ ] 4.5 Create `app/admin/seller-profiles/[id]/page.tsx` — detail page with full profile info (NOT IMPLEMENTED — see Known Issues)

## 5. Shop Approvals Page

- [x] 5.1 Create `app/admin/shop-approvals/page.tsx` — list pending shops only (filter by status=pending)
- [x] 5.2 Implement approve shop action — call `approveShop()`
- [x] 5.3 Implement reject shop action with reason modal — call `rejectShop()`
- [x] 5.4 Implement suspend shop action — call `suspendShop()`

## 6. Product Approvals Page

- [x] 6.1 Create `app/admin/product-approvals/page.tsx` — list products pending approval (filter by status=pending or use `fetchAdminModerationProducts()`)
- [x] 6.2 Implement approve product action — call `approveProduct()`
- [x] 6.3 Implement reject product action with reason modal — call `rejectProduct()`
- [x] 6.4 Implement hide product action — call `hideProduct()`

## 7. Sellers Placeholder Page

- [x] 7.1 Create `app/admin/sellers/page.tsx` — placeholder page with "Backend API not yet implemented" message and link to Known Issues

## 8. User Detail Page

- [x] 8.1 Create `app/admin/users/[id]/page.tsx` — user detail with linked profiles, status toggle, role change
- [x] 8.2 Implement activate/deactivate user action — call `updateAdminUserStatus()`
- [x] 8.3 Implement change role action — call `updateAdminUserRole()`

## 9. Analytics Page

- [x] 9.1 Create `app/admin/analytics/page.tsx` — stats dashboard using computed data from `fetchAdminOrders`, `fetchAdminUsers`, `fetchAdminProducts`, `fetchAdminPayments`
- [x] 9.2 Display stat cards: total orders, total revenue, total users, total products
- [x] 9.3 Display recent orders list (last 5 orders)
- [x] 9.4 Handle partial data gracefully — show available metrics, mark unavailable ones

## 10. Placeholder Pages

- [x] 10.1 Create `app/admin/refunds/page.tsx` — placeholder with "Refund management coming soon" message
- [x] 10.2 Create `app/admin/commissions/page.tsx` — placeholder with "Commission tracking coming soon" message
- [x] 10.3 Create or redirect `app/admin/settings/page.tsx` — redirect to `/admin/store-settings` or unified settings placeholder

## 11. Existing Pages Verification (No Regression)

- [ ] 11.1 Verify `app/admin/products/page.tsx` (AdminProductsManager) still builds and loads correctly
- [ ] 11.2 Verify `app/admin/categories/page.tsx` still builds and loads correctly
- [ ] 11.3 Verify `app/admin/inventory/page.tsx` still builds and loads correctly
- [ ] 11.4 Verify `app/admin/orders/page.tsx` and `app/admin/orders/[id]/page.tsx` still build and load correctly
- [ ] 11.5 Verify `app/admin/shop-orders/page.tsx` and `app/admin/shop-orders/[id]/page.tsx` still build and load correctly
- [ ] 11.6 Verify `app/admin/users/page.tsx` still builds and loads correctly
- [ ] 11.7 Verify `app/admin/payments/page.tsx` still builds and loads correctly
- [ ] 11.8 Verify `app/admin/store-settings/page.tsx` still builds and loads correctly

## 12. Build & Documentation

- [x] 12.1 Run `cd my-app && npm run build` — verify no TypeScript errors
- [x] 12.2 Create `docs/phase-5-admin-console-notes.md` — summary, files changed, API verification results, known issues
- [x] 12.3 Create `docs/phase-5-api-usage.md` — page-to-API mapping, missing APIs, placeholder pages
- [x] 12.4 Create `docs/phase-5-ui-components.md` — new/c updated components, file paths, props
- [x] 12.5 Create `docs/phase-5-known-issues.md` — missing APIs, placeholder pages, unverified runtime items
- [x] 12.6 Create `docs/phase-5-test-checklist.md` — manual test checklist
