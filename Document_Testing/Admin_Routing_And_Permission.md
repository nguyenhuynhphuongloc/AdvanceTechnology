# Admin Routing And Permission

## Public routes

| Route | Chuc nang | Auth |
|---|---|---|
| `/` | Homepage storefront | Public |
| `/HomePage` | Alternate homepage | Public |
| `/product` | Catalog canonical page | Public |
| `/products` | Legacy product list redirect | Public |
| `/product/[slug]` | Product detail canonical | Public |
| `/products/[slug]` | Legacy product detail redirect | Public |
| `/search` | Search page | Public |
| `/login` | User login | Public |
| `/register` | User register | Public |
| `/product/cart` | Cart page | User/guest context |
| `/product/checkout` | Checkout page | User/guest context |
| `/product/orders` | User orders | User context |
| `/product/account` | Account page | User context |
| `/product/chat` | Chat page | Public/user context tuy flow |

## Seller routes

| Route | Chuc nang | Auth |
|---|---|---|
| `/seller` | Seller entry | Can kiem tiep |
| `/seller/login` | Seller login | Public |
| `/seller/register` | Seller register | Public |
| `/seller/dashboard` | Seller dashboard | Seller |
| `/seller/products` | Seller products | Seller |
| `/seller/products/new` | Create seller product | Seller |
| `/seller/products/edit/[id]` | Edit seller product | Seller |
| `/seller/orders` | Seller orders | Seller |
| `/seller/profile` | Seller profile | Seller |

Luu y: mot so seller page dang dung localStorage va public product API. Can test permission rieng neu seller flow la scope that.

## Admin routes hien co

| Route | File | Auth |
|---|---|---|
| `/admin` | `my-app/app/admin/page.tsx` | Cookie `admin_session` + session validation |
| `/admin/login` | `my-app/app/admin/login/page.tsx` | Public admin login |
| `/admin/products` | `my-app/app/admin/products/page.tsx` | Cookie `admin_session` + session validation |
| `/admin/inventory` | `my-app/app/admin/inventory/page.tsx` | Cookie `admin_session` + session validation |
| `/admin/media-library` | `my-app/app/admin/media-library/page.tsx` | Cookie `admin_session` + session validation |
| `/admin/shop-settings` | Not found | Can bo sung |

## Route nao can auth/admin role

### Frontend admin guard

| File | Co che |
|---|---|
| `my-app/middleware.ts` | Neu path bat dau `/admin` va khong phai `/admin/login`, yeu cau cookie `admin_session`; khong co cookie thi redirect login |
| `my-app/app/admin/layout.tsx` | Wrap `AdminSessionGate` |
| `my-app/components/admin/AdminSessionGate.tsx` | Lay token tu cookie, goi `/api/v1/auth/admin/me`; fail thi clear session va redirect |

### Gateway admin guard

| API route | Guard |
|---|---|
| `/api/v1/admin/products/*` | `JwtAuthGuard`, `AdminRoleGuard` |
| `/api/v1/admin/inventory/*` | `JwtAuthGuard`, `AdminRoleGuard` |
| `/api/v1/admin/users/*` | `JwtAuthGuard`, `AdminRoleGuard` |
| `/api/v1/admin/orders/*` | `OptionalJwtAuthGuard`, `SellerOrAdminRoleGuard` |
| `/api/v1/inventory/*` | `JwtAuthGuard` |
| `/api/v1/notifications/*` | `JwtAuthGuard` |

## Route/API dang sai vi tri

| Van de | Bang chung | Muc do |
|---|---|---|
| Cloudinary media listing nam tren public homepage | `StorefrontHomePage.tsx` import `getCloudinaryImages` va render `Cloudinary Media` | High |
| Media library admin route chua co | `/admin/media-library` Not found | Medium |
| Shop settings admin route chua co | `/admin/shop-settings` Not found | Medium |
| Product upload endpoint nam duoi public product namespace | `POST /api/v1/products/upload-image`; frontend admin goi co token nhung gateway route public product khong co guard | High |

## Layout public/admin

```text
RootLayout
  |
  +-- Public routes
  |     +-- StorefrontHeader / ShoppingHeader
  |     +-- ProductGrid, Cart, Checkout
  |
  +-- /admin/*
        +-- AdminLayout
        +-- AdminSessionGate
        +-- AdminDashboard / AdminProductsManager / Inventory
```

