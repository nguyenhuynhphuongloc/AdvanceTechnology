# Phase 3: API Contract

> **Ngày**: 16 May 2026
> **Phase**: 3 — Checkout, Order Split & Payment Foundation
> **Base URL**: `http://localhost:3000` (API Gateway)

---

## Conventions

- **Authentication**: JWT Bearer token or `x-user-id` header from gateway
- **User ID**: Gateway forwards `x-user-id`, `x-user-role`, `x-user-email`
- **Content-Type**: `application/json`
- **Error format**: NestJS default exception format
- **ID type**: All IDs are UUID strings

---

## 1. Buyer Order APIs

### 1.1 Checkout

```
POST /api/v1/orders/checkout
```

**Auth**: JWT required

**Request Body**:
```json
{
  "shippingAddress": {
    "fullName": "Nguyen Van A",
    "phone": "0900000000",
    "province": "Ho Chi Minh",
    "district": "District 1",
    "ward": "Ben Nghe",
    "street": "123 Nguyen Hue"
  },
  "paymentMethod": "cod",
  "note": "Optional note"
}
```

**Response 201**:
```json
{
  "id": "order-uuid",
  "buyerId": "user-uuid",
  "orderNumber": "ORD-20260516-ABC123",
  "status": "pending",
  "paymentStatus": "pending",
  "paymentMethod": "cod",
  "shippingAddressSnapshot": { ... },
  "subtotal": 300000,
  "shippingFee": 0,
  "totalAmount": 300000,
  "currency": "VND",
  "note": "Optional note",
  "cancelledAt": null,
  "cancelReason": null,
  "shopOrders": [
    {
      "id": "shop-order-uuid",
      "orderId": "order-uuid",
      "shopId": "shop-uuid",
      "sellerId": "seller-uuid",
      "status": "pending",
      "subtotal": 300000,
      "shippingFee": 0,
      "shopTotal": 300000,
      "trackingNumber": null,
      "shippingProvider": null,
      "confirmedAt": null,
      "shippedAt": null,
      "deliveredAt": null,
      "cancelledAt": null,
      "cancelReason": null,
      "items": [
        {
          "id": "item-uuid",
          "productId": "product-uuid",
          "variantId": "variant-uuid",
          "productNameSnapshot": "T-Shirt",
          "variantNameSnapshot": "Black / M",
          "skuSnapshot": "SKU-001",
          "imageUrlSnapshot": "https://...",
          "shopNameSnapshot": "Fashion Shop",
          "unitPrice": 150000,
          "quantity": 2,
          "lineTotal": 300000
        }
      ],
      "createdAt": "2026-05-16T...",
      "updatedAt": "2026-05-16T..."
    }
  ],
  "createdAt": "2026-05-16T...",
  "updatedAt": "2026-05-16T..."
}
```

**Errors**:
| Status | Message | Scenario |
|--------|---------|----------|
| 400 | Cart is empty. | Empty cart |
| 400 | Legacy cart items cannot be checked out. | Cart has items without shopId |
| 400 | Insufficient stock... | Not enough available stock |
| 400 | Product "X" is not available... | Product inactive/unapproved |
| 401 | Authentication required. | Missing JWT |

**Behavior**: Creates Order + ShopOrders + ShopOrderItems, reserves stock, creates COD payment, clears cart.

---

### 1.2 List My Orders

```
GET /api/v1/orders/me
```

**Auth**: JWT required

**Query Params**:
- `page` (default: 1)
- `limit` (default: 20)
- `status` (optional) — order status filter

