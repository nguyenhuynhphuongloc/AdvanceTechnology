# Phase 5 — API Usage Mapping

## Page-to-API Mapping

| Page | API Function(s) | Endpoint(s) |
|------|----------------|-------------|
| `/admin/seller-profiles` | `fetchAdminSellerProfiles()` | `GET /api/v1/admin/seller-profiles` |
| `/admin/seller-profiles` | `updateAdminSellerProfileStatus()` | `PATCH /api/v1/admin/seller-profiles/:id/status` |
| `/admin/seller-profiles/[id]` | `fetchAdminSellerProfileDetail()` | `GET /api/v1/admin/seller-profiles/:id` |
| `/admin/shop-approvals` | `fetchAdminShops(status=pending)` | `GET /api/v1/admin/shops?status=pending` |
| `/admin/shop-approvals` | `approveShop()` | `PATCH /api/v1/admin/shops/:id/approve` |
| `/admin/shop-approvals` | `rejectShop()` | `PATCH /api/v1/admin/shops/:id/reject` |
| `/admin/shop-approvals` | `suspendShop()` | `PATCH /api/v1/admin/shops/:id/suspend` |
| `/admin/product-approvals` | `fetchAdminModerationProducts(approvalStatus=pending)` | `GET /api/v1/admin/products?approvalStatus=pending` |
| `/admin/product-approvals` | `approveProduct()` | `PATCH /api/v1/admin/products/moderation/:id/approve` |
| `/admin/product-approvals` | `rejectProduct()` | `PATCH /api/v1/admin/products/moderation/:id/reject` |
| `/admin/product-approvals` | `hideProduct()` | `PATCH /api/v1/admin/products/moderation/:id/hide` |
| `/admin/users/[id]` | `fetchAdminUserDetail()` | `GET /api/v1/admin/users/:id` |
| `/admin/users/[id]` | `updateAdminUserStatus()` | `PATCH /api/v1/admin/users/:id/status` |
| `/admin/users/[id]` | `updateAdminUserRole()` | `PATCH /api/v1/admin/users/:id/role` |
| `/admin/analytics` | `fetchAdminOrders()` | `GET /api/v1/admin/orders` |
| `/admin/analytics` | `fetchAdminUsers()` | `GET /api/v1/admin/users` |
| `/admin/analytics` | `fetchAdminProducts()` | `GET /api/v1/admin/products` |
| `/admin/analytics` | `fetchAdminPayments()` | `GET /api/v1/admin/payments` |
| `/admin/sellers` | None | **MISSING** |
| `/admin/refunds` | None | **MISSING** |
| `/admin/commissions` | None | **MISSING** |
| `/admin/settings` | Redirect only | Redirects to `/admin/store-settings` |

---

## Admin APIs Used (by Phase 5)

### Existing APIs (verified from source code)

| API | Endpoint | Gateway Route | Backend Service | File |
|-----|----------|-------------|----------------|------|
| Admin Users List | `GET /api/v1/admin/users` | `AdminUserController` | `auth-service` | `auth/admin-users.controller.ts` |
| Admin User Detail | `GET /api/v1/admin/users/:id` | `AdminUserController` | `auth-service` | `auth/admin-users.controller.ts` |
| Admin User Status | `PATCH /api/v1/admin/users/:id/status` | `AdminUserController` | `auth-service` | `auth/admin-users.controller.ts` |
| Admin User Role | `PATCH /api/v1/admin/users/:id/role` | `AdminUserController` | `auth-service` | `auth/admin-users.controller.ts` |
| Admin Orders | `GET /api/v1/admin/orders` | `AdminOrderController` | `order-service` | `orders/orders.controller.ts` |
| Admin Order Detail | `GET /api/v1/admin/orders/:id` | `AdminOrderController` | `order-service` | `orders/orders.controller.ts` |
| Admin Shop Orders | `GET /api/v1/admin/shop-orders` | `AdminShopOrderProxyController` | `order-service` | `orders/orders.controller.ts` |
| Admin Payments | `GET /api/v1/admin/payments` | `AdminPaymentController` | `payment-service` | — |
| Admin Categories | `GET /api/v1/admin/categories` | `AdminCategoryController` | `product-service` | `product/product.controller.ts` |
| Admin Store Settings | `GET /api/v1/admin/store-settings` | `AdminStoreSettingsController` | `store-service` | — |
| Admin Products | `GET /api/v1/admin/products` | `AdminProductController` | `product-service` | `product/product.controller.ts` |
| Admin Inventory | `GET /api/v1/admin/inventory` | `AdminInventoryController` | `inventory-service` | — |

