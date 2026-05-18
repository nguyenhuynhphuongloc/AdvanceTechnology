# Phase 4A Test Checklist

## Gateway Routes

- [ ] `GET /api/v1/seller/orders` proxied to order-service
- [ ] `PATCH /api/v1/seller/orders/:id/confirm` proxied
- [ ] `PATCH /api/v1/seller/orders/:id/ship` proxied
- [ ] `PATCH /api/v1/seller/orders/:id/deliver` proxied
- [ ] `PATCH /api/v1/seller/orders/:id/cancel` proxied
- [ ] `GET /api/v1/admin/shop-orders` proxied to order-service
- [ ] `GET /api/v1/admin/shop-orders/:id` proxied
- [ ] `PATCH /api/v1/admin/shop-orders/:id/status` proxied
- [ ] Existing `/api/v1/admin/orders` still works
- [ ] Existing `/api/v1/orders/*` still works

## Service Build

- [ ] api-gateway build pass after adding new routes
- [ ] order-service build pass
- [ ] cart-service build pass
- [ ] inventory-service build pass
- [ ] payment-service build pass
- [ ] my-app build pass

## Buyer UI

- [ ] Buyer order history page loads without crash
- [ ] Tab filter works with correct status values
- [ ] Order detail link navigates to `/product/orders/[id]`
- [ ] Buyer order detail page exists and loads
- [ ] Buyer sees orderNumber, status, paymentStatus, paymentMethod, totalAmount
- [ ] Buyer sees shopOrders and items with snapshots
- [ ] Buyer cancel button visible for cancelable orders
- [ ] Cancel calls `PATCH /api/v1/orders/:id/cancel` with reason
- [ ] Loading state shown while fetching
- [ ] Empty state shown when no orders
- [ ] Error state shown on API failure

## Checkout

- [ ] Checkout page calls `POST /api/v1/orders/checkout` with real API
- [ ] Checkout success redirects to `/product/orders` or confirmation
- [ ] No localStorage mock used

## Seller UI

- [ ] Seller order list calls `GET /api/v1/seller/orders`
- [ ] Seller sees shopOrder id, status, shopTotal, createdAt, items count
- [ ] Confirm button calls `PATCH /api/v1/seller/orders/:id/confirm`
- [ ] Ship button calls `PATCH /api/v1/seller/orders/:id/ship` with tracking info
- [ ] Deliver button calls `PATCH /api/v1/seller/orders/:id/deliver`
- [ ] Cancel button calls `PATCH /api/v1/seller/orders/:id/cancel` with reason
- [ ] Seller order detail page exists and loads
- [ ] Seller cannot see orders from other shops (backend filter)
- [ ] Loading/error/empty states work

## Admin UI

- [ ] Admin order list calls `GET /api/v1/admin/orders`
- [ ] Admin order detail page exists and loads
- [ ] Admin sees orderNumber, buyerId, status, paymentStatus, totalAmount
- [ ] Admin sees shopOrders and items
- [ ] Admin shop-orders list page exists and calls `GET /api/v1/admin/shop-orders`
- [ ] Admin shop-orders list supports filter by status/shopId/sellerId/orderId
- [ ] Admin shop-order detail page exists and loads
- [ ] Admin can update shop-order status via `PATCH /api/v1/admin/shop-orders/:id/status`
- [ ] Loading/error/empty states work

## API Client

- [ ] `order-api.ts` `cancelOrder()` sends `{ reason }` body
- [ ] `order-api.ts` `fetchSellerOrders()` exists and calls correct URL
- [ ] `order-api.ts` `fetchSellerOrderDetail()` exists
- [ ] `order-api.ts` `shipSellerOrder()` exists
- [ ] `order-api.ts` `cancelSellerOrder()` exists
- [ ] `admin/api.ts` `fetchAdminShopOrders()` exists
- [ ] `admin/api.ts` `fetchAdminShopOrderDetail()` exists
- [ ] `admin/api.ts` `updateAdminShopOrderStatus()` exists
- [ ] All functions handle errors without swallowing them

## Backward Compatibility

- [ ] Buyer checkout still works
- [ ] Buyer order history still works
- [ ] Product APIs still work
- [ ] Cart APIs still work
- [ ] Inventory APIs still work
- [ ] Payment APIs still work
- [ ] Admin products/categories/users pages still work
