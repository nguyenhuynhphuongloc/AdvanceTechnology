# Phase 2B: API Contract

> **Ngày**: 16 May 2026
> **Phase**: 2B — Cart & Inventory Marketplace Foundation
> **Base URL**: `http://localhost:3000` (API Gateway)

---

## Conventions

- **Authentication**: JWT Bearer token (for protected routes), Optional JWT + guest token (for cart routes)
- **User ID**: Gateway forward `x-user-id`, `x-user-role`, `x-user-email`
- **Guest Token**: `x-guest-token` header
- **Content-Type**: `application/json`
- **Error format**: NestJS default exception format

---

## 1. Cart APIs

### 1.1 Get My Cart

```
GET /api/v1/carts/me
```

**Auth**: Optional JWT + `x-guest-token` header

**Headers**:
- `Authorization: Bearer <jwt>` (optional)
- `x-guest-token: <guest-token>` (optional, if not authenticated)

**Response 200**:
```json
{
  "id": "cart-uuid",
  "userId": "user-uuid or null",
  "guestToken": "guest-token or null",
  "groups": [
    {
      "shopId": "shop-uuid",
      "shopName": "Fashion Shop",
      "items": [
        {
          "itemId": "ci_1234567890_abc1234",
          "variantId": "variant-uuid",
          "productId": "product-uuid",
          "productName": "T-Shirt",
          "variantName": "Black / M",
          "sku": "SKU-001",
          "imageUrl": "https://...",
          "unitPriceSnapshot": 150000,
          "quantity": 2,
          "addedAt": "2026-05-16T12:00:00.000Z"
        }
      ],
      "shopSubtotal": 300000
    }
  ],
  "subtotal": 300000,
  "totalItems": 2,
  "updatedAt": "2026-05-16T12:00:00.000Z"
}
```

**Note**: Empty cart returns `groups: []`.

---

### 1.2 Add Item to Cart

```
POST /api/v1/carts/me/items
```

**Auth**: Optional JWT + `x-guest-token` header

**Request Body**:
```json
{
  "productId": "product-uuid",
  "variantId": "variant-uuid",
  "quantity": 1
}
```

**Response 200**: Updated cart object (full cart)

**Errors**:
| Status | Message | Scenario |
|--------|---------|----------|
| 400 | `productId, variantId, and quantity (> 0) are required.` | Invalid input |
| 400 | `Product or variant not found, or variant is inactive.` | Invalid product/variant |
| 400 | `Legacy product must be assigned to a shop before purchase.` | Product has no shopId |
| 400 | `Product is not available for purchase. Status: pending` | Product not approved |

**Behavior**:
- Validates product/variant via product-service internal endpoint
- Extracts shopId from product automatically (NOT from request body)
- If same variant already in cart, increases quantity
- Snapshots product name, price, image at time of add

---

### 1.3 Update Cart Item Quantity

```
PATCH /api/v1/carts/me/items/:itemId
```

**Auth**: Optional JWT + `x-guest-token` header

**Request Body**:
```json
{
  "quantity": 3
}
```

**Response 200**: Updated cart object

**Errors**:
| Status | Message | Scenario |
|--------|---------|----------|
| 400 | `itemId and quantity (> 0) are required.` | Invalid input |
| 404 | `Cart item with id "X" was not found.` | Item not in cart |

---

### 1.4 Remove Cart Item (by itemId)

```
DELETE /api/v1/carts/me/items/:itemId
```

**Auth**: Optional JWT + `x-guest-token` header

**Response 200**: Updated cart object

**Errors**:
| Status | Message | Scenario |
|--------|---------|----------|
| 404 | `Cart item with id "X" was not found.` | Item not in cart |

---

### 1.5 Remove Cart Item (by variantId — backward compat)

```
DELETE /api/v1/carts/me/items/:variantId
```

**Auth**: Optional JWT + `x-guest-token` header

**Response 200**: Updated cart object

**Errors**:
| Status | Message | Scenario |
|--------|---------|----------|
| 404 | `Cart item with variantId "X" was not found.` | Item not in cart |

---

### 1.6 Clear Cart

```
DELETE /api/v1/carts/me
```

**Auth**: Optional JWT + `x-guest-token` header

**Response 200**: Empty cart object

---

### 1.7 Merge Guest Cart

```
POST /api/v1/carts/merge
```

**Auth**: JWT Bearer (required)

**Request Body**:
```json
{
  "guestToken": "guest-token-string"
}
```

**Response 200**: Merged user cart object

**Behavior**:
- Merges guest cart items into user cart
- If same variant exists, quantities are combined
- Guest cart is deleted after merge

---

## 2. Admin Cart APIs

### 2.1 List All Carts

```
GET /api/v1/admin/carts
```

**Auth**: JWT Bearer (admin only)

**Query Params**:
- `userId` (optional)
- `guestToken` (optional)
- `search` (optional)

**Response 200**:
```json
{
  "items": [
    {
      "id": "cart-uuid",
      "userId": "user-uuid",
      "guestToken": null,
      "ownerKey": "cart:user:user-uuid",
      "items": [...],
      "itemCount": 3,
      "subtotal": 500000,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 10
}
```

---

### 2.2 Get Cart by ID

```
GET /api/v1/admin/carts/:id
```

**Auth**: JWT Bearer (admin only)

**Response 200**: Single cart object with `itemCount` and `subtotal`.

---

## 3. Seller Inventory APIs

### 3.1 List Seller Inventory

```
GET /api/v1/seller/inventory
```

