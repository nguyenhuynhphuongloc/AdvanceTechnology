## Context

The current Next.js storefront has two overlapping public catalog implementations:

- `my-app/app/products/page.tsx` is the live, gateway-backed listing page. It uses `fetchProducts` from `my-app/lib/products/api.ts`, maps product cards with `toStorefrontProduct`, and links cards to `/products/[slug]`.
- `my-app/app/products/[slug]/page.tsx` is the live detail page and already consumes `GET /api/v1/products/:slug` plus `/related`.
- `my-app/app/product/page.tsx` is a second listing experience with the visual direction the user wants to keep, but it uses a separate shopping component stack and currently falls back to `my-app/lib/shopping/data.ts` when the live API request fails.
- Product-page styling is split between shared storefront tokens in `my-app/app/globals.css`, inline styles in the `/products` route family, and Tailwind-heavy shopping components under `my-app/components/shopping`.

This change is cross-cutting because it affects route ownership, navigation, styling integration, card/detail linking, and the frontend's contract with the existing API gateway and `product-service`. The backend catalog API already supports the needed listing and detail operations, so the main problem is frontend duplication and route ambiguity rather than missing service capability.

## Goals / Non-Goals

**Goals:**
- Make `/product` the canonical storefront listing route and `/product/[slug]` the canonical product detail route.
- Preserve the current `/product` page as the primary visual reference, including Cart, Login, Logout, and the general shopping-oriented header behavior.
- Reuse the working live catalog flow from the `/products` implementation for listing, filtering, sorting, pagination, and detail navigation.
- Remove mock/sample-data fallback behavior from the public product browsing path so catalog data always comes from `my-app` -> API gateway -> `product-service` -> database.
- Resolve duplicate or conflicting links so nav items, product cards, redirects, and related-product surfaces point to one route family.

**Non-Goals:**
- Redesigning the admin pages or changing admin product APIs.
- Replacing the existing cart or local auth experience under `/product/cart` and `/product/account`.
- Introducing a new frontend dependency, state library, or design system.
- Redesigning `product-service` or the API gateway unless implementation uncovers a concrete catalog-contract gap.

## Decisions

### 1. Canonical public catalog routes will move to the `/product` namespace
The storefront will use `/product` for listing and `/product/[slug]` for detail. Existing `/product/cart` and `/product/account` pages remain in place so the shopping flow stays grouped under one namespace.

Why:
- The user explicitly wants the `product` page kept as the design reference and primary browsing page.
- Keeping catalog, account, and cart under one route family reduces naming ambiguity and aligns navigation with the existing shopping chrome.

Alternative considered:
- Keep `/products` as the canonical listing route and restyle it to match `/product`. Rejected because the user wants `product` to remain the reference surface, not an alias to the older route family.

### 2. `/products` will become a compatibility route, not a second active catalog surface
The legacy `/products` listing route should redirect to `/product`, and legacy `/products/[slug]` requests should redirect to `/product/[slug]`. This preserves existing bookmarks and avoids two live route families competing for the same responsibility.

Why:
- Removing duplicate entry points prevents future regressions where one path gets updated and the other drifts.
- Redirects give a clean migration path with minimal user disruption.

Alternative considered:
- Keep both route families active with shared components. Rejected because it preserves the root ambiguity this change is meant to remove.

### 3. The canonical `/product` listing will reuse the live catalog client and query contract from `/products`
The implementation should move the live fetch path, query normalization, card mapping, and catalog controls into shared helpers or reusable components, then render those inside the `/product` visual shell.

Why:
- `my-app/app/products/page.tsx` already proves the real API flow works end-to-end.
- Reusing those parts is lower risk than trying to evolve the local-data shopping stack into a separate data layer.

Alternative considered:
- Keep the current `/product` fetch function and only remove its fallback data. Rejected because it still duplicates query mapping, product shaping, and list rendering logic already working elsewhere.

### 4. Public product browsing must fail visibly instead of silently using local sample data
If the live catalog request fails, the listing page should show a consistent error state rather than substituting `my-app/lib/shopping/data.ts` sample products. Local sample data may remain only if still needed for isolated demos or tests outside the public browsing flow.

Why:
- The user explicitly requires the storefront to use the real database path and not present hardcoded fallback catalog content.
- Silent fallback hides integration failures and makes debugging harder.

Alternative considered:
- Keep local fallback as a resilience mechanism. Rejected because it breaks the source-of-truth contract for the storefront.

### 5. Styling should preserve the `/product` visual identity while consolidating reusable product-discovery pieces
The page-level layout and shopping-specific header behavior from `/product` should remain the design anchor, but product cards, empty/error states, and other catalog UI pieces should be unified where that reduces duplication. Shared CSS should continue to live primarily in `my-app/app/globals.css`, with Tailwind utility usage retained where it already fits the `product` page structure.

Why:
- The user wants the `product` page look and controls preserved.
- A full visual rewrite would add risk without solving the actual route/data problem.

Alternative considered:
- Rebuild the `product` page entirely with the `/products` component tree. Rejected because it would likely lose the preferred design language and shopping actions.

## Risks / Trade-offs

- [Legacy links to `/products` may still exist in components, docs, or bookmarks] -> Mitigation: add redirects, then update all known internal links and navigation to the canonical `/product` routes.
- [Shopping components currently use a different product shape than the live catalog cards] -> Mitigation: introduce a shared mapping layer and only keep shape-specific adapters where cart behavior truly requires them.
- [Removing local fallback may expose backend outages more visibly] -> Mitigation: provide a clear error state with actionable copy instead of silent mock substitution.
- [Moving detail pages to `/product/[slug]` can break assumptions in card links and related-product sections] -> Mitigation: centralize route generation and update product cards, breadcrumbs, and related links together.
- [Styling comes from both global storefront tokens and Tailwind-heavy shopping components] -> Mitigation: preserve the `product` layout first, then selectively merge shared catalog UI styles instead of forcing one styling approach everywhere.

## Migration Plan

1. Extract or reuse shared catalog helpers for query parsing, live product fetching, and product-card route generation.
2. Refactor `my-app/app/product/page.tsx` to use the live catalog flow without local fallback data, while preserving its visual shell and action buttons.
3. Introduce `my-app/app/product/[slug]/page.tsx` using the existing live detail data flow and update product cards to link there.
4. Convert `my-app/app/products/page.tsx` and `my-app/app/products/[slug]/page.tsx` into redirects or clean compatibility wrappers to the canonical `/product` routes.
5. Update navbar, header, footer, search, cart/account back-links, and any hardcoded hrefs that still point to the legacy route family.
6. Verify the end-to-end data flow through API gateway -> `product-service` -> database, plus listing/detail navigation and failure states.

## Open Questions

- Whether the canonical detail route should support every current `/products` query-param behavior on redirect, or only slug-based navigation.
- Whether any part of `my-app/lib/shopping/data.ts` is still needed after catalog browsing stops using it, or if it can be removed in the same implementation change.
