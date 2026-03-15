# product-service

`product-service` now owns the storefront catalog schema, Cloudinary-backed product media, and the public product APIs consumed through the API gateway.

## Required environment variables

Copy `.env.example` and provide:

- `DB_HOST`
- `DB_PORT`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_DATABASE`
- `DB_SSL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `PORT`

Cloudinary credentials are required because product image uploads persist `image_url` and `public_id`, and the service keeps `public_id` so assets can be replaced or deleted later.

## Catalog API

All endpoints are mounted inside the service at `/api/v1/products`.

- `POST /upload-image`
  Uploads a multipart file field named `file` to Cloudinary and returns `{ imageUrl, publicId }`.
- `POST /`
  Creates a product with category, main image, gallery images, variants, and optional `relatedProductSlugs`.
- `GET /`
  Returns paginated product cards and accepts `page`, `limit`, `category`, `search`, and `sort`.
- `GET /:slug`
  Returns the storefront detail shape with `mainImage`, `galleryImages`, `variants`, `availableSizes`, `availableColors`, and `relatedProducts`.
- `GET /:slug/related`
  Returns related product cards independently for detail page sections.

Example create payload:

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
    "isMain": true
  },
  "galleryImages": [
    {
      "imageUrl": "https://res.cloudinary.com/demo/image/upload/v123/products/jacket-back.jpg",
      "publicId": "products/jacket-back",
      "altText": "Back view",
      "sortOrder": 1
    }
  ],
  "variants": [
    { "sku": "JKT-DNM-001-BLU-S", "size": "S", "color": "Blue" },
    { "sku": "JKT-DNM-001-BLK-M", "size": "M", "color": "Black", "priceOverride": 139.99 }
  ],
  "relatedProductSlugs": ["wide-leg-jeans"]
}
```

## Development commands

```bash
npm install
npm run build
npm run test
npm run test:e2e
```
