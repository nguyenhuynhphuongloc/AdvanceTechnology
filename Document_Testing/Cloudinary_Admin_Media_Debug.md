# Cloudinary Admin Media Debug

## Mo ta loi

Trang public `http://localhost:3009/` dang hien thi block Cloudinary/media assets:

- Text: `Cloudinary Media`
- Heading: `Featured Assets`
- Noi dung: danh sach anh lay tu Cloudinary Admin API

Theo yeu cau nghiep vu, media library/Cloudinary management chi duoc nam trong Admin, khong xuat hien o storefront public.

## Expected behavior

- Public homepage chi hien noi dung shop/catalog/san pham.
- Cloudinary/media library chi nam trong Admin navigation.
- User thuong khong thay duoc danh sach media assets quan tri.
- Product public chi render anh san pham thong qua URL da luu trong DB, khong query Cloudinary Admin API de liet ke media.

## Actual behavior

| Kiem tra | Ket qua |
|---|---|
| Route `/` | `my-app/app/page.tsx` render `StorefrontHomePage` |
| Component public | `StorefrontHomePage.tsx` import `getCloudinaryImages` |
| Cloudinary list call | `StorefrontHomePage.tsx` goi `getCloudinaryImages(8)` |
| Public UI text | `Cloudinary Media` va `Featured Assets` trong homepage |
| Admin media route | `/admin/media-library` Not found |
| Admin shop settings route | `/admin/shop-settings` Not found |

## Route/component lien quan

| Route | File/component | Trang thai |
|---|---|---|
| `/` | `my-app/app/page.tsx` -> `StorefrontHomePage` | Public route |
| `/admin` | `my-app/app/admin/page.tsx` -> `AdminDashboard` | Admin route |
| `/admin/products` | `my-app/app/admin/products/page.tsx` -> `AdminProductsManager` | Admin route |
| `/admin/inventory` | `my-app/app/admin/inventory` | Found trong route list truoc do |
| `/admin/media-library` | Not found | Can bo sung neu yeu cau |
| `/admin/shop-settings` | Not found | Can bo sung neu yeu cau |

## Vi sao Cloudinary asset xuat hien o public

Bang chung trong `my-app/components/storefront/StorefrontHomePage.tsx`:

- Import `getCloudinaryImages` tu `../../lib/cloudinary`.
- Trong `Promise.all`, goi `getCloudinaryImages(8)` cung luc voi `fetchProducts`.
- Neu `cloudinaryImages.length > 0`, render section `Cloudinary Media` / `Featured Assets`.

Day khong phai layout bi nham. Day la component public homepage import truc tiep media-list utility.

## Admin/media library flow mong muon

```text
Admin login
  |
  v
/admin
  |
  +--> /admin/products
  |      |
  |      +--> upload image -> product-service -> Cloudinary -> save URL/publicId to DB
  |
  +--> /admin/media-library
  |      |
  |      +--> list media assets
  |      +--> upload new asset
  |      +--> delete asset only if not linked to products
  |
  +--> /admin/shop-settings
         |
         +--> shop name/logo/branches/contact
```

## Product image upload flow hien co

```text
AdminProductsManager
  |
  | file input: main image / gallery images
  v
uploadAdminProductImage(file, token)
  |
  v
POST /api/v1/products/upload-image
  |
  v
product-service CloudinaryService.uploadProductImage()
  |
  v
Cloudinary folder: products
  |
  v
returns { imageUrl, publicId }
  |
  v
create/update product payload saves mainImage/galleryImages to DB
```

Bang chung:

- `my-app/components/admin/AdminProductsManager.tsx` co file input main/gallery.
- `my-app/lib/admin/api.ts` co `uploadAdminProductImage()`.
- `microservices/product-service/src/product/product.controller.ts` co `POST /api/v1/products/upload-image`.
- `microservices/product-service/src/cloudinary/cloudinary.service.ts` upload len Cloudinary folder `products`.
- `product-service` luu `ProductImage` vao collection `product_images`.

## Cloudinary config lien quan

| Layer | File | Ghi chu |
|---|---|---|
| Frontend server utility | `my-app/lib/cloudinary.ts` | Dung Cloudinary Admin API de list resources |
| Product backend upload | `microservices/product-service/src/cloudinary/cloudinary.service.ts` | Upload/delete Cloudinary image |
| Admin product frontend | `my-app/lib/admin/api.ts` | Goi upload endpoint |
| Product service env | `microservices/product-service/.env` | Chua Cloudinary config |

Khuyen nghi bao mat: public homepage khong nen goi Admin API/list Cloudinary resources, ke ca chay server-side, vi lam lo concept media management va lam public page phu thuoc vao credential quan tri.

## Database lien quan

| Collection | Vai tro |
|---|---|
| `products` | Luu product, `mainImagePublicId` |
| `product_images` | Luu `imageUrl`, `publicId`, `productId`, `isMain`, `sortOrder` |
| `product_variants` | Variant co the tham chieu image qua `imageId` |

Hien runtime MongoDB local: `products`, `product_images`, `product_variants` deu count `0`, nen public product image flow chua co data de render.

## Nguyen nhan nghi ngo

### Kha nang cao nhat

Cloudinary/media block bi dat nham vao public homepage component `StorefrontHomePage.tsx`.

Day la import/render sai vi tri, khong phai route admin bi leak qua layout.

### Kha nang lien quan

