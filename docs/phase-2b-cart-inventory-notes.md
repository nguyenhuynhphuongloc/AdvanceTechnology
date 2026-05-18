# Phase 2B: Cart & Inventory Marketplace Foundation — Implementation Notes

> **Ngày**: 16 May 2026
> **Phase**: 2B — Cart & Inventory Marketplace Foundation
> **Trạng thái**: ✅ Completed

---

## 1. Summary

Phase 2B hoàn thành việc chuẩn hóa cart-service và inventory-service để hỗ trợ mô hình marketplace giống Shopee. Các thay đổi chính:

- CartItem có `shopId`, `productId`, `variantId` và snapshot fields
- Cart response group theo shop
- InventoryItem có `shopId` và `lowStockThreshold`
- Seller có API quản lý inventory của shop mình
- Admin inventory API vẫn hoạt động
- Product-service có internal endpoint validate variant
- Store-service có internal endpoint get shop by ID
- API Gateway có route cho seller inventory

---

## 2. Files Changed

### product-service

| File | Change | Notes |
|------|--------|-------|
| `src/product/product.controller.ts` | **ADD** InternalProductsController | Internal variant validation endpoint |
| `src/product/product.service.ts` | **ADD** `getProductVariantForInternal()` | Validate variant for cart/inventory |
| `src/product/product.module.ts` | **ADD** InternalProductsController | Register controller |

### store-service

| File | Change | Notes |
|------|--------|-------|
| `src/shops/shops.controller.ts` | **ADD** `GET /api/v1/internal/shops/:id` | Get shop by ID for inventory-service |

### cart-service

| File | Change | Notes |
|------|--------|-------|
| `src/cart/entities/cart-state.entity.ts` | **REWRITE** CartItemSnapshot | Thêm marketplace fields |
| `src/cart/cart.service.ts` | **REWRITE** | Full marketplace cart logic |
| `src/cart/cart.controller.ts` | **REWRITE** | Add/update/remove by itemId |
| `src/cart/dto/add-cart-item.dto.ts` | **REWRITE** | productId, variantId, quantity |
| `src/cart/cart.module.ts` | **MINOR** | Import cart controller |
| `package.json` | **ADD** `axios` | HTTP client |
| `.env` | **ADD** `PRODUCT_SERVICE_URL` | Product service URL |

### inventory-service

| File | Change | Notes |
|------|--------|-------|
| `src/inventory/entities/inventory-item.entity.ts` | **REWRITE** | Thêm shopId, lowStockThreshold |
| `src/inventory/inventory.service.ts` | **REWRITE** | Seller inventory + shopId validation |
| `src/inventory/inventory.controller.ts` | **ADD** SellerInventoryController | Seller CRUD endpoints |
| `src/inventory/dto/inventory.dto.ts` | **NEW** | Seller inventory DTOs |
| `src/inventory/inventory.module.ts` | **MINOR** | Register new controller |
| `package.json` | **ADD** `axios` | HTTP client |
| `.env` | **ADD** `PRODUCT_SERVICE_URL`, `STORE_SERVICE_URL` | Service URLs |

### api-gateway

| File | Change | Notes |
|------|--------|-------|
| `src/modules/routes/v1/routes.controller.ts` | **ADD** SellerInventoryProxyController | Proxy to inventory-service |
| `src/modules/routes/routes.module.ts` | **ADD** SellerInventoryProxyController | Register controller |
| `src/modules/proxy/proxy.service.ts` | **ADD** `x-guest-token` forward | Forward guest token |

---

## 3. Cart Schema Changes

### CartItemSnapshot (new)

```typescript
interface CartItemSnapshot {
  itemId: string;           // Client-safe unique ID (ci_timestamp_random)
  variantId: string;         // Product variant UUID
  productId: string;         // Product UUID
  shopId: string;            // Shop UUID — KEY for grouping
  productNameSnapshot: string;
  variantNameSnapshot: string;
  skuSnapshot: string;
  imageUrlSnapshot: string;
  shopNameSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  addedAt: string;           // ISO timestamp
}
```

### Cart identification

- `userId: string | null` — UUID string
- `guestToken: string | null`
- `ownerKey: string` — `cart:user:{userId}` or `cart:guest:{guestToken}`

### Unique constraint

- `ownerKey` is unique — one cart per user or per guest token

---

## 4. Inventory Schema Changes

### InventoryItemEntity (new)

```typescript
@Entity({ name: 'inventory_items' })
@Index(['shopId', 'variantId'], { unique: true })
export class InventoryItemEntity {
  id: string;                // UUID
  shopId: string | null;     // NEW — FK to Shop.id (MongoDB reference)
  productId: string | null;
  variantId: string | null;
  branchId: string | null;   // kept, nullable
  sku: string | null;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number; // NEW — default 10
  updatedAt: Date;
}
```

