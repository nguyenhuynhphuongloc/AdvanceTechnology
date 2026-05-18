# Phase 6.5A.1 Seller Critical Fixes Plan

## 1. Current Bugs

| Bug | Current Error | Suspected Layer | Files/API to Check |
|---|---|---|---|
| Vietnamese slug bug | `bán bánh mì` → `bn-bnh-m` (loses diacritics) | Frontend `slugify` function | `my-app/app/seller/shop/page.tsx`, `my-app/app/seller/products/new/page.tsx` |
| Onboarding shop not synced | Shop created but not available at `/seller/shop` | Frontend flow / redirect | `my-app/app/seller/shop/page.tsx` |
| Cannot GET seller products | `Cannot GET /api/v1/seller/products` (CORS 403) | product-service CORS config | `microservices/product-service/src/main.ts` |
| Cannot GET seller inventory | `Cannot GET /api/v1/seller/inventory` | Inventory service pagination missing | `microservices/inventory-service/src/inventory/inventory.controller.ts`, `inventory.service.ts` |
| Missing seller shop categories | No API for shop-specific categories | Store-service / product-service | New schema needed in store-service |
| uploadSellerProductImage not a function | Runtime import error | Frontend import path | `my-app/lib/seller/product-api.ts` (already exists but verify) |
| Cannot POST seller products | `Cannot POST /api/v1/seller/products` | product-service body parser + DTO validation | `microservices/product-service/src/main.ts`, `create-product.dto.ts` |

## 2. Required Fix Strategy

### Frontend Fixes
- **Slugify utility**: Create `my-app/lib/utils/slugify.ts` with proper Vietnamese Unicode normalization (`đ→d`, strip diacritics). Replace inline `slugify` in shop page and product form.
- **Seller layout**: The `SellerShell` component already has `fetchMyShop()` in the layout effect. After shop creation via `/seller/shop`, the layout should re-fetch shop. No change needed in layout itself — shop page should navigate after creation.

### API Gateway
- No changes needed. All routes (`/api/v1/seller/shop`, `/api/v1/seller/products`, `/api/v1/seller/inventory`) are already routed correctly.

### product-service Fixes
- **CORS**: `main.ts` needs `app.enableCors()` — this is the root cause of all 403s from the product-service.
- **Body parser**: The `NestFactory.create()` needs to properly handle `multipart/form-data` and JSON bodies.
- **CreateProductDto**: Make `variants` optional (add `@IsOptional()`), require at least 1 variant in service layer. Make `mainImage` required only when images are present.
- **slugify**: Update `normalizeSlug` in product-service to handle `đ→d` properly.

### inventory-service Fixes
- **listSellerInventory pagination**: Controller receives `page`/`limit` query params but does not pass them to service. Service needs `skip/take` in the query builder.

### store-service (Shop Categories)
- **New entity**: `ShopCategory` with `id`, `shopId`, `name`, `slug`, `description`, `isActive`.
- **New service/controller**: CRUD for shop categories, scoped by shopId.
- **API Gateway**: Add route for `/api/v1/seller/categories`.
- **Frontend**: Create `category-api.ts`, wire into product new page.

## 3. Files Planned to Change

| Area | File | Change |
|---|---|---|
| Utils | `my-app/lib/utils/slugify.ts` | **CREATE**: Vietnamese-aware slugify function |
| Frontend Shop | `my-app/app/seller/shop/page.tsx` | Use new slugify, fix auto-slug on name change |
| Frontend Product | `my-app/app/seller/products/new/page.tsx` | Use new slugify, load shop categories |
| product-service | `microservices/product-service/src/main.ts` | Add `app.enableCors()`, configure body parser for file uploads |
| product-service | `microservices/product-service/src/product/dto/create-product.dto.ts` | Make `variants` optional, keep mainImage required |
| product-service | `microservices/product-service/src/product/product.service.ts` | Require at least 1 variant in `saveVariants`, fix `normalizeSlug` for `đ` |
| inventory-service | `microservices/inventory-service/src/inventory/inventory.service.ts` | Add pagination (skip/take) to `listSellerInventory` |
| store-service | `microservices/store-service/src/shops/entities/shop-category.entity.ts` | **CREATE**: new entity |
| store-service | `microservices/store-service/src/shops/dto/shop-category.dto.ts` | **CREATE**: DTOs |
| store-service | `microservices/store-service/src/shops/shops-category.service.ts` | **CREATE**: CRUD service |
| store-service | `microservices/store-service/src/shops/shops-category.controller.ts` | **CREATE**: REST controller |
| store-service | `microservices/store-service/src/shops/shops.module.ts` | Import new category module |
| store-service | `microservices/store-service/src/app.module.ts` | Ensure module is loaded |
| api-gateway | `microservices/api-gateway/src/modules/routes/v1/routes.controller.ts` | Add `SellerCategoryProxyController` |
| api-gateway | `microservices/api-gateway/src/modules/routes/routes.module.ts` | Register new controller |
| Frontend | `my-app/lib/seller/category-api.ts` | **CREATE**: shop categories API client |
| Frontend | `my-app/components/seller/SellerShell.tsx` | Add Categories nav item |

## 4. Out of Scope

Không làm:
- Buyer Marketplace UI
- Admin redesign
- Review/rating
- Notification
- Commission/refund/settlement
- Buyer order flow
- Payment integration
- Search functionality improvements
- Email/SMS integration
