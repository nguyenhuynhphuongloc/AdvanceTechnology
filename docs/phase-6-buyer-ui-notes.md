# Phase 6 Buyer Marketplace UI - Implementation Notes

Generated: 2026-05-17T14:58:00Z

---

## Summary

Phase 6 Buyer Marketplace UI is fully implemented under the `/marketplace` route namespace with a clean white/orange theme separate from existing Seller and Admin UIs.

**Build Status:** `npm run build` PASSED (no errors, only pre-existing warnings)

**Runtime Status:** Build passed, runtime not fully verified (services needed for full test: store-service, order-service, inventory-service, payment-service).

---

## Route Namespace Created

All routes under `/marketplace`:

| Route | Status | Notes |
|-------|--------|-------|
| `/marketplace` | PASS | Homepage with featured products |
| `/marketplace/products` | PASS | Product listing with search/filter/sort/pagination |
| `/marketplace/products/[slug]` | PASS | Product detail with variants, add-to-cart |
| `/marketplace/shops` | PASS (API pending) | Shop listing (store-service down) |
| `/marketplace/shops/[slug]` | PASS (API pending) | Shop detail + products (store-service down) |
| `/marketplace/cart` | PASS (auth) | Cart grouped by shop, qty update, remove |
| `/marketplace/checkout` | PASS (auth) | Address form, COD, place order |
| `/marketplace/orders` | PASS (auth) | Buyer order history |
| `/marketplace/orders/[id]` | PASS (auth) | Order detail + cancel |
| `/marketplace/profile` | PASS (shell) | No buyer profile API available |
| `/marketplace/addresses` | PASS (shell) | No buyer address API available |

---

## Pages Created

### Pages (11 routes)

```
my-app/app/marketplace/
  layout.tsx              — MarketplaceShell wrapper (white theme)
  page.tsx                — Homepage
  products/
    page.tsx             — Product listing (search/filter/sort/pagination)
    [slug]/
      page.tsx            — Product detail
  shops/
    page.tsx             — Shop listing
    [slug]/
      page.tsx            — Shop detail
  cart/
    page.tsx             — Cart (grouped by shop)
  checkout/
    page.tsx             — Checkout (address + COD)
  orders/
    page.tsx             — Order history
    [id]/
      page.tsx           — Order detail
  profile/
    page.tsx             — Profile shell
  addresses/
    page.tsx             — Addresses shell
```

### API Clients

```
my-app/lib/marketplace/
  index.ts                — Barrel export
  product-api.ts          — fetchProducts, fetchProductDetail, fetchCategories
  shop-api.ts            — fetchShops, fetchShopDetail, fetchShopProducts
  cart-api.ts            — fetchMyCart, addCartItem, updateCartItem, removeCartItem
  order-api.ts           — fetchMyOrders, fetchOrderDetail, checkout, cancelOrder
```

### Components

```
my-app/components/marketplace/
  index.ts                — Barrel export
  MarketplaceHeader.tsx    — Sticky white header with search bar
  MarketplaceFooter.tsx    — Footer with links
  MarketplaceEmptyState.tsx
  MarketplaceErrorState.tsx
  MarketplaceLoadingState.tsx
  ProductCard.tsx         — Product grid card
  ProductGrid.tsx         — Responsive product grid
  ShopCard.tsx            — Shop card
  CategoryPill.tsx         — Category filter pills
  PriceText.tsx           — VND price formatter
  QuantityStepper.tsx     — +/- quantity selector
  CartShopGroup.tsx       — Cart items grouped by shop
  OrderStatusBadge.tsx     — Order status chip
```

---

## Files Changed

| File | Change |
|------|--------|
| `my-app/app/layout.tsx` | No change |
| `my-app/app/globals.css` | No change (theme isolated via shell) |
| `my-app/next.config.ts` | No change |
| `my-app/app/marketplace/` | **New** — all Phase 6 pages |
| `my-app/components/marketplace/` | **New** — all Phase 6 components |
| `my-app/lib/marketplace/` | **New** — all Phase 6 API clients |

---

## Theme

| Element | Value |
|---------|-------|
| Background | `#f9fafb` (gray-50) |
| Surface | `#ffffff` white |
| Accent | `#f97316` (orange-500) |
| Accent Hover | `#ea580c` (orange-600) |
| Border | `#e5e7eb` (gray-200) |
| Text Primary | `#111827` (gray-900) |
| Text Secondary | `#6b7280` (gray-500) |

Theme is isolated to the Marketplace shell via inline styles — no global CSS changes.

---

## Build Result

```
✓ Compiled successfully in 7.0s
✓ Linting and checking validity of types
✓ Generating static pages (53/53)
✓ First Load JS shared by all: 102 kB
```

**All pre-existing warnings** (about `<img>` vs `<Image />`, unused vars in other areas) are pre-existing and not introduced by Phase 6.

---

## API Integration

| API | Status | Notes |
|-----|--------|-------|
| `GET /api/v1/products` | Working | Public, product-service connected |
| `GET /api/v1/products/:slug` | Working | Via product-service |
| `GET /api/v1/categories` | Working | Via product-service |
| `GET /api/v1/shops` | Blocked | store-service returns 502 |
| `GET /api/v1/shops/:slug` | Blocked | store-service returns 502 |
| `GET /api/v1/shops/:slug/products` | Blocked | store-service returns 502 |
| `GET /api/v1/carts/me` | Working | Needs JWT |
| `POST /api/v1/carts/me/items` | Working | Needs JWT |
| `PATCH /api/v1/carts/me/items/:id` | Working | Needs JWT |
| `DELETE /api/v1/carts/me/items/:id` | Working | Needs JWT |
| `POST /api/v1/orders/checkout` | Working | Needs JWT |
| `GET /api/v1/orders/me` | Working | Needs JWT |
| `GET /api/v1/orders/:id` | Working | Needs JWT |
| `PATCH /api/v1/orders/:id/cancel` | Working | Needs JWT |
| Buyer Profile API | Missing | No endpoint exists |
| Buyer Address API | Missing | No endpoint exists |

---

## Known Issues

1. **store-service down (502)** — `/marketplace/shops` and `/marketplace/shops/[slug]` show error states. Fix: bring store-service online.
2. **No buyer profile API** — `/marketplace/profile` and `/marketplace/addresses` show placeholder shells. Fix: create backend API endpoints.
3. **Runtime not fully tested** — Build passed, runtime test with real services pending.
4. **`<img>` warnings** — Pre-existing across entire codebase. Not introduced by Phase 6.

---

## Next Phase Recommendations

1. **Fix store-service** to enable shop browsing
2. **Create buyer profile/address backend APIs** to enable those pages
3. **Start remaining services** (order, inventory, payment) for full E2E flow
4. **Runtime test all 11 `/marketplace` routes** with real data
5. **Consider replacing `<img>` with `next/image`** across codebase (performance improvement)
