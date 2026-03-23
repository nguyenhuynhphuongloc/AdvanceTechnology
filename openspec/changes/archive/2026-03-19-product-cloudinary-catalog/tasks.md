## 1. Product-Service Media And Schema

- [x] 1.1 Add Cloudinary dependencies and environment configuration to `product-service`
- [x] 1.2 Implement a Cloudinary module/service for image upload and Cloudinary metadata handling
- [x] 1.3 Redesign the product-service schema for products, product images, variants, and related products
- [x] 1.4 Update product-service entities and persistence layer to store `image_url` and `public_id`

## 2. Product-Service APIs

- [x] 2.1 Implement `POST /api/v1/products/upload-image`
- [x] 2.2 Implement `POST /api/v1/products` with product, gallery, and variant payload support
- [x] 2.3 Implement `GET /api/v1/products` with pagination, category filter, search, and sorting
- [x] 2.4 Implement `GET /api/v1/products/:slug` with media, variants, size/color options, and related products
- [x] 2.5 Implement `GET /api/v1/products/:slug/related`

## 3. Gateway And Frontend Integration

- [x] 3.1 Verify API gateway `/api/v1/products` routing still proxies correctly to product-service
- [x] 3.2 Integrate `my-app` `/products` listing page and product card links with the real product listing API
- [x] 3.3 Integrate `my-app` `/products/[slug]` page with product detail, gallery, variant options, and related products APIs

## 4. Validation

- [x] 4.1 Add or update tests for Cloudinary media handling and product-service APIs
- [x] 4.2 Verify end-to-end product listing and product detail flows through the API gateway
- [x] 4.3 Document required Cloudinary environment variables, catalog API usage, and frontend data mapping
