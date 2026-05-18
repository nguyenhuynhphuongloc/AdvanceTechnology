# Phase 4B: Seller Center UI Redesign — Implementation Notes

## Summary

Phase 4B redesigns the Seller Center UI in `my-app` with a professional, marketplace-style layout. All seller pages now use real APIs instead of localStorage mocks. New inventory management UI was created. Layout was redesigned with a proper sidebar, shop status header, and consistent component library.

## Files Changed

### New Files

| File | Description |
|------|-------------|
| `lib/seller/shop-api.ts` | Shop API client (fetchMyShop, updateMyShop, createMyShop) |
| `lib/seller/product-api.ts` | Seller product API client (CRUD + submit) |
| `lib/seller/inventory-api.ts` | Seller inventory API client (list, upsert, update stock) |
| `components/seller/SellerShell.tsx` | Seller layout wrapper (not used directly, kept for reference) |
| `components/seller/SellerPageHeader.tsx` | Page header with title, subtitle, back link, action |
| `components/seller/SellerStatCard.tsx` | Stat card with icon, value, accent colors |
| `components/seller/SellerStatusBadge.tsx` | Consistent status badge across all modules |
| `components/seller/SellerEmptyState.tsx` | Empty state component |
| `components/seller/SellerLoadingState.tsx` | Loading spinner component |
| `components/seller/SellerActionBar.tsx` | Search + filter + action bar component |
| `components/seller/SellerModal.tsx` | Modal dialog with backdrop and keyboard support |
| `app/seller/inventory/page.tsx` | **NEW** — Seller inventory management page |
| `app/seller/shop/page.tsx` | **NEW** — Seller shop profile (replaced /profile) |

### Modified Files

| File | Change |
|------|--------|
| `app/seller/layout.tsx` | Full rewrite: orange accent, Inventory nav, shop status header, auth improvements |
| `app/seller/dashboard/page.tsx` | Full rewrite: real API data, 6 stat cards, quick actions |
| `app/seller/products/page.tsx` | Full rewrite: real API, search/filter, table view, submit/delete actions |
| `app/seller/products/new/page.tsx` | Full rewrite: real API, slug auto-generate, variant management |
| `app/seller/products/edit/[id]/page.tsx` | Full rewrite: real API, loads product detail, variant editing |
| `app/seller/orders/page.tsx` | UI polish: orange tabs, tab counts, consistent table, actions |
| `app/seller/orders/[id]/page.tsx` | UI polish: orange accent, sections, cleaner layout |

### Deleted Files

| File | Reason |
|------|--------|
| `app/seller/profile/page.tsx` | Replaced by `/seller/shop` |

## UI Redesign Summary

### Style System
- **Background**: `#0a0e14` (near-black, slightly cooler)
- **Surface**: `bg-zinc-900/60` for cards
- **Accent**: Orange gradient (`from-orange-500 to-orange-600`) for primary actions
- **Borders**: `border-zinc-700/50` or `border-zinc-800/60`
- **Radius**: `rounded-2xl` for cards, `rounded-xl` for inputs
- **All pages**: loading state, error state, empty state via shared components

### Layout
- Sidebar: 256px, sticky, with logo, shop status badge, nav items, user info
- Nav items highlight with orange background when active
- Shop status badge (approved/pending/rejected/suspended) shown in sidebar
- Main content: `p-8` padding, `max-w-3xl` on forms, full-width on tables

## Seller Layout Changes

- Sidebar nav now includes 5 items: Dashboard, My Shop, Products, Inventory, Orders
- Shop name + status badge rendered from `fetchMyShop()` on every layout load
- Sign out button styled consistently
- Loading state shown while auth/user check runs
- Auth pages (login/register) bypass the seller shell

## Seller Dashboard Changes

- Now fetches from 4 real APIs in parallel using `Promise.allSettled`:
  - `fetchMyShop()` → shop name + status
  - `fetchSellerProducts({ limit: 1 })` → total product count
  - `fetchSellerOrders({ limit: 100 })` → orders + revenue
  - `fetchSellerInventory({ limit: 1 })` → low stock items
