## Context

The current repository already has a working dark visual direction on the root landing page, `/products`, and `/products/[slug]`, but the storefront is not consistent across public surfaces. `/HomePage` is still a separate light-themed page with hardcoded demo content, and `/search` is a client-only mock flow built on `mockProducts`, Ant Design widgets, and custom query logic that bypasses the real product catalog APIs. The frontend already has a gateway-aware catalog client in `my-app/lib/products/api.ts`, and the backend already exposes `GET /api/v1/products` and `GET /api/v1/products/:slug` through the API gateway and `product-service`.

This change is cross-cutting because it touches public UI theming, shared storefront components, search/listing behavior, and potentially small backend contract adjustments if implementation exposes a real gap. The existing product-service remains the source of truth for catalog data, while inventory-service does not currently expose a storefront-oriented aggregate stock API for product cards or detail pages.

## Goals / Non-Goals

**Goals:**
- Centralize a shared dark storefront theme system for existing public pages and reusable storefront components.
- Move `/search` off mock data and onto the existing product catalog flow through `my-app` -> API gateway -> `product-service`.
- Keep `/products` and `/products/[slug]` on real data while aligning them visually and structurally with the same shared storefront patterns.
- Preserve current microservice ownership boundaries and avoid bypassing the gateway or database-backed services.
- Provide loading, empty, and error states that are consistent across product listing and search experiences.

**Non-Goals:**
- Redesigning the admin console to match the public storefront theme.
- Introducing a new frontend state management library or design system dependency.
- Building a new customer auth flow or new customer cart UI if those user-facing pages are not already present.
- Adding a new storefront stock aggregation service unless an existing API can support it with minimal extension.

## Decisions

### 1. Centralize public storefront styling with shared theme tokens in the existing Next.js app
The implementation should consolidate repeated colors, backgrounds, borders, spacing accents, and surface patterns into `my-app/app/globals.css` and shared storefront styling primitives instead of continuing to duplicate page-local inline style values.

Why:
- The public UI already repeats a dark palette and glass/surface patterns, but each page defines them ad hoc.
- Global theme tokens are the lowest-complexity way to unify pages in the current stack without introducing new libraries.

Alternative considered:
- Leave styling inline and only "match visually" page by page. Rejected because it keeps drift and duplicated values.

### 2. Reuse and refactor current catalog/search components instead of building a parallel storefront
The change should evolve current components such as `ProductGrid`, `ProductCard`, `ProductCatalogHeader`, and search layout pieces into a single storefront language where possible.

Why:
- The repo already has reusable catalog and search components.
- Refactoring the existing surfaces reduces implementation risk and preserves route behavior.

Alternative considered:
- Replace the current storefront with a new page/component set. Rejected because it discards useful working parts and increases regression risk.

### 3. Use the existing product-service listing endpoint as the primary search backend
The search page should call the existing `GET /api/v1/products` endpoint through the frontend catalog client using shareable query params instead of maintaining a separate mock search stack.

Why:
- The product-service already supports `page`, `limit`, `category`, `search`, and `sort`.
- Using one listing endpoint keeps listing and search semantics aligned and avoids inventing an unnecessary parallel API.

Alternative considered:
- Add a dedicated search endpoint immediately. Rejected unless implementation discovers a concrete API gap that the listing endpoint cannot cover cleanly.

### 4. Treat storefront inventory visibility as conditional, not foundational
The change should only expose stock-aware product states if existing inventory contracts can support them through the current architecture with low complexity.

Why:
- Inventory-service currently exposes admin search and per-variant lookup, but not a storefront-ready aggregate product stock contract.
- Forcing stock-aware cards into this change would likely require extra cross-service aggregation that is outside the minimal, maintainable scope.

Alternative considered:
- Add a new product+inventory aggregation flow immediately. Rejected for proposal scope; it can be a follow-up if the storefront explicitly needs public stock signals.

### 5. Keep backend changes minimal and contract-driven
Implementation may adjust DTOs or add small product-service enhancements only if required to support real search/listing UX, but the default assumption is to consume the existing gateway-backed catalog APIs.

Why:
- The objective is to unify and wire the storefront to the current architecture, not redesign backend ownership.
- Minimal backend changes reduce risk across the microservice system.

Alternative considered:
- Create a frontend-only workaround layer with duplicated search logic. Rejected because it preserves divergence from the database-backed source of truth.

## Risks / Trade-offs

- [Theme refactor touches many pages and components] -> Mitigation: centralize tokens first, then update public routes incrementally around shared primitives.
- [Search migration may expose mismatch between current `collection` query params and backend `category` filters] -> Mitigation: normalize query params in the frontend client and only extend backend filtering if normalization is insufficient.
- [Public pages currently mix server and client component patterns] -> Mitigation: keep data fetching on server components where already working, and confine client interactivity to components that truly need browser state.
- [Legacy `/HomePage` route may remain structurally different from `/`] -> Mitigation: explicitly define whether it is brought into the shared theme system or reduced to a thin variant over shared storefront sections.
- [Inventory-aware UX may be requested during implementation] -> Mitigation: treat it as optional unless an existing contract supports it cleanly; otherwise leave it documented as follow-up work.
