# Phase 2A: API Contract

> **Ngày**: 16 May 2026
> **Phase**: 2A — Product & Catalog Marketplace Foundation
> **Base URL**: `http://localhost:3000` (API Gateway)

---

## Conventions

- **Authentication**: JWT Bearer token
- **User ID**: Gateway forward `x-user-id`, `x-user-role`, `x-user-email`
- **Content-Type**: `application/json`
- **Error format**: NestJS default exception format

---

## 1. Seller Product APIs

### 1.1 List Seller Products

```
GET /api/v1/seller/products
```

**Auth**: JWT Bearer (role: seller | admin)

**Query Params**:
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `search` (optional)
- `status` (optional): `draft | pending | approved | rejected | hidden`
- `categoryId` (optional)

**Response 200**:
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Product Name",
      "slug": "product-name",
      "sku": "SKU-001",
      "categoryId": "category-uuid",
      "collectionId": null,
      "basePrice": 150000,
      "imageUrl": "https://...",
      "sellerName": "My Shop",
      "isActive": true,
      "shopId": "shop-uuid",
      "sellerId": "user-uuid",
      "approvalStatus": "pending"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 5
}
```

**Note**: Seller chỉ thấy products thuộc sellerId của mình.

---

### 1.2 Get Seller Product Detail

```
GET /api/v1/seller/products/:id
```

**Auth**: JWT Bearer (role: seller | admin)

**Response 200**: Full `ProductDetailDto` với marketplace fields.

**Error 404**: Product không tồn tại hoặc không thuộc seller.

---

### 1.3 Create Seller Product

```
POST /api/v1/seller/products
```

**Auth**: JWT Bearer (role: seller | admin)

**Request Body**: Tương tự `CreateProductDto`

**Behavior**:
- Tự lấy `shopId` từ `GET /internal/shops/by-seller/:sellerId`
- Nếu chưa có shop → 404 `"You do not have a shop. Please create a shop first."`
- Nếu shop bị rejected/suspended → 403 `"Your shop is X. You cannot create products."`
- `approvalStatus` mặc định = `'pending'`

**Error 409**: `A product with the same slug or SKU already exists.`

---

### 1.4 Update Seller Product

```
PATCH /api/v1/seller/products/:id
```

**Auth**: JWT Bearer (role: seller | admin)

**Behavior**:
- Seller chỉ sửa được product của mình
- Nếu product bị rejected, tự động set `approvalStatus = 'pending'`
- Không cho sửa `shopId`, `sellerId`, `approvalStatus`, `approvedAt`, `approvedBy`

---

### 1.5 Delete Seller Product

```
DELETE /api/v1/seller/products/:id
```

**Auth**: JWT Bearer (role: seller | admin)

**Behavior**: Soft delete (gọi `deleteProduct` như cũ).

**Error 404**: Product không tồn tại hoặc không thuộc seller.

---

### 1.6 Submit Product for Approval

```
PATCH /api/v1/seller/products/:id/submit
```

**Auth**: JWT Bearer (role: seller | admin)

**Behavior**: Set `approvalStatus = 'pending'`. Chỉ áp dụng với status `draft` hoặc `rejected`.

**Error 400**: `Cannot submit product with status "approved". Only draft or rejected products can be submitted.`

---

## 2. Admin Product Moderation APIs

### 2.1 List All Products (Admin)

```
GET /api/v1/admin/products
```

**Auth**: JWT Bearer (role: admin)

**Query Params**: Giữ nguyên + thêm:
- `shopId` (optional)
- `sellerId` (optional)
- `approvalStatus` (optional)

**Response 200**: Paginated products list.

---

### 2.2 Create Product (Admin)

```
POST /api/v1/admin/products/moderation
```

**Auth**: JWT Bearer (role: admin)

**Request Body**: `CreateProductDto` + bắt buộc `shopId`.

**Error 400**: `shopId is required for admin product creation.`

**Behavior**:
- `approvalStatus` mặc định = `'approved'` (auto-approved)
- `approvedAt = now`
- `approvedBy = adminId`

---

### 2.3 Update Product (Admin)

```
PATCH /api/v1/admin/products/moderation/:id
```

**Auth**: JWT Bearer (role: admin)

**Request Body**: `UpdateProductDto` (partial).

---

### 2.4 Approve Product

```
PATCH /api/v1/admin/products/moderation/:id/approve
```

**Auth**: JWT Bearer (role: admin)

**Behavior**:
- `approvalStatus = 'approved'`
- `rejectionReason = null`
- `approvedAt = now`
- `approvedBy = adminId`

**Error 400**: `Product is already approved.`

---

### 2.5 Reject Product

```
PATCH /api/v1/admin/products/moderation/:id/reject
```

**Auth**: JWT Bearer (role: admin)

**Request Body** (optional):
```json
{ "rejectionReason": "Invalid product information" }
```

**Behavior**:
- `approvalStatus = 'rejected'`
- `rejectionReason = dto.rejectionReason ?? null`
- `approvedAt = null`

---

### 2.6 Hide Product

```
PATCH /api/v1/admin/products/moderation/:id/hide
```

**Auth**: JWT Bearer (role: admin)

**Behavior**:
- `approvalStatus = 'hidden'`
- `isActive = false`
- `approvedAt = null`

---

### 2.7 Delete Product (Admin)

```
DELETE /api/v1/admin/products/moderation/:id
```

**Auth**: JWT Bearer (role: admin)

**Behavior**: Hard delete (xóa hết variants, images, related).

---

### 2.8 Assign Legacy Product to Shop

```
PATCH /api/v1/admin/products/moderation/:id/assign-shop
```

**Auth**: JWT Bearer (role: admin)

**Request Body**:
```json
{
  "shopId": "uuid",
  "sellerId": "uuid"  // optional — nếu không có sẽ lấy từ shop.sellerId
}
```

**Behavior**:
- Gán legacy product vào shop
- Set `sellerId` từ `shop.sellerId` nếu không truyền

---

## 3. Public Shop Products API

### 3.1 Get Products by Shop

```
GET /api/v1/shops/:slug/products
```

**Auth**: None (public)

**Query Params**:
- `page` (default: 1)
- `limit` (default: 12)
- `search` (optional)
- `category` (optional)
- `sort`: `latest` | `price-asc` | `price-desc` | `name-asc` | `name-desc`

**Response 200**:
```json
{
  "shop": {
    "id": "uuid",
    "name": "Fashion Store",
    "slug": "fashion-store"
  },
  "items": [
    {
      "id": "uuid",
      "name": "Product Name",
      "slug": "product-name",
      "sku": "SKU-001",
      "categoryId": "category-uuid",
      "collectionId": null,
      "basePrice": 150000,
      "imageUrl": "https://...",
      "sellerName": "Fashion Store",
      "isActive": true,
      "shopId": "shop-uuid",
      "sellerId": "user-uuid",
      "approvalStatus": "approved"
    }
  ],
  "page": 1,
  "limit": 12,
  "total": 5
}
```

**Behavior**:
- Chỉ trả products có `shopId = shop.id`, `approvalStatus = 'approved'`, `isActive = true`
- Shop phải có `status = 'approved'`
- Nếu shop không tồn tại hoặc chưa approved → 404

---

## 4. Public Product APIs (Modified)

### 4.1 List Products

```
GET /api/v1/products
```

**Auth**: None (public)

**Behavior Changed**:
- Chỉ trả products có `isActive = true`
- Legacy products (không có shopId) → luôn hiển thị
- Marketplace products (có shopId) → chỉ hiển thị nếu `approvalStatus = 'approved'`

**Response thay đổi**: Mỗi item có thêm `shopId`, `sellerId`, `approvalStatus`.

---

### 4.2 Get Product Detail

```
GET /api/v1/products/:slug
```

**Auth**: None (public)

**Behavior Changed**:
- Legacy products → luôn hiển thị
- Marketplace products → chỉ hiển thị nếu `approvalStatus = 'approved'`, `isActive = true`
- Nếu product tồn tại nhưng chưa approved → 404 `"Product with slug "X" was not found."`

---

### 4.3 Get Related Products

```
GET /api/v1/products/:slug/related
```

**Auth**: None (public)

**Behavior Changed**: Chỉ lấy related products có `approvalStatus = 'approved'`, `isActive = true`.

---

## 5. Error Codes Reference

| HTTP Status | Exception | Scenario |
|-------------|-----------|----------|
| 400 | BadRequestException | Validation failed, duplicate slug/SKU, shopId required |
| 401 | UnauthorizedException | Invalid/missing JWT |
| 403 | ForbiddenException | Shop suspended/rejected, not your product |
| 404 | NotFoundException | Product not found, shop not found |
| 409 | ConflictException | Duplicate slug or SKU |
| 500 | InternalServerErrorException | Unexpected error |

---

*Document generated by Senior Backend Architect / Full-stack Engineer Agent*
*Last updated: 16 May 2026*
