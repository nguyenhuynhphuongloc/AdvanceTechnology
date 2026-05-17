# Missing API & Field Checklist — Seller & Admin UI

> Audit date: 2025-05-18  
> This document lists APIs or fields that are missing or incorrect, causing UI gaps or data display failures.

---

## Priority: CRITICAL (causes wrong data or broken pages)

### 1. Auth token mismatch — Seller Product & Inventory APIs
- **Files affected**: `lib/seller/product-api.ts`, `lib/seller/inventory-api.ts`
- **Problem**: `getAuthHeaders()` reads `acme_token` / `acme_user` from localStorage but seller login stores under `seller_token` / `seller_user`
- **Effect**: Seller products and inventory API calls fail with 401 Unauthorized
- **Fix**: Update `getAuthHeaders()` to read `seller_token` with fallback to `acme_token`
- **Status**: 🔴 Must fix immediately

### 2. Auth token mismatch — Seller Order API
- **File**: `lib/seller/order-api.ts`
- **Problem**: Order API reads auth token from `document.cookie` (`token=`) but seller stores token in `localStorage` as `seller_token`
- **Effect**: Seller orders API calls fail with 401 Unauthorized
- **Fix**: Update order API to read `localStorage.getItem('seller_token')`
- **Status**: 🔴 Must fix immediately

### 3. Currency format — Admin Dashboard & Admin pages
- **Files**: `app/admin/page.tsx`
- **Problem**: `formatPrice()` uses `new Intl.NumberFormat("en-US", { currency: "USD" })` — all monetary values show as `$X.XX`
- **Effect**: All prices/revenue display as USD instead of VND
- **Fix**: Change to `new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })`
- **Status**: 🔴 Must fix immediately

---

## Priority: HIGH (missing data causes UI gaps/empty states)

### 4. Seller Orders — Missing buyer information
- **Screen**: `/seller/orders`
- **Missing fields**: `buyerName`, `buyerEmail`, `buyerPhone`, `shippingAddress`
- **Current API response** (`ShopOrderResponse`): Only has `shopId`, `shopName`, `status`, `items[]`, totals
- **Why needed**: Seller needs to know who ordered and where to ship
- **Suggested API**: Extend `GET /api/v1/seller/orders` to include a `buyer` object: `{ name, email, phone, address }` OR add `GET /api/v1/seller/orders/:id` detail endpoint with buyer info
- **Temporary UI fallback**: Show "—" for buyer fields; display items and totals which are available
- **Backend effort**: Medium (join with order table)

### 5. Seller Inventory — Missing product/variant names
- **Screen**: `/seller/inventory`
- **Missing fields**: Product name, variant name (only `productId` and `variantId` are returned)
- **Suggested API**: Extend inventory response to include `productName`, `variantName`, and `productImageUrl`
- **Temporary UI fallback**: Truncate and display `productId` and `variantId` as mono IDs
- **Backend effort**: Low (join with product/variant tables)

### 6. Admin Shop Approvals — Missing owner name/email
- **Screen**: `/admin/shop-approvals`
- **Missing field**: Owner name and email (only `sellerId` returned in `AdminShopRecord`)
- **Suggested API**: Extend `GET /api/v1/admin/shops` to include `sellerName`, `sellerEmail`
- **Temporary UI fallback**: Display only `sellerId` (truncated)
- **Backend effort**: Low (join with users table)

### 7. Admin Users — Missing order count & total spend
- **Screen**: `/admin/users`
- **Missing fields**: `orderCount`, `totalSpend`
- **Current API**: `AdminUserAccount` has `id`, `name`, `email`, `role`, `isActive`, `createdAt`
- **Suggested API**: Add these as optional aggregated fields: `GET /api/v1/admin/users?includeStats=true`
- **Temporary UI fallback**: Omit columns from table; just show account info
- **Backend effort**: Medium (aggregation query)

---

## Priority: MEDIUM (missing features, non-blocking)

### 8. Seller Products — No category list for Create/Edit form
- **Screen**: `/seller/products/new`, `/seller/products/edit/[id]`
- **Problem**: Product form needs a category dropdown but there is no `GET /api/v1/seller/categories` endpoint
- **Current workaround**: Admin has `GET /api/v1/admin/categories` — could be called as a public endpoint if available
- **Suggested API**: `GET /api/v1/categories` (public) or `GET /api/v1/seller/categories`
- **Temporary UI fallback**: Free-text input for categoryId (UUID), with a note
- **Backend effort**: Low (expose category list endpoint)

