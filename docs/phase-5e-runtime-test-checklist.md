# Phase 5E Runtime Test Checklist

## Seed Data

- [ ] Admin account exists (`admin@example.com` / password from `.env`)
- [ ] Buyer account exists (`alice@example.com` / password known)
- [ ] Seller account registered (`seller_phase5e@test.local`)
- [ ] Seller profile exists (linked to seller auth ID)
- [ ] Shop exists (in store-service DB)
- [ ] Shop status is `approved`
- [ ] Category exists (in MongoDB)
- [ ] Product exists (in MongoDB)
- [ ] Product has `shopId` field
- [ ] Product has `sellerId` field
- [ ] Product `approvalStatus` is `approved`
- [ ] Product variant exists (in MongoDB)
- [ ] Inventory item exists with `shopId` + `variantId` + `productId`
- [ ] Inventory stock > 0
- [ ] Buyer cart item added via API

## Build Verification

- [ ] authentication-service build pass
- [ ] user-service build pass
- [ ] store-service build pass
- [ ] product-service build pass
- [ ] cart-service build pass
- [ ] inventory-service build pass
- [ ] order-service build pass
- [ ] payment-service build pass
- [ ] notification-service build pass
- [ ] api-gateway build pass

## Seller/Admin Setup Flow

- [ ] Seller login works (`POST /api/v1/auth/login`)
- [ ] Seller can create shop (`POST /api/v1/seller/shop`)
- [ ] Admin can list shops (`GET /api/v1/admin/shops`)
- [ ] Admin can approve shop (`PATCH /api/v1/admin/shops/:id/approve`)
- [ ] Seller can create category (via admin or direct) (`POST /api/v1/admin/categories`)
- [ ] Seller can create product (`POST /api/v1/seller/products`)
- [ ] Admin can approve product (`PATCH /api/v1/admin/products/moderation/:id/approve`)
- [ ] Seller can create inventory item (`POST /api/v1/seller/inventory`)
- [ ] Seller can update inventory (`PATCH /api/v1/seller/inventory/:variantId`)

## Buyer Cart Flow

- [ ] Buyer login works (`POST /api/v1/auth/login`)
- [ ] Buyer can add approved product variant to cart (`POST /api/v1/carts/me/items`)
- [ ] Cart response contains item
- [ ] Cart item has `productId`
- [ ] Cart item has `variantId`
- [ ] Cart groups by shop (cart groups output has shopId per group)

## Checkout / Order Split Flow

- [ ] Buyer checkout succeeds (`POST /api/v1/orders/checkout` with JWT + x-user-id header)
- [ ] `orders` row created in order-service DB
- [ ] `shop_orders` row created in order-service DB
- [ ] `shop_order_items` row(s) created in order-service DB
- [ ] `shop_orders.order_id` references `orders.id` (FK)
- [ ] `shop_order_items.shop_order_id` references `shop_orders.id` (FK)
- [ ] `shop_order_items` snapshot fields populated (productNameSnapshot, variantNameSnapshot, skuSnapshot, unitPriceSnapshot)
- [ ] Payment transaction created (order-service calls payment-service)
- [ ] Inventory `reserved_stock` updated correctly (if reservation implemented)

## Seller Order Flow

- [ ] Seller `GET /api/v1/seller/orders` returns ShopOrder list
- [ ] Seller `GET /api/v1/seller/orders/:shopOrderId` returns detail
- [ ] Seller confirm order works (`PATCH /api/v1/seller/orders/:shopOrderId/confirm`)
- [ ] Seller ship order works (`PATCH /api/v1/seller/orders/:shopOrderId/ship`)
- [ ] Seller deliver order works (`PATCH /api/v1/seller/orders/:shopOrderId/deliver`)
- [ ] Seller only sees own shop orders (not other sellers')

## Admin Order Flow

- [ ] Admin `GET /api/v1/admin/orders` returns order list
- [ ] Admin `GET /api/v1/admin/shop-orders` returns shop orders list
- [ ] Admin `GET /api/v1/admin/shop-orders/:id` returns detail with items
- [ ] Admin can inspect order/payment/inventory relationship

## Data Integrity

- [ ] Existing legacy orders still readable (`orders` table)
- [ ] Existing `order_items` still intact
- [ ] Existing `order_events` still intact
- [ ] Existing `transactions` still intact
- [ ] Existing `refunds` still intact
- [ ] Existing `inventory_items` (orphaned) still intact
- [ ] Existing `inventory_transactions` still intact

## Payment Integration

- [ ] Stripe checkout creates PaymentIntent (or test equivalent)
- [ ] COD checkout creates transaction with status=pending
- [ ] Payment gateway error handling works

## Inventory Integration

- [ ] Checkout calls inventory reservation (if implemented)
- [ ] `inventory_transactions` row created for reservation
- [ ] Reserved stock released on cancel (if implemented)

## Reports & Documentation

- [ ] `docs/phase-5e-seed-data-report.md` created
- [ ] `docs/phase-5e-runtime-flow-verification-report.md` created
- [ ] `docs/phase-5e-known-issues.md` created with accurate issue list
