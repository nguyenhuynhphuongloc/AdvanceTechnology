# Phase 4A: API Usage Reference

Frontend is using these APIs for order management.

## Buyer APIs

| Function | Method | Endpoint | Auth |
|----------|--------|----------|------|
| `checkout(data)` | POST | `/api/v1/orders/checkout` | JWT |
| `fetchMyOrders(params?)` | GET | `/api/v1/orders/me` | JWT |
| `fetchOrderById(id)` | GET | `/api/v1/orders/:id` | JWT |
| `cancelOrder(id, reason?)` | PATCH | `/api/v1/orders/:id/cancel` | JWT |

## Seller APIs

| Function | Method | Endpoint | Auth |
|----------|--------|----------|------|
| `fetchSellerOrders(params?)` | GET | `/api/v1/seller/orders` | JWT (seller/admin) |
| `fetchSellerOrderDetail(id)` | GET | `/api/v1/seller/orders/:id` | JWT (seller/admin) |
| `confirmShopOrder(id)` | PATCH | `/api/v1/seller/orders/:id/confirm` | JWT (seller/admin) |
| `shipShopOrder(id, {trackingNumber, shippingProvider})` | PATCH | `/api/v1/seller/orders/:id/ship` | JWT (seller/admin) |
| `deliverShopOrder(id)` | PATCH | `/api/v1/seller/orders/:id/deliver` | JWT (seller/admin) |
| `cancelSellerOrder(id, reason?)` | PATCH | `/api/v1/seller/orders/:id/cancel` | JWT (seller/admin) |

## Admin APIs

| Function | Method | Endpoint | Auth |
|----------|--------|----------|------|
| `fetchAdminOrders(token)` | GET | `/api/v1/admin/orders` | JWT (admin) |
| `fetchAdminShopOrders(token, query?)` | GET | `/api/v1/admin/shop-orders` | JWT (admin) |
| `fetchAdminShopOrderDetail(token, id)` | GET | `/api/v1/admin/shop-orders/:id` | JWT (admin) |
| `updateAdminShopOrderStatus(token, id, {status, reason?})` | PATCH | `/api/v1/admin/shop-orders/:id/status` | JWT (admin) |

## Buyer Order Request/Response

### Checkout Request
```json
{
  "shippingAddress": {
    "fullName": "string",
    "phone": "string",
    "province": "string",
    "district": "string",
    "ward": "string",
    "street": "string"
  },
  "paymentMethod": "cod",
  "note": "string (optional)"
}
```

### Order Response
```json
{
  "id": "uuid",
  "buyerId": "uuid",
  "orderNumber": "ORD-YYYYMMDD-XXXXXX",
  "status": "pending | processing | shipped | delivered | cancelled",
  "paymentStatus": "pending | paid | failed",
  "paymentMethod": "cod",
  "shippingAddressSnapshot": { ... },
  "subtotal": 0,
  "shippingFee": 0,
  "totalAmount": 0,
  "currency": "VND",
  "note": null,
  "cancelledAt": null,
  "cancelReason": null,
  "shopOrders": [
    {
      "id": "uuid",
      "orderId": "uuid",
      "shopId": "uuid",
      "sellerId": "uuid",
      "status": "pending | confirmed | shipped | delivered | cancelled",
      "subtotal": 0,
      "shippingFee": 0,
      "shopTotal": 0,
      "trackingNumber": null,
      "shippingProvider": null,
      "confirmedAt": null,
      "shippedAt": null,
      "deliveredAt": null,
      "cancelledAt": null,
      "cancelReason": null,
      "items": [
        {
          "id": "uuid",
          "productId": "uuid",
          "variantId": "uuid",
          "productNameSnapshot": "string",
          "variantNameSnapshot": "string",
          "skuSnapshot": "string",
          "imageUrlSnapshot": "url",
          "shopNameSnapshot": "string",
          "unitPrice": 0,
          "quantity": 0,
          "lineTotal": 0
        }
      ],
      "createdAt": "ISO",
      "updatedAt": "ISO"
    }
  ],
  "createdAt": "ISO",
  "updatedAt": "ISO"
}
```

## Seller Order Status Flow

```
pending → confirmed → shipped → delivered
              ↓            ↓
           cancelled    cancelled
```

- **pending**: Awaiting seller confirmation
- **confirmed**: Seller confirmed, preparing items
- **shipped**: Handed to shipping carrier (tracking info entered)
- **delivered**: Confirmed received by buyer
- **cancelled**: Order cancelled (stock released)

## Admin Shop Order Status Values

`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`

## Order Status Values (Parent)

`pending`, `awaiting_payment`, `paid`, `processing`, `partially_shipped`, `shipped`, `delivered`, `cancelled`, `refunded`