### Unique constraint

- `(shopId, variantId)` — unique
- Legacy items (shopId = null) don't have uniqueness constraint

---

## 5. Product/Internal API Changes

### New Internal Endpoint (product-service)

```
GET /api/v1/internal/products/:productId/variants/:variantId
```

**Response**:
```json
{
  "productId": "uuid",
  "variantId": "uuid",
  "shopId": "uuid | null",
  "sellerId": "uuid | null",
  "productName": "Product name",
  "variantName": "Black / M",
  "sku": "SKU-001",
  "imageUrl": "https://...",
  "unitPrice": 150000,
  "approvalStatus": "approved",
  "isActive": true
}
```

**Auth**: Internal only (not exposed via gateway in Phase 2B)

### New Internal Endpoint (store-service)

```
GET /api/v1/internal/shops/:id
```

---

## 6. Backward Compatibility Notes

### Cart

- `GET /api/v1/carts/me` → **CHANGED** — now returns grouped response
- `POST /api/v1/carts/me/items` → **CHANGED** — body changed to `{ productId, variantId, quantity }`
- `DELETE /api/v1/carts/me/items/:variantId` → **KEPT** — still works (variantId-based)
- `DELETE /api/v1/carts/me` → **KEPT** — unchanged
- `POST /api/v1/carts/merge` → **KEPT** — unchanged
- Admin cart APIs → **KEPT** — unchanged

### Inventory

- `POST /api/v1/inventory/items` → **KEPT** — still works (admin upsert)
- `GET /api/v1/inventory/items/:variantId` → **KEPT** — unchanged
- `GET /api/v1/admin/inventory` → **KEPT** — unchanged (shopId filter added)
- `PATCH /api/v1/admin/inventory/:id` → **KEPT** — unchanged
- Branch APIs → **KEPT** — unchanged

### Product

- All Phase 2A APIs → **KEPT** — unchanged

---

## 7. Stock Validation Decision

**Phase 2B**: Stock is NOT validated at add-to-cart time.

- `POST /api/v1/carts/me/items` validates product/variant approval status but NOT stock
- Stock will be validated during **Phase 3 checkout**
- Cart response includes snapshot prices but NOT real-time stock

**Rationale**: Adding stock validation at cart level requires inventory service to be always available and adds latency to every add-to-cart request. Phase 3 checkout will handle stock validation as part of the order creation flow.

---

## 8. Legacy Data Strategy

### Legacy Cart Items

- Items without `shopId` are shown in a group with `shopId: "__legacy__"` or `shopId: null`
- Cannot add legacy items to cart (product validation rejects items without shopId)
- Legacy items in existing carts can still be viewed/removed

### Legacy Inventory Items

- Inventory items without `shopId` are visible in admin inventory
- Admin can filter by `shopId: null` to see legacy items
- Seller inventory only shows items with `shopId` matching their shop

### Legacy Products (no shopId)

- Products without `shopId` cannot be added to cart
- Cart service returns: `"Legacy product must be assigned to a shop before purchase."`
- Admin should use `PATCH /api/v1/admin/products/moderation/:id/assign-shop` to assign legacy products

---

## 9. Known Issues

| # | Severity | Issue | Resolution |
|---|----------|-------|-----------|
| 1 | Medium | Order-service broken due to cart changes | Document in Known Issues; rebuild order in Phase 3 |
| 2 | Medium | Internal endpoints have no service-to-service auth | Add internal API key in Phase 3 |
| 3 | Low | Branch entity location unknown in inventory-service | Keep branchId nullable; investigate in Phase 3 |
| 4 | Low | Cart response format changed — frontend needs update | Document new response format |
| 5 | Low | Stock not validated at add-to-cart | Phase 3 checkout will validate |

---

## 10. Build Results

| Service | Build | Notes |
|---------|-------|-------|
| product-service | ✅ Pass | |
| store-service | ✅ Pass | |
| cart-service | ✅ Pass | |
| inventory-service | ✅ Pass | |
| api-gateway | ✅ Pass | |

---

## 11. Next Phase Recommendation

### Phase 3: Checkout & Order Split

1. **Order Split Logic**: 1 Order → n ShopOrder → n ShopOrderItem
2. **Checkout API**: Validate stock, split by shop, create ShopOrders
3. **Stock validation at checkout**: Check availableStock before confirming
4. **Seller Order Management API**: View/confirm/ship orders per shop
5. **Stock reservation on checkout**: Reserve stock when order is placed

### Phase 2B Follow-up (if needed)

1. **Add internal API key** for service-to-service calls
2. **Investigate branch entity** in inventory-service
3. **Update frontend cart context** to handle new response format
4. **Add stock validation at add-to-cart** (optional, Phase 3 preferred)

---

*Document generated by Senior Backend Architect / Full-stack Engineer Agent*
*Last updated: 16 May 2026*
