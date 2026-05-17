# Phase 6 Buyer Marketplace UI Plan

## 1. Objective

Build a brand-new Buyer Marketplace UI under the `/marketplace` route namespace with:
- White/clean theme with orange accent
- Shopee-like marketplace UX patterns (not a visual copy)
- Real API integration from Phase 5E.1 runtime flows
- Separation from Seller Center (`/seller`) and Admin Console (`/admin`)

---

## 2. Current Buyer UI Findings

### Existing Buyer-facing Pages

| Route | Exists | Tech | Reuse |
|-------|--------|------|-------|
| `/product/[slug]` | YES | Next.js | Fetch logic only, layout new |
| `/products` | MAYBE | Next.js | Fetch logic only, layout new |
| `/shops/[slug]` | MAYBE | Next.js | Fetch logic only, layout new |
| `/cart` | MAYBE | Next.js | Fetch logic only, layout new |
| `/checkout` | MAYBE | Next.js | Fetch logic only, layout new |

### Route Conflict Resolution

- `GET /api/v1/products` vs `GET /api/v1/products/:slug` — NestJS uses `:slug` as catch-all but Express priority means exact `/products` should match first. Next.js App Router segment routes (`/products/page.tsx` vs `/products/[slug]/page.tsx`) handle this correctly.
- All Buyer UI pages under `/marketplace` are new routes — no conflict with existing `/seller` or `/admin`.

### What Will Be Created Fresh

All pages in `/marketplace` are **new routes** with a **new layout** — no reuse of old CSS/layout.

---

## 3. New Route Map

| New Route | Purpose | API Used | Auth |
|-----------|---------|----------|------|
| `/marketplace` | Homepage | `GET /products` | None |
| `/marketplace/products` | Product listing | `GET /products` | None |
| `/marketplace/products/[slug]` | Product detail | `GET /products/:slug` | None |
| `/marketplace/shops` | Shop listing | `GET /shops` | None |
| `/marketplace/shops/[slug]` | Shop detail | `GET /shops/:slug` | None |
| `/marketplace/shops/[slug]/products` | Shop's products | `GET /shops/:slug/products` | None |
| `/marketplace/cart` | Buyer cart | `GET /carts/me`, `PATCH`, `DELETE` | JWT |
| `/marketplace/checkout` | Checkout | `POST /orders/checkout` | JWT |
| `/marketplace/orders` | Buyer orders | `GET /orders/me` | JWT |
| `/marketplace/orders/[id]` | Order detail | `GET /orders/:id` | JWT |
| `/marketplace/profile` | Buyer profile | None (API missing) | JWT |
| `/marketplace/addresses` | Buyer addresses | None (API missing) | JWT |

---

## 4. UI Direction

### Theme

| Element | Value |
|---------|-------|
| Background | `#ffffff` (white) |
| Card background | `#ffffff` with `border border-gray-200` |
| Accent/Primary | `#f97316` (orange-500) |
| Accent hover | `#ea580c` (orange-600) |
| Text primary | `#111827` (gray-900) |
| Text secondary | `#6b7280` (gray-500) |
| Border | `#e5e7eb` (gray-200) |
| Page background | `#f9fafb` (gray-50) |

### Layout System

```
MarketplaceShell
  MarketplaceHeader (sticky, white, shadow-sm)
    Logo (left)
    SearchBar (center, dominant)
    Nav icons: Products | Shops | Cart(w/badge) | Orders | Profile (right)
  {children}
  MarketplaceFooter
```

### Typography

- Font: Inter (Next.js default)
- Headings: `font-semibold text-gray-900`
- Body: `text-gray-600 text-sm`
- Price: `text-orange-500 font-bold`

### Components to Create

New components in `my-app/components/marketplace/`:

```
MarketplaceShell.tsx        — layout wrapper
MarketplaceHeader.tsx       — sticky header
MarketplaceSearchBar.tsx    — centered search input
MarketplaceNav.tsx          — icon navigation
MarketplaceFooter.tsx       — simple footer
ProductCard.tsx             — card: image, name, price, shop
ProductGrid.tsx             — responsive grid
ShopCard.tsx                — card: logo, name, status, description
CategoryPill.tsx            — horizontal scroll category pills
PriceText.tsx               — formatted price display
QuantityStepper.tsx         — +/- quantity selector
CartShopGroup.tsx           — cart items grouped by shop
CheckoutSummary.tsx          — order summary panel
OrderStatusBadge.tsx         — status chip with color
AddressForm.tsx             — shipping address form
MarketplaceEmptyState.tsx    — empty state with icon+message
MarketplaceErrorState.tsx    — error state with retry
MarketplaceLoadingState.tsx  — skeleton loading
```

---

## 5. API Availability

