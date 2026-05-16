# Product Display Debug

## Mo ta loi

Frontend public hien khong hien thi san pham trong danh sach catalog/homepage, mac du ky vong database co san pham cua cua hang.

Anh huong truc tiep:

- Trang chu latest products.
- Trang danh sach san pham.
- Tim kiem, loc, phan trang.
- Chi tiet san pham.
- Gio hang va checkout vi can product/variant/image data.

## Expected behavior

- `http://localhost:3009/` hien thi san pham moi nhat tu database.
- `http://localhost:3009/product` va redirect tu `/products` hien thi danh sach san pham.
- API `GET /api/v1/products` tra response co `items.length > 0` khi database co san pham active.
- Moi product card co toi thieu: `id`, `name`, `slug`, `sku`, `category`, `basePrice`, `imageUrl`, `stock`.

## Actual behavior

Ket qua runtime da kiem tra:

| Kiem tra | Ket qua |
|---|---|
| `GET http://localhost:3000/api/v1/products?limit=4&sort=latest` | `200`, `{"items":[],"page":1,"limit":4,"total":0}` |
| `GET http://localhost:3001/api/v1/products?limit=4&sort=latest` | `200`, `{"items":[],"page":1,"limit":4,"total":0}` |
| MongoDB `neondb.products` | `0` documents |
| MongoDB `neondb.product_images` | `0` documents |
| MongoDB `neondb.product_variants` | `0` documents |
| MongoDB `neondb.categories` | `0` documents |

Ket luan tam thoi: frontend khong render sai response o buoc dau; API product dang tra dung format nhung data source hien tai rong.

## Luong hien tai

```text
Public page
  |
  v
my-app StorefrontHomePage / ProductPage
  |
  v
my-app/lib/products/api.ts
  |
  v
API Gateway :3000 /api/v1/products
  |
  v
product-service :3001 /api/v1/products
  |
  v
MongoDB docker service / neondb / products
```

## Frontend files lien quan

| File | Vai tro | Bang chung |
|---|---|---|
| `my-app/app/page.tsx` | Route `/`, render homepage | Import va render `StorefrontHomePage` |
| `my-app/components/storefront/StorefrontHomePage.tsx` | Homepage public, fetch latest products | Goi `fetchProducts({ limit: 4, sort: "latest" })` |
| `my-app/app/product/page.tsx` | Catalog canonical page | Goi `fetchCatalogPage(..., { limit: 12 })` |
| `my-app/app/products/page.tsx` | Legacy route | Redirect sang canonical product list |
| `my-app/lib/products/api.ts` | Build API URL va fetch product API | Base URL lay tu `API_GATEWAY_URL` hoac `NEXT_PUBLIC_API_BASE_URL`; endpoint `/api/v1/products` |
| `my-app/lib/products/catalog.ts` | Normalize query params va map response | `response.items.map(toStorefrontProduct)` |
| `my-app/lib/products/storefront.ts` | Map DTO sang UI Product | `basePrice -> price`, `imageUrl -> imageUrl` |
| `my-app/components/search/ProductGrid.tsx` | Render grid/empty state | Neu `products.length === 0` thi hien empty state |
| `my-app/components/search/ProductCard.tsx` | Render product card | Dung `product.imageUrl`, fallback picsum neu thieu image |

## Backend/API files lien quan

| File | Vai tro |
|---|---|
| `microservices/api-gateway/src/modules/routes/v1/routes.controller.ts` | Gateway route `api/v1/products`, proxy den `PRODUCT_SERVICE_URL` |
| `microservices/api-gateway/src/modules/proxy/proxy.service.ts` | Forward request sang downstream service |
| `microservices/product-service/src/product/product.controller.ts` | Product endpoint `GET /api/v1/products`, `GET /api/v1/products/:slug` |
| `microservices/product-service/src/product/product.service.ts` | Query MongoDB, filter active products, map DTO |
| `microservices/product-service/src/product/dto/product-list-query.dto.ts` | Query params: `page`, `limit`, `category`, `search`, `sort`, `sellerName` |
| `microservices/product-service/src/product/dto/product-response.dto.ts` | Response contract frontend dang can |

## Database/model lien quan

Product-service hien dung MongoDB trong Docker:

