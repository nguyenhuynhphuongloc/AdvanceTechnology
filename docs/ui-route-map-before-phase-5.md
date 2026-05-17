# UI Route Map — Before Phase 5

## Summary

This document audits all routes in `my-app` across three user groups: Buyer, Seller, and Admin. It identifies which routes exist, their API integration status, and what action is needed.

## Route Group Overview

```
my-app/app/
├── / (Homepage)
├── /login, /register (Public auth)
├── /product (Catalog)
│   ├── /product/[slug] (Detail)
│   ├── /product/cart
│   ├── /product/checkout
│   ├── /product/orders
│   ├── /product/orders/[id]
│   ├── /product/account
│   └── /product/chat
├── /search
├── /products (Legacy redirect)
├── /products/[slug] (Legacy redirect)
├── /HomePage (Alternative homepage)
├── /seller (Layout)
│   ├── /seller/login, /seller/register
│   ├── /seller/dashboard
│   ├── /seller/shop
│   ├── /seller/products
│   │   ├── /seller/products/new
│   │   └── /seller/products/edit/[id]
│   ├── /seller/inventory
│   ├── /seller/orders
│   └── /seller/orders/[id]
├── /admin (Layout)
│   ├── /admin/login
│   ├── /admin (Dashboard)
│   ├── /admin/products
│   ├── /admin/categories
│   ├── /admin/inventory
│   ├── /admin/media-library
│   ├── /admin/orders
│   │   └── /admin/orders/[id]
│   ├── /admin/shop-orders
│   │   └── /admin/shop-orders/[id]
│   ├── /admin/users
│   ├── /admin/carts
│   ├── /admin/payments
│   ├── /admin/store-settings
│   ├── /admin/logs
│   └── /admin/notifications
└── /api/payments/intent
```

---

## Buyer Route Audit

| Route | Page Exists | API Integration | Current Status | Action Needed | Notes |
|-------|------------|-----------------|----------------|--------------|-------|
| `/` | ✅ Yes | Real API (StorefrontHomePage) | **Done** | — | Homepage with featured products |
| `/login` | ✅ Yes | localStorage auth | **Exists but needs redesign** | Consider unified login page | Redirects to AccountPageClient |
| `/register` | ✅ Yes | localStorage auth | **Exists but needs redesign** | Consider unified register page | Redirects to AccountPageClient |
| `/products` | ✅ Yes | Redirect | **Done** | — | Redirects to `/product` |
| `/products/[slug]` | ✅ Yes | Redirect | **Done** | — | Redirects to `/product/[slug]` |
| `/product` | ✅ Yes | Real API (fetchCatalogPage) | **Done** | — | Product catalog with filters/sort |
| `/product/[slug]` | ✅ Yes | Real API (fetchProductBySlug, fetchRelatedProducts) | **Done** | — | Product detail with variants |
| `/product/cart` | ✅ Yes | Real API (cart-api) | **Done** | — | Cart with group by shop |
| `/product/checkout` | ✅ Yes | Real API (checkout, fetchOrderById) | **Done** | — | Checkout form with Stripe/COD |
| `/product/orders` | ✅ Yes | Real API (fetchMyOrders) | **Done** | — | Buyer order history with tabs |
| `/product/orders/[id]` | ✅ Yes | Real API (fetchOrderById, cancelOrder) | **Done** | — | Buyer order detail with cancel |
| `/product/account` | ✅ Yes | localStorage auth | **Exists but needs redesign** | Unify with /login,/register | Uses AccountPageClient |
| `/product/chat` | ✅ Yes | External (n8n webhook) | **Done** | — | AI chat — not our API gateway |
| `/search` | ✅ Yes | Real API (fetchCatalogPage) | **Done** | — | Search results |
| `/shops` | ❌ No | — | **Missing** | Create shop directory page | Public shop listing |
| `/shops/[slug]` | ❌ No | — | **Missing** | Create public shop page | Shows shop + products |
| `/shops/[slug]/products` | ❌ No | — | **Missing** | Create shop products page | Filtered by shop slug |
| `/profile` | ❌ No | — | **Missing** | Create buyer profile page | Buyer profile + addresses |
| `/addresses` | ❌ No | — | **Missing** | Create addresses management | List/add/edit addresses |
| `/HomePage` | ✅ Yes | Real API (StorefrontHomePage) | **Done** | — | Alternative route to homepage |