| Page | API Endpoint | Status | Notes |
|------|-------------|--------|-------|
| Homepage | `GET /api/v1/products?limit=12&sort=latest` | ✅ Available | Public, no auth |
| Product list | `GET /api/v1/products` | ✅ Available | Supports page/limit/category/search/sort |
| Product detail | `GET /api/v1/products/:slug` | ✅ Available | Public |
| Categories | `GET /api/v1/categories` | ✅ Available | Public |
| Shop list | `GET /api/v1/shops` | ⚠️ Blocked | store-service down (502) |
| Shop detail | `GET /api/v1/shops/:slug` | ⚠️ Blocked | store-service down (502) |
| Shop products | `GET /api/v1/shops/:slug/products` | ⚠️ Blocked | store-service down (502) |
| Cart | `GET /api/v1/carts/me` | ✅ Available | Needs JWT |
| Add to cart | `POST /api/v1/carts/me/items` | ✅ Available | Needs JWT |
| Update cart item | `PATCH /api/v1/carts/me/items/:itemId` | ✅ Available | Needs JWT |
| Remove cart item | `DELETE /api/v1/carts/me/items/:itemId` | ✅ Available | Needs JWT |
| Checkout | `POST /api/v1/orders/checkout` | ✅ Available | Needs JWT |
| Order list | `GET /api/v1/orders/me` | ✅ Available | Needs JWT |
| Order detail | `GET /api/v1/orders/:id` | ✅ Available | Needs JWT |
| Cancel order | `PATCH /api/v1/orders/:id/cancel` | ✅ Available | Needs JWT |
| Profile | None | ❌ Missing | No buyer profile API |
| Addresses | None | ❌ Missing | No buyer address API |

**Proxy behavior**: API gateway forwards all requests to downstream services. If store-service is down, shop endpoints return 502. These will show error states.

---

## 6. API Client Files to Create

```
my-app/lib/marketplace/
  product-api.ts     — fetchProducts, fetchProductDetail, fetchCategories
  shop-api.ts        — fetchShops, fetchShopDetail, fetchShopProducts
  cart-api.ts        — fetchMyCart, addCartItem, updateCartItem, removeCartItem
  order-api.ts       — checkout, fetchMyOrders, fetchOrderDetail, cancelOrder
  profile-api.ts     — fetchMyProfile (stub), fetchMyAddresses (stub)
  auth-api.ts        — login (buyer), getTokenFromCookie
```

All clients will:
- Use `NEXT_PUBLIC_API_BASE_URL` or `/api/v1` (relative, via gateway)
- Throw typed errors on failure
- NOT fake data
- Accept optional JWT token from cookie

---

## 7. Files to Create

### Pages (`my-app/app/marketplace/`)

```
(marketplace)/
  layout.tsx                    — MarketplaceShell wrapper
  page.tsx                      — Homepage
  products/
    page.tsx                    — Product listing
    [slug]/
      page.tsx                  — Product detail
  shops/
    page.tsx                    — Shop listing
    [slug]/
      page.tsx                  — Shop detail
  cart/
    page.tsx                    — Cart page
  checkout/
    page.tsx                    — Checkout page
  orders/
    page.tsx                    — Order history
    [id]/
      page.tsx                  — Order detail
  profile/
    page.tsx                    — Profile page (shell only)
  addresses/
    page.tsx                    — Addresses page (shell only)
```

### Components (`my-app/components/marketplace/`)

```
MarketplaceShell.tsx
MarketplaceHeader.tsx
MarketplaceSearchBar.tsx
MarketplaceNav.tsx
MarketplaceFooter.tsx
ProductCard.tsx
ProductGrid.tsx
ShopCard.tsx
CategoryPill.tsx
PriceText.tsx
QuantityStepper.tsx
CartShopGroup.tsx
CheckoutSummary.tsx
OrderStatusBadge.tsx
AddressForm.tsx
MarketplaceEmptyState.tsx
MarketplaceErrorState.tsx
MarketplaceLoadingState.tsx
index.ts                        — barrel export
```

### API Clients (`my-app/lib/marketplace/`)

```
product-api.ts
shop-api.ts
cart-api.ts
order-api.ts
profile-api.ts
auth-api.ts
index.ts
```

---

## 8. Files to Modify

| File | Change |
|------|--------|
| `my-app/app/layout.tsx` | Add link to `/marketplace` in main nav (optional, keep existing nav) |
| `my-app/app/globals.css` | Add `.orange-*` utility classes if needed (minimal change) |
| `my-app/next.config.ts` | No change expected |

---

## 9. Out of Scope

- Seller Center UI (`/seller`)
- Admin Console UI (`/admin`)
- Review/rating system
- Push notifications
- Commission/settlement/refund pages
- Backend schema changes
- Fake data to simulate missing APIs
- Mobile app

---

## 10. Implementation Order

1. Create API clients (`lib/marketplace/`)
2. Create shared components (`components/marketplace/`)
3. Create `MarketplaceShell` and `MarketplaceHeader` layout
4. Implement `/marketplace` homepage
5. Implement `/marketplace/products` + `/marketplace/products/[slug]`
6. Implement `/marketplace/shops` + `/marketplace/shops/[slug]`
7. Implement `/marketplace/cart`
8. Implement `/marketplace/checkout`
9. Implement `/marketplace/orders` + `/marketplace/orders/[id]`
10. Implement `/marketplace/profile` + `/marketplace/addresses` (shells)
11. Build check + runtime test
12. Document in Phase 6 output docs
