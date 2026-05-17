# Phase 5E: Checkout Flow & Shop-Order Split

## Mục tiêu
Kiểm thử end-to-end luồng checkout trên marketplace — từ buyer add cart đến khi order được tạo với cấu trúc Order → ShopOrder → ShopOrderItem.

## Kiến trúc Checkout

### Flow
```
Buyer Add to Cart
  → cart-service (PostgreSQL: carts, cart_items)
  → product-service (MongoDB: products, product_variants)
    ↳ verify: isActive=true, approvalStatus='approved', shopId != null

Buyer Checkout
  → order-service:
    1. Fetch cart từ cart-service
    2. Validate variants qua product-service/internal
    3. Reserve stock qua inventory-service (RabbitMQ: inventory.reserve)
    4. Tạo Order (1 record)
    5. Tạo ShopOrder (N records — 1 per shop, nhóm theo shopId)
    6. Tạo ShopOrderItem (N*M records — 1 per item per shop)
    7. Tạo Payment transaction (payment-service)
    8. Clear cart (cart-service)
  → inventory-service (RabbitMQ consumer):
    - Nhận event inventory.reserved → đợi payment
    - payment.succeeded → commit (trừ stock)
    - payment.failed / order.cancelled → release (hoàn lại reserved)
```

### Entity Relationships
```
Order (1) ──< ShopOrder (N) ──< ShopOrderItem (N)
  └─ buyerId (NOT NULL, UUID)
  └─ paymentStatus
  └─ shippingAddressSnapshot (JSONB)

ShopOrder:
  └─ orderId (FK → Order.id)
  └─ shopId, sellerId (từ store-service)
  └─ status (pending → confirmed → shipped → delivered)
  └─ subtotal, shippingFee, shopTotal

ShopOrderItem:
  └─ shopOrderId (FK → ShopOrder.id)
  └─ productId, variantId (không FK — chỉ snapshot)
  └─ unitPrice, quantity, lineTotal
  └─ productNameSnapshot, variantNameSnapshot, skuSnapshot, imageUrlSnapshot, shopNameSnapshot
```

## API Endpoints

### Buyer
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/v1/orders/checkout` | Tạo order từ cart |
| GET | `/api/v1/orders/me` | List orders của buyer |
| GET | `/api/v1/orders/:orderId` | Chi tiết order |
| PATCH | `/api/v1/orders/:orderId/cancel` | Hủy order |

### Seller
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/seller/orders` | List shop-orders của shop mình |
| GET | `/api/v1/seller/orders/:shopOrderId` | Chi tiết shop-order |
| PATCH | `/api/v1/seller/orders/:shopOrderId/confirm` | Xác nhận |
| PATCH | `/api/v1/seller/orders/:shopOrderId/ship` | Giao hàng |
| PATCH | `/api/v1/seller/orders/:shopOrderId/deliver` | Đã giao |
| PATCH | `/api/v1/seller/orders/:shopOrderId/cancel` | Hủy |

### Admin
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/v1/admin/orders` | List all orders |
| GET | `/api/v1/admin/orders/:orderId` | Chi tiết order |
| GET | `/api/v1/admin/shop-orders` | List all shop-orders |
| GET | `/api/v1/admin/shop-orders/:shopOrderId` | Chi tiết shop-order |
| PATCH | `/api/v1/admin/shop-orders/:shopOrderId/status` | Update status |

## Infrastructure

| Service | Database | Port | Docker Hostname |
|---------|----------|------|-----------------|
| order-service | Neon PostgreSQL (ep-cold-dream) | 3004 | order-service |
| store-service | Neon PostgreSQL (ep-spring-union) | 3012 | store-service |
| cart-service | Neon PostgreSQL (ep-old-base) | 3007 | cart-service |
| inventory-service | Neon PostgreSQL (ep-spring-scene) | 3006 | inventory-service |
| payment-service | Neon PostgreSQL (ep-fancy-glade) | 3003 | payment-service |
| product-service | MongoDB | 3001 | product-service |
| RabbitMQ | - | 5672/15672 | rabbitmq |
| Redis | - | 6379 | redis |
| MongoDB | - | 27017 | mongodb |

## Test Data IDs

```
buyerId  : cccccccc-cccc-cccc-cccc-cccccccccccc
sellerId : aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
shopId   : bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
variant1 : dddddddd-dddd-dddd-dddd-dddddddd0001
variant2 : dddddddd-dddd-dddd-dddd-dddddddd0002
variant3 : dddddddd-dddd-dddd-dddd-dddddddd0003
order-1  : 11111111-1111-1111-1111-111111111111
order-2  : 33333333-3333-3333-3333-333333333333
```

## Test Commands

```bash
# Start services
cd microservices/store-service && npx ts-node src/main.ts
cd microservices/order-service && npx ts-node src/main.ts

# Seed test data
npx ts-node seed-test-shop.ts
npx ts-node seed-test-orders.ts

# Test APIs
curl -H "x-user-id: cccccccc-cccc-cccc-cccc-cccccccccccc" \
  http://localhost:3004/api/v1/orders/me

curl -H "x-user-id: 22222222-2222-2222-2222-222222222222" -H "x-user-role: admin" \
  http://localhost:3004/api/v1/admin/orders

curl -H "x-user-id: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" -H "x-user-role: seller" \
  http://localhost:3004/api/v1/seller/orders
```
