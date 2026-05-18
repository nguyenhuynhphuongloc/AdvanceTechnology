# Phase 5E.1 Runtime Flow Verification Report

Generated: 2026-05-17T14:51:36.615Z

## Fixed Seed IDs Used in This Test

| Name | ID |
|------|----|
| adminId | `99999999-9999-9999-9999-999999999999` |
| sellerId | `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` |
| buyerId | `cccccccc-cccc-cccc-cccc-cccccccccccc` |
| shopId | `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb` |
| productId | `eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee` |
| variantId | `dddddddd-dddd-dddd-dddd-dddddddd0001` |

## Test Results

| # | Test | Status | Details |
|---|------|--------|--------|
| 1 | GET /api/v1/carts/me — get cart for buyer | ✅ PASS | {"cartId":"90757841-dc9f-4d16-97e9-146610c0218f","totalItems":2,"subtotal":15000 |
| 2 | GET /api/v1/orders/me — list buyer orders | ✅ PASS | {"count":1,"total":1} |
| 3 | POST /api/v1/orders/checkout — full checkout flow | ✅ PASS | {"orderId":"419a45b5-f42c-4416-833b-44157c65601e","orderNumber":"ORD-20260517-AQ |
| 4 | GET /api/v1/orders/me — verify new order visible to buyer | ✅ PASS | {"count":2,"total":2} |
| 5 | GET /api/v1/seller/orders — list shop orders for seller | ✅ PASS | {"count":3,"total":3} |
| 6 | GET /api/v1/admin/orders — admin order list | ✅ PASS | {"count":10,"total":13} |
| 7 | GET /api/v1/admin/shop-orders — admin shop-order list | ✅ PASS | {"count":3,"total":3} |
| 8 | GET /internal/products/:id/variants/:id — verify variant via product-service | ✅ PASS | {"productId":"eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee","variantId":"dddddddd-dddd-d |
| 9 | GET /api/v1/products — public product listing | ✅ PASS | {"count":1,"total":1,"hasSeedProduct":true} |
| 10 | DB CHECK: inventory_items — verify stock/reserved after checkout | ✅ PASS | {"stock":100,"reserved":2,"note":"Stock reserved (checkout worked)"} |
| 11 | DB CHECK: orders — verify orders table has buyer orders | ✅ PASS | {"count":2,"latestStatus":"pending"} |
| 12 | DB CHECK: shop_orders — verify shop_orders created for order | ✅ PASS | {"count":2,"shopIds":["bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","bbbbbbbb-bbbb-bbbb |
| 13 | DB CHECK: cart_state — verify cart cleared after checkout | ✅ PASS | {"itemsRemaining":0,"note":"Cart cleared"} |

## Blockers & Service Failures
_No blockers detected._

## Known Infrastructure Issues

## Recommendations

1. **MongoDB Atlas fix**: Whitelist SRV DNS `_mongodb._tcp.product-service.nkkntfg.mongodb.net` or provide direct IP for connection.
2. **Retry checkout** after MongoDB fix: The cart is pre-seeded and inventory is ready.
3. **Seller order confirm**: After checkout, seller can confirm via `PATCH /api/v1/seller/orders/:id/confirm`.
4. **Admin approval**: Admin can list/manage all orders via `/api/v1/admin/orders`.
5. **Inventory commit**: Delivering a shop-order triggers `POST /internal/inventory/commit`.
6. **Payment**: COD payment is created in `payment-transactions` table (or via RabbitMQ if `RABBITMQ_ENABLED=true`).