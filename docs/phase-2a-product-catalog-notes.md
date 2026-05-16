# Phase 2A: Product & Catalog Marketplace Foundation — Implementation Notes

> **Ngày**: 16 May 2026
> **Phase**: 2A — Product & Catalog Marketplace Foundation
> **Trạng thái**: ✅ Completed

---

## 1. Summary

Phase 2A hoàn thành việc chuyển product-service từ mô hình single-store sang marketplace catalog. Các thay đổi chính:

- Product entity có thêm `shopId`, `sellerId`, `approvalStatus`, `rejectionReason`, `approvedAt`, `approvedBy`
- Seller có API quản lý sản phẩm của shop mình
- Admin có API duyệt/từ chối/ẩn sản phẩm
- Public xem sản phẩm theo shop: `GET /api/v1/shops/:slug/products`
- Legacy products (không có shopId) vẫn hiển thị ở listing công khai
- Không phá các APIs cũ

---

## 2. Files Changed

### product-service

| File | Change | Notes |
|------|--------|-------|
| `src/product/entities/product.entity.ts` | **MODIFY** | Thêm marketplace fields |
| `src/product/dto/product-response.dto.ts` | **MODIFY** | Thêm shopId, sellerId, approvalStatus vào DTOs |
| `src/product/dto/create-product.dto.ts` | **MODIFY** | Thêm shopId, sellerId, approvalStatus |
| `src/product/dto/admin-product-query.dto.ts` | **MODIFY** | Thêm shopId, sellerId, approvalStatus filters |
| `src/product/dto/seller-product-query.dto.ts` | **NEW** | Seller product list query DTO |
| `src/product/product.service.ts` | **MODIFY** | Thêm seller/admin/moderation methods, cập nhật public queries |
| `src/product/product.controller.ts` | **MODIFY** | Thêm 3 controllers mới |
| `src/product/product.module.ts` | **MODIFY** | Register controllers mới |
| `.env` | **MODIFY** | Thêm STORE_SERVICE_URL |

### store-service

| File | Change | Notes |
|------|--------|-------|
| `src/shops/shops.service.ts` | **MODIFY** | Thêm `getShopBySellerId()` |
| `src/shops/shops.controller.ts` | **MODIFY** | Thêm `InternalShopsController` |
| `src/shops/shops.module.ts` | **MODIFY** | Register new controller |

### api-gateway

| File | Change | Notes |
|------|--------|-------|
| `src/modules/routes/v1/routes.controller.ts` | **MODIFY** | Thêm 3 proxy controllers |
| `src/modules/routes/routes.module.ts` | **MODIFY** | Register new controllers |

---

## 3. Product Schema Changes

### Product Entity

```typescript
// Thêm vào product.entity.ts
shopId?: string | null          // UUID string — liên kết với Shop.id
sellerId?: string | null         // UUID string — liên kết với AuthUser.id
approvalStatus: ProductApprovalStatus  // 'draft' | 'pending' | 'approved' | 'rejected' | 'hidden'
rejectionReason?: string | null
approvedAt?: Date | null
approvedBy?: string | null
```

### ProductApprovalStatus Enum

```typescript
export enum ProductApprovalStatus {
  DRAFT = 'draft',      // Seller tạo nhưng chưa gửi duyệt
  PENDING = 'pending',  // Đang chờ admin duyệt
  APPROVED = 'approved', // Admin đã duyệt, public thấy được
  REJECTED = 'rejected', // Admin từ chối
  HIDDEN = 'hidden',    // Admin ẩn do vi phạm hoặc seller tạm ẩn
}
```

---

## 4. API Changes

### New Seller Product APIs

- `GET /api/v1/seller/products` — List products của seller
- `GET /api/v1/seller/products/:id` — Get product detail
- `POST /api/v1/seller/products` — Create product (tự động lấy shopId từ store-service)
- `PATCH /api/v1/seller/products/:id` — Update product
- `DELETE /api/v1/seller/products/:id` — Soft delete (isActive=false)
- `PATCH /api/v1/seller/products/:id/submit` — Submit draft/rejected product for approval

