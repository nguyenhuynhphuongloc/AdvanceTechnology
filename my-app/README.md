# my-app

The storefront now uses this public product route structure:

- `/product`
- `/product/[slug]`
- `/products` -> redirects to `/product`
- `/products/[slug]` -> redirects to `/product/[slug]`

The canonical product listing and detail pages fetch live catalog data from the API gateway instead of using mock-only catalog fallbacks.

## Environment variables

The storefront resolves the gateway base URL in this order:

1. `API_GATEWAY_URL`
2. `NEXT_PUBLIC_API_BASE_URL`
3. `http://localhost:3000`

For local development with the gateway running on the host, this works out of the box because the default fallback already targets `http://localhost:3000`.

## Frontend data flow

The storefront product flow now follows this path:

1. `/product` and `/product/[slug]` call `my-app/lib/products/api.ts`
2. The frontend requests `/api/v1/products`, `/api/v1/products/:slug`, and `/api/v1/products/:slug/related`
3. The API gateway proxies those requests to `product-service`
4. `product-service` reads the catalog from the database and returns storefront DTOs
5. The Next.js pages map those DTOs into listing cards, detail content, and related-product grids

## Frontend data mapping

`/product` consumes `GET /api/v1/products` and maps the response like this:

- `name` -> product card title
- `slug` -> `/product/[slug]` link target
- `basePrice` -> card price
- `imageUrl` -> product image
- `category` -> filter and display metadata

`/product/[slug]` consumes `GET /api/v1/products/:slug` and `GET /api/v1/products/:slug/related`:

- `mainImage.imageUrl` -> hero image
- `galleryImages` -> gallery strip
- `sku`, `basePrice`, `description` -> product content
- `availableSizes`, `availableColors` -> option chips
- `variants` -> variant catalog section
- `relatedProducts` -> related product grid

## Development commands

```bash
npm install
npm run dev
npm run build
```
