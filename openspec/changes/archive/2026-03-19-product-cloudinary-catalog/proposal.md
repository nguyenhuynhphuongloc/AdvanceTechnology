## Why

The storefront already has product listing and detail UI, but the backend still lacks a real product catalog with variant-aware data and durable image storage. Integrating Cloudinary and a proper product-service catalog now will replace mock frontend assumptions with an architecture that fits the existing microservices and API gateway.

## What Changes

- Add Cloudinary integration inside `product-service` for uploading, storing, replacing, and deleting product images.
- Redesign the product-service schema to support clothing catalog data, gallery images, variants, and related products.
- Implement product-service APIs for image upload, product creation, product listing, product detail, and related products.
- Ensure the API gateway continues to proxy `/api/v1/products` routes to product-service.
- Integrate the Next.js frontend product listing and detail pages with the real catalog APIs.

## Capabilities

### New Capabilities
- `product-catalog-api`: Product-service catalog APIs and schema for products, variants, listing, detail views, and related products.
- `cloudinary-product-media`: Cloudinary-backed product image upload and persistence of returned image URLs and public IDs.

### Modified Capabilities
<!-- None. -->

## Impact

- `microservices/product-service` database schema, modules, services, controllers, and environment configuration.
- `microservices/api-gateway` product route proxy verification.
- `my-app` product listing and detail pages.
- New Cloudinary dependency and environment variables for media handling.
