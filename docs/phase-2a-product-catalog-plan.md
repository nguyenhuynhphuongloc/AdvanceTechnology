# Phase 2A: Product & Catalog Marketplace Foundation — Plan

> **Ngày**: 16 May 2026
> **Phase**: 2A — Product & Catalog Marketplace Foundation
> **Trạng thái**: In Progress

---

## 1. Current Product-Service Findings

### 1.1 Database Architecture

- **Engine**: TypeORM 0.3.28 + MongoDB driver (NOT Mongoose)
- **6 Collections**: `products`, `product_variants`, `product_images`, `categories`, `collections`, `product_related`
- **Dual-ID pattern**: Mỗi entity có `_id: ObjectId` (MongoDB native) + `id: string` (UUID) — API dùng UUID string
- **Variants/Images là COLLECTION RIÊNG**, không embedded trong Product document

### 1.2 Product Collection (current)

```
products:
  _id: ObjectId (MongoDB)
  id: string (UUID) ← API-facing
  name: string
  slug: string (unique index)
  description: string
  basePrice: number
  images[]: string[] (legacy - array of URLs)
  tags[]: string[]
  category: string (không phải ObjectId)
  collection: string
  variants[]: string[] (legacy - array of variant IDs)
  isActive: boolean ← CHỈ CÓ isActive
  createdAt: Date
  updatedAt: Date
```

**Issues:**
- Không có `shopId`
- Không có `sellerId`
- Không có `approvalStatus`
- Không có `rejectionReason`
- `category` là string thuần, không phải ObjectId → không cần join
- `variants[]` và `images[]` là legacy array chỉ lưu IDs

### 1.3 ProductVariant Collection (current)

```
product_variants:
  _id: ObjectId
  id: string (UUID) ← CÓ sẵn rồi, dùng cho cart/order
  productId: string
  sku: string (unique)
  size: string
  color: string
  priceOverride: number
  imageId: string
  isActive: boolean
  createdAt: Date
```

**Tốt**: Variant đã có `id` (UUID string) — có thể dùng cho cart/order ở Phase 2B.

### 1.4 ProductImage Collection (current)

```
product_images:
  _id: ObjectId
  id: string (UUID)
  productId: string
  imageUrl: string
  publicId: string (Cloudinary)
  altText: string
  sortOrder: number
  isMain: boolean
```

**Tốt**: Đã có đầy đủ field, variant image đã có `imageId`.