### Buyer Navigation Plan

```
Top Header (StorefrontHeader)
├── Logo / Home → /
├── Search bar → /search
├── Cart button → /product/cart
└── Account dropdown
    ├── Login / Register → /product/account
    ├── My Orders → /product/orders
    ├── My Profile → /profile (MISSING → placeholder to /product/account)
    └── Addresses → /addresses (MISSING → placeholder to /product/account)
```

**Navigation gaps**: Buyer has no dedicated profile or addresses pages. These should be created in a future phase (Phase 5 or Phase 6).

---

## Seller Route Audit

| Route | Page Exists | API Integration | Current Status | Action Needed | Notes |
|-------|------------|-----------------|----------------|--------------|-------|
| `/seller` | ✅ Yes | Redirect | **Done** | — | Redirects to /seller/dashboard |
| `/seller/login` | ✅ Yes | localStorage auth | **Exists but needs redesign** | Polish if needed | Uses AccountPageClient |
| `/seller/register` | ✅ Yes | localStorage auth | **Exists but needs redesign** | Polish if needed | Uses AccountPageClient |
| `/seller/dashboard` | ✅ Yes | Real API (Phase 4B) | **Done** | — | 6 stat cards from 4 APIs |
| `/seller/shop` | ✅ Yes | Real API (Phase 4B) | **Done** | — | Shop profile CRUD (replaced /profile) |
| `/seller/products` | ✅ Yes | Real API (Phase 4B) | **Done** | — | Table with search/filter/submit/delete |
| `/seller/products/new` | ✅ Yes | Real API (Phase 4B) | **Done** | — | Form with variants |
| `/seller/products/edit/[id]` | ✅ Yes | Real API (Phase 4B) | **Done** | — | Form loads product detail |
| `/seller/inventory` | ✅ Yes | Real API (Phase 4B) | **Done** | — | Table + modal edit stock |
| `/seller/orders` | ✅ Yes | Real API (Phase 4A) | **Done** | — | Table with tabs + actions |
| `/seller/orders/[id]` | ✅ Yes | Real API (Phase 4A) | **Done** | — | Detail with confirm/ship/cancel |
| `/seller/analytics` | ❌ No | — | **Missing** | Create analytics page | Compute from existing APIs |
| `/seller/settings` | ❌ No | — | **Missing** | Create settings page | Payout settings, etc. |
| `/seller/notifications` | ❌ No | — | **Missing** | Create notification page | Order status notifications |

### Seller Sidebar Navigation (Current — Phase 4B)

```
Sidebar (/seller/layout)
├── Logo → /
├── Shop Status Badge
│   └── Shop: [Name] [Status badge]
├── Dashboard → /seller/dashboard
├── My Shop → /seller/shop
├── Products → /seller/products
├── Inventory → /seller/inventory
└── Orders → /seller/orders
```

**Future Seller Nav (Phase 5+)**
```
├── Analytics → /seller/analytics (MISSING)
├── Settings → /seller/settings (MISSING)
└── Notifications → /seller/notifications (MISSING)
```

---

## Admin Route Audit

