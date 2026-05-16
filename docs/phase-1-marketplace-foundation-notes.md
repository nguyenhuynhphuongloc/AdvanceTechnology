# Phase 1: Marketplace Foundation — Implementation Notes

> **Ngày**: 16 May 2026
> **Phase**: 1 — Core Identity & Shop Foundation
> **Trạng thái**: ✅ Completed

---

## 1. Summary

Phase 1 đã hoàn thành việc xây dựng nền tảng backend cho mô hình marketplace. Các thay đổi bao gồm:

- Chuẩn hóa authentication với 3 roles (customer/seller/admin)
- Xây dựng user-service với BuyerProfile, SellerProfile, Address
- Xây dựng Shop domain trong store-service
- Cập nhật API Gateway với routing và guards mới
- Fix các lỗi infrastructure (docker-compose, Dockerfile)

---

## 2. Current Findings (Pre-Phase1)

### authentication-service

| Field | Value |
|-------|-------|
| Entity name | `AuthUser` |
| ID type | **UUID** (`@PrimaryGeneratedColumn('uuid')`) |
| Role enum location | Không có enum — role là `varchar(20)` |
| Role values | `'customer'`, `'admin'` |
| JWT payload | `{ id, email, role }` |
| Register endpoint | Không có |
| Login endpoint | Chỉ cho admin |

### user-service

| Field | Value |
|-------|-------|
| Entities | Không có |
| Controllers | Chỉ có `AppController` boilerplate |
| Services | Chỉ có `AppService` boilerplate |
| Database connection | PostgreSQL đã configured |

### store-service

| Field | Value |
|-------|-------|
| Entities | `StoreSettingsEntity` (singleton) |
| Controllers | `StoreSettingsController`, `AdminStoreSettingsController` |
| Database | PostgreSQL (synchronize: true — DANGER) |
| Port mismatch | Dockerfile `EXPOSE 3012`, main.ts default `3011`, .env `3011` |
| Docker env_file | Points to **auth-service .env** — WRONG |

### api-gateway

| Field | Value |
|-------|-------|
| Guards | `JwtAuthGuard`, `AdminRoleGuard`, `SellerOrAdminRoleGuard`, `OptionalJwtAuthGuard` |
| SellerOrAdminRoleGuard | Check `'admin'` và `'seller'` ✅ |
| Routes for users | `/api/v1/users/*` → user-service (JwtAuthGuard) |
| Routes for shops | **Không có** |
| Routes for seller profile | **Không có** |

---

## 3. Files Changed

### authentication-service

| File | Change | Notes |
|------|--------|-------|
| `src/auth/dto/register.dto.ts` | **NEW** | `LoginDto` + `RegisterDto` |
| `src/auth/auth.service.ts` | **REWRITTEN** | Thêm `register()`, `VALID_ROLES`, `updateUserStatus()`, `updateUserRole()`, `BadRequestException` |
| `src/auth/auth.controller.ts` | **REWRITTEN** | Tách `AuthController` (register/login) và `AdminAuthController` (admin-only) |
| `src/auth/auth.module.ts` | **MINOR** | Import thêm DTOs |
| `src/auth/admin-users.controller.ts` | **NEW** | Thêm `PATCH :id/status`, `PATCH :id/role` |

### user-service

| File | Change | Notes |
|------|--------|-------|
| `src/users/entities/buyer-profile.entity.ts` | **NEW** | BuyerProfile entity |
| `src/users/entities/seller-profile.entity.ts` | **NEW** | SellerProfile entity + `SellerProfileStatus` enum |
| `src/users/entities/address.entity.ts` | **NEW** | Address entity |
| `src/users/dto/user.dto.ts` | **NEW** | DTOs for profiles and addresses |
| `src/users/users.service.ts` | **NEW** | Full business logic |
| `src/users/users.controller.ts` | **NEW** | 3 controllers: UsersController, SellerController, AdminSellerProfilesController |
| `src/users/users.module.ts` | **NEW** | Module wiring |
| `src/app.module.ts` | **REWRITTEN** | Thêm `UsersModule` |
| `package.json` | **MODIFIED** | Thêm `class-validator`, `class-transformer` |

### store-service

| File | Change | Notes |
|------|--------|-------|
| `src/shops/entities/shop.entity.ts` | **NEW** | Shop entity + `ShopStatus` enum |
| `src/shops/dto/shop.dto.ts` | **NEW** | CreateShopDto, UpdateShopDto, AdminUpdateShopDto, ShopActionDto |
| `src/shops/shops.service.ts` | **NEW** | Full business logic |
| `src/shops/shops.controller.ts` | **NEW** | 3 controllers: ShopsController, SellerShopController, AdminShopsController |
| `src/shops/shops.module.ts` | **NEW** | Module wiring |
| `src/app.module.ts` | **REWRITTEN** | Thêm ShopsModule, fix `synchronize: false` |
| `.env` | **NEW** | Tạo file với placeholder credentials |
| `Dockerfile` | **MODIFIED** | Đổi `npm run start` → `npm run start:prod` |

### api-gateway

| File | Change | Notes |
|------|--------|-------|
| `src/modules/routes/v1/routes.controller.ts` | **REWRITTEN** | Thêm 5 controllers mới: SellerController, SellerShopController, PublicShopsController, AdminShopsController, AdminSellerProfilesController |
| `src/modules/routes/routes.module.ts` | **REWRITTEN** | Register tất cả controllers mới |