- `DB_TYPE=mongodb`
- `DB_URL=mongodb://...@mongodb:27017/neondb?authSource=admin`

Collections du kien:

| Collection | Entity file | Trang thai hien tai |
|---|---|---|
| `products` | `product.entity.ts` | Found, count `0` |
| `product_images` | `product-image.entity.ts` | Found, count `0` |
| `product_variants` | `product-variant.entity.ts` | Found, count `0` |
| `product_related` | `product-related.entity.ts` | Found |
| `categories` | `category.entity.ts` | Found, count `0` |

Product list query trong `ProductService.getProducts()` co filter:

```text
where = { isActive: true }
optional: categorySlug, sellerName, search regex
sort: latest/price/name
```

Neu san pham trong DB khong co `isActive: true`, hoac nam o database khac, endpoint public se tra rong.

## API response hien tai

```json
{
  "items": [],
  "page": 1,
  "limit": 4,
  "total": 0
}
```

Response format phu hop voi frontend type `ProductListResponse`; van de la data rong.

## Nguyen nhan nghi ngo

### Kha nang cao nhat

Product-service dang ket noi toi MongoDB local trong Docker, nhung database/collection hien tai khong co product documents.

Bang chung:

- Gateway endpoint va direct product-service endpoint deu tra `items: []`.
- MongoDB `neondb.products` count = `0`.
- Product-service config dang tro toi Docker MongoDB service, khong phai Neon/Postgres hay DB khac.

### Kha nang phu

| Kha nang | Can kiem tiep |
|---|---|
| Data cua cua hang dang nam o DB khac | Can xac nhan DB goc dang chua product la Mongo local, Neon, hay Cloud DB khac |
| Data bi mat khi reset Docker volume | Da co thao tac Docker volume reset truoc do; named volume Mongo hien tai rong |
| Product documents co `isActive: false` | Hien collection rong nen chua ap dung |
| Product data schema cu dung snake_case/cot khac | Hien collection rong nen chua xac minh |
| Redis cache dang cache ket qua rong | Co the anh huong sau khi seed data; can clear/increment catalog cache khi nap data |

## Cach kiem tra tiep

- Xac nhan database chinh thuc dang co san pham nam o dau.
- Neu dung MongoDB Docker hien tai: chay query count va sample document trong `neondb.products`.
- Neu san pham nam o DB khac: so sanh `DB_URL` cua product-service voi DB do.
- Sau khi co data, goi:
  - `GET /api/v1/products?limit=12`
  - `GET /api/v1/admin/products?limit=20` voi admin token
  - `GET /api/v1/products/:slug`
- Kiem tra product document co:
  - `id`
  - `name`
  - `slug`
  - `sku`
  - `description`
  - `basePrice`
  - `categorySlug`
  - `isActive: true`
  - `mainImagePublicId`
- Kiem tra `product_images` co document khop `productId` va `publicId`.
- Kiem tra `product_variants` co it nhat 1 variant theo `productId`.

## Huong sua de xuat

Chua implement trong explore mode. Huong sua nen duoc chon sau khi xac nhan data source:

1. Neu DB dung la MongoDB Docker hien tai:
   - Tao seed/import data san pham vao `neondb`.
   - Dam bao moi product co image va variant hop le.
   - Clear Redis catalog cache sau seed.

2. Neu san pham dang nam o DB khac:
   - Cap nhat `product-service` DB config ve dung DB.
   - Hoac migrate data sang MongoDB local/stable stack.
   - Ghi ro trong README/Document_Testing de QA khong nham DB.

3. Neu data co nhung `isActive` sai:
   - Admin can co flow publish/unpublish ro rang.
   - Public query chi lay active products la hop ly.

4. Neu schema cu khong khop entity:
   - Viet migration/adapter mapping field cu sang field moi.
   - Khong nen bat `synchronize` de sua schema production-like mot cach im lang.

## Checklist test sau khi sua

| Test | Expected |
|---|---|
| `GET /api/v1/products?limit=4&sort=latest` | `200`, `items.length > 0`, `total > 0` |
| `GET /api/v1/products/:slug` | `200`, co `mainImage`, `galleryImages`, `variants` |
| `http://localhost:3009/` | Hien latest catalog arrivals |
| `http://localhost:3009/product` | Hien grid product |
| Search keyword hop le | Chi hien product matching |
| Category filter | Chi hien category matching |
| Sort price/name/latest | Thu tu dung |
| Empty search | Empty state dung, khong crash |
| Product card image | Hien Cloudinary URL hoac fallback |
| Add to cart tu detail | Product snapshot co id/name/price/image/variant |

