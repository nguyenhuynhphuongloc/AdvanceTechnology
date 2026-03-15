# my-app

The storefront now includes gateway-backed catalog routes:

- `/products`
- `/products/[slug]`

These pages fetch live catalog data from the API gateway instead of using mock-only data.

## Environment variables

The storefront resolves the gateway base URL in this order:

1. `API_GATEWAY_URL`
2. `NEXT_PUBLIC_API_BASE_URL`
3. `http://localhost:3000`

For local development with the gateway running on the host, this works out of the box because the default fallback already targets `http://localhost:3000`.

## Frontend data mapping

`/products` consumes `GET /api/v1/products` and maps the response like this:

- `name` -> product card title
- `slug` -> `/products/[slug]` link target
- `basePrice` -> card price
- `imageUrl` -> product image
- `category` -> filter and display metadata

`/products/[slug]` consumes `GET /api/v1/products/:slug` and `GET /api/v1/products/:slug/related`:

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