### 9. Seller Products — No image upload endpoint
- **Screen**: `/seller/products/new`, `/seller/products/edit/[id]`
- **Problem**: No `POST /api/v1/seller/products/upload-image` — admin has its own upload endpoint
- **Temporary UI fallback**: URL input (manual Cloudinary URL paste) — already implemented
- **Backend effort**: Medium (Cloudinary upload endpoint for sellers)

### 10. Seller Products List — No category name in list response
- **Screen**: `/seller/products`
- **Problem**: `SellerProduct.categoryId` returns UUID only, no `categoryName`
- **Suggested fix**: Include `categoryName` in the list response
- **Temporary UI fallback**: Omit category column or show truncated ID
- **Backend effort**: Low (join query)

### 11. Admin Orders — `orderNumber` field not in list response
- **Screen**: `/admin/orders`
- **Problem**: The `AdminOrderRecord` type has no `orderNumber` field in the list. The admin page uses `id.slice(0, 10)` as substitute
- **Suggested fix**: Include `orderNumber` in list response (already exists on backend for some calls)
- **Temporary UI fallback**: Current workaround with `id.slice(0, 10)` is acceptable

### 12. Seller Dashboard — No revenue trend data
- **Screen**: `/seller/dashboard`
- **Missing**: No endpoint for time-series revenue data (per-day/week/month breakdown)
- **Suggested API**: `GET /api/v1/seller/analytics/revenue?period=7d|30d`
- **Temporary UI fallback**: Omit chart widget; show static total only (current implementation)
- **Backend effort**: High

---

## Priority: LOW (nice to have)

### 13. Admin Analytics (`/admin/analytics`)
- **All fields missing**: Revenue chart, order volume, top products, top sellers, user acquisition
- **Current state**: Route exists (`/admin/analytics`) but shows unavailable
- **Suggested API**: `GET /api/v1/admin/analytics?period=7d|30d`
- **Temporary UI fallback**: "Coming soon" placeholder page
- **Backend effort**: High

### 14. Seller Profile page (`/seller/profile`)
- **Screen**: Not yet implemented in Next.js app
- **Missing**: `GET /api/v1/seller/profile` or equivalent
- **Note**: `GET /api/v1/admin/seller-profiles` exists for admin side
- **Temporary UI fallback**: Read from auth context (email, role) + create stub page

### 15. Seller Shop Policy field
- **Screen**: `/seller/shop`
- **Missing**: `policy` field not in `Shop` type or API response
- **Temporary UI fallback**: Omit from form

### 16. Admin Refunds & Commissions
- **Screens**: `/admin/refunds`, `/admin/commissions`
- **Status**: Marked as "unavailable" / "coming soon" in AdminShell nav
- **Backend effort**: High — skip for now

---

## Summary Table

| # | Issue | Screen | Priority | Temp Fallback |
|---|---|---|---|---|
| 1 | Auth token bug (product/inventory) | Seller all | 🔴 Critical | Fix code |
| 2 | Auth token bug (orders) | Seller orders | 🔴 Critical | Fix code |
| 3 | USD → VND currency | Admin dashboard | 🔴 Critical | Fix code |
| 4 | Missing buyer info in orders | Seller orders | 🟠 High | Show "—" |
| 5 | Missing product/variant name in inventory | Seller inventory | 🟠 High | Show truncated ID |
| 6 | Missing owner name in shop approvals | Admin shop approvals | 🟠 High | Show `sellerId` |
| 7 | Missing order count/spend in users | Admin users | 🟠 High | Omit columns |
| 8 | No category list for seller | Seller product form | 🟡 Medium | Free-text input |
| 9 | No seller image upload | Seller product form | 🟡 Medium | URL input |
| 10 | No category name in product list | Seller products | 🟡 Medium | Omit column |
| 11 | No `orderNumber` in admin orders | Admin orders | 🟡 Medium | Use `id.slice(0,10)` |
| 12 | No seller revenue trend | Seller dashboard | 🟡 Medium | Omit chart |
| 13 | No admin analytics | Admin analytics | 🔵 Low | "Coming soon" page |
| 14 | No seller profile page | `/seller/profile` | 🔵 Low | Stub page |
| 15 | No shop policy field | Seller shop | 🔵 Low | Omit field |
| 16 | Refunds & commissions | Admin finance | 🔵 Low | "Soon" nav label |
