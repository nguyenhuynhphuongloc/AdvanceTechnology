# Testing Summary

## Công nghệ website phát hiện
| Layer | Công nghệ/Bằng chứng |
|---|---|
| Frontend | Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, Ant Design |
| Backend | NestJS 11 microservices |
| Gateway | NestJS API Gateway, native `fetch` proxy, JWT guards |
| Database | MongoDB cho product-service; PostgreSQL/TypeORM cho auth/cart/order/inventory/payment/notification |
| Cache/Queue | Redis, RabbitMQ |
| Payment | Stripe package/frontend Stripe SDK |
| Image upload | Cloudinary trong product-service |
| Testing hiện có | Jest unit/e2e config; Postman collection/env |
| Deployment/local runtime | One stable Docker Compose runtime, frontend port `3009`, gateway `3000` |

## Kiến trúc tổng quan
```text
Browser
  |
  | http://localhost:3009
  v
Next.js my-app
  |
  | NEXT_PUBLIC_API_BASE_URL / API_GATEWAY_URL
  v
API Gateway :3000
  |-- auth-service :3008 -> auth_users
  |-- product-service :3001 -> MongoDB + Redis + Cloudinary
  |-- cart-service :3007 -> PostgreSQL/Redis
  |-- order-service :3004 -> PostgreSQL + RabbitMQ
  |-- inventory-service :3006 -> PostgreSQL + Redis/RabbitMQ
  |-- payment-service :3003 -> PostgreSQL + Stripe
  |-- notification-service :3005 -> PostgreSQL + WebSocket/RabbitMQ
  |-- user-service :3002
```

## Module/chức năng đã phát hiện
| Module | Chức năng chính | Status kiểm thử |
|---|---|---|
| Storefront/Home | Hero, featured assets, latest products | Not Started |
| Catalog/Search | List, filter, sort, pagination, search | Not Started |
| Product detail | Gallery, variant size/color, related products, add cart | Not Started |
| Cart | Guest/user cart, add/remove/clear/merge | Not Started |
| Checkout/Order | Create order, payment flow, order status | Not Started |
| Account user | Login/register/logout localStorage | Not Started |
| Admin Auth | Admin login/logout/me, JWT cookie | Not Started |
| Admin Products | CRUD product, upload image, variants, related products | Not Started |
| Admin Inventory | Search/update stock | Not Started |
| Admin Orders | List/detail orders | Not Started |
| Admin Users | List/detail auth users | Not Started |
| Seller | Register/login/dashboard/products/orders/profile | Not Started |
| Notification | Logs endpoint, WebSocket gateway present | Not Started |
| AI/chat | n8n webhook chat, API AI proxy | Not Started |
| Forgot password | Not found in current project | Not Started |

## Database/schema/model phát hiện
| Service | Schema/model |
|---|---|
| authentication-service | `auth_users`: id, email, passwordHash, role, isActive, refreshToken, createdAt, updatedAt |
| product-service | `products`, `categories`, `product_images`, `product_variants`, `product_related` |
| cart-service | `cart_state`, legacy `carts`, `cart_items` |
| order-service | UUID `orders` entity với items snapshot; legacy int `orders`, `order_items` cũng tồn tại |
| inventory-service | `inventory_items`: variantId, productId, sku, stock, reservedStock |
| payment-service | `transactions`: orderId, method, amount, status, gatewayRef, clientSecret |
| notification-service | `notification_logs`: orderId, type, recipient, status, message, createdAt |

## Config/file quan trọng
| File | Nội dung liên quan |
|---|---|
| `README.md` | Local runtime, single Docker startup command, ports, admin/product flow |
| `ROUTES.md` | Frontend pages, gateway route prefixes, query params |
| `docker-compose.yml` | Service ports, Redis/RabbitMQ/MongoDB, env mapping |
| `my-app/package.json` | Next.js scripts/dependencies |
| `my-app/middleware.ts` | Admin route cookie guard |
| `my-app/app/layout.tsx` | Global metadata |
| `my-app/next.config.ts` | Hiện trống |
| `microservices/*/.env.example`, `.env` | DB/JWT/service URL/env runtime |
| `microservices/*/src/config/*` | Required env validation |
| `microservices/api-gateway/src/modules/routes/v1/*` | Gateway proxy route definitions |
| `postman/*` | Postman collection/env/validation notes |

