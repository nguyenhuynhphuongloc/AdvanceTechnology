# Phase 4B Test Checklist

## Build

- [ ] my-app build pass
- [ ] api-gateway build pass (only if route was changed)

## Seller Layout

- [ ] Seller Center has its own layout
- [ ] Sidebar shows: Dashboard, Shop, Products, Inventory, Orders
- [ ] Header shows shop name + status (from real API)
- [ ] User avatar/name shown in sidebar
- [ ] Sign out works
- [ ] Mobile/responsive does not break
- [ ] No conflict with admin/buyer CSS

## Seller Dashboard

- [ ] Dashboard fetches real data from seller APIs
- [ ] Shows total products count
- [ ] Shows total orders count
- [ ] Shows pending orders count
- [ ] Shows shipped/delivered orders count
- [ ] Shows shop status
- [ ] No localStorage mock data
- [ ] Fallback values shown if API fails

## Seller Shop

- [ ] GET /api/v1/seller/shop called on page load
- [ ] Shows: name, slug, logoUrl, bannerUrl, description, contactEmail, contactPhone, address
- [ ] Shows: status badge (pending/approved/rejected/suspended)
- [ ] Shows: rejectionReason if status is rejected
- [ ] Seller can update: name, description, logoUrl, bannerUrl, contactEmail, contactPhone, address
- [ ] Seller cannot change: status, sellerId, commissionRate
- [ ] Save triggers PATCH /api/v1/seller/shop
- [ ] Success/error feedback shown

## Seller Products

- [ ] List calls GET /api/v1/seller/products
- [ ] Shows: image, name, sku, basePrice, approvalStatus, isActive, createdAt
- [ ] Search filter works
- [ ] Status filter (draft/pending/approved/rejected/hidden) works
- [ ] Pagination works
- [ ] Create calls POST /api/v1/seller/products
- [ ] Edit fetches GET /api/v1/seller/products/:id
- [ ] Edit saves via PATCH /api/v1/seller/products/:id
- [ ] Delete calls DELETE /api/v1/seller/products/:id
- [ ] Submit for approval via PATCH /api/v1/seller/products/:id/submit
- [ ] Shows approvalStatus badge
- [ ] Shows rejectionReason if rejected
- [ ] Form has: name, slug, sku, description, basePrice, categoryId, images, variants

## Seller Inventory

- [ ] List calls GET /api/v1/seller/inventory
- [ ] Shows: sku, productId, variantId, stock, reservedStock, availableStock, lowStockThreshold, status
- [ ] Low-stock filter works
- [ ] Search works
- [ ] Update stock via PATCH /api/v1/seller/inventory/:variantId
- [ ] Shows low-stock/out-of-stock status indicator
- [ ] Seller does not manually enter shopId

## Seller Orders

- [ ] List calls GET /api/v1/seller/orders
- [ ] Tab filters work (all/pending/confirmed/shipped/delivered/cancelled)
- [ ] Confirm action via PATCH /api/v1/seller/orders/:id/confirm
- [ ] Ship action via PATCH /api/v1/seller/orders/:id/ship (with tracking)
- [ ] Deliver action via PATCH /api/v1/seller/orders/:id/deliver
- [ ] Cancel action via PATCH /api/v1/seller/orders/:id/cancel
- [ ] Detail page calls GET /api/v1/seller/orders/:id
- [ ] Shows: status, shopTotal, items, trackingNumber, shippingProvider, createdAt
- [ ] All actions work from detail page

## UX States

- [ ] Loading state (spinner) shown on every page
- [ ] Error state shown when API fails
- [ ] Empty state shown when no data
- [ ] Success toast/feedback on save/update
- [ ] Form validation on required fields
- [ ] Confirmation before destructive actions (delete, cancel)

## Backward Compatibility

- [ ] Buyer UI not broken
- [ ] Admin UI not broken
- [ ] Product public APIs still work
- [ ] Cart APIs still work
- [ ] Order buyer APIs still work
