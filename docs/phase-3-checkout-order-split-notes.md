# Phase 3: Checkout, Order Split & Payment Foundation — Implementation Notes

> **Ngày**: 16 May 2026
> **Phase**: 3 — Checkout, Order Split & Payment Foundation
> **Trạng thái**: ✅ Completed

---

## 1. Summary

Phase 3 rebuilds the order-service from single-store to marketplace model. Key changes:

- **Order Split**: 1 Order → n ShopOrder → n ShopOrderItem (Shopee-like model)
- **Checkout Flow**: Validates stock → reserves inventory → creates Order + ShopOrders + Items → creates COD payment → clears cart
- **Stock Reservation**: Reserve on checkout, release on cancel, commit on delivered
- **COD Payment**: Payment record created on checkout for COD orders
- **Buyer/Seller/Admin**: Full CRUD for their respective order scopes
- **Frontend**: localStorage mock replaced with real API calls

---

## 2. Files Changed

### order-service

| File | Change | Notes |
|------|--------|-------|
| `src/orders/entities/order.entity.ts` | **REWRITE** | UUID, buyerId, status, paymentStatus, shippingAddressSnapshot, Order→ShopOrder relation |
| `src/orders/entities/shop-order.entity.ts` | **NEW** | ShopOrder with shopId, sellerId, status, tracking, timestamps |
| `src/orders/entities/shop-order-item.entity.ts` | **NEW** | Snapshot fields: productName, variantName, sku, image, price |
| `src/orders/entities/order-item.entity.ts` | **DELETE** | Old int-based OrderItem removed |
| `src/orders/orders.service.ts` | **REWRITE** | Full marketplace order logic: checkout, buyer/seller/admin APIs |
| `src/orders/orders.controller.ts` | **REWRITE** | 4 controllers: BuyerOrder, SellerOrder, AdminOrder, AdminShopOrder |
| `src/orders/orders.module.ts` | **REWRITE** | Import all 3 new entities |
| `src/orders/dto/checkout.dto.ts` | **NEW** | CheckoutRequest with shippingAddress |
| `src/orders/dto/order-query.dto.ts` | **NEW** | Paginated query DTOs for buyer/seller/admin |
| `src/orders/dto/seller-order.dto.ts` | **NEW** | ShipOrder, CancelOrder, AdminUpdateShopOrderStatus |
| `src/orders/guards/*.ts` | **NEW** | Local JwtAuthGuard, AdminRoleGuard, SellerOrAdminRoleGuard |
| `src/app.module.ts` | **MINOR** | Remove old OrderModule import |
| `.env` | **ADD** | Service URLs for cart, inventory, payment, store, product |
| `package.json` | **ADD** | axios dependency |

### inventory-service

| File | Change | Notes |
|------|--------|-------|
| `src/inventory/inventory.service.ts` | **ADD** | `reserveInventoryItems`, `releaseInventoryItems`, `commitInventoryItems` |
| `src/inventory/internal-inventory.controller.ts` | **NEW** | `POST /reserve`, `/release`, `/commit` |
| `src/inventory/inventory.module.ts` | **ADD** | InternalInventoryController registration |

### cart-service

| File | Change | Notes |
|------|--------|-------|
| `src/cart/cart.controller.ts` | **ADD** | InternalCartController `GET /:userId/items` |
| `src/cart/cart.service.ts` | **MINOR** | Made `buildUserOwner` public for internal use |
| `src/cart/cart.module.ts` | **ADD** | InternalCartController registration |

### payment-service

| File | Change | Notes |
|------|--------|-------|
| `src/payment/payment.service.ts` | **ADD** | `createTransaction` for COD checkout |
| `src/payment/payment.controller.ts` | **ADD** | `POST /transactions` endpoint |

### my-app (frontend)

| File | Change | Notes |
|------|--------|-------|
| `lib/shopping/order-api.ts` | **REWRITE** | All functions now call real API; removed localStorage mock |
| `app/product/cart/page.tsx` | **MINOR** | Checkout redirects to `/product/checkout` instead of calling createOrder |
| `app/product/checkout/page.tsx` | **REWRITE** | New checkout flow: form → place order via real API → confirmation |

---

## 3. Order Schema Changes

### Order Entity (new)

```
orders:
  id              UUID (PK)
  buyer_id        UUID (FK → AUTH_USER.id)
  order_number    VARCHAR(32) UNIQUE — auto-generated ORD-YYYYMMDD-XXXXXX
  status          ENUM — pending | awaiting_payment | paid | processing | partially_shipped | shipped | delivered | cancelled | refunded
  payment_status  ENUM — pending | paid | failed | refunded | partially_refunded
  payment_method  ENUM — cod | stripe | vnpay | momo
  shipping_address_snapshot JSONB
  subtotal        DECIMAL(14,2)
  shipping_fee    DECIMAL(14,2)
  total_amount    DECIMAL(14,2)
  currency        VARCHAR(8) DEFAULT 'VND'
  note            VARCHAR(500) nullable
  cancelled_at    TIMESTAMPTZ nullable
  cancel_reason  VARCHAR(500) nullable
```

### ShopOrder Entity (new)