## Tổng số test case theo nhóm
| Nhóm | Số test case/scenario |
|---|---:|
| Functional Testing | 28 |
| API Testing | 40 endpoint rows + 12 validation/auth/error cases |
| UX/UI Testing | 24 |
| Performance Testing | 18 |
| Security Testing | 32 |
| SEO Testing | 20 |

## Kết quả kiểm thử sơ bộ đã chạy
| Lệnh | Kết quả |
|---|---|
| `openspec.cmd list --json` | Thành công; nhiều change đã complete |
| `npm.cmd test -- --runInBand` trong `microservices/api-gateway` | Passed: 1 test suite, 1 test |
| `npm.cmd test -- --runInBand` trong `my-app` | Failed do `jest` không nhận diện; cần kiểm dependency/bin install |
| `openspec`, `npm` trực tiếp trong PowerShell | Bị chặn bởi execution policy `.ps1`; dùng `.cmd` workaround |

## Rủi ro lớn nhất
| Rủi ro | Mức độ | Ghi chú |
|---|---|---|
| Public product mutation endpoints | High | `/api/v1/products` POST/PATCH/DELETE không có guard ở gateway route public |
| Seller/admin role header spoofing | High | `SellerOrAdminRoleGuard` đọc `x-user-role`; cần kiểm bypass |
| CORS rộng | High | Gateway `origin:true`, `credentials:true` |
| Admin middleware chỉ check cookie tồn tại | High | Fake cookie có thể vào UI, API phải chặn |
| Direct service ports expose | High | Các service mở host port, có thể bypass gateway guard trong local/deploy sai |
| User/customer auth thật chưa rõ | Medium | Frontend login/register dùng localStorage |
| Duplicate `/product` và `/products` | Medium | Rủi ro functional/SEO duplicate content |
| Frontend test dependency issue | Medium | `jest` không nhận diện trong `my-app` |
| SEO artifacts thiếu | Medium | robots/sitemap/OG/canonical/structured data Not found |
| Payment DB schema chưa khớp | Medium | Docker smoke reach được payment-service, nhưng `GET /api/v1/payments/transactions` trả 500 vì DB hiện có dùng `transactions.order_id` trong khi entity query `orderId`; cần migration/reset schema trước khi chạy payment QA đầy đủ |

## Phần chưa đủ thông tin/cần bổ sung
- SLA chính thức cho page load/API response.
- Tài khoản admin/seller/user test và dữ liệu seed ổn định.
- Môi trường chạy mục tiêu: local Docker, staging hay production-like.
- Chính sách SEO mong muốn cho `/product` vs `/products`, private pages, search/filter pages.
- Quy tắc bảo mật production: allowed origins, rate limit, security headers, direct service exposure.
- Stripe/Cloudinary/n8n test keys và webhook local.
- Quyết định user auth backend thật hay chỉ mock/localStorage.
- Migration/reset schema cho payment database để đồng bộ `transactions.order_id` với entity hiện tại.

## Đề xuất thứ tự kiểm thử ưu tiên
1. Smoke environment: stable Docker stack, health/root endpoints, gateway route cơ bản.
2. Admin auth và authorization: login, protected routes, role/forbidden, fake cookie/token.
3. Product/catalog critical path: list/search/detail/upload/admin CRUD.
4. Cart/checkout/order/payment flow end-to-end.
5. Security high-risk: public mutation, CORS, direct service bypass, header spoofing.
6. UX responsive/accessibility cho storefront/cart/checkout/admin.
7. Performance Core Web Vitals và API p95.
8. SEO public pages, canonical/robots/sitemap/metadata.

