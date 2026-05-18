# Phase 4B Plan

## 1. Current Seller UI Findings

### Existing Routes
| Route | Status | Issues |
|-------|--------|--------|
| `/seller/dashboard` | Mock + fetchAdminOrders | Uses localStorage mock; revenue uses "$" not VND |
| `/seller/products` | Broken API call | Uses public `/api/v1/products` with sellerName filter; not real seller API |
| `/seller/products/new` | Mixed | Calls legacy POST `/api/v1/products`; no real seller product API |
| `/seller/products/edit/[id]` | Broken | Fetches from public products list; no real seller API |
| `/seller/orders` | Real API | Phase 4A — already uses real API; UI decent but can be polished |
| `/seller/orders/[id]` | Real API | Phase 4A — already uses real API; UI decent but can be polished |
| `/seller/profile` | localStorage only | Uses localStorage, not real shop API |
| `/seller/inventory` | Does not exist | No route, no UI |

### Layout Assessment
- Current layout in `seller/layout.tsx` is already decent (dark theme, sidebar, auth gate)
- Sidebar has: Dashboard, My Products, Manage Orders, Shop Profile
- Missing: Inventory link in sidebar
- Header shows user info but NOT shop name/status (API not called)
- Uses `getAuthHeaders()` for auth

## 2. Current Seller API Availability

| Module | API Available | UI Available | Gap |
|--------|--------------|--------------|-----|
| Seller Shop | `GET /api/v1/seller/shop`, `PATCH /api/v1/seller/shop` | NO (localStorage) | Need to build shop page |
| Seller Products | `GET /api/v1/seller/products`, `POST`, `PATCH`, `DELETE`, `PATCH /submit` | YES (broken) | Need to rewrite |
| Seller Inventory | `GET /api/v1/seller/inventory`, `POST`, `PATCH /:variantId` | NO | Need to create |
| Seller Orders | `GET /api/v1/seller/orders`, `GET /:id`, `PATCH /confirm`, `/ship`, `/deliver`, `/cancel` | YES (Phase 4A) | Polish UI only |
| Seller Analytics | None | NO | Compute from existing APIs |

## 3. UI Redesign Direction

### Style System
- **Keep**: Tailwind dark theme from existing layout (dark bg, white text, zinc palette)
- **Keep**: Sidebar + main content layout from `seller/layout.tsx`
- **Add**: Seller-specific CSS variables in `globals.css` for seller accent colors
- **Seller accent**: `var(--seller-accent)` = `#f97316` (orange — distinguishes from buyer/admin)
- **Avoid**: Touching admin shell CSS or buyer storefront CSS

### Layout
- Sidebar: Dashboard, Shop, Products, Inventory, Orders (Analytics/Settings optional)
- Header area within main content: shop name + status badge
- Cards: dark zinc-900, rounded-2xl, consistent padding
- Tables: transparent background, clear headers, zebra rows optional
- Forms: dark inputs, orange accent for primary buttons
- States: Loading spinner, empty state with icon, error state

### Responsive
- Sidebar collapses on mobile (hamburger)
- Tables scroll horizontally on small screens
- Grid adapts from 1→2→3 columns

## 4. Files Planned to Change

| Area | File | Change |
|------|------|--------|
| API Client | `lib/seller/shop-api.ts` | **NEW** — fetchMyShop, updateMyShop |
| API Client | `lib/seller/product-api.ts` | **NEW** — seller product CRUD + submit |
| API Client | `lib/seller/inventory-api.ts` | **NEW** — seller inventory list/update |
| Components | `components/seller/SellerShell.tsx` | **NEW** — shared layout wrapper |
| Components | `components/seller/SellerPageHeader.tsx` | **NEW** — page header with title/subtitle |
| Components | `components/seller/SellerStatCard.tsx` | **NEW** — stat card with icon/value |
| Components | `components/seller/SellerDataTable.tsx` | **NEW** — sortable table wrapper |
| Components | `components/seller/SellerStatusBadge.tsx` | **NEW** — consistent status badges |
| Components | `components/seller/SellerEmptyState.tsx` | **NEW** — empty state component |
| Components | `components/seller/SellerLoadingState.tsx` | **NEW** — loading spinner |
| Components | `components/seller/SellerActionBar.tsx` | **NEW** — action bar with search/filter |
| Components | `components/seller/SellerModal.tsx` | **NEW** — modal dialog for confirmations |
| Layout | `app/seller/layout.tsx` | Add Inventory link to sidebar, add shop status header |
| Dashboard | `app/seller/dashboard/page.tsx` | Rewrite with real API calls |
| Shop | `app/seller/shop/page.tsx` | **RENAME** from profile; rewrite with real API |
| Products List | `app/seller/products/page.tsx` | Rewrite with real seller product API |
| Products New | `app/seller/products/new/page.tsx` | Rewrite with real seller product API |
| Products Edit | `app/seller/products/edit/[id]/page.tsx` | Rewrite with real seller product API |
| Inventory | `app/seller/inventory/page.tsx` | **NEW** — seller inventory UI |
| Orders List | `app/seller/orders/page.tsx` | Polish (already real API) |
| Orders Detail | `app/seller/orders/[id]/page.tsx` | Polish (already real API) |
| CSS | `app/globals.css` | Add seller CSS variables |

## 5. Implementation Steps

1. Add seller CSS variables to `globals.css`
2. Create `lib/seller/` API clients (shop, product, inventory)
3. Create seller shared components (Shell, PageHeader, StatCard, StatusBadge, EmptyState, LoadingState, ActionBar, Modal)
4. Update `seller/layout.tsx` (sidebar + shop status)
5. Create `/seller/inventory` page
6. Rewrite `/seller/shop` with real API
7. Rewrite `/seller/products` list with real API
8. Rewrite `/seller/products/new` with real API
9. Rewrite `/seller/products/edit/[id]` with real API
10. Rewrite `/seller/dashboard` with real API
11. Polish `/seller/orders` and `/seller/orders/[id]`
12. Build and fix errors
13. Create output documentation

## 6. Out of Scope

- Commission / Refund / Payment split / Review
- Notification system
- Shipping provider integration
- Backend schema redesign
- Analytics / Charts (compute from existing APIs)
- Settings page
- Cloudinary image upload
