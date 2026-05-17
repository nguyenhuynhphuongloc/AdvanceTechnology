# Phase 4A Plan

## 1. Current Frontend Findings

**Buyer order page** (`/product/orders/page.tsx`):
- ✅ Calls real `fetchMyOrders()` → `GET /api/v1/orders/me`
- ✅ Uses real API types (`OrderResponse`, `ShopOrderResponse`)
- ⚠️ Missing `orderNumber` display, shows `order.id.slice(0,8)` instead
- ⚠️ Tabs filter use wrong status values (e.g. `awaiting_approval`, `shipping`, `delivered` don't match API statuses)
- ⚠️ Detail link goes to `/product/checkout?orderId=...` instead of `/product/orders/[id]`
- ⚠️ No order detail page exists (`/product/orders/[id]/page.tsx` missing)
- ⚠️ No cancel button on buyer side

**Checkout page** (`/product/checkout/page.tsx`):
- ✅ Calls real `checkout()` → `POST /api/v1/orders/checkout`
- ✅ Uses real API response for confirmation
- ✅ Redirect to `/product/orders` on success

**Seller order page** (`/seller/orders/page.tsx`):
- ⚠️ Fetches directly via `fetch()` instead of using `order-api.ts`
- ⚠️ Missing `shipShopOrder()` action (shows "Phase 4" disabled button)
- ⚠️ Missing `cancelShopOrder()` action
- ⚠️ No order detail page for sellers
- ⚠️ `cancelShopOrder()` function doesn't exist in `order-api.ts`
- ⚠️ Seller calls `/api/v1/seller/orders` but **no gateway route exists** for this path — gateway only has `/api/v1/orders` and `/api/v1/admin/orders`

**Admin order page** (`/admin/orders/page.tsx`):
- ✅ Uses `fetchAdminOrders()` → `GET /api/v1/admin/orders`
- ⚠️ **No gateway route** for `/api/v1/admin/orders` (route controller exists but not registered)
- ⚠️ `AdminOrderRecord` type in types.ts may not match actual API response shape
- ⚠️ Missing admin shop-orders pages (`/admin/shop-orders`, `/admin/orders/[id]`, `/admin/shop-orders/[id]`)

---

## 2. Current Backend/API Findings

**Order API (order-service)**:
- ✅ All endpoints exist: checkout, list orders, get order, cancel
- ✅ Seller endpoints: list, get, confirm, ship, deliver, cancel
- ✅ Admin endpoints: list orders, get order, list shop-orders, get shop-order, update shop-order status

**API Gateway routes**:
| Route | Status |
|-------|--------|
| `POST /api/v1/orders/checkout` | ✅ proxied |
| `GET /api/v1/orders/me` | ✅ proxied |
| `GET /api/v1/orders/:id` | ✅ proxied |
| `PATCH /api/v1/orders/:id/cancel` | ✅ proxied |
| `GET /api/v1/seller/orders` | ❌ **MISSING** — no controller registered |
| `GET /api/v1/seller/orders/:id` | ❌ **MISSING** |
| `PATCH /api/v1/seller/orders/:id/confirm` | ❌ **MISSING** |
| `PATCH /api/v1/seller/orders/:id/ship` | ❌ **MISSING** |
| `PATCH /api/v1/seller/orders/:id/deliver` | ❌ **MISSING** |
| `PATCH /api/v1/seller/orders/:id/cancel` | ❌ **MISSING** |
| `GET /api/v1/admin/orders` | ✅ controller exists, check registration |
| `GET /api/v1/admin/orders/:id` | ✅ controller exists |
| `GET /api/v1/admin/shop-orders` | ❌ **MISSING** — no controller registered |
| `GET /api/v1/admin/shop-orders/:id` | ❌ **MISSING** |
| `PATCH /api/v1/admin/shop-orders/:id/status` | ❌ **MISSING** |

---

## 3. Service & Database Stability Check Plan

| Service | Build | DB | Internal API | Notes |
|---------|-------|----|--------------|-------|
| order-service | ✅ Pass | PostgreSQL | Calls cart, inventory, payment | Entity mapping verified |
| cart-service | ✅ Pass | PostgreSQL + Redis | Internal cart by userId | Needs runtime test |
| inventory-service | ✅ Pass | PostgreSQL | Internal reserve/release/commit | Needs runtime test |
| payment-service | ✅ Pass | PostgreSQL | `POST /transactions` | orderId is string |
| product-service | ✅ Pass | MongoDB | — | Unchanged |
| api-gateway | ✅ Pass | — | — | Missing seller/admin shop-orders routes |

**Critical**: Missing gateway routes must be added before seller/admin UI can work.

---

## 4. Files Planned to Change

| Area | File | Change |
|------|------|--------|
| Gateway | `microservices/api-gateway/src/modules/routes/v1/routes.controller.ts` | Add seller orders proxy route, add admin shop-orders proxy route |
| Gateway | `microservices/api-gateway/src/modules/routes/routes.module.ts` | Register new controllers |
| Buyer | `my-app/app/product/orders/page.tsx` | Fix tab status mapping, link to detail page |
| Buyer | `my-app/app/product/orders/[id]/page.tsx` | **NEW** — buyer order detail with cancel |
| Buyer | `my-app/lib/shopping/order-api.ts` | Add `cancelOrder` reason param support |
| Seller | `my-app/app/seller/orders/page.tsx` | Use JWT auth headers, add ship/cancel actions |
| Seller | `my-app/app/seller/orders/[id]/page.tsx` | **NEW** — seller order detail |
| Seller | `my-app/lib/shopping/order-api.ts` | Add `fetchSellerOrders`, `fetchSellerOrderDetail`, `cancelSellerOrder`, `shipSellerOrder` |
| Admin | `my-app/app/admin/orders/[id]/page.tsx` | **NEW** — admin order detail |
| Admin | `my-app/app/admin/shop-orders/page.tsx` | **NEW** — admin shop-orders list |
| Admin | `my-app/app/admin/shop-orders/[id]/page.tsx` | **NEW** — admin shop-order detail |
| Admin | `my-app/lib/admin/api.ts` | Add `fetchAdminShopOrders`, `fetchAdminShopOrderDetail`, `updateAdminShopOrderStatus` |
| Admin | `my-app/lib/admin/types.ts` | Add `AdminShopOrderListResponse` type |

---

## 5. Implementation Steps

1. **Gateway fix**: Add `SellerOrderProxyController` for `/api/v1/seller/orders/*` → `ORDER_SERVICE_URL`
2. **Gateway fix**: Add `AdminShopOrderProxyController` for `/api/v1/admin/shop-orders/*` → `ORDER_SERVICE_URL`
3. **Gateway fix**: Register new controllers in `RoutesModule`
4. **Buyer**: Fix `/product/orders` tab status mapping, fix detail link
5. **Buyer**: Create `/product/orders/[id]` detail page with cancel
6. **Buyer**: Ensure `cancelOrder()` sends reason in body
7. **Seller**: Add missing seller API functions to `order-api.ts`
8. **Seller**: Fix auth headers (add Authorization Bearer token)
9. **Seller**: Add ship/cancel actions to seller orders list
10. **Seller**: Create `/seller/orders/[id]` detail page
11. **Admin**: Add shop-order types and API functions to admin lib
12. **Admin**: Create `/admin/shop-orders` list page
13. **Admin**: Create `/admin/shop-orders/[id]` detail page
14. **Admin**: Create `/admin/orders/[id]` detail page
15. **Build**: Verify all services and frontend compile
16. **Docs**: Create all output docs

---

## 6. Out of Scope

- No commission/refund/payment split
- No review/rating
- No notification system
- No UI redesign
- No shipping provider integration
- No new database entities or schema changes
- No cart/inventory/payment architectural changes
