# Phase 3 Plan

## 1. Current Order-Service Findings

**Entities**:
- `Order` (orders table): `id int PK`, `userId int`, `status PENDING|CONFIRMED|CANCELLED`, `totalAmount decimal`
- `OrderItem` (order_items table): `id int PK`, `productId int`, `name`, `price`, `quantity`, `lineTotal`
- `OrderEntity` (orders table, separate): `id UUID`, `authUserId UUID`, `items OrderItemSnapshot[] JSON`, flat single-store design
- Both sets of controllers/services exist (OrdersController + OrdersService vs OrderController + OrderService)

**Issues**:
- Uses `userId: int` from header (not UUID)
- No shopId/ShopOrder/ShopOrderItem split
- Cart fetch URL wrong (`/cart/internal/{userId}` not matching Phase 2B cart structure)
- No stock validation, no reservation
- OrderEntity (UUID) has `items` as JSON array, no ShopOrder

**API Gateway**: Routes to order-service correctly for `/api/v1/orders` and `/api/v1/admin/orders`.

## 2. Current Checkout/Frontend Findings

- `my-app/lib/shopping/order-api.ts` uses localStorage mock (`acme_mock_orders`)
- `createOrder()` writes to localStorage, ignores real API
- `fetchMyOrders()` reads from localStorage
- `checkout/page.tsx` expects orderId from query params, polls order status
- Frontend cart is Phase 2B (grouped by shop, cart items have shopId)

## 3. Current Payment-Service Findings

- `PaymentTransactionEntity`: `id UUID`, `orderId string`, `method string`, `amount float`, `status string`
- `orderId` is already `string` (UUID compatible)
- Has `createPaymentIntent` for Stripe
- Listens to RabbitMQ `inventory.reserved` and `payment.succeeded/failed`
- COD not explicitly supported as payment method
- Phase 3 needs: COD checkout creates payment pending record

## 4. Required Database Changes

### order-service (new tables)
- `orders`: `id UUID PK`, `buyerId UUID`, `orderNumber UNIQUE`, `status`, `paymentStatus`, `paymentMethod`, `shippingAddressSnapshot JSONB`, `subtotal DECIMAL`, `shippingFee DECIMAL`, `totalAmount DECIMAL`, `currency DEFAULT VND`, `note`, `createdAt`, `updatedAt`, `cancelledAt`, `cancelReason`
- `shop_orders`: `id UUID PK`, `orderId UUID FK`, `shopId UUID`, `sellerId UUID`, `status`, `subtotal DECIMAL`, `shippingFee DECIMAL`, `shopTotal DECIMAL`, `trackingNumber`, `shippingProvider`, `estimatedDelivery`, `confirmedAt`, `shippedAt`, `deliveredAt`, `cancelledAt`, `cancelReason`, `createdAt`, `updatedAt`
- `shop_order_items`: `id UUID PK`, `shopOrderId UUID FK`, `productId`, `variantId`, `productNameSnapshot`, `variantNameSnapshot`, `skuSnapshot`, `imageUrlSnapshot`, `shopNameSnapshot`, `unitPrice DECIMAL`, `quantity INT`, `lineTotal DECIMAL`, `createdAt`

### inventory-service
- Add internal endpoints: `POST /api/v1/internal/inventory/reserve`, `/release`, `/commit`
- `releaseReservation` already exists via RabbitMQ, needs direct HTTP fallback
- `finalizeReservation` already exists

### payment-service
- No schema change needed (orderId already string)
- Add COD payment method support in `createPaymentIntent` check

### cart-service
- Add internal endpoint: `GET /api/v1/internal/carts/:userId/items` returning flat cart items array for order-service

## 5. Required API Changes

### Buyer APIs
- `POST /api/v1/orders/checkout` — checkout from cart, create Order + ShopOrders + ShopOrderItems, reserve stock
- `GET /api/v1/orders/me` — list buyer orders
- `GET /api/v1/orders/:id` — buyer order detail
- `PATCH /api/v1/orders/:id/cancel` — buyer cancel order

