## 1. Catalog Route Consolidation

- [x] 1.1 Audit and centralize all public product href generation so listing, detail, related-product, navbar, footer, cart, and account links can target one canonical `/product` route family
- [x] 1.2 Add a canonical product detail route under `my-app/app/product/[slug]` that reuses the live gateway-backed detail and related-product flow
- [x] 1.3 Convert `my-app/app/products/page.tsx` and `my-app/app/products/[slug]/page.tsx` into legacy compatibility redirects or wrappers to `/product` and `/product/[slug]`

## 2. Live Catalog Listing Refactor

- [x] 2.1 Refactor `my-app/app/product/page.tsx` to use the shared live catalog client and query contract already proven in the `/products` listing flow
- [x] 2.2 Reuse or extract product listing helpers for search, category filtering, sorting, pagination, and product-card mapping so `/product` does not duplicate catalog logic unnecessarily
- [x] 2.3 Remove catalog-listing fallback behavior that substitutes `my-app/lib/shopping/data.ts` sample products when the live API request fails

## 3. UI and Styling Integration

- [x] 3.1 Preserve the current `/product` page layout and shopping header actions while merging in any reusable listing or card components needed from the `/products` flow
- [x] 3.2 Update product cards and related-product surfaces to navigate to the canonical `/product/[slug]` detail route without breaking add-to-cart or account/cart entry points
- [x] 3.3 Align shared CSS and component styling so the `product` page remains visually consistent and any reused `/products` styles do not break the target design

## 4. Data Flow and Verification

- [x] 4.1 Verify the public catalog flow uses `my-app/lib/products/api.ts` against `/api/v1/products` and `/api/v1/products/:slug` through the API gateway and `product-service`, with no mock-data path in the browsing experience
- [x] 4.2 Run the relevant frontend checks and practical route tests for `/product`, `/product/[slug]`, and legacy `/products` redirects, then fix regressions
- [x] 4.3 Document the final route structure, changed files, and the database-to-frontend product data flow for the implementation handoff
