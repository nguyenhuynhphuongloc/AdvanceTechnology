# New Change: `unify-storefront-shell-and-guest-cart`

## Summary

Create a new umbrella OpenSpec change at `openspec/changes/unify-storefront-shell-and-guest-cart/` that supersedes the currently fragmented storefront work. The proposal should frame the root problem as three coupled issues already visible in the repo: duplicated public storefront shells (`/`, `/search`, `/product`, `/products`), mixed dark-theme implementations with inconsistent components, and a shopping flow that already persists guest cart state in `localStorage` but still blocks add-to-cart and cart access behind the mock auth layer.

This change should standardize the public storefront around the existing Next.js architecture, keep `/product` and `/product/[slug]` as the canonical catalog routes, treat `/products` as compatibility-only, and make the public UI consistently English. It should also introduce one reusable storefront header with configurable brand/logo data from a temporary frontend config source that can later be swapped to backend settings without changing component contracts.

## Artifact Content

### `proposal.md`
Write the proposal around these points:

- Why:
  - Public storefront pages currently look like different systems.
  - Header/navigation is duplicated and inconsistent.
  - Product detail lacks the same shopping affordances and visual system as the main catalog.
  - Guest cart is partially implemented in state persistence but blocked in the UI by auth redirects.
  - Several storefront labels still contain Vietnamese text and broken encoding.
- What changes:
  - Unify all public pages on one black storefront theme.
  - Reuse one shared header across home, catalog, detail, cart, and search.
  - Keep `/product` as canonical public catalog, with `/products` preserved only for compatibility.
  - Remove login-required gating from add-to-cart and cart access for guests.
  - Standardize all public-facing UI copy to English.
  - Add temporary configurable storefront branding source.
- Impact:
  - Frontend only by default, with no backend dependency required for guest cart beyond existing client persistence.
  - Existing overlapping storefront changes should be treated as absorbed by this umbrella change rather than implemented independently.

### `design.md`
Lock these implementation decisions:

- Shared storefront shell:
  - Introduce a reusable storefront layout/header layer used by `/`, `/search`, `/product`, `/product/[slug]`, and `/product/cart`.
  - Consolidate dark theme tokens into the current global styling layer instead of adding a new design dependency.
- Canonical routes:
  - `/product` and `/product/[slug]` remain canonical.
  - `/products` and `/products/[slug]` become redirects or thin compatibility wrappers.
- Branding config:
  - Add a small typed frontend config module for `brandName`, `logoText` or `logoAsset`, and primary nav links.
  - Keep the config local to the storefront app so it can later be replaced by backend settings without changing header consumers.
- Guest cart behavior:
  - Keep the existing `localStorage` cart persistence mechanism as the supported guest-cart path.
  - Remove auth checks from add-to-cart actions and from the cart page gate.
  - Preserve logged-in behavior if the local auth context is present, but do not require it for cart usage.
- Product detail behavior:
  - Add a real add-to-cart control on `/product/[slug]`.
  - Define a mapping from live catalog/detail DTOs into the cart item shape currently expected by the shopping cart context.
  - Support variant selection in the UI when variants exist; if the cart model cannot yet persist selected variant metadata cleanly, store the chosen variant identifier in the cart item as part of this change.
- English-only copy:
  - Replace hardcoded Vietnamese labels and any mojibake text in storefront components, cart/account chrome, buttons, empty states, and aria labels.
- Public interfaces/types to add or update:
  - A typed storefront config object for brand/header settings.
  - A shared storefront header component contract usable from both server and client-rendered pages.
  - Cart item typing extended as needed to carry product slug, image, category, and selected variant information from live catalog data.

### `tasks.md`
Generate implementation tasks in this order:

1. Audit the current public storefront routes/components and list every duplicated header, mixed theme surface, and non-English storefront string.
2. Create the shared storefront branding/config source and reusable header/layout primitives.
3. Centralize the black-theme tokens and refactor shared buttons, cards, inputs, and nav treatments to consume them.
4. Apply the shared shell to `/`, `/search`, `/product`, `/product/[slug]`, and `/product/cart`.
5. Make `/product` the canonical public catalog route and convert `/products` routes to compatibility redirects or wrappers.
6. Add product-detail add-to-cart with variant selection support wired to the existing cart context.
7. Remove auth gating from add-to-cart and cart access while preserving logged-in compatibility.
8. Standardize all public storefront copy and accessibility labels to English.
9. Verify route flow, guest-cart persistence, logged-in cart behavior, and visual consistency across all public pages.
10. Document any backend follow-up items only if a real gap is discovered during implementation.

## Test Plan

Include these acceptance scenarios in the change:

- Guest user can add a product from `/product` or `/product/[slug]` and see it in `/product/cart` without logging in.
- Guest cart survives page refresh through the current local persistence path.
- Logged-in user still sees correct account/cart chrome and cart interactions continue to work.
- Home, catalog, detail, cart, and search share the same header, dark palette, spacing, button treatment, and card style.
- Product detail shows image gallery, name, price, description, variant options, and add-to-cart control.
- All public-facing labels are English and no broken-encoding text remains.
- Internal navigation consistently points to canonical `/product` routes while legacy `/products` URLs still resolve safely.
- Search and browse pages stay on the live catalog data path and do not regress to mock catalog behavior.

## Assumptions

- Use a new change rather than extending the existing storefront changes.
- Treat this as the umbrella storefront change; overlapping earlier storefront proposals should not be implemented separately afterward without reconciliation.
- Keep the existing tech stack, Tailwind/global CSS mix, local auth context, and localStorage cart mechanism.
- Do not invent a backend settings API in this change; the branding source is a frontend adapter designed for later backend wiring.
- Do not redesign admin pages or broader authentication beyond removing storefront guest-cart blockers.
