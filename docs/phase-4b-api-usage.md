# Phase 4B: API Usage Reference

## Seller Shop APIs

| Function | Method | Endpoint | Auth | Used In |
|----------|--------|----------|------|---------|
| `fetchMyShop()` | GET | `/api/v1/seller/shop` | JWT (seller/admin) | layout, dashboard, shop page |
| `updateMyShop(payload)` | PATCH | `/api/v1/seller/shop` | JWT (seller/admin) | shop page |
| `createMyShop(payload)` | POST | `/api/v1/seller/shop` | JWT (seller/admin) | shop page |

### Shop Response Shape
```json
{
  "id": "uuid",
  "sellerId": "uuid",
  "name": "My Shop",
  "slug": "my-shop",
  "logoUrl": "https://...",
  "bannerUrl": "https://...",
  "description": "...",
  "contactEmail": "contact@shop.com",
  "contactPhone": "+84...",
  "address": "123 Main St...",
  "status": "approved | pending | rejected | suspended",
  "commissionRate": "0.00",
  "rejectionReason": "Invalid business info | null",
  "createdAt": "ISO",
  "updatedAt": "ISO"
}
```

### Update Shop Payload
```json
{
  "name": "Updated Name",
  "slug": "updated-slug",
  "description": "...",
  "logoUrl": "https://...",
  "bannerUrl": "https://...",
  "contactEmail": "...",
  "contactPhone": "...",
  "address": "..."
}
```

---

## Seller Product APIs

| Function | Method | Endpoint | Auth | Used In |
|----------|--------|----------|------|---------|
| `fetchSellerProducts(params?)` | GET | `/api/v1/seller/products` | JWT (seller/admin) | products list, dashboard |
| `fetchSellerProductDetail(id)` | GET | `/api/v1/seller/products/:id` | JWT (seller/admin) | edit product |
| `createSellerProduct(payload)` | POST | `/api/v1/seller/products` | JWT (seller/admin) | new product |
| `updateSellerProduct(id, payload)` | PATCH | `/api/v1/seller/products/:id` | JWT (seller/admin) | edit product |
| `deleteSellerProduct(id)` | DELETE | `/api/v1/seller/products/:id` | JWT (seller/admin) | products list |
| `submitSellerProduct(id)` | PATCH | `/api/v1/seller/products/:id/submit` | JWT (seller/admin) | products list |

### Product List Response
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Product Name",
      "slug": "product-name",
      "sku": "SKU-001",
      "categoryId": "uuid | null",
      "basePrice": 150000,
      "imageUrl": "https://...",
      "sellerName": "My Shop",
      "isActive": true,
      "shopId": "uuid",
      "sellerId": "uuid",
      "approvalStatus": "draft | pending | approved | rejected | hidden",
      "rejectionReason": "...",
      "description": "...",
      "variants": [...],
      "images": [...],
      "createdAt": "ISO",
      "updatedAt": "ISO"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 5
}
```

### Create/Update Product Payload
```json
{
  "name": "Product Name",
  "slug": "product-name",
  "sku": "SKU-001",
  "description": "...",
  "categoryId": "uuid",
  "basePrice": 150000,
  "isActive": true,
  "images": [
    { "imageUrl": "https://...", "isMain": true, "altText": "Name", "sortOrder": 0 }
  ],
  "variants": [
    { "sku": "SKU-001-S", "size": "S", "color": "Red", "priceOverride": null, "isActive": true }
  ]
}
```

---

## Seller Inventory APIs

| Function | Method | Endpoint | Auth | Used In |
|----------|--------|----------|------|---------|
| `fetchSellerInventory(params?)` | GET | `/api/v1/seller/inventory` | JWT (seller/admin) | inventory page, dashboard |
| `upsertInventoryItem(payload)` | POST | `/api/v1/seller/inventory` | JWT (seller/admin) | inventory page |
| `updateInventoryStock(variantId, payload)` | PATCH | `/api/v1/seller/inventory/:variantId` | JWT (seller/admin) | inventory page |

### Inventory List Response
```json
{
  "items": [
    {
      "id": "uuid",
      "shopId": "uuid",
      "productId": "uuid",
      "variantId": "uuid",
      "sku": "SKU-001",
      "stock": 100,
      "reservedStock": 5,
      "availableStock": 95,
      "lowStockThreshold": 10,
      "status": "in-stock | low-stock | out-of-stock",
      "updatedAt": "ISO"
    }
  ],
  "total": 1
}
```

### Update Stock Payload
```json
{
  "stock": 120,
  "lowStockThreshold": 10
}
```

---

## Seller Order APIs

| Function | Method | Endpoint | Auth | Used In |
|----------|--------|----------|------|---------|
| `fetchSellerOrders(params?)` | GET | `/api/v1/seller/orders` | JWT (seller/admin) | orders list, orders detail |
| `fetchSellerOrderDetail(id)` | GET | `/api/v1/seller/orders/:id` | JWT (seller/admin) | orders detail |
| `confirmShopOrder(id)` | PATCH | `/api/v1/seller/orders/:id/confirm` | JWT (seller/admin) | orders list/detail |
| `shipShopOrder(id, {trackingNumber, shippingProvider})` | PATCH | `/api/v1/seller/orders/:id/ship` | JWT (seller/admin) | orders list/detail |
| `deliverShopOrder(id)` | PATCH | `/api/v1/seller/orders/:id/deliver` | JWT (seller/admin) | orders list/detail |
| `cancelSellerOrder(id, reason)` | PATCH | `/api/v1/seller/orders/:id/cancel` | JWT (seller/admin) | orders list/detail |

## Page-to-API Mapping

| Page | APIs Called |
|------|-------------|
| `/seller/dashboard` | fetchMyShop, fetchSellerProducts, fetchSellerOrders, fetchSellerInventory |
| `/seller/shop` | fetchMyShop, updateMyShop, createMyShop |
| `/seller/products` | fetchSellerProducts, deleteSellerProduct, submitSellerProduct |
| `/seller/products/new` | createSellerProduct |
| `/seller/products/edit/[id]` | fetchSellerProductDetail, updateSellerProduct |
| `/seller/inventory` | fetchSellerInventory, updateInventoryStock |
| `/seller/orders` | fetchSellerOrders |
| `/seller/orders/[id]` | fetchSellerOrderDetail |
