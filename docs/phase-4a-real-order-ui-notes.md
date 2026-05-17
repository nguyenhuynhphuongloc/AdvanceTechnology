# Phase 4A: Real Order UI Integration — Implementation Notes

## Summary

Phase 4A connects Buyer, Seller, and Admin UI to real Order APIs (Phase 3 backend). Key changes: added missing API gateway routes, rewrote all order pages to use real API calls, removed localStorage/mock patterns.

## Files Changed

### Backend

| File | Change |
|------|--------|
| `api-gateway/src/modules/routes/v1/routes.controller.ts` | Added `SellerOrderProxyController` and `AdminShopOrderProxyController` |
| `api-gateway/src/modules/routes/routes.module.ts` | Registered new controllers |

### Frontend — Buyer

| File | Change |
|------|--------|
| `app/product/orders/page.tsx` | Rewrote: fixed tab status mapping, added cancel button, fixed detail link |
| `app/product/orders/[id]/page.tsx` | **NEW** — buyer order detail with cancel |

### Frontend — Seller

| File | Change |
|------|--------|
| `app/seller/orders/page.tsx` | Rewrote: real API, proper auth, added ship/cancel actions, tab filters |
| `app/seller/orders/[id]/page.tsx` | **NEW** — seller order detail with all actions |

### Frontend — Admin

| File | Change |
|------|--------|
| `app/admin/orders/page.tsx` | Fixed detail link to `/admin/orders/[id]` |
| `app/admin/orders/[id]/page.tsx` | **NEW** — admin order detail with shopOrders & items |
| `app/admin/shop-orders/page.tsx` | **NEW** — admin shop-orders list with filters |
| `app/admin/shop-orders/[id]/page.tsx` | **NEW** — admin shop-order detail with status actions |

### Frontend — API Client

| File | Change |
|------|--------|
| `lib/shopping/order-api.ts` | Added `fetchSellerOrders`, `fetchSellerOrderDetail`, `shipSellerOrder`, `cancelSellerOrder`, admin shop-order types & functions |
| `lib/admin/api.ts` | Added `fetchAdminShopOrders`, `fetchAdminShopOrderDetail`, `updateAdminShopOrderStatus` + type imports |
| `lib/admin/types.ts` | Added `AdminShopOrderRecord`, `AdminShopOrderListResponse` |

### Pre-existing Bug Fixes

| File | Issue |
|------|-------|
| `app/admin/page.tsx` | Fixed `any` type in `reduce` callback |
| `app/api/payments/intent/route.ts` | Fixed `any` in catch block |
| `app/admin/orders/page.tsx` | Fixed `AdminOrderRecord` import (from types, not api) |

## Buyer UI Changes

- Order history page now shows real data from `GET /api/v1/orders/me`
- Tab filters corrected to match actual API statuses: `pending`, `processing`, `shipped`, `delivered`, `cancelled`
- Order detail link changed from `/product/checkout?orderId=` to `/product/orders/[id]`
- Cancel button appears for `pending` orders
- Shows `orderNumber` instead of truncated `id`
- Shows shop count, payment method, currency

## Seller UI Changes

- Order list calls `GET /api/v1/seller/orders` (real API, gateway proxy added)
- Seller can: Confirm, Ship (with tracking), Deliver, Cancel
- Order detail shows items with snapshots, shipping info, financial summary
- Auth via `getAuthHeaders()` which includes Bearer token

## Admin UI Changes

- Order list → detail with full Order + ShopOrders + Items
- New Shop Orders section: `/admin/shop-orders` with filter by status/shopId/sellerId/orderId
- Shop Order detail with admin override actions (confirm/processing/shipped/delivered/cancel)
- Currency displayed in VND format

## API Client Changes

`lib/shopping/order-api.ts` now exports:
- Buyer: `checkout`, `fetchMyOrders`, `fetchOrderById`, `cancelOrder`
- Seller: `fetchSellerOrders`, `fetchSellerOrderDetail`, `confirmShopOrder`, `shipShopOrder`, `deliverShopOrder`, `cancelSellerOrder`
- Admin: `fetchAdminShopOrders`, `fetchAdminShopOrderDetail`, `updateAdminShopOrderStatus`

## Service/Database Checks

- order-service: ✅ Pass
- cart-service: ✅ Pass
- inventory-service: ✅ Pass
- payment-service: ✅ Pass
- product-service: ✅ Pass
- api-gateway: ✅ Pass (2 new routes added)
- my-app: ✅ Build passed (38 pages)

## Backward Compatibility

- Product APIs Phase 2A: unchanged ✅
- Cart APIs Phase 2B: unchanged ✅
- Inventory APIs Phase 2B: unchanged ✅
- Payment APIs Phase 3: unchanged ✅
- Existing admin pages: unchanged ✅

## Test Results

- Build: api-gateway ✅ | my-app ✅
- Runtime test: **not verified** (services not running)
- ECONNREFUSED during static generation is expected — services need Docker/runtime

## Known Issues

1. `ShopOrderResponse` type does not include `shopNameSnapshot` — buyer detail page uses `shopId` prefix as fallback
2. Admin order detail fetches from list endpoint (no dedicated detail endpoint available)
3. Static generation fetches fail (ECONNREFUSED) — expected without running services
4. All warnings are pre-existing (`<img>` instead of `<Image>`, unused variables in unrelated files)
5. No dedicated seller profile API for shop name — uses shopId display
6. `AdminOrderRecord` was incorrectly imported from `api.ts` instead of `types.ts` — existing pages also had this bug, fixed in Phase 4A

## Next Phase Recommendation

### Phase 4B: Order Status Notifications & Refinement

1. Email/notification on order status change
2. Real seller profile name in ShopOrder display
3. Admin order detail API endpoint (currently fetches from list)
4. Payment confirmation for non-COD methods
5. Shipping provider tracking integration

### Phase 8: Commission & Refund

1. Payment split per shop
2. Platform commission calculation
3. Seller payout/settlement
4. Refund flow
