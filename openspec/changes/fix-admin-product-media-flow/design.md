## Context

Product catalog data has moved to MongoDB through `product-service`; the old PostgreSQL product data is no longer the source for storefront catalog rendering. The current stable Docker stack correctly routes frontend product calls through the API Gateway to product-service, but the MongoDB product collections are empty until Admin creates products.

The current public homepage also imports `getCloudinaryImages()` and renders a Cloudinary media asset section. That is a misplaced Admin/media-management concern. Admin product creation already supports main/gallery image upload through Cloudinary and saves image metadata to MongoDB, but there is no dedicated `/admin/media-library` route and media mutation endpoints are not clearly separated from public product routes.

## Goals / Non-Goals

**Goals:**

- Keep MongoDB-backed product-service as the product source of truth.
- Remove Cloudinary media listing from public storefront pages.
- Ensure public storefront pages render only product catalog content and product image URLs stored in MongoDB.
- Add an Admin-only media library surface for Cloudinary/media management.
- Keep Admin product creation as the main path for creating MongoDB products with Cloudinary main image, gallery images, and variants.
- Harden Admin product media operations so public users cannot upload/list/delete media assets.
- Add implementation verification steps covering Admin create -> Cloudinary -> MongoDB -> public catalog display.

**Non-Goals:**

- Do not migrate old PostgreSQL product data.
- Do not seed sample product data as part of this change.
- Do not replace Cloudinary with another media provider.
- Do not redesign the full Admin dashboard beyond the routes and navigation needed for product/media flow.
- Do not solve unrelated payment/notification schema mismatches.

## Decisions

### Decision: Treat Admin-created MongoDB products as the catalog source

The product catalog should be populated by Admin product creation in the current MongoDB product-service. This keeps the system aligned with the current service architecture and avoids reviving the old PostgreSQL product path.

Alternative considered: migrate/seed old PostgreSQL products into MongoDB in this change. Rejected because the user explicitly asked not to process old DB data now; the immediate fix is product creation/media management flow.

### Decision: Remove Cloudinary listing from public homepage

The public homepage should not call `getCloudinaryImages()` or render a generic media asset gallery. Public pages should only render product images that product-service returns from MongoDB product records.

Alternative considered: keep a public "featured media" section but rename it. Rejected because the requested business rule is that media library/Cloudinary management belongs only in Admin.

### Decision: Add `/admin/media-library` as a separate Admin capability

Media library should be separated from product form upload. The product form can continue to upload main/gallery images, while media library provides a broader Admin asset view and future delete/reuse workflows.

Alternative considered: keep media only embedded inside `/admin/products`. Rejected because requirements explicitly call out a Media Library Admin function and future reuse/delete checks.

### Decision: Prefer stored product image metadata over direct public Cloudinary listing

Public storefront product cards/details should use `imageUrl` and `publicId` persisted in `product_images`. This lets the backend enforce which images are associated with products and avoids exposing arbitrary Cloudinary resources.

Alternative considered: frontend public pages query Cloudinary directly and match images client-side. Rejected due to security, performance, and ownership ambiguity.

### Decision: Harden media mutation through Admin routes/guards

Image upload/delete/list operations used for Admin media management should require Admin authentication and authorization at the gateway. Product creation/update remains Admin-only through `/api/v1/admin/products`.

Alternative considered: leave upload under public `/api/v1/products/upload-image` and rely on UI hiding. Rejected because public API access would still allow bypassing the Admin UI.

## Risks / Trade-offs

- Existing Admin product upload may rely on `/api/v1/products/upload-image` -> Keep compatibility temporarily or update Admin client and gateway together; verify upload after route hardening.
- Media delete can break product images -> Require link checks against `product_images` before deletion, or block delete when linked.
- MongoDB remains empty until Admin creates products -> Document this as expected; QA should create products through Admin before expecting public catalog data.
- Cloudinary Admin API list can expose broad account resources -> Scope listing to product/media folder where possible and keep it behind Admin auth.
- Public catalog may still show empty state after removing homepage media -> Expected until Admin creates products; test empty state remains clean.

## Migration Plan

1. Remove public Cloudinary media rendering from homepage.
2. Add Admin media library route and navigation entry.
3. Add or reuse Admin-authenticated media APIs for list/upload/delete.
4. Update Admin product image upload to use Admin-protected media endpoint if route hardening changes the path.
5. Create a product through Admin in local Docker stack and verify MongoDB persistence.
6. Verify public storefront reads the new MongoDB product via gateway.

Rollback: restore the previous Admin product upload endpoint path if Admin product creation breaks, but do not restore Cloudinary media listing to public homepage.

## Open Questions

- Should media library list all Cloudinary images or only images under the product/media folder?
- Should deleting a linked media asset be blocked, soft-deleted, or require unlinking products first?
- Should `/admin/shop-settings` be included in this implementation or reserved for a separate change?
- Should upload route remain backward compatible as `/api/v1/products/upload-image` while adding a guarded Admin route?