## Cap nhat sau implement `fix-admin-product-media-flow` - 2026-05-15

### Final expected Admin-to-MongoDB flow

```text
Admin /admin/products
  |
  | upload main/gallery image
  v
POST /api/v1/admin/products/upload-image
  |
  v
API Gateway JwtAuthGuard + AdminRoleGuard
  |
  v
product-service AdminProductController
  |
  v
Cloudinary folder products -> returns imageUrl/publicId
  |
  v
Admin create/update product payload
  |
  v
MongoDB products + product_images + product_variants + categories
  |
  v
GET /api/v1/products and GET /api/v1/products/:slug
  |
  v
Public homepage/catalog/detail render product imageUrl from MongoDB response
```

### Files da implement

| Area | File | Ket qua |
|---|---|---|
| Public homepage | `my-app/components/storefront/StorefrontHomePage.tsx` | Da bo Cloudinary list/render; chi fetch `fetchProducts({ limit: 4, sort: "latest" })` |
| Admin product upload client | `my-app/lib/admin/api.ts` | `uploadAdminProductImage()` da chuyen sang `/api/v1/admin/products/upload-image` |
| Gateway protection | `microservices/api-gateway/src/modules/routes/v1/routes.controller.ts` | Public `/api/v1/products/upload-image` yeu cau JWT admin; Admin namespace van dung `JwtAuthGuard` + `AdminRoleGuard` |
| Multipart proxy | `microservices/api-gateway/src/modules/proxy/proxy.service.ts` | Ho tro forward multipart upload stream qua gateway |
| Product-service admin upload | `microservices/product-service/src/product/product.controller.ts` | Them Admin upload endpoint va dung chung validation JPG/PNG/WEBP <= 5MB |

### Risk con lai

| Risk | Ghi chu |
|---|---|
| MongoDB rong | Day la expected cho den khi Admin tao product moi; khong seed/migrate PostgreSQL trong change nay |
| Direct product-service port | Local Docker van expose `3001`, co the bypass gateway neu goi truc tiep; production nen dong direct public port |
| Frontend build | Compile pass nhung build bi chan boi loi co san o cart/ESLint ngoai scope product-media |

### Checklist test sau implement

| Test | Expected | Status |
|---|---|---|
| Public `/` khong co Cloudinary Media/Featured Assets | Khong render media library tren homepage | Passed |
| Admin tao product co main image + gallery | Upload qua Admin endpoint, Cloudinary tra `imageUrl/publicId` | Passed |
| Product create payload vao MongoDB | Co product, image, variant, category records | Passed |
| `GET /api/v1/products` sau khi create active product | Product xuat hien trong `items` | Passed |
| `GET /api/v1/products/:slug` | Co `mainImage`, `galleryImages`, `variants`, `availableSizes`, `availableColors` | Passed |

### Smoke result - 2026-05-15

| Test | Ket qua |
|---|---|
| Admin upload main image | Passed, returned Cloudinary `imageUrl/publicId` |
| Admin upload gallery image | Passed, returned Cloudinary `imageUrl/publicId` |
| Admin create product | Passed, `201 Created`, slug `opsx-admin-media-smoke-20260515165511` |
| Public `GET /api/v1/products?limit=10&sort=latest` | Passed, product found, `total=2` after smoke products |
| Public `GET /api/v1/products/:slug` | Passed, co main image, 1 gallery image, 1 variant, size `M`, color `Black` |
| Public `/` | Passed, HTTP 200, co `Latest catalog arrivals`, khong co `Cloudinary Media`/`Featured Assets` |
| Public `/product` | Passed, HTTP 200 |
| Public `/product/opsx-admin-media-smoke-20260515165511` | Passed, HTTP 200 |

Ghi chu: Smoke test da tao 2 product test trong MongoDB do lan goi dau tao product thanh cong nhung PowerShell `Invoke-WebRequest` gap loi client-side khi doc response. Co the xoa bang Admin Product Manager neu muon lam sach data local.