| Route | Page Exists | API Integration | Current Status | Action Needed | Notes |
|-------|------------|-----------------|----------------|--------------|-------|
| `/admin` | ✅ Yes | Real API (server-side) | **Done** | — | Dashboard with 8 stat cards |
| `/admin/login` | ✅ Yes | Real API (loginAdmin) | **Done** | — | Cookie-based session |
| `/admin/products` | ✅ Yes | Real API (fetchAdminProducts) | **Done** | — | AdminProductsManager (1468 lines) |
| `/admin/categories` | ✅ Yes | Real API (fetchAdminCategories) | **Needs verification** | Verify CRUD | Category management |
| `/admin/inventory` | ✅ Yes | Real API (fetchAdminInventory, fetchAdminBranches) | **Needs verification** | Verify CRUD | Inventory + branch management |
| `/admin/media-library` | ✅ Yes | Real API (fetchAdminMediaAssets) | **Needs verification** | Verify upload | Media library UI |
| `/admin/orders` | ✅ Yes | Real API (fetchAdminOrders) | **Done** | — | Order list with filters |
| `/admin/orders/[id]` | ✅ Yes | Real API (fetchAdminOrders) | **Needs verification** | — | Order detail |
| `/admin/shop-orders` | ✅ Yes | Real API (fetchAdminShopOrders) | **Done** | — | Shop order list (Phase 4A) |
| `/admin/shop-orders/[id]` | ✅ Yes | Real API (fetchAdminShopOrderDetail) | **Done** | — | Shop order detail (Phase 4A) |
| `/admin/users` | ✅ Yes | Real API (fetchAdminUsers) | **Needs verification** | Verify user actions | User management |
| `/admin/carts` | ✅ Yes | Real API (fetchAdminCarts) | **Needs verification** | Verify view | Cart management |
| `/admin/payments` | ✅ Yes | Real API (fetchAdminPayments) | **Needs verification** | Verify view | Payment management |
| `/admin/store-settings` | ✅ Yes | Real API (fetchAdminStoreSettings) | **Needs verification** | Verify CRUD | Store identity settings |
| `/admin/logs` | ✅ Yes | Real API (fetchAdminLogs) | **Needs verification** | Verify view | System logs |
| `/admin/notifications` | ✅ Yes | Real API (fetchAdminNotifications) | **Needs verification** | Verify view | Notification log |
| `/admin/sellers` | ❌ No | — | **Missing** | Create seller management page | List all sellers |
| `/admin/seller-profiles` | ❌ No | — | **Missing** | Create seller profiles page | Manage seller profiles |
| `/admin/shop-approvals` | ❌ No | — | **Missing** | Create shop approvals page | Pending shop reviews |
| `/admin/product-approvals` | ❌ No | — | **Missing** | Create product approvals page | Pending product reviews |
| `/admin/refunds` | ❌ No | — | **Missing** | Create refunds page | Refund management |
| `/admin/commissions` | ❌ No | — | **Missing** | Create commissions page | Commission tracking |
| `/admin/analytics` | ❌ No | — | **Missing** | Create admin analytics | Revenue/charts |
| `/admin/settings` | ❌ No | — | **Missing** | Redirect or create | Generic settings |

### Admin Sidebar Navigation (Current)

```
Sidebar (/admin/layout) — AdminShell.tsx
├── Logo: "Admin Console" / AT
├── Overview
│   └── Dashboard → /admin
├── Catalog
│   ├── Products → /admin/products
│   ├── Categories → /admin/categories
│   ├── Inventory → /admin/inventory
│   └── Media Library → /admin/media-library
├── Commerce
│   ├── Orders → /admin/orders
│   ├── Payments → /admin/payments
│   └── Carts → /admin/carts
├── Customers
│   └── Users → /admin/users
├── System
│   ├── Store Settings → /admin/store-settings
│   ├── Logs → /admin/logs
│   └── Notifications → /admin/notifications
└── Back to Store → /
```

**Missing Admin Nav Groups (Phase 5)**
```
├── Seller Management (MISSING)
│   ├── Sellers → /admin/sellers (MISSING)
│   ├── Seller Profiles → /admin/seller-profiles (MISSING)
│   └── Shop Approvals → /admin/shop-approvals (MISSING)
├── Moderation (MISSING)
│   └── Product Approvals → /admin/product-approvals (MISSING)
├── Finance (MISSING)
│   ├── Refunds → /admin/refunds (MISSING)
│   └── Commissions → /admin/commissions (MISSING)
└── Analytics → /admin/analytics (MISSING)
```

---

## Page Completion Matrix

### Legend
- ✅ **Done** — Page exists with real API, UI acceptable
- ⚠️ **Needs redesign** — Page exists but UI needs improvement
- 🔧 **Needs verification** — Page exists but not fully tested
- ❌ **Missing** — Route does not exist
- 🔶 **Mock** — Uses localStorage or mock data

### Buyer Completion