- Chua co route `/admin/media-library`.
- Chua co media library API rieng de list/upload/delete assets va check lien ket voi product truoc khi xoa.
- Admin product upload hien co chi phuc vu tao/sua product, chua phai media library doc lap.

## Huong sua de xuat

Chua implement trong explore mode. De xuat:

1. Xoa/di chuyen Cloudinary media section ra khoi `StorefrontHomePage.tsx`.
2. Tao route admin rieng:
   - `/admin/media-library`
   - `/admin/shop-settings`
3. Tao component admin media library:
   - List assets da luu trong DB hoac Cloudinary.
   - Upload asset moi.
   - Delete asset co check `product_images.publicId` hoac `productId`.
4. Public homepage chi fetch product catalog:
   - Product image lay tu `product.imageUrl`.
   - Khong list Cloudinary resources truc tiep.

## Checklist test sau khi sua

| Test | Expected |
|---|---|
| `http://localhost:3009/` | Khong con `Cloudinary Media` / `Featured Assets` |
| Public page source/UI | Khong render media library management |
| User thuong vao `/admin/media-library` | Redirect `/admin/login` neu chua login |
| Admin login vao `/admin/media-library` | Thay media library |
| Upload anh san pham trong `/admin/products` | Anh upload len Cloudinary va URL luu DB |
| Product public | Hien anh san pham tu DB URL |
| Delete media dang linked product | Bi chan hoac can confirm unlink |
| Delete media khong linked | Xoa Cloudinary va DB record thanh cong |

## Cap nhat sau implement `fix-admin-product-media-flow` - 2026-05-15

### Admin media routes/API da them

| Layer | Route/API | Ket qua |
|---|---|---|
| Frontend route | `/admin/media-library` | Nam duoi `AdminLayout` va `AdminSessionGate` |
| Admin navigation | Dashboard sidebar va Product Manager header | Co link den Media Library; khong them vao public navigation |
| Client helper | `fetchAdminMediaAssets(token)` | Goi `GET /api/v1/admin/products/media` |
| Client helper | `uploadAdminMediaAsset(file, token)` | Goi `POST /api/v1/admin/products/media/upload` |
| Client helper | `deleteAdminMediaAsset(token, publicId)` | Goi `DELETE /api/v1/admin/products/media?publicId=...` |
| Product image upload | `uploadAdminProductImage(file, token)` | Goi `POST /api/v1/admin/products/upload-image` |

### Admin/media library flow da implement

```text
/admin/media-library
  |
  v
AdminMediaLibrary
  |
  +-- list -> GET /api/v1/admin/products/media
  |          -> Cloudinary list prefix products
  |          -> MongoDB product_images link check
  |
  +-- upload -> POST /api/v1/admin/products/media/upload
  |            -> file validation client + server
  |            -> Cloudinary upload, returns imageUrl/publicId
  |
  +-- delete -> DELETE /api/v1/admin/products/media?publicId=...
               -> block if publicId exists in product_images
               -> delete Cloudinary asset if unlinked
```

### Product image upload flow da implement

```text
/admin/products form
  |
  v
POST /api/v1/admin/products/upload-image
  |
  v
Gateway admin guards
  |
  v
product-service AdminProductController.uploadImage()
  |
  v
CloudinaryService.uploadProductImage()
  |
  v
Admin product payload persists imageUrl/publicId into MongoDB product_images
```

### File lien quan

| File | Noi dung |
|---|---|
| `my-app/app/admin/media-library/page.tsx` | Route page |
| `my-app/components/admin/AdminMediaLibrary.tsx` | List/upload/delete UI va states |
| `my-app/lib/admin/api.ts` | Admin media API helpers |
| `my-app/lib/admin/types.ts` | Media asset/list/upload response types |
| `microservices/product-service/src/cloudinary/cloudinary.service.ts` | Cloudinary upload/list/delete |
| `microservices/product-service/src/product/product.service.ts` | Media list/link check/delete |
| `microservices/product-service/src/product/product.controller.ts` | Admin media endpoints |
| `microservices/api-gateway/src/modules/routes/v1/routes.controller.ts` | Admin guard boundaries |

### Checklist test sau implement

| Test | Expected | Status |
|---|---|---|
| Unauthenticated `/admin/media-library` | Redirect `/admin/login` | Passed |
| Admin open `/admin/media-library` | Thay media UI | Passed via API/runtime; browser UI smoke still recommended |
| Media list | Hien thumbnail, publicId, metadata, linked status | Passed |
| Upload invalid type/oversize | Bi chan va hien validation error | Not run |
| Upload valid image | Cloudinary upload thanh cong, list reload | Passed |
| Delete linked media | Bi chan, khong xoa Cloudinary | Passed |
| Delete unlinked media | Xoa Cloudinary thanh cong | Passed |

### Smoke result - 2026-05-15

| Test | Ket qua |
|---|---|
| Admin product image upload | Passed qua `POST /api/v1/admin/products/upload-image` |
| Admin media standalone upload | Passed qua `POST /api/v1/admin/products/media/upload`, response `linked:false` |
| Admin media list | Passed qua `GET /api/v1/admin/products/media`, returned linked status |
| Delete linked media | Passed: `400 Bad Request`, message asset still linked to product |
| Delete unlinked media | Passed: `200 OK`, response `{ "success": true }` |
| Public homepage media section | Passed: khong con `Cloudinary Media`/`Featured Assets` |