## Checklist tổng thể
| Checklist | Status |
|---|---|
| Xác định framework frontend/backend | Done |
| Liệt kê page/screen chính | Done |
| Liệt kê API endpoint hiện có | Done |
| Xác định luồng nghiệp vụ chính | Done |
| Xác định role/permission | Done |
| Xác định database/schema/model | Done |
| Xác định config auth/API/env/SEO/security/deployment | Done |
| Tạo tài liệu functional/API/UX/performance/security/SEO/summary | Done |
| Chạy kiểm thử sơ bộ nếu có thể | Partially Done |
| Cần chạy app bằng Docker và kiểm thử browser thực tế | Not Started |
## Product/Cloudinary debug update - 2026-05-15

### Tong hop loi da phat hien

| Loi | Bang chung | Muc do anh huong |
|---|---|---|
| Public product list rong | `GET /api/v1/products?limit=4&sort=latest` qua gateway va direct product-service deu tra `items: []`, `total: 0` | High |
| Product DB hien tai rong | MongoDB Docker `neondb.products`, `product_images`, `product_variants`, `categories` deu count `0` | High |
| Cloudinary media hien tren public homepage | `StorefrontHomePage.tsx` import `getCloudinaryImages()` va render `Cloudinary Media` / `Featured Assets` | High |
| Admin media library route chua ton tai | `/admin/media-library` Not found | Medium |
| Shop settings route chua ton tai | `/admin/shop-settings` Not found | Medium |
| Product upload endpoint nam duoi public namespace | Admin goi `POST /api/v1/products/upload-image`; gateway product route public khong co guard | High |

### Nguyen nhan chinh

1. Product-service dang doc MongoDB Docker `neondb`, nhung database hien tai khong co product documents. Neu "database da co san pham" la dung, kha nang cao product-service dang tro sai DB hoac data da bi reset/mat khi doi Docker named volume.
2. Cloudinary media asset xuat hien o public homepage vi code public component import va render truc tiep Cloudinary listing utility. Khong thay bang chung layout admin bi nham.

### Thu tu uu tien sua loi

1. Xac nhan DB source chinh thuc cua product data va nap/migrate product data vao DB ma product-service dang dung.
2. Remove/di chuyen Cloudinary media section khoi public homepage.
3. Tao route admin `/admin/media-library` neu can media library dung nghiep vu.
4. Harden upload/list/delete media endpoints de chi admin duoc thao tac.
5. Sau khi co product data, test lai catalog, search, detail, cart, checkout.

### Nhung file can chinh sua o buoc implement

| File/area | Ly do |
|---|---|
| `my-app/components/storefront/StorefrontHomePage.tsx` | Bo Cloudinary media listing khoi public homepage; chi render shop/catalog content |
| `my-app/app/admin/media-library/page.tsx` | Can tao neu implement media library admin |
| `my-app/components/admin/*Media*` | Can component media library neu implement |
| `my-app/lib/admin/api.ts` | Can admin media API helpers neu implement media library |
| `microservices/product-service/src/product/product.service.ts` | Can xac nhan query/mapping neu data schema cu khac entity |
| `microservices/product-service/.env` hoac Compose env | Can tro dung DB neu product data nam o DB khac |
| Seed/migration scripts | Can nap lai product/images/variants vao MongoDB Docker neu chon local stable DB |
| `microservices/api-gateway/src/modules/routes/v1/routes.controller.ts` | Can can nhac guard rieng cho upload/media mutation |

### Nhung phan can xac nhan them

- Database nao moi la source of truth cua product data hien co.
- San pham trong DB do dang dung Mongo schema moi hay schema cu.
- Co can public route `/products` tiep tuc redirect sang `/product` hay muon dung mot canonical route duy nhat.
- Media library nen list tu Cloudinary Admin API truc tiep hay tu DB `product_images`/`media_assets`.
- Chinh sach xoa media: hard delete Cloudinary hay soft delete trong DB truoc.

## Implement update `fix-admin-product-media-flow` - 2026-05-15

### Tong hop thay doi da implement