| Route | Status | Priority |
|-------|--------|----------|
| `/` | ✅ Done | — |
| `/login` | ⚠️ Needs redesign | Low |
| `/register` | ⚠️ Needs redesign | Low |
| `/product` | ✅ Done | — |
| `/product/[slug]` | ✅ Done | — |
| `/product/cart` | ✅ Done | — |
| `/product/checkout` | ✅ Done | — |
| `/product/orders` | ✅ Done | — |
| `/product/orders/[id]` | ✅ Done | — |
| `/product/account` | ⚠️ Needs redesign | Low |
| `/product/chat` | ✅ Done | — |
| `/search` | ✅ Done | — |
| `/shops` | ❌ Missing | Medium |
| `/shops/[slug]` | ❌ Missing | Medium |
| `/shops/[slug]/products` | ❌ Missing | Medium |
| `/profile` | ❌ Missing | Medium |
| `/addresses` | ❌ Missing | Medium |

**Buyer completion: 9/16 done (~56%)**

### Seller Completion

| Route | Status | Priority |
|-------|--------|----------|
| `/seller` | ✅ Done | — |
| `/seller/login` | ⚠️ Needs redesign | Low |
| `/seller/register` | ⚠️ Needs redesign | Low |
| `/seller/dashboard` | ✅ Done | — |
| `/seller/shop` | ✅ Done | — |
| `/seller/products` | ✅ Done | — |
| `/seller/products/new` | ✅ Done | — |
| `/seller/products/edit/[id]` | ✅ Done | — |
| `/seller/inventory` | ✅ Done | — |
| `/seller/orders` | ✅ Done | — |
| `/seller/orders/[id]` | ✅ Done | — |
| `/seller/analytics` | ❌ Missing | Medium |
| `/seller/settings` | ❌ Missing | Low |
| `/seller/notifications` | ❌ Missing | Medium |

**Seller completion: 11/14 done (~79%)**

### Admin Completion

| Route | Status | Priority |
|-------|--------|----------|
| `/admin` | ✅ Done | — |
| `/admin/login` | ✅ Done | — |
| `/admin/products` | ✅ Done | — |
| `/admin/categories` | 🔧 Needs verification | Medium |
| `/admin/inventory` | 🔧 Needs verification | Medium |
| `/admin/media-library` | 🔧 Needs verification | Medium |
| `/admin/orders` | ✅ Done | — |
| `/admin/orders/[id]` | 🔧 Needs verification | Medium |
| `/admin/shop-orders` | ✅ Done | — |
| `/admin/shop-orders/[id]` | ✅ Done | — |
| `/admin/users` | 🔧 Needs verification | Medium |
| `/admin/carts` | 🔧 Needs verification | Medium |
| `/admin/payments` | 🔧 Needs verification | Medium |
| `/admin/store-settings` | 🔧 Needs verification | Medium |
| `/admin/logs` | 🔧 Needs verification | Medium |
| `/admin/notifications` | 🔧 Needs verification | Medium |
| `/admin/sellers` | ❌ Missing | High |
| `/admin/seller-profiles` | ❌ Missing | High |
| `/admin/shop-approvals` | ❌ Missing | High |
| `/admin/product-approvals` | ❌ Missing | High |
| `/admin/refunds` | ❌ Missing | Medium |
| `/admin/commissions` | ❌ Missing | Medium |
| `/admin/analytics` | ❌ Missing | Medium |
| `/admin/settings` | ❌ Missing | Low |

**Admin completion: 10/24 done (~42%)** (10 done, 6 need verification, 8 missing)

---

## Overall Summary

| Group | Total Routes | Done | Redesign | Verify | Missing | Completion |
|-------|-------------|------|----------|--------|---------|-----------|
| Buyer | 16 | 9 | 3 | 0 | 4 | 56% |
| Seller | 14 | 11 | 0 | 0 | 3 | 79% |
| Admin | 24 | 10 | 0 | 6 | 8 | 42% |
| **Total** | **54** | **30** | **3** | **6** | **15** | **56%** |

**Key findings**:
1. **Buyer**: Best shape overall, needs shop directory pages and profile/addresses
2. **Seller**: Best completion rate, only missing analytics/settings/notifications
3. **Admin**: Most incomplete — 8 missing pages, 6 unverified, but base platform exists

**Phase 5 recommendation**: Focus on **Admin Platform Console** since it has the most gaps and is foundational for operating a marketplace.
