## Context

The storefront UI already presents fashion-style product listing and product detail pages, but product data is still incomplete and image handling is not integrated with a durable media system. The current product-service schema is too limited for a clothing catalog because it does not model gallery media cleanly, uses JSON for images, and does not provide the API surface needed by the frontend and the gateway-backed architecture.

## Goals / Non-Goals

**Goals:**
- Add Cloudinary media upload support to `product-service` and persist both `image_url` and `public_id`.
- Redesign the product-service data model for products, gallery images, variants, and related products.
- Expose product-service APIs that support product creation, product listing, product detail, and related products.
- Keep `/api/v1/products` flowing through the API gateway as the frontend entry point.
- Integrate the existing Next.js product UI with real backend data for listing and detail experiences.

**Non-Goals:**
- Implement full admin UI for catalog management beyond the specified API support.
- Redesign cart, order, or inventory ownership boundaries beyond what is necessary to expose product and variant data.
- Move image storage into the frontend or gateway; media management remains inside `product-service`.

## Decisions

- **Cloudinary integration stays inside product-service**: Media upload, replacement, and deletion are owned by product-service because it owns product data and must persist `image_url` and `public_id`.
  - Alternative: upload directly from frontend or through the gateway. Rejected because it leaks product media concerns outside the owning service and complicates consistency.
- **Normalize product media and variant data instead of overusing JSON**: Keep the main product record compact and model gallery media, variants, and related links with dedicated tables.
  - Alternative: store all images and variants in JSONB on `products`. Rejected because filtering, validation, and downstream integrations become brittle.
- **Use slug-based product detail routes**: Product detail and related-product APIs will key off `slug` so backend URLs match the desired frontend route structure.
  - Alternative: ID-only public routing. Rejected because the frontend requirement already centers on `/products/[slug]`.
- **Derive available sizes and colors from active variants**: Product detail responses should aggregate unique size and color options from the product’s active variants instead of duplicating those lists manually.
  - Alternative: store redundant product-level size/color arrays. Rejected because duplication invites drift.
- **Related products stay in product-service**: Related product links are a catalog concern and can be computed from explicit links or same-category fallback logic inside product-service.
  - Alternative: push recommendations into another service. Rejected because the current requirement is bounded to catalog/product pages and not a broader personalization system.
- **Frontend consumes gateway routes, not service-local routes**: `my-app` should fetch via the API gateway so the microservice boundary stays hidden from the client.
  - Alternative: call product-service directly from the frontend. Rejected because it bypasses the existing gateway architecture.

## Risks / Trade-offs

- **Cloudinary upload succeeds but database write fails** -> Mitigation: wrap media persistence in service-level error handling and delete orphaned Cloudinary assets on failed product creation where feasible.
- **Schema migration from the current product model is non-trivial** -> Mitigation: introduce new tables and adapt the service layer rather than trying to force-fit new requirements into the old `images` JSON column.
- **Variant modeling can drift from inventory ownership** -> Mitigation: keep variant identity in product-service and let inventory-service continue to reference variant IDs without taking over descriptive catalog data.
- **Frontend and backend route shapes may diverge** -> Mitigation: define DTOs explicitly around listing, detail, and related-product responses and wire the Next.js pages to those contracts.

## Migration Plan

1. Add Cloudinary configuration and a dedicated media service inside `product-service`.
2. Introduce the new product catalog schema for products, media, variants, and related links.
3. Build the product-service APIs and verify they serve gateway routes correctly.
4. Update the Next.js listing and detail pages to use the gateway-backed product APIs.
5. Keep rollback simple by preserving the service boundaries and reverting the new schema/module additions if necessary.

## Open Questions

- Should related products be purely explicit links, or should same-category fallback be included in the first implementation when explicit links are missing?
- Should variant combinations include per-variant stock in the product detail response now, or remain catalog-only until inventory-service integration is expanded?

## Schema Design

The product-service schema should be normalized around product identity, media, variants, and related links. `products.image_url` and `products.images` from the current draft schema should be replaced by dedicated media records.

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    sku VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    base_price NUMERIC(12,2) NOT NULL CHECK (base_price >= 0),
    main_image_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    public_id VARCHAR(255) NOT NULL UNIQUE,
    alt_text VARCHAR(255),
    sort_order INT NOT NULL DEFAULT 0,
    is_main BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    size VARCHAR(50) NOT NULL,
    color VARCHAR(80) NOT NULL,
    price_override NUMERIC(12,2),
    image_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_product_variants_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_product_variants_image
        FOREIGN KEY (image_id)
        REFERENCES product_images(id)
        ON DELETE SET NULL,
    CONSTRAINT uq_product_variant_option
        UNIQUE (product_id, size, color)
);