### Seller APIs
- `GET /api/v1/seller/orders` — list shop orders for seller's shop
- `GET /api/v1/seller/orders/:shopOrderId` — shop order detail
- `PATCH /api/v1/seller/orders/:shopOrderId/confirm` — seller confirm
- `PATCH /api/v1/seller/orders/:shopOrderId/ship` — seller ship
- `PATCH /api/v1/seller/orders/:shopOrderId/deliver` — seller deliver
- `PATCH /api/v1/seller/orders/:shopOrderId/cancel` — seller cancel

### Admin APIs
- `GET /api/v1/admin/orders` — list all orders
- `GET /api/v1/admin/orders/:id` — order detail
- `GET /api/v1/admin/shop-orders` — list all shop orders
- `GET /api/v1/admin/shop-orders/:id` — shop order detail
- `PATCH /api/v1/admin/shop-orders/:id/status` — admin override status

### Inventory Internal APIs
- `POST /api/v1/internal/inventory/reserve` — reserve stock
- `POST /api/v1/internal/inventory/release` — release reserved stock
- `POST /api/v1/internal/inventory/commit` — commit (deduct stock + reserved)

## 6. Files Planned to Change

| Service | File | Change |
|---------|------|--------|
| order-service | `src/orders/entities/order.entity.ts` | **REWRITE** — marketplace Order with UUID, buyerId |
| order-service | `src/orders/entities/shop-order.entity.ts` | **NEW** — ShopOrder entity |
| order-service | `src/orders/entities/shop-order-item.entity.ts` | **NEW** — ShopOrderItem entity |
| order-service | `src/orders/orders.service.ts` | **REWRITE** — checkout + buyer APIs |
| order-service | `src/orders/orders.controller.ts` | **REWRITE** — buyer checkout + order APIs |
| order-service | `src/orders/orders.module.ts` | **REWRITE** — import new entities |
| order-service | `src/orders/dto/checkout.dto.ts` | **NEW** — checkout request DTO |
| order-service | `src/orders/dto/order-query.dto.ts` | **NEW** — paginated query DTOs |
| order-service | `src/orders/dto/seller-order.dto.ts` | **NEW** — seller order action DTOs |
| order-service | `src/orders/orders.module.ts` | Update imports |
| order-service | `src/app.module.ts` | Update OrderModule import |
| inventory-service | `src/inventory/inventory.service.ts` | Add reserve/release/commit methods |
| inventory-service | `src/inventory/inventory.controller.ts` | Add internal endpoints |
| inventory-service | `src/inventory/inventory.module.ts` | Register internal controller |
| cart-service | `src/cart/cart.controller.ts` | Add internal cart items endpoint |
| payment-service | `src/payment/payment.service.ts` | Minor: ensure COD path works |
| api-gateway | `src/modules/routes/v1/routes.controller.ts` | Add seller order routes |
| api-gateway | `src/modules/routes/routes.module.ts` | Register controllers |
| my-app | `lib/shopping/order-api.ts` | **REWRITE** — use real API |

## 7. Compatibility Risks

- **Cart response**: Cart already has shopId/variantId/productId fields — compatible
- **Payment orderId**: Already string/UUID — compatible
- **Frontend mock**: order-api.ts uses localStorage — must replace with real API calls
- **Legacy products**: Items without shopId will fail checkout validation
- **Old order entities**: OrderEntity (JSON items) and Order (int userId) will coexist; admin list may show both
- **Inventory without shopId**: Reserve by variantId only (backward compat)

## 8. Implementation Steps

1. Create plan + checklist docs
2. Rewrite order entities: Order (UUID), ShopOrder, ShopOrderItem
3. Add internal inventory reserve/release/commit endpoints
4. Add internal cart items endpoint for order-service
5. Implement checkout flow: validate → split by shop → create Order/ShopOrders/Items → reserve stock → create payment record → clear cart
6. Implement buyer: list orders, get order, cancel order
7. Implement seller: list shop orders, get, confirm, ship, deliver, cancel
8. Implement admin: list orders/shop-orders, get detail, update status
9. Add COD payment creation on checkout
10. Update API gateway: seller order routes + buyer checkout route
11. Rewrite frontend order-api.ts to call real endpoints
12. Build all services
13. Create output docs