```
shop_orders:
  id                  UUID (PK)
  order_id            UUID (FK → orders.id)
  shop_id             UUID (FK → shops.id)
  seller_id           UUID (FK → AUTH_USER.id)
  status              ENUM — pending | confirmed | processing | shipped | delivered | cancelled | refund_requested | refunded
  subtotal            DECIMAL(14,2)
  shipping_fee        DECIMAL(14,2)
  shop_total          DECIMAL(14,2)
  tracking_number      VARCHAR(100) nullable
  shipping_provider   VARCHAR(50) nullable
  estimated_delivery  TIMESTAMPTZ nullable
  confirmed_at        TIMESTAMPTZ nullable
  shipped_at          TIMESTAMPTZ nullable
  delivered_at        TIMESTAMPTZ nullable
  cancelled_at        TIMESTAMPTZ nullable
  cancel_reason       VARCHAR(500) nullable
```

### ShopOrderItem Entity (new)

```
shop_order_items:
  id                    UUID (PK)
  shop_order_id         UUID (FK → shop_orders.id)
  product_id            UUID
  variant_id            UUID
  product_name_snapshot  VARCHAR(255)
  variant_name_snapshot  VARCHAR(255)
  sku_snapshot           VARCHAR(100)
  image_url_snapshot    VARCHAR(500)
  shop_name_snapshot    VARCHAR(255)
  unit_price            DECIMAL(14,2)
  quantity              INT
  line_total            DECIMAL(14,2)
```

---

## 4. Inventory Reservation Strategy

**Decision**: Use reserve → release → commit pattern.

| Event | Action |
|-------|--------|
| Checkout success | Reserve stock (reservedStock += quantity) |
| Order/ShopOrder cancel (before shipped) | Release (reservedStock -= quantity) |
| ShopOrder delivered | Commit (stock -= quantity, reservedStock -= quantity) |
| Admin cancel (before shipped) | Release |
| Admin deliver | Commit |

**Validation**: At checkout, `availableStock = stock - reservedStock >= quantity` for each item.

---

## 5. Payment Foundation Changes

- `PaymentTransactionEntity` already had `orderId: string` (UUID compatible) — no schema change needed
- Added `POST /api/v1/payments/transactions` endpoint for direct COD payment creation
- COD checkout creates payment with `status: 'pending'`, `method: 'cod'`
- Stripe endpoints remain unchanged
- Phase 8 will add payment split, commission, settlement

---

## 6. API Gateway Changes

No routing changes needed — existing routes `/api/v1/orders`, `/api/v1/admin/orders` already proxy to order-service. New endpoints work automatically:

- `POST /api/v1/orders/checkout` → `order-service:3004/api/v1/orders/checkout`
- `GET /api/v1/orders/me` → `order-service:3004/api/v1/orders/me`
- `GET /api/v1/seller/orders` → `order-service:3004/api/v1/seller/orders`
- `GET /api/v1/admin/shop-orders` → `order-service:3004/api/v1/admin/shop-orders`

---

## 7. Frontend Minimal Changes

- `order-api.ts` fully rewritten to call real backend
- Cart page now redirects to checkout page (no longer calls createOrder directly)
- Checkout page handles the full flow: shipping form → `checkout()` API → confirmation
- Seller order page (`/seller/orders`) and admin order page (`/admin/orders`) can be updated in Phase 4+ to use real APIs

---

## 8. Backward Compatibility Notes

- **Cart API Phase 2B**: Unchanged — still works
- **Inventory API Phase 2B**: Unchanged — internal endpoints added only
- **Product API Phase 2A**: Unchanged
- **Legacy cart items**: Checkout fails with clear error if `shopId` is missing
- **Old Order entity** (int userId): Coexists with new Order (UUID buyerId). Admin list will show only new orders.
- **Old OrderItem entity**: Removed

---

## 9. Build Results

| Service | Build |
|---------|-------|
| order-service | ✅ Pass |
| inventory-service | ✅ Pass |
| cart-service | ✅ Pass |
| payment-service | ✅ Pass |
| api-gateway | ✅ Pass (no changes) |
| my-app | To be tested at runtime |

---

## 10. Known Issues

- Internal API has no service-to-service auth (x-user-id forwarded from gateway) — to be addressed in future phase
- Seller order page and admin order page still use localStorage/mock — to be fixed in Phase 4+
- No payment split per shop — Phase 8
- No commission/settlement — Phase 8
- No refund flow — Phase 8
- No shipping provider integration — Phase 8
- Checkout flow is synchronous (no idempotency key retry protection)

---

## 11. Next Phase Recommendation

### Phase 4: Seller Order Management UI + Order Status Notifications

1. Seller order dashboard: list/filter/manage ShopOrders
2. Admin order management: filter by status, shopId, buyerId
3. Buyer order history page with real API
4. Order status webhook/notification on status change
5. Email notification on order placed/confirmed/shipped/delivered

### Phase 5: Review & Rating

1. Buyer reviews after order delivered
2. Seller response to reviews
3. Product rating aggregation

### Phase 8: Payment Split & Settlement

1. Per-shop payment split
2. Platform commission calculation
3. Seller payout/settlement
4. Refund flow

---

*Document generated by Senior Backend Architect / Full-stack Engineer Agent*
*Last updated: 16 May 2026*