### 1.5 Current Product APIs

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/v1/products` | GET | List products | None |
| `/api/v1/products/:slug` | GET | Product detail | None |
| `/api/v1/products/:slug/related` | GET | Related products | None |
| `/api/v1/admin/products` | GET | Admin list | Admin |
| `/api/v1/admin/products` | POST | Admin create | Admin |
| `/api/v1/admin/products/:id` | GET | Admin detail | Admin |
| `/api/v1/admin/products/:id` | PATCH | Admin update | Admin |
| `/api/v1/admin/products/:id` | DELETE | Admin delete | Admin |
| `/api/v1/admin/products/upload-image` | POST | Upload image | Admin |
| `/api/v1/admin/products/media` | GET | List media | Admin |
| `/api/v1/admin/products/media/upload` | POST | Upload media | Admin |
| `/api/v1/admin/products/media` | DELETE | Delete media | Admin |

### 1.6 Compatibility Risks

| Risk | Impact | Mitigation |
|------|--------|-------------|
| Destructive `updateProduct()` | Xóa variants/images rồi insert lại | Giữ nguyên — không đổi logic update |
| Legacy `images[]` array field | Product document có cả mảng string và collection mới | Giữ array để không break frontend cũ |
| Category là string, không phải ObjectId | Không cần join, filter bằng string | Giữ nguyên |
| Slug unique index | Không đổi → slug unique toàn hệ thống | Giữ nguyên |

---

## 2. Exact Files Planned to Change

### 2.1 product-service

| File | Change | Notes |
|------|--------|-------|
| `src/product/schemas/product.schema.ts` | **MODIFY** | Thêm shopId, sellerId, approvalStatus, rejectionReason, approvedAt, approvedBy |
| `src/product/dto/create-product.dto.ts` | **MODIFY** | Thêm validation, shopId optional với admin |
| `src/product/dto/update-product.dto.ts` | **MODIFY** | Thêm validation |
| `src/product/dto/admin-product.dto.ts` | **NEW** | Admin create/update DTO với shopId |
| `src/product/product.service.ts` | **MODIFY** | Thêm seller product logic, approval logic, admin moderation |
| `src/product/product.controller.ts` | **MODIFY** | Thêm seller routes, admin moderation routes, public shop products route |
| `src/product/product.module.ts` | **MINOR** | Import modules mới nếu cần |

### 2.2 store-service (internal endpoint)

| File | Change | Notes |
|------|--------|-------|
| `src/shops/shops.service.ts` | **MODIFY** | Thêm `getShopBySellerId()` method |
| `src/shops/shops.controller.ts` | **MODIFY** | Thêm internal route `GET /internal/shops/by-seller/:sellerId` |

### 2.3 api-gateway

| File | Change | Notes |
|------|--------|-------|
| `src/modules/routes/v1/routes.controller.ts` | **MODIFY** | Thêm 3 controllers: SellerProductsController, AdminProductModerationController, ShopProductsController |
| `src/modules/routes/routes.module.ts` | **MODIFY** | Register controllers mới |

---

## 3. Step-by-Step Implementation Plan

### Step 1: Store-service — Internal shop lookup

**Goal**: product-service cần gọi store-service để lấy shop theo sellerId.

**Actions:**
1. Thêm `getShopBySellerId(sellerId)` vào `ShopsService`
2. Thêm `GET /internal/shops/by-seller/:sellerId` vào `ShopsController` (internal, không qua gateway)
3. Không cần gateway route cho endpoint này vì product-service gọi trực tiếp

**Rationale**: Option B — HTTP call product-service → store-service. Đơn giản, không tạo dependency qua gateway header.

### Step 2: Product Schema — Thêm marketplace fields

**Goal**: Cập nhật Product schema thêm:

```typescript
shopId: string        // UUID string
sellerId: string        // UUID string
approvalStatus: enum    // 'draft' | 'pending' | 'approved' | 'rejected' | 'hidden'
rejectionReason: string | null
approvedAt: Date | null
approvedBy: string | null  // admin user ID
```

**Actions:**
1. Sửa `product.schema.ts`
2. Thêm enum `ProductApprovalStatus`
3. Đặt giá trị mặc định: `approvalStatus = 'pending'`, `isActive = true`
4. **Legacy products** (không có shopId): Giữ nguyên, trả 404 ở public API

### Step 3: Seller Product APIs

**Goal**: Seller có thể CRUD sản phẩm của shop mình.

**Route**: `GET/POST /api/v1/seller/products`  
**Guard**: `SellerOrAdminRoleGuard` + scope check

**Actions:**
1. Thêm `SellerProductsController` trong product.controller.ts hoặc file mới
2. Seller create → tự lấy shopId từ `GET /internal/shops/by-seller/:sellerId`
3. Validate: shop phải tồn tại và không bị rejected/suspended
4. Product mới → `approvalStatus = 'pending'`
5. Seller update → validate product thuộc sellerId của mình

### Step 4: Admin Product Moderation APIs

**Goal**: Admin approve/reject/hide products.

**Route**: `PATCH /api/v1/admin/products/:id/approve|reject|hide`

**Actions:**
1. Thêm `AdminProductModerationController`
2. `approve`: Set `approvalStatus = 'approved'`, `approvedAt = now`, `approvedBy = adminId`
3. `reject`: Set `approvalStatus = 'rejected'`, `rejectionReason`
4. `hide`: Set `approvalStatus = 'hidden'`
5. Admin create → `approvalStatus = 'approved'` (auto-approved)

### Step 5: Public Shop Products API

**Goal**: Buyer xem sản phẩm theo shop.

**Route**: `GET /api/v1/shops/:slug/products`

**Actions:**
1. Thêm `ShopProductsController`
2. Lấy shop theo slug từ store-service
3. Chỉ trả products thỏa: `shopId = shop.id`, `approvalStatus = 'approved'`, `isActive = true`
4. Support pagination và filter

### Step 6: Backward Compatibility

**Goal**: Không break APIs cũ.

**Public listing**: Chỉ trả products thỏa: `approvalStatus = 'approved'`, `isActive = true`, AND (có shopId HOẶC legacy product để tương thích ngược)

**Decision**: Legacy products (không có shopId) vẫn hiển thị ở public listing để không break frontend hiện tại. Chỉ products mới bắt buộc có shopId.

### Step 7: Gateway Routing

**New routes:**
- `POST/GET/PATCH/DELETE /api/v1/seller/products/*` → product-service (SellerOrAdminRoleGuard)
- `PATCH /api/v1/admin/products/:id/approve|reject|hide` → product-service (AdminRoleGuard)
- `GET /api/v1/shops/:slug/products` → product-service (public)

---

## 4. Legacy Product Strategy

**Option A (Recommended)**:
- Products không có `shopId` → legacy products
- Legacy products vẫn hiển thị ở public `/products` listing
- Legacy products không có trong `/shops/:slug/products` (vì không có shopId)
- Admin thấy legacy products trong admin products list
- Admin có thể gán legacy product vào shop bằng `PATCH /admin/products/:id/assign-shop`

**Tác động nhỏ nhất**: Không ẩn legacy data, không break frontend.

---

## 5. Testing Checklist

- [ ] Build product-service ✅
- [ ] Build api-gateway ✅
- [ ] Build store-service ✅
- [ ] Register seller → Create shop → Admin approve shop
- [ ] Seller tạo product → Product ở trạng thái pending
- [ ] Public GET /products → Không thấy product pending
- [ ] Admin approve product → Public thấy product
- [ ] GET /shops/:slug/products → Thấy approved products của shop
- [ ] Seller không sửa được product của seller khác
- [ ] Admin reject product → Public không thấy
- [ ] Legacy products vẫn hiển thị ở /products cũ
- [ ] Customer gọi /seller/products → 403

---

## 6. Out of Scope (Phase 2A)

- Cart/order rebuild
- Variant image theo variant
- Product review/rating
- Seller dashboard UI
- Commission tracking

---

*Plan created: 16 May 2026*