**Response 200**:
```json
{
  "items": [ /* Order objects */ ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

---

### 1.3 Get Order Detail

```
GET /api/v1/orders/:orderId
```

**Auth**: JWT required

**Response 200**: Full Order object with shopOrders and items

**Errors**:
| Status | Message | Scenario |
|--------|---------|----------|
| 404 | Order not found. | Order doesn't exist |
| 403 | You do not own this order. | Wrong buyer |

---

### 1.4 Cancel Order

```
PATCH /api/v1/orders/:orderId/cancel
```

**Auth**: JWT required

**Request Body**:
```json
{
  "reason": "Changed my mind"
}
```

**Response 200**: Updated Order object

**Errors**:
| Status | Message | Scenario |
|--------|---------|----------|
| 400 | Order cannot be cancelled in status: X | Order already shipped/delivered |
| 400 | Cannot cancel: some items have already been shipped. | Partial shipment |
| 403 | You do not own this order. | Wrong buyer |

---

## 2. Seller Order APIs

### 2.1 List Shop Orders

```
GET /api/v1/seller/orders
```

**Auth**: JWT (seller | admin)

**Query Params**:
- `page`, `limit`
- `status` (optional)

**Response 200**:
```json
{
  "items": [ /* ShopOrder objects */ ],
  "total": 5,
  "page": 1,
  "limit": 20
}
```

---

### 2.2 Get Shop Order Detail

```
GET /api/v1/seller/orders/:shopOrderId
```

**Auth**: JWT (seller | admin)

**Response 200**: Full ShopOrder object with items

---

### 2.3 Confirm Shop Order

```
PATCH /api/v1/seller/orders/:shopOrderId/confirm
```

**Auth**: JWT (seller | admin)

**Response 200**: Updated ShopOrder with `status: "confirmed"`, `confirmedAt` set

**Errors**: 400 if not in `pending` status

---

### 2.4 Ship Shop Order

```
PATCH /api/v1/seller/orders/:shopOrderId/ship
```

**Auth**: JWT (seller | admin)

**Request Body**:
```json
{
  "trackingNumber": "TRACK123",
  "shippingProvider": "GHN"
}
```

**Response 200**: Updated ShopOrder with `status: "shipped"`, `shippedAt` set

---

### 2.5 Deliver Shop Order

```
PATCH /api/v1/seller/orders/:shopOrderId/deliver
```

**Auth**: JWT (seller | admin)

**Response 200**: Updated ShopOrder with `status: "delivered"`, `deliveredAt` set

**Behavior**: Commits stock for all items in the ShopOrder.

---

### 2.6 Cancel Shop Order

```
PATCH /api/v1/seller/orders/:shopOrderId/cancel
```

**Auth**: JWT (seller | admin)

**Request Body**:
```json
{
  "reason": "Out of stock"
}
```

**Response 200**: Updated ShopOrder with `status: "cancelled"`, releases reserved stock

---

## 3. Admin Order APIs

### 3.1 List All Orders

```
GET /api/v1/admin/orders
```

**Auth**: JWT (admin only)

**Query Params**: `page`, `limit`, `status`, `buyerId`, `paymentStatus`

**Response 200**:
```json
{
  "items": [ /* Order objects */ ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

---

### 3.2 Get Order Detail

```
GET /api/v1/admin/orders/:orderId
```

**Auth**: JWT (admin only)

---

### 3.3 List All Shop Orders

```
GET /api/v1/admin/shop-orders
```

**Auth**: JWT (admin only)

**Query Params**: `page`, `limit`, `status`, `shopId`, `sellerId`, `orderId`

---

### 3.4 Get Shop Order Detail

```
GET /api/v1/admin/shop-orders/:shopOrderId
```

**Auth**: JWT (admin only)

---

### 3.5 Update Shop Order Status

```
PATCH /api/v1/admin/shop-orders/:shopOrderId/status
```

**Auth**: JWT (admin only)

**Request Body**:
```json
{
  "status": "confirmed",
  "reason": "Admin override"
}
```

**Behavior**:
- `confirmed`: Sets confirmedAt
- `shipped`: Sets shippedAt
- `delivered`: Commits stock
- `cancelled` (before shipped): Releases stock

---

## 4. Inventory Internal APIs

### 4.1 Reserve Stock

```
POST /api/v1/internal/inventory/reserve
```

**Request Body**:
```json
{
  "items": [
    { "shopId": "shop-uuid", "variantId": "variant-uuid", "quantity": 2 }
  ]
}
```

**Response 200**:
```json
{
  "success": true
}
```

**Response 200** (failure):
```json
{
  "success": false,
  "failedItems": [
    { "variantId": "variant-uuid", "reason": "insufficient_stock" }
  ]
}
```

---

### 4.2 Release Stock

```
POST /api/v1/internal/inventory/release
```

**Request Body**: Same as reserve

**Response 200**: `{ "success": true }`

---

### 4.3 Commit Stock

```
POST /api/v1/internal/inventory/commit
```

**Request Body**: Same as reserve

**Behavior**: Deducts both `stock` and `reservedStock`.

**Response 200**: `{ "success": true }`

---

## 5. Payment APIs

### 5.1 Create COD Transaction

```
POST /api/v1/payments/transactions
```

**Request Body**:
```json
{
  "orderId": "order-uuid",
  "method": "cod",
  "amount": 300000,
  "status": "pending"
}
```

**Response 201**: Payment transaction object

---

### 5.2 Get Payment by Order ID

```
GET /api/v1/payments/order/:orderId
```

**Auth**: Optional JWT

---

## 6. Error Codes Reference

| HTTP Status | Exception | Scenario |
|-------------|-----------|----------|
| 400 | BadRequestException | Validation failed, empty cart, insufficient stock |
| 401 | UnauthorizedException | Invalid/missing JWT |
| 403 | ForbiddenException | Role not allowed, not order owner |
| 404 | NotFoundException | Resource not found |
| 500 | InternalServerErrorException | Unexpected error |

---

*Document generated by Senior Backend Architect / Full-stack Engineer Agent*
*Last updated: 16 May 2026*