- Shows skeleton loaders while loading
- 6 stat cards: Total Products, Total Orders, Pending Orders, Shipped/Delivered, Low Stock, Revenue
- Revenue displayed in abbreviated format (K/M)
- Quick actions section links to all key pages
- Getting started section for new sellers

## Seller Shop Changes

- Route: `/seller/shop` (was `/seller/profile`)
- Fetches `GET /api/v1/seller/shop` on load
- Shows shop status badge + rejection reason if rejected
- Shows logo preview if logoUrl provided
- Shows banner preview if bannerUrl provided
- Seller can update: name, slug, description, logoUrl, bannerUrl, contactEmail, contactPhone, address
- Seller cannot change: status, sellerId, commissionRate
- If shop doesn't exist (404), shows "Create your shop" banner and allows creation via POST
- Success/error feedback shown inline

## Seller Product Changes

- List: `GET /api/v1/seller/products` with search + status filter + pagination
- Table view: image thumbnail, name, SKU, price, approvalStatus badge, active badge, created date, actions
- Edit link → `/seller/products/edit/[id]`
- Submit for approval button for draft/rejected products
- Delete with confirmation
- Status filter: All / Draft / Pending / Approved / Rejected / Hidden
- Rejection reason shown inline for rejected products

### Create Product
- `POST /api/v1/seller/products`
- Auto-generates slug from name if empty
- Auto-generates SKU if empty
- Variants: dynamic add/remove, fields: SKU, size, color, price override
- Image URL input with preview
- Active/inactive toggle
- Category selector

### Edit Product
- `GET /api/v1/seller/products/:id` to load detail
- `PATCH /api/v1/seller/products/:id` to save
- Loads existing variants for editing
- Shows current approvalStatus badge

## Seller Inventory Changes

- Route: `/seller/inventory` (new)
- `GET /api/v1/seller/inventory` with search + lowStockOnly filter + pagination
- 4 stat cards: Total SKUs, Available Stock, Reserved, Low Stock SKUs
- Table with: SKU, productId, variantId, stock, reserved, available, threshold, status, edit
- Available stock color-coded: green (OK), amber (near threshold), red (out of stock)
- Edit button opens modal: update total stock + lowStock threshold
- Shows preview of new available stock (stock - reserved) in modal

## Seller Order Changes

- List: `GET /api/v1/seller/orders` with tab filters
- Tabs: All, Chờ xác nhận, Đã xác nhận, Đã giao ĐVVC, Đã giao, Đã hủy
- Tab shows count in parentheses
- Table: order ID, parent order, items, total, status badge, date, actions
- Actions: Confirm (pending), Ship (confirmed/processing), Delivered (shipped), Cancel (before shipped)
- Order detail: full item list, shipping info, financial summary, action buttons
- All actions use real API

## API Client Changes

- `lib/seller/shop-api.ts` — 3 functions
- `lib/seller/product-api.ts` — 5 functions
- `lib/seller/inventory-api.ts` — 3 functions
- All use `getAuthHeaders()` from `lib/shopping/order-api.ts` for consistent auth
- Error handling throws descriptive messages

## Test Results

- **Build**: ✅ my-app passed (39 pages, no errors)
- **Warnings**: Only pre-existing warnings (no-img-element, unused vars) — none from Phase 4B new files
- **Runtime**: Not verified (services not running, ECONNREFUSED during static generation expected)
- **Backward compat**: Buyer and admin pages not modified

## Known Issues

1. Shop status fetched on every layout load — could be cached at context level for performance
2. Dashboard uses `Promise.allSettled` which swallows individual API failures — stats show 0 on partial failure
3. Seller profile page (`/seller/profile`) was deleted — if any external link points there, it will 404
4. Image upload not implemented — uses URL input only (no Cloudinary)
5. Static generation ECONNREFUSED for seller pages that call APIs — expected without running services

## Next Phase Recommendation

### Phase 5: Seller Analytics & Notifications
1. Seller analytics dashboard with charts
2. Email/push notification on order status change
3. Seller notification center

### Phase 6: Review & Rating
1. Buyer review/rating flow
2. Seller response to reviews
3. Product rating display

### Phase 7: Payment Settlement
1. Payment split per shop
2. Seller payout/settlement page
3. Commission display
