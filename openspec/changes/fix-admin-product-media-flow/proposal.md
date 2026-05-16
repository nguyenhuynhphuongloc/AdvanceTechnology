## Why

Product data has intentionally moved from the old PostgreSQL product database to the MongoDB-backed product-service, so storefront product visibility should be driven by products created through the Admin product flow rather than by migrating old data during this change. At the same time, Cloudinary media management is currently exposed on the public homepage, which violates the intended separation between public storefront content and Admin-only media tooling.

## What Changes

- Remove Cloudinary/media asset listing from the public homepage so public users only see storefront/shop/catalog content.
- Keep public product pages dependent on MongoDB-backed product-service data created through Admin product management.
- Introduce an Admin-only media library surface for Cloudinary/media management.
- Ensure Admin product creation remains the primary flow for uploading Cloudinary images, saving `imageUrl`/`publicId` to MongoDB, and making products visible in public catalog APIs.
- Protect product media management/mutation routes behind Admin authentication/authorization where they are used for Admin workflows.
- Add post-implementation QA checklist coverage for Admin product creation, Cloudinary upload, MongoDB persistence, public catalog rendering, and permission boundaries.
- Do not seed or migrate old PostgreSQL product data as part of this change.

## Capabilities

### New Capabilities

- `admin-media-library`: Admin-only media library routes and behavior for listing, uploading, and managing Cloudinary-backed media assets.

### Modified Capabilities

- `cloudinary-product-media`: Cloudinary product media must be Admin-scoped and must not render or expose media-library listing behavior on public storefront pages.
- `product-catalog-api`: Product catalog visibility depends on MongoDB-backed products created through Admin product flow, with clear post-create public catalog verification.
- `gateway-authentication`: Product media mutation/management operations used by Admin must require Admin authentication/authorization at the gateway boundary.

## Impact

- Frontend public homepage: `my-app/components/storefront/StorefrontHomePage.tsx`.
- Admin frontend routes/components: `/admin/products`, new `/admin/media-library`, Admin navigation/session guard.
- Admin API client: `my-app/lib/admin/api.ts`.
- Product-service APIs: product create/update, image upload, image delete/media management if introduced.
- API Gateway route guards for Admin-only product media operations.
- MongoDB collections: `products`, `product_images`, `product_variants`, `product_related`, `categories`.
- Cloudinary integration: upload/list/delete behavior and media ownership rules.
- QA documentation/checklists in `Document_Testing`.