**Auth**: JWT Bearer (role: seller | admin)

**Query Params**:
- `page` (default: 1)
- `limit` (default: 20)
- `search` (optional) — search by sku, productId, variantId
- `lowStockOnly` (optional) — `true/false`
- `productId` (optional)

**Response 200**:
```json
{
  "items": [
    {
      "id": "inventory-uuid",
      "shopId": "shop-uuid",
      "productId": "product-uuid",
      "variantId": "variant-uuid",
      "sku": "SKU-001",
      "stock": 100,
      "reservedStock": 5,
      "availableStock": 95,
      "lowStockThreshold": 10,
      "status": "in-stock",
      "updatedAt": "2026-05-16T12:00:00.000Z"
    }
  ],
  "total": 1
}
```

**Note**: Seller only sees inventory of their own shop (determined by sellerId from JWT → shopId).

---

### 3.2 Create/Upsert Inventory Item

```
POST /api/v1/seller/inventory
```

**Auth**: JWT Bearer (role: seller | admin)

**Request Body**:
```json
{
  "productId": "product-uuid",
  "variantId": "variant-uuid",
  "stock": 100,
  "lowStockThreshold": 10
}
```

**Response 201**: Created inventory item

**Errors**:
| Status | Message | Scenario |
|--------|---------|----------|
| 404 | `You do not have a shop. Please create a shop first.` | Seller has no shop |
| 400 | `Your shop is rejected. You cannot manage inventory.` | Shop not active |
| 404 | `Product or variant not found, or variant is inactive.` | Invalid product/variant |
| 400 | `This product does not belong to your shop.` | Variant belongs to different shop |

**Behavior**:
- Validates product/variant via product-service internal endpoint
- If inventory item already exists for this shop+variant, updates stock
- SKU is automatically populated from product-service

---

### 3.3 Update Inventory Stock

```
PATCH /api/v1/seller/inventory/:variantId
```

**Auth**: JWT Bearer (role: seller | admin)

**Request Body**:
```json
{
  "stock": 120,
  "lowStockThreshold": 10
}
```

**Response 200**: Updated inventory item

**Errors**:
| Status | Message | Scenario |
|--------|---------|----------|
| 404 | `You do not have a shop.` | Seller has no shop |
| 404 | `Inventory item for variant "X" not found in your shop.` | Item doesn't belong to seller |
| 400 | `Stock (50) cannot be less than reserved stock (60).` | Insufficient stock |

---

## 4. Admin Inventory APIs

### 4.1 List All Inventory

```
GET /api/v1/admin/inventory
```

**Auth**: JWT Bearer (admin only)

**Query Params**:
- `page`, `limit`
- `productId` (optional)
- `variantId` (optional)
- `sku` (optional)
- `branchId` (optional)
- `shopId` (optional)
- `lowStockOnly` (optional)

**Response 200**:
```json
{
  "items": [...],
  "total": 50
}
```

---

### 4.2 Update Inventory Stock (Admin)

```
PATCH /api/v1/admin/inventory/:id
```

**Auth**: JWT Bearer (admin only)

**Request Body**:
```json
{
  "stock": 200
}
```

**Response 200**: Updated inventory item

---

### 4.3 Upsert Inventory Item (Admin — backward compat)

```
POST /api/v1/inventory/items
```

**Auth**: JWT Bearer (admin only)

**Request Body**:
```json
{
  "productId": "product-uuid",
  "variantId": "variant-uuid",
  "shopId": "shop-uuid (optional)",
  "stock": 100,
  "lowStockThreshold": 10
}
```

**Response 201**: Created/updated inventory item

---

### 4.4 Get Inventory by Variant (backward compat)

```
GET /api/v1/inventory/items/:variantId
```

**Auth**: JWT Bearer (admin only)

**Response 200**: Single inventory item

---

## 5. Internal Product Endpoint

### 5.1 Validate Product Variant

```
GET /api/v1/internal/products/:productId/variants/:variantId
```

**Auth**: Internal only (not exposed via public gateway)

**Response 200**:
```json
{
  "productId": "uuid",
  "variantId": "uuid",
  "shopId": "uuid",
  "sellerId": "uuid",
  "productName": "Product name",
  "variantName": "Black / M",
  "sku": "SKU-001",
  "imageUrl": "https://...",
  "unitPrice": 150000,
  "approvalStatus": "approved",
  "isActive": true
}
```

**Response 404**: `Product or variant not found, or variant is inactive.`

---

## 6. Internal Store Endpoint

### 6.1 Get Shop by ID

```
GET /api/v1/internal/shops/:id
```

**Auth**: Internal only (not exposed via public gateway)

**Response 200**: Shop entity

---

## 7. Inventory Status Values

| Status | Condition |
|--------|-----------|
| `in-stock` | `availableStock > lowStockThreshold` |
| `low-stock` | `0 < availableStock <= lowStockThreshold` |
| `out-of-stock` | `availableStock == 0` |

Where `availableStock = stock - reservedStock`.

---

## 8. Error Codes Reference

| HTTP Status | Exception | Scenario |
|-------------|-----------|----------|
| 400 | BadRequestException | Validation failed, invalid input |
| 401 | UnauthorizedException | Invalid/missing JWT |
| 403 | ForbiddenException | Role not allowed, shop not active |
| 404 | NotFoundException | Resource not found |
| 500 | InternalServerErrorException | Unexpected error |

---

*Document generated by Senior Backend Architect / Full-stack Engineer Agent*
*Last updated: 16 May 2026*