### New APIs Added by Phase 5

| API | Endpoint | Gateway Route | Backend Service | File |
|-----|----------|-------------|----------------|------|
| Seller Profiles List | `GET /api/v1/admin/seller-profiles` | `AdminSellerProfilesController` | `user-service` | `users/users.controller.ts` |
| Seller Profile Detail | `GET /api/v1/admin/seller-profiles/:id` | `AdminSellerProfilesController` | `user-service` | `users/users.controller.ts` |
| Seller Profile Status | `PATCH /api/v1/admin/seller-profiles/:id/status` | `AdminSellerProfilesController` | `user-service` | `users/users.controller.ts` |
| Admin Shops List | `GET /api/v1/admin/shops` | `AdminShopsController` | `store-service` | `shops/shops.controller.ts` |
| Approve Shop | `PATCH /api/v1/admin/shops/:id/approve` | `AdminShopsController` | `store-service` | `shops/shops.controller.ts` |
| Reject Shop | `PATCH /api/v1/admin/shops/:id/reject` | `AdminShopsController` | `store-service` | `shops/shops.controller.ts` |
| Suspend Shop | `PATCH /api/v1/admin/shops/:id/suspend` | `AdminShopsController` | `store-service` | `shops/shops.controller.ts` |
| Restore Shop | `PATCH /api/v1/admin/shops/:id/restore` | `AdminShopsController` | `store-service` | `shops/shops.controller.ts` |
| Product Moderation List | `GET /api/v1/admin/products` | `AdminProductModerationProxyController` | `product-service` | `product/product.controller.ts` |
| Approve Product | `PATCH /api/v1/admin/products/moderation/:id/approve` | `AdminProductModerationProxyController` | `product-service` | `product/product.controller.ts` |
| Reject Product | `PATCH /api/v1/admin/products/moderation/:id/reject` | `AdminProductModerationProxyController` | `product-service` | `product/product.controller.ts` |
| Hide Product | `PATCH /api/v1/admin/products/moderation/:id/hide` | `AdminProductModerationProxyController` | `product-service` | `product/product.controller.ts` |

---

## Missing APIs

### Request from Backend Team

| Feature | Missing Endpoint | Priority | Notes |
|---------|----------------|----------|-------|
| Seller List | `GET /api/v1/admin/sellers` | High | For `/admin/sellers` page |
| Seller Detail | `GET /api/v1/admin/sellers/:id` | High | For seller detail view |
| Refunds List | `GET /api/v1/admin/refunds` | Medium | For `/admin/refunds` page |
| Refund Action | `PATCH /api/v1/admin/refunds/:id` | Medium | For processing refunds |
| Commissions | `GET /api/v1/admin/commissions` | Medium | For `/admin/commissions` page |

### Workaround Used

| Missing API | Workaround |
|-------------|-----------|
| `GET /api/v1/admin/sellers` | Placeholder page at `/admin/sellers` with "Backend not implemented" message |
| `GET /api/v1/admin/refunds` | Placeholder page at `/admin/refunds` with "Coming soon" message |
| `GET /api/v1/admin/commissions` | Placeholder page at `/admin/commissions` with "Coming soon" message |

---

## Placeholder Pages

| Page | Route | Reason |
|------|-------|--------|
| Sellers | `/admin/sellers` | No `/api/v1/admin/sellers` endpoint exists |
| Refunds | `/admin/refunds` | No refund backend API exists |
| Commissions | `/admin/commissions` | No commission calculation backend exists |
| Settings | `/admin/settings` | Redirects to `/admin/store-settings` |

All placeholder pages use `AdminEmptyState` component with descriptive text explaining the situation.
