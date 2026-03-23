## 1. Storefront Theme Foundation

- [x] 1.1 Audit existing public storefront routes and shared components under `my-app/app` and `my-app/components` to identify conflicting palettes, duplicated surface styles, and legacy light-themed sections
- [x] 1.2 Centralize shared dark storefront theme tokens and reusable surface styles in the most suitable existing styling layer such as `my-app/app/globals.css`
- [x] 1.3 Refactor shared storefront components such as catalog headers, cards, grids, filters, buttons, and form controls to consume the centralized theme tokens

## 2. Public Page Theme Unification

- [x] 2.1 Update the public home routes (`/` and `/HomePage` if retained) to use the shared storefront theme and remove conflicting demo presentation patterns
- [x] 2.2 Align `/products` and `/products/[slug]` with the same shared storefront layout, empty states, and error/loading treatments without breaking existing real-data flows
- [x] 2.3 Review any existing public-facing forms, shared layout elements, and discovery sidebars so they follow the same dark premium storefront theme

## 3. Database-Backed Product Discovery

- [x] 3.1 Replace `/search` mock data usage with the existing gateway-backed catalog client and normalize URL query params for search, category or collection, sorting, and pagination
- [x] 3.2 Refactor search-specific components to render real catalog results, database-backed product imagery, and consistent loading, empty, and error states
- [x] 3.3 Inspect the current `product-service` and gateway contract during implementation and add only the minimal backend changes required if an actual search or listing gap is found
- [x] 3.4 Remove or isolate obsolete storefront mock-product dependencies once the real discovery flow is in place

## 4. Verification

- [x] 4.1 Verify end-to-end product list, product detail, and search flows through frontend -> API gateway -> product-service -> database using existing seeded or sample catalog data
- [x] 4.2 Run the relevant frontend build/tests and backend tests or practical checks for affected catalog routes, then fix any regressions introduced by the theme or search refactor
- [x] 4.3 Document any required env changes, route behavior updates, and implementation notes needed for the unified storefront theme and live discovery flow
