# Phase 6.5A — Seller UI Runtime QA & Bug Fix Plan

## Routes Under Test
| Route | Component | Status |
|---|---|---|
| `/seller/register` | Two-step form → register + createMyShop | **BUG 1 FIXED** |
| `/seller/login` | Login form → redirect `/seller/dashboard` | OK |
| `/seller/dashboard` | Dashboard stats | OK |
| `/seller/shop` | Shop info form (create/update) | **BUG 2 FIXED** |
| `/seller/products` | Product list with filters | OK |
| `/seller/products/new` | Create product form | **BUG 3 FIXED** |
| `/seller/products/edit/[id]` | Edit product form | **BUG 3 FIXED** |
| `/seller/inventory` | Inventory management | OK |
| `/seller/orders` | Order list | OK |
| `/seller/orders/[id]` | Order detail | OK |

## Bugs Found & Fixed

### Bug 1: Seller Registration — `name should not be empty, name must be a string`
- **Service**: `authentication-service`
- **Root cause**: `RegisterDto` declares `name: string` with `@IsString() @IsNotEmpty()`, but `AuthUser` entity has **no** `name` column and `auth.service.register()` never uses `dto.name`. Any registration that sends an empty or missing `name` hits both validators.
- **Fix**: Add `@IsOptional()` to `name` in `RegisterDto` — it is a dangling required field with no downstream effect.
- **Files**: `microservices/authentication-service/src/auth/dto/register.dto.ts`

### Bug 2: Shop Update — slug silently stripped, seller cannot change slug
- **Service**: `store-service`
- **Root cause**: `UpdateShopDto` has no `slug` field. With `whitelist: true` in ValidationPipe, any `slug` sent in the PATCH body is silently dropped. The seller PATCH at `/api/v1/seller/shop` never persists the new slug.
- **Fix**: Add `@IsOptional() @IsString() slug?: string` to `UpdateShopDto`. Add slug conflict check in `ShopsService.updateShop()`. Add `slug?` to `UpdateShopPayload` frontend type and auto-slug from name on the shop form.
- **Files**:
  - `microservices/store-service/src/shops/dto/shop.dto.ts`
  - `microservices/store-service/src/shops/shops.service.ts`
  - `my-app/lib/seller/shop-api.ts`
  - `my-app/app/seller/shop/page.tsx`

### Bug 3: Product Create/Edit — image URL field, no Cloudinary upload
- **Service**: `product-service` + frontend
- **Root cause**: Product new/edit pages only provide a free-text URL input. No Cloudinary upload is wired. `SellerProductsController` has no `POST upload-image` endpoint. The gateway already has `@All(['', '/*'])` on `api/v1/seller/products` routing to product-service, so adding the endpoint to the controller is enough.
- **Fix**: Add `@Post('upload-image')` to `SellerProductsController` in product-service. Add `uploadSellerProductImage()` to `product-api.ts`. Replace URL inputs in product forms with file-upload buttons.
- **Files**:
  - `microservices/product-service/src/product/product.controller.ts`
  - `my-app/lib/seller/product-api.ts`
  - `my-app/app/seller/products/new/page.tsx`
  - `my-app/app/seller/products/edit/[id]/page.tsx`

## Gateway Route Audit
| Path | Guard | Proxy Target |
|---|---|---|
| `POST /api/v1/auth/register` | None | auth-service |
| `POST /api/v1/auth/login` | None | auth-service |
| `ALL /api/v1/seller/shop/*` | JWT + SellerOrAdmin | store-service |
| `ALL /api/v1/seller/products/*` | JWT + SellerOrAdmin | product-service |
| `ALL /api/v1/seller/inventory/*` | JWT + SellerOrAdmin | inventory-service |
| `ALL /api/v1/seller/orders/*` | JWT + SellerOrAdmin | order-service |
| `POST /api/v1/products/upload-image` | JWT + **AdminOnly** | product-service |

> ⚠️ `/api/v1/products/upload-image` is admin-only. Sellers must use `/api/v1/seller/products/upload-image` (added by Bug 3 fix).

## Known Issues (No API / Out of Scope)
- `GET /api/v1/seller/dashboard` — no dashboard stats API; dashboard shows static/empty state.
- Revenue and reports pages — no backend API endpoints yet.
- Seller profile page (`/seller/profile`) — linked to user-service; verify if profile update endpoint exists.

## Forbidden Actions
- No UI redesign
- No Admin UI changes
- No fake/mocked data
- No DB schema changes
- No data drops