CREATE TABLE IF NOT EXISTS product_related (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    related_product_id UUID NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_product_related_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_product_related_related_product
        FOREIGN KEY (related_product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_product_related_not_self
        CHECK (product_id <> related_product_id),
    CONSTRAINT uq_product_related_pair
        UNIQUE (product_id, related_product_id)
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product_main ON product_images(product_id, is_main);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_size ON product_variants(product_id, size);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_color ON product_variants(product_id, color);
CREATE INDEX IF NOT EXISTS idx_product_related_product_id ON product_related(product_id);
```

Implementation note:
- `products.main_image_id` points to the canonical main image.
- `product_images.is_main` is retained for simple querying and must stay consistent with `products.main_image_id`.
- `product_variants.image_id` is optional so a color-specific image can be attached later.

## Module Structure

`product-service` should be organized around explicit modules instead of extending the current single-controller skeleton:

- `product.module`
- `product.controller`
- `product.service`
- `product.repository` or TypeORM service layer
- `dto/create-product.dto.ts`
- `dto/upload-product-image.dto.ts`
- `dto/product-list-query.dto.ts`
- `dto/product-card.dto.ts`
- `dto/product-detail.dto.ts`
- `entities/category.entity.ts`
- `entities/product.entity.ts`
- `entities/product-image.entity.ts`
- `entities/product-variant.entity.ts`
- `entities/product-related.entity.ts`
- `cloudinary/cloudinary.module.ts`
- `cloudinary/cloudinary.service.ts`

Controller layout:
- `POST /api/v1/products/upload-image`
- `POST /api/v1/products`
- `GET /api/v1/products`
- `GET /api/v1/products/:slug`
- `GET /api/v1/products/:slug/related`

Service responsibilities:
- `CloudinaryService`: upload image, delete asset by `public_id`
- `ProductService`: create products, query product cards, assemble detail DTOs, resolve related products

## DTO Design

Create DTOs around the two main frontend shapes: product cards for listings and full product detail for the slug page.

```ts
export class UploadProductImageResponseDto {
  imageUrl: string;
  publicId: string;
}

export class CreateProductImageDto {
  imageUrl: string;
  publicId: string;
  altText?: string;
  sortOrder?: number;
  isMain?: boolean;
}

export class CreateProductVariantDto {
  sku: string;
  size: string;
  color: string;
  priceOverride?: number;
  imageId?: string;
}

export class CreateProductDto {
  name: string;
  slug: string;
  sku: string;
  description: string;
  categorySlug: string;
  basePrice: number;
  mainImage: CreateProductImageDto;
  galleryImages: CreateProductImageDto[];
  variants: CreateProductVariantDto[];
  relatedProductSlugs?: string[];
}

export class ProductListQueryDto {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: 'latest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
}

export class ProductCardDto {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  basePrice: number;
  imageUrl: string;
}

export class ProductVariantDto {
  id: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  imageUrl?: string;
}

export class ProductImageDto {
  id: string;
  imageUrl: string;
  publicId: string;
  altText?: string;
  sortOrder: number;
  isMain: boolean;
}

export class ProductDetailDto {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  category: string;
  basePrice: number;
  mainImage: ProductImageDto;
  galleryImages: ProductImageDto[];
  variants: ProductVariantDto[];
  availableSizes: string[];
  availableColors: string[];
  relatedProducts: ProductCardDto[];
}
```

## Example API Payloads

`POST /api/v1/products/upload-image`

Request:
- multipart form-data with field `file`

Response:
```json
{
  "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/products/jacket-main.jpg",
  "publicId": "products/jacket-main"
}
```

`POST /api/v1/products`

Request:
```json
{
  "name": "Oversized Denim Jacket",
  "slug": "oversized-denim-jacket",
  "sku": "JKT-DNM-001",
  "description": "Relaxed denim jacket with washed finish and metal buttons.",
  "categorySlug": "jackets",
  "basePrice": 129.99,
  "mainImage": {
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/products/jacket-main.jpg",
    "publicId": "products/jacket-main",
    "altText": "Front view of oversized denim jacket",
    "sortOrder": 0,
    "isMain": true
  },
  "galleryImages": [
    {
      "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/products/jacket-side.jpg",
      "publicId": "products/jacket-side",
      "altText": "Side view",
      "sortOrder": 1
    },
    {
      "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/products/jacket-back.jpg",
      "publicId": "products/jacket-back",
      "altText": "Back view",
      "sortOrder": 2
    }
  ],
  "variants": [
    { "sku": "JKT-DNM-001-BLU-S", "size": "S", "color": "Blue" },
    { "sku": "JKT-DNM-001-BLU-M", "size": "M", "color": "Blue" },
    { "sku": "JKT-DNM-001-BLK-M", "size": "M", "color": "Black", "priceOverride": 139.99 }
  ],
  "relatedProductSlugs": ["wide-leg-jeans", "ribbed-basic-tee"]
}
```

`GET /api/v1/products`

Response:
```json
{
  "items": [
    {
      "id": "7b5c6c0c-1111-2222-3333-444444444444",
      "name": "Oversized Denim Jacket",
      "slug": "oversized-denim-jacket",
      "sku": "JKT-DNM-001",
      "category": "jackets",
      "basePrice": 129.99,
      "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/products/jacket-main.jpg"
    }
  ],
  "page": 1,
  "limit": 12,
  "total": 1
}
```

This response is intentionally card-shaped for the listing page.

`GET /api/v1/products/:slug`

Response:
```json
{
  "id": "7b5c6c0c-1111-2222-3333-444444444444",
  "name": "Oversized Denim Jacket",
  "slug": "oversized-denim-jacket",
  "sku": "JKT-DNM-001",
  "description": "Relaxed denim jacket with washed finish and metal buttons.",
  "category": "jackets",
  "basePrice": 129.99,
  "mainImage": {
    "id": "img-main",
    "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/products/jacket-main.jpg",
    "publicId": "products/jacket-main",
    "altText": "Front view of oversized denim jacket",
    "sortOrder": 0,
    "isMain": true
  },
  "galleryImages": [
    {
      "id": "img-side",
      "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/products/jacket-side.jpg",
      "publicId": "products/jacket-side",
      "altText": "Side view",
      "sortOrder": 1,
      "isMain": false
    }
  ],
  "variants": [
    {
      "id": "variant-1",
      "sku": "JKT-DNM-001-BLU-S",
      "size": "S",
      "color": "Blue",
      "price": 129.99
    }
  ],
  "availableSizes": ["S", "M"],
  "availableColors": ["Blue", "Black"],
  "relatedProducts": [
    {
      "id": "rel-1",
      "name": "Wide Leg Jeans",
      "slug": "wide-leg-jeans",
      "sku": "JNS-WLG-001",
      "category": "jeans",
      "basePrice": 89.99,
      "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/products/jeans-main.jpg"
    }
  ]
}
```

`GET /api/v1/products/:slug/related`

Response:
```json
{
  "items": [
    {
      "id": "rel-1",
      "name": "Wide Leg Jeans",
      "slug": "wide-leg-jeans",
      "sku": "JNS-WLG-001",
      "category": "jeans",
      "basePrice": 89.99,
      "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/products/jeans-main.jpg"
    }
  ]
}
```

## Frontend Integration

Frontend routes:
- `/products`: storefront listing page
- `/products/[slug]`: product detail page

Listing page mapping:
- `ProductCard` should map from `ProductCardDto`
- current `Product` type in `my-app/lib/search/types.ts` should be expanded to include `slug`, `sku`, and `imageUrl` or renamed to match the API card response
- the current mock data in `app/search/page.tsx` should be replaced with gateway fetches; ideally the route becomes `/products` rather than keeping search-only mock behavior

Detail page mapping:
- fetch `GET /api/v1/products/:slug` through the gateway
- map `mainImage.imageUrl` to the hero image
- map `galleryImages` to the thumbnail strip
- map `name`, `sku`, `basePrice`, and `description` directly to the product header and body
- map `availableSizes` and `availableColors` to selectors
- map `relatedProducts` to the related-product section

## Navigation Flow

Click flow should be simple and slug-driven:

1. `/products` fetches `GET /api/v1/products` through the API gateway.
2. Each product card renders a `Link` to `/products/[slug]`, for example `/products/oversized-denim-jacket`.
3. When the user clicks the card, Next.js navigates to `/products/[slug]`.
4. The detail page uses the route `slug` param to fetch `GET /api/v1/products/:slug` through the API gateway.
5. The detail page renders the returned main image, gallery, SKU, price, description, variant selectors, add-to-cart CTA, and related products.

This keeps the frontend free of hardcoded product content and preserves the gateway-first microservice architecture.
