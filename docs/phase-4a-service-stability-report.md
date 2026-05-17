# Phase 4A Service Stability Report

## Summary

All 4 core services pass TypeScript build. Gateway proxy for buyer order APIs exists. Gateway is **missing** seller orders and admin shop-orders routes — this is the primary blocker for Phase 4A.

## Service Checks

| Service | Build | DB/Storage | API Connectivity | Issues |
|---------|-------|------------|-----------------|--------|
| order-service | ✅ Pass | PostgreSQL | Internal calls to cart, inventory, payment | None |
| cart-service | ✅ Pass | PostgreSQL + Redis | Internal cart by userId | None |
| inventory-service | ✅ Pass | PostgreSQL | Internal reserve/release/commit | None |
| payment-service | ✅ Pass | PostgreSQL | `POST /transactions` | None |
| product-service | ✅ Pass | MongoDB | — | None |
| api-gateway | ✅ Pass | — | — | Missing seller orders & admin shop-orders routes |

## Database Checks

| Database/Table | Status | Notes |
|---|---|---|
| orders | ✅ OK | Phase 3 marketplace schema |
| shop_orders | ✅ OK | Phase 3 per-shop schema |
| shop_order_items | ✅ OK | Phase 3 snapshot schema |
| inventory_items | ✅ OK | Phase 2B + reservedStock |
| cart_state | ✅ OK | Phase 2B with shopId |
| transactions (payment) | ✅ OK | Phase 1, orderId is string |
| products (MongoDB) | ✅ OK | Phase 2A |
| shops | ✅ OK | Phase 1 |

## Internal API Checks

| From | To | Endpoint | Status | Notes |
|---|---|---|---|---|
| order-service | cart-service | `GET /api/v1/carts/:userId/items` | ✅ OK | Phase 3 note |
| order-service | inventory-service | `POST /api/v1/internal/inventory/reserve` | ✅ OK | Phase 3 added |
| order-service | inventory-service | `POST /api/v1/internal/inventory/release` | ✅ OK | Phase 3 added |
| order-service | inventory-service | `POST /api/v1/internal/inventory/commit` | ✅ OK | Phase 3 added |
| order-service | payment-service | `POST /api/v1/payments/transactions` | ✅ OK | Phase 3 added |

## Blocking Issues

1. **Gateway missing `SellerOrderProxyController`** — `/api/v1/seller/orders/*` not proxied
2. **Gateway missing `AdminShopOrderProxyController`** — `/api/v1/admin/shop-orders/*` not proxied

## Non-blocking Issues

- Buyer order detail page missing (needs to be created)
- Seller order detail page missing (needs to be created)
- Admin shop-orders list page missing (needs to be created)
- Admin order/shop-order detail pages missing (needs to be created)
- Buyer order page has incorrect tab status mapping
