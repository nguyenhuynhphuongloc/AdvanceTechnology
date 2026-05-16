## Why

The public storefront and admin UI are now connected to more real backend data, but the user experience remains inconsistent and operationally weak. Store pages use mixed visual directions, product imagery can crop incorrectly, variant selection is not communicated clearly, cart and checkout flows feel fragile, and admin pages lack a coherent management shell.

Navigation also feels slow because stable catalog/settings data is fetched without caching, admin tables load broad result sets without a consistent pagination/filter model, and loading/empty/error states are inconsistent.

## What Changes

- Redesign the public storefront around a modern ecommerce information architecture for home, catalog, product detail, cart, checkout, account, and orders.
- Redesign the admin experience around a structured management shell with sidebar, topbar, breadcrumbs, data tables, drawers/modals, toasts, confirmation dialogs, and route-aware navigation.
- Standardize reusable UI primitives for images, cards, buttons, inputs, tables, badges, dialogs, skeletons, empty states, and error states.
- Correct product image treatment so product cards, galleries, cart items, admin product rows, and media assets use stable frames, non-distorting image fit, fallbacks, and loading placeholders.
- Make color/variant selection on product detail update the active image and purchase state predictably.
- Rework cart and checkout UX so checkout eligibility, guest redirects, order review, payment, validation, and errors are clear.
- Move Cloudinary/media management fully into the Admin information architecture and keep public routes focused on catalog data.
- Improve perceived and actual navigation performance through caching, pagination, debounced search, route prefetching, lazy image loading, and public/admin layout separation.

## Capabilities

### New Capabilities

- `storefront-ux-redesign`: Defines modern ecommerce UX, layout, responsive behavior, product imagery, variant selection, cart, and checkout requirements for public storefront pages.
- `admin-ux-redesign`: Defines the redesigned admin shell, navigation structure, data table behavior, media library placement, dashboard, products, orders, users, carts, and store settings UX.
- `ui-performance-ux`: Defines performance-facing UX requirements for route transitions, loading states, caching, pagination, search debouncing, and image loading.

### Modified Capabilities

- Existing storefront catalog/cart/admin dashboard implementations will be updated during implementation, but this proposal introduces a new UX-level capability layer instead of changing service ownership.

## Impact

- Frontend public routes under `my-app/app`, especially `/`, `/search`, `/product/[slug]`, `/product/cart`, `/product/checkout`, account, and orders pages.
- Admin routes under `my-app/app/admin` and admin components under `my-app/components/admin`.
- Shared UI/style layer under `my-app/app/globals.css`, storefront components, admin components, and frontend API helpers where caching/pagination/query behavior affects UX.
- Existing gateway/product/order/auth/cart/payment APIs should remain intact. Backend changes are only expected if a required filter, pagination, status, or settings field is missing from current contracts.

## Non-Goals

- Do not copy source code from referenced open-source ecommerce/admin projects.
- Do not replace the microservice architecture or break existing API/data flow.
- Do not introduce fake product/order/user/media data to make the UI look complete.
- Do not create testing folders or `Document_Testing` artifacts as part of this change.
- Do not implement the redesign in this planning change; implementation should happen after this proposal is reviewed and accepted.
