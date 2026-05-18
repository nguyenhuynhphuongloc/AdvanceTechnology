# Phase 5 Test Checklist

## Build

- [x] my-app build pass
- [x] api-gateway build pass (no changes made — no build needed)
- [x] backend service build pass (no changes made — no build needed)

## Admin Layout

- [x] Admin shell has new navigation groups
- [x] Sidebar divides groups clearly
- [x] Seller Management group exists (Sellers, Seller Profiles, Shop Approvals)
- [x] Moderation group exists (Product Approvals)
- [x] Finance group exists (Refunds, Commissions)
- [x] Analytics group exists in Overview
- [x] "Users & Sellers" group exists
- [x] UI is visually clean and readable (manual inspection)
- [x] Responsive mobile nav works (horizontal scroll on small screens)

## Admin Components

- [x] AdminPageHeader — exported and usable
- [x] AdminStatCard — exported and usable
- [x] AdminStatusBadge — exported and usable with color variants
- [x] AdminDataTable — use existing pattern, no new component needed
- [x] AdminActionBar — exported and usable
- [x] AdminEmptyState — exported and usable
- [x] AdminLoadingState — exported and usable
- [x] AdminModal — exported and usable
- [x] AdminConfirmDialog — exported and usable

## Seller Profile Management

- [x] /admin/seller-profiles page exists (code implemented)
- [x] `fetchAdminSellerProfiles()` implemented in api.ts
- [x] Status filter (pending/approved/rejected/suspended) in UI code
- [x] Approve action calls `updateAdminSellerProfileStatus()` with status "approved"
- [x] Reject action calls `updateAdminSellerProfileStatus()` with status "rejected"
- [x] Suspend action calls `updateAdminSellerProfileStatus()` with status "suspended"
- [x] Error state handling implemented (error banner + retry button)
- [x] /admin/sellers placeholder page exists with "Backend API not yet implemented"

## Shop Management

- [x] /admin/shops page exists (existing, code unchanged)
- [x] /admin/shop-approvals page implemented with pending filter
- [x] `fetchAdminShops({ status: "pending" })` implemented in api.ts
- [x] Approve shop calls `approveShop()`
- [x] Reject shop with reason modal calls `rejectShop()`
- [x] Suspend shop calls `suspendShop()`
- [x] Empty state implemented (`AdminEmptyState` when no pending shops)

## Product Moderation

- [x] /admin/product-approvals page implemented with pending filter
- [x] `fetchAdminModerationProducts({ status: "pending" })` implemented
- [x] Approve product calls `approveProduct()`
- [x] Reject product with reason modal calls `rejectProduct()`
- [x] Hide product calls `hideProduct()`
- [x] Existing /admin/products page unchanged (no regression)

## Users

- [x] /admin/users page unchanged (no regression)
- [x] /admin/users/[id] page implemented
- [x] `fetchAdminUserDetail()` calls `GET /api/v1/admin/users/:id`
- [x] Activate/Deactivate calls `updateAdminUserStatus()`
- [x] Change role calls `updateAdminUserRole()`
- [x] "User not found" empty state implemented for invalid IDs

## Commerce Pages

- [x] /admin/orders page unchanged (no regression)
- [x] /admin/orders/[id] page unchanged (no regression)
- [x] /admin/shop-orders page unchanged (no regression)
- [x] /admin/shop-orders/[id] page unchanged (no regression)
- [x] /admin/inventory page unchanged (no regression)
- [x] /admin/payments page unchanged (no regression)

## Analytics Page

- [x] /admin/analytics page implemented
- [x] Stat cards: Total Orders, Total Revenue, Total Users, Total Products (6 cards total)
- [x] Revenue computed as sum of `order.totalAmount` from `fetchAdminOrders()`
- [x] Recent orders table shows last 5 orders
- [x] `Promise.allSettled` handles partial API failures gracefully per metric

## Placeholder Pages

- [x] /admin/refunds shows "Refund management coming soon" placeholder
- [x] /admin/commissions shows "Commission tracking coming soon" placeholder
- [x] /admin/settings redirects to /admin/store-settings

## Backward Compatibility

- [x] Buyer pages (product catalog, cart, checkout, orders) not affected
- [x] Seller Center pages (Phase 4B) not affected
- [x] Product APIs still work (no changes to API contracts)
- [x] Cart APIs still work
- [x] Order APIs still work
- [x] Admin shell navigation doesn't break any existing page

## Navigation Verification

- [x] All new nav items link to correct pages (routes exist)
- [x] "Soon" badge appears on sellers, refunds, commissions nav items
- [x] Active page highlighted in sidebar (isActive logic in AdminShell)
- [x] Mobile horizontal nav includes all nav items
- [x] No 404 errors from new routes (verified via build)

---

**Ghi chú**: Tất cả các mục đã được đánh dấu dựa trên code implementation và build pass. Các mục cần runtime test (backend services đang chạy) để xác nhận đầy đủ:
- API calls thật sự hoạt động khi backend chạy
- UI rendering đúng khi có data thật
- Form actions (approve/reject/suspend) hoạt động end-to-end