### docker-compose.yml

| Change | Impact |
|--------|--------|
| `store-service env_file`: `./auth-service/.env` → `./store-service/.env` | **CRITICAL FIX** |
| `store-service command`: `npm run start` → `npm run start:prod` | **HIGH FIX** |

---

## 4. Database Changes

### Tables created (via TypeORM synchronize)

**user-service (PostgreSQL)**:

```sql
CREATE TABLE buyer_profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  default_address_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE seller_profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  tax_id VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE addresses (
  id UUID PRIMARY KEY,
  buyer_profile_id UUID NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  ward VARCHAR(100) NOT NULL,
  street VARCHAR(255) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**store-service (PostgreSQL)**:

```sql
CREATE TABLE shops (
  id UUID PRIMARY KEY,
  seller_id UUID UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  banner_url TEXT,
  description TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  commission_rate DECIMAL(5,2) DEFAULT 0,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

---

## 5. Role Changes

| Decision | Value | Rationale |
|----------|-------|---------|
| Role standard | lowercase | Giữ `'customer'`, `'seller'`, `'admin'` |
| VALID_ROLES | `['customer', 'seller', 'admin']` | Defined in auth.service.ts |
| Seller role | `'seller'` | Dùng để check trong guards |
| Buyer role | `'customer'` | Giữ nguyên để tránh breaking change |

**JWT Payload Structure**:
```json
{
  "sub": "<userId>",
  "id": "<userId>",
  "email": "user@example.com",
  "role": "customer | seller | admin"
}
```

---

## 6. User ID Decision

| Decision | Value | Rationale |
|----------|-------|---------|
| User ID type | **UUID** | AuthUser.id đã là UUID |
| All new entities | Use `UUID` | Khớp với AuthUser.id |
| Consistency across services | ✅ UUID | user-service và store-service dùng UUID cho userId/sellerId |
| Migration note | **Phase 2+** | Order/Cart hiện dùng `int` — cần migrate ở Phase 2 |

**Đã resolve**: UUID vs INT inconsistency — tất cả entities mới dùng UUID. order-service và cart-service (Phase 2+) sẽ migrate.

---

## 7. Test Results

### Build Results

| Service | Build | Lint | Notes |
|---------|-------|------|-------|
| authentication-service | ✅ Pass | N/A | |
| user-service | ✅ Pass | N/A | |
| store-service | ✅ Pass | N/A | |
| api-gateway | ✅ Pass | ⚠️ Pre-existing errors | |

### Build Commands

```bash
# authentication-service
npm run build  # ✅ Pass

# user-service  
npm run build  # ✅ Pass (after adding class-validator)

# store-service
npm run build  # ✅ Pass

# api-gateway
npm run build  # ✅ Pass
```

---

## 8. Known Issues

| # | Severity | Issue | Fix Plan |
|---|----------|-------|---------|
| 1 | Medium | api-gateway lint: pre-existing 99 errors, 24 warnings | Pre-existing, không sửa trong Phase 1 |
| 2 | Medium | store-service `synchronize: false` nhưng user-service `synchronize: true` | user-service dev mode OK; production cần migration |
| 3 | Low | store-service `.env` có placeholder password | Cần replace bằng real credentials |
| 4 | Low | StoreSettings vẫn dùng singleton pattern (`where: {}`) | Không ảnh hưởng Phase 1 |
| 5 | Low | Logging-service `.env` không tồn tại (docker-compose dùng auth-service .env) | Cần tạo |

---

## 9. Remaining Risks

| Risk | Description | Mitigation |
|------|-------------|-----------|
| **Breaking Auth JWT** | JWT payload không đổi, nhưng `role` mới `'seller'` cần được frontend hiểu | Frontend Seller Dashboard cần update để dùng real JWT thay vì localStorage mock |
| **Store-settings route conflict** | StoreSettings và Shops cùng proxy qua `STORE_SERVICE_URL` — không conflict vì khác prefix | `/api/v1/store-settings/*` → StoreSettings; `/api/v1/shops/*` → Shops |
| **Seller tự đổi role** | Hiện không có API để user tự đăng ký làm seller | Seller cần admin approve qua `PATCH /api/v1/admin/users/:id/role` |
| **Product shopId** | Product trong product-service chưa có shopId | Phase 2 |
| **Order split** | Order chưa tách theo shop | Phase 3 |

---

## 10. Next Phase Recommendation

### Phase 2: Product & Catalog Marketplace

1. **Thêm `shopId` vào Product** trong product-service (MongoDB)
2. **API cho seller quản lý sản phẩm**: `POST/PATCH/DELETE /api/v1/seller/products`
3. **API cho buyer xem sản phẩm theo shop**: `GET /api/v1/shops/:slug/products`
4. **Sửa order-service**: Chuyển `userId: int` → `userId: uuid`
5. **Sửa cart-service**: Thêm `variantId`, `shopId` vào CartItem
6. **Xây dựng Order Split Logic**: Order → ShopOrders
7. **Product approval flow**: `isApproved` flag

### Phase 3: Seller Dashboard

1. Seller products CRUD API
2. Seller order management API
3. Seller shop profile API
4. Seller inventory management API

### Phase 4: Moderation & Trust

1. Shop approval/rejection flow
2. Product moderation
3. Review/Rating system

---

*Document generated by Software Architect / Backend Architect Agent*
*Last updated: 16 May 2026*