| Nhom | Ket qua |
|---|---|
| Public storefront | Da bo Cloudinary media listing khoi `StorefrontHomePage`; homepage chi fetch latest products |
| Admin media library | Da them `/admin/media-library`, UI list/upload/delete, loading/empty/error/linked states |
| Admin navigation | Da them link Media Library trong Admin Dashboard va Product Manager |
| Admin API client | Da them helpers list/upload/delete media; product image upload da chuyen sang Admin namespace |
| Product-service | Da them Admin media endpoints, Cloudinary list, link check voi `product_images`, block delete linked media |
| API Gateway | Da giu Admin product routes sau `JwtAuthGuard` + `AdminRoleGuard`; public upload endpoint qua gateway yeu cau Admin |
| QA docs | Da cap nhat Product Display, Cloudinary Admin Media, Admin Routing/Permission |

### File can chu y khi review code

| File | Ly do |
|---|---|
| `my-app/components/storefront/StorefrontHomePage.tsx` | Removed public Cloudinary listing |
| `my-app/app/admin/media-library/page.tsx` | New Admin route |
| `my-app/components/admin/AdminMediaLibrary.tsx` | New media library UI |
| `my-app/lib/admin/api.ts` | New protected Admin media helpers |
| `microservices/api-gateway/src/modules/proxy/proxy.service.ts` | Multipart upload proxy support |
| `microservices/api-gateway/src/modules/routes/v1/routes.controller.ts` | Admin guard for product upload/media routes |
| `microservices/product-service/src/product/product.controller.ts` | Admin media endpoints |
| `microservices/product-service/src/product/product.service.ts` | Media list/link/delete behavior |
| `microservices/product-service/src/cloudinary/cloudinary.service.ts` | Cloudinary list support |

### Verification status

| Check | Ket qua |
|---|---|
| `npm.cmd run build` trong `microservices/api-gateway` | Passed |
| `npm.cmd run build` trong `microservices/product-service` | Passed sau khi cai lai dependency local |
| `npm.cmd run build` trong `my-app` | Compile passed, nhung build fail do loi co san ngoai scope: ESLint import `eslint-config-next/core-web-vitals` va type error `app/product/cart/page.tsx` |
| Docker stack | Dang chay dev mode voi source-mounted volumes |
| Smoke public/admin/API | Passed cho product-media scope sau khi restart `product-service`, `api-gateway`, `my-app` |

### Smoke result chi tiet

| Check | Ket qua |
|---|---|
| Product-service routes moi | Runtime mapped `/api/v1/admin/products/media`, `/media/upload`, `/upload-image` |
| Gateway no-token Admin media | `401 Unauthorized` |
| Gateway non-admin Admin media | `403 Forbidden` |
| Public upload through gateway without token | `401 Unauthorized` |
| Admin product image upload | Passed, Cloudinary returned `imageUrl/publicId` |
| Admin create product | Passed, MongoDB product slug `opsx-admin-media-smoke-20260515165511` |
| Public product list | Passed, created product found |
| Public product detail | Passed, returned main image, gallery, variant, size, color |
| `/`, `/product`, product detail pages | HTTP 200 |
| Public homepage Cloudinary text | `Cloudinary Media=false`, `Featured Assets=false`, `Latest catalog arrivals=true` |
| Linked media delete | `400 Bad Request`, delete blocked |
| Unlinked media upload/delete | Upload returned `linked:false`; delete returned `{ "success": true }` |

### Rủi ro con lai

| Risk | Muc do | Ghi chu |
|---|---|---|
| Frontend build bi chan boi loi ngoai scope | Medium | Can sua cart type va ESLint config rieng neu muon production build xanh |
| Direct product-service port expose | High | Gateway da guard, nhung local direct port `3001` van co the bypass |
| MongoDB product data rong | High | Expected den khi Admin tao product moi; khong migrate PostgreSQL |
| Cloudinary list scope | Medium | Dang list prefix `products`; can dam bao upload folder thong nhat |

### Thu tu test tiep theo

1. Rebuild/restart dev containers neu watcher khong reload code moi.
2. Login Admin, open `/admin/media-library`.
3. Test media list/upload/delete unlinked.
4. Tao product trong `/admin/products` voi main image + gallery + variant.
5. Verify MongoDB collections va public `GET /api/v1/products`, `/product`, product detail.
6. Test unauthorized/no-token voi Admin media APIs.