### New Admin Moderation APIs

- `POST /api/v1/admin/products/moderation` — Admin tạo product cho shop
- `PATCH /api/v1/admin/products/moderation/:id` — Admin update product
- `PATCH /api/v1/admin/products/moderation/:id/approve` — Admin approve
- `PATCH /api/v1/admin/products/moderation/:id/reject` — Admin reject
- `PATCH /api/v1/admin/products/moderation/:id/hide` — Admin hide
- `DELETE /api/v1/admin/products/moderation/:id` — Admin delete
- `PATCH /api/v1/admin/products/moderation/:id/assign-shop` — Gán legacy product vào shop

### New Public Shop Products API

- `GET /api/v1/shops/:slug/products` — List approved products của shop

### Modified Public APIs

- `GET /api/v1/products` — Chỉ trả products approved + active (legacy products vẫn hiển thị)
- `GET /api/v1/products/:slug` — Chỉ trả product approved (404 nếu chưa approved)
- `GET /api/v1/products/:slug/related` — Chỉ lấy related products approved

---

## 5. Shop Validation Strategy

**Option B — HTTP call**: product-service gọi store-service qua `STORE_SERVICE_URL`.

- Seller tạo product → product-service gọi `GET /api/v1/internal/shops/by-seller/:sellerId`
- Nếu chưa có shop → 404
- Nếu shop bị rejected/suspended → 403
- Nếu shop pending → vẫn cho tạo product nhưng approvalStatus = pending

**Internal endpoint** (`GET /api/v1/internal/shops/by-seller/:sellerId`):
- Không expose qua gateway
- Trả về shop entity hoặc null

---

## 6. Legacy Product Strategy

**Option A** (đã chọn):
- Legacy products (không có shopId) vẫn hiển thị ở public `/products`
- Legacy products không hiển thị ở `/shops/:slug/products`
- Admin thấy legacy products trong admin products list
- Admin có thể gán legacy product vào shop qua `PATCH /admin/products/moderation/:id/assign-shop`

---

## 7. Backward Compatibility Notes

- `GET /api/v1/products` — KHÔNG break, legacy products vẫn hiển thị
- `GET /api/v1/categories` — KHÔNG break
- `POST /api/v1/admin/products` — Vẫn hoạt động nhưng không có shopId
- `PATCH /api/v1/admin/products/:id` — Vẫn hoạt động
- `DELETE /api/v1/admin/products/:id` — Vẫn hoạt động
- Media upload APIs — KHÔNG break

**Response thay đổi**:
- `ProductCardDto` có thêm: `shopId`, `sellerId`, `approvalStatus`
- `ProductDetailDto` có thêm: `shopId`, `sellerId`, `approvalStatus`, `rejectionReason`

---

## 8. Build Results

| Service | Build | Notes |
|---------|-------|-------|
| product-service | ✅ Pass | |
| store-service | ✅ Pass | |
| api-gateway | ✅ Pass | |

---

## 9. Known Issues

| # | Severity | Issue | Fix Plan |
|---|----------|-------|----------|
| 1 | Low | product-service `synchronize: true` vẫn bật trong MongoDB — có thể tự động thay đổi schema | Không sửa trong Phase 2A |
| 2 | Low | TypeORM overload resolution confuse với enum — phải dùng `Object.assign` | Đã fix bằng workaround |
| 3 | Low | Store-service internal endpoint không có auth — chỉ gọi nội bộ giữa services | Cân nhắc thêm header validation ở phase sau |

---

## 10. Next Phase Recommendation

### Phase 2B: Cart & Order Marketplace Foundation

1. Thêm `shopId`, `variantId` vào CartItem trong cart-service
2. Validate cart chỉ chứa products cùng shop hoặc tách order
3. Xây dựng Order Split Logic: 1 Order → nhiều ShopOrder
4. ProductVariant stock management

### Phase 3: Seller Dashboard & Order Split

1. Seller order management API
2. Seller inventory management API
3. Order split theo shop

---

*Document generated by Senior Backend Architect / Full-stack Engineer Agent*
*Last updated: 16 May 2026*
