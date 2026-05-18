# Phase 6.5A.1 Seller Critical Fixes Checklist

## Slug

- [x] Nhập `bán bánh mì` tạo slug đúng, ví dụ `ban-banh-mi`
- [x] Nhập `Bánh Gạo Ngon Ngon` tạo slug đúng `banh-gao-ngon-ngon`
- [x] Slug chỉ gồm lowercase, number, hyphen
- [x] Không mất nguyên âm tiếng Việt
- [x] Manual slug override vẫn hoạt động
- [x] Duplicate slug báo lỗi rõ (backend ConflictException)

## Shop Onboarding Sync

- [x] Seller register/login thành công (auth-service chạy)
- [x] Onboarding tạo shop thành công (`/seller/shop` page)
- [x] Shop được lưu vào store-service DB
- [x] `/seller/shop` load đúng shop vừa tạo
- [x] `/seller/shop` hiển thị name, slug, description, address, contact info
- [x] Update shop ở `/seller/shop` persist đúng
- [x] Không redirect seller về `/product/account`

## Seller Products API

- [x] GET `/api/v1/seller/products?page=1&limit=20` trả 200
- [x] POST `/api/v1/seller/products` tạo product được
- [x] Product list `/seller/products` load được
- [x] Product tạo mới hiển thị trong `/seller/products`
- [x] Product chỉ thuộc shop của seller hiện tại (filtered by sellerId)
- [x] Seller không thấy product shop khác

## Seller Inventory API

- [x] GET `/api/v1/seller/inventory?page=1&limit=20` trả 200
- [x] `/seller/inventory` load được
- [x] Tạo/cập nhật stock cho variant được
- [x] Inventory gắn đúng shopId, productId, variantId
- [x] Seller không thấy inventory shop khác

## Seller Categories

- [x] Có API lấy categories của shop hiện tại (GET `/api/v1/seller/categories`)
- [x] Seller có thể tạo category cho shop mình (POST `/api/v1/seller/categories`)
- [x] Seller có thể sửa/xóa/ẩn category (PATCH/DELETE `/api/v1/seller/categories/:id`)
- [x] Product form lấy category từ shop hiện tại (dynamic dropdown in product new page)
- [x] Shop A không thấy category của Shop B (scoped by shopId)
- [x] Product tạo ra gắn đúng category của shop hiện tại
- [x] Nếu category global vẫn còn, không làm lẫn với seller shop categories (separate collection/table)

## Product Image Upload

- [x] `uploadSellerProductImage` được export đúng (in product-api.ts)
- [x] Import trong product new/edit không lỗi
- [x] Upload file gọi đúng endpoint (POST `/api/v1/seller/products/upload-image`)
- [x] Upload trả imageUrl/publicId
- [x] Product form hiển thị ảnh sau upload
- [x] Product create gửi image data đúng (mainImage + publicId)

## Product Create Runtime

- [x] `/seller/products/new` submit không lỗi
- [x] Payload có name, slug, description, basePrice
- [x] Payload có shop category đúng
- [x] Payload có variant (auto-create default variant nếu empty)
- [x] Payload có image nếu upload (mainImage.publicId required)
- [x] Backend tạo product thành công
- [x] Product xuất hiện trong seller product list
- [x] Nếu approved/active, product có thể hiển thị trên marketplace

## Build

- [x] my-app build pass
- [x] api-gateway build pass (added SellerCategoryProxyController)
- [x] product-service build pass (fixed CORS, DTO optionals, service)
- [x] inventory-service build pass (fixed CORS, pagination)
- [x] store-service build pass (added shop_categories entity/service/controller)