Khong thay bang chung layout admin bi import vao public. Loi Cloudinary la do public component import media utility truc tiep.

## Checklist kiem thu permission

| Test | Expected |
|---|---|
| User chua login vao `/admin` | Redirect `/admin/login?redirect=/admin` |
| User chua login vao `/admin/products` | Redirect login |
| Cookie gia vao `/admin/products` | `AdminSessionGate` goi `/me`, fail va redirect |
| Token user role thuong goi `/api/v1/admin/products` | 403/401 |
| Token admin goi `/api/v1/admin/products` | 200 |
| Public vao `/` | Khong thay admin/media library UI |
| Public goi upload image endpoint | Nen bi chan sau khi harden route |
| Admin upload image | Thanh cong neu Cloudinary config hop le |

## Cap nhat sau implement `fix-admin-product-media-flow` - 2026-05-15

### Public route matrix

| Route | Permission | Ghi chu |
|---|---|---|
| `/` | Public | Storefront homepage, khong render Cloudinary media library |
| `/product` | Public | Product catalog tu MongoDB product-service |
| `/product/[slug]` | Public | Product detail tu MongoDB product-service |
| `/search` | Public | Search/list UI |
| `/product/cart` | Public/user context | Cart flow |
| `/product/checkout` | Public/user context | Checkout flow |

### Admin route matrix

| Route | Permission | File/component |
|---|---|---|
| `/admin` | Admin session required | `AdminDashboard` |
| `/admin/products` | Admin session required | `AdminProductsManager` |
| `/admin/media-library` | Admin session required | `AdminMediaLibrary` |
| `/admin/inventory` | Admin session required | Admin inventory page |
| `/admin/login` | Public admin login | `AdminLoginPage` |

### API permission matrix

| API | Permission | Behavior |
|---|---|---|
| `GET /api/v1/products` | Public | List active products |
| `GET /api/v1/products/:slug` | Public | Product detail |
| `POST /api/v1/products/upload-image` | Admin JWT required at gateway | Public upload now rejected through gateway |
| `GET /api/v1/admin/products` | Admin JWT required | Admin product list |
| `POST /api/v1/admin/products` | Admin JWT required | Create MongoDB product |
| `POST /api/v1/admin/products/upload-image` | Admin JWT required | Upload product image to Cloudinary |
| `GET /api/v1/admin/products/media` | Admin JWT required | List Cloudinary product-folder images + MongoDB linked status |
| `POST /api/v1/admin/products/media/upload` | Admin JWT required | Upload standalone media asset |
| `DELETE /api/v1/admin/products/media?publicId=...` | Admin JWT required | Delete only unlinked media |

### Route da sua sai vi tri

| Truoc | Sau |
|---|---|
| Public homepage import/render `getCloudinaryImages()` | Removed; homepage chi render storefront/product catalog |
| Admin media library Not found | Added `/admin/media-library` under Admin layout/session gate |
| Admin product upload goi `/api/v1/products/upload-image` | Migrated to `/api/v1/admin/products/upload-image` |

### Checklist permission sau implement

| Test | Expected | Status |
|---|---|---|
| No cookie vao `/admin/media-library` | Redirect login | Passed |
| Admin cookie/token hop le vao `/admin/media-library` | Render Media Library | Passed via route/API runtime; browser UI smoke still recommended |
| No token goi `GET /api/v1/admin/products/media` | `401 Unauthorized` | Passed |
| No token goi `POST /api/v1/products/upload-image` qua gateway | `401 Unauthorized` | Passed |
| Admin token goi media list/upload/delete | Gateway forward den product-service | Passed |
| Public `/` | Khong co media library navigation/UI | Passed |

### Smoke result - 2026-05-15

| Test | Ket qua |
|---|---|
| No cookie vao `/admin/media-library` | Passed: HTTP `307`, redirect `/admin/login?redirect=%2Fadmin%2Fmedia-library` |
| No token goi `GET /api/v1/admin/products/media` | Passed: `401 Unauthorized` |
| No token goi `POST /api/v1/products/upload-image` | Passed: `401 Unauthorized` |
| Non-admin JWT goi `GET /api/v1/admin/products/media` | Passed: `403 Forbidden`, message `Admin role is required.` |
| Admin token goi media list/upload/delete | Passed |
| Public `/` | Passed: khong co media library UI/text |
