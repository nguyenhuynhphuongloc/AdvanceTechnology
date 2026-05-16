## Why

The public storefront currently mixes multiple shells, duplicated navigation, and inconsistent dark-theme implementations across `/`, `/search`, `/product`, and legacy `/products` routes. The shopping flow already persists cart state for guests in `localStorage`, but the UI still blocks add-to-cart and cart access behind the mock auth layer, while several storefront labels still contain non-English and broken-encoding text.

## What Changes

- Unify public storefront pages around one reusable black-themed shell with shared header, footer, spacing, cards, buttons, and form controls.
- Keep `/product` and `/product/[slug]` as the canonical catalog routes and preserve `/products` routes only as compatibility redirects.
- Introduce a typed storefront branding config so the logo and store name are configurable without hardcoding them into header components.
- Add a real product-detail add-to-cart flow that uses the live catalog payload, supports variant selection, and writes the selected item into the existing client cart.
- Remove login-required gating from add-to-cart and cart access so guests can browse and purchase using the current local cart persistence mechanism.
- Standardize public-facing storefront copy to English and remove broken-encoding strings from shopping and catalog UI surfaces.

## Capabilities

### New Capabilities
- `storefront-shell`: Shared public storefront shell, branding configuration, canonical navigation, and unified black theme requirements for home, catalog, detail, search, and cart pages.
- `storefront-guest-cart`: Guest-capable cart interactions for public storefront pages, including detail-page add-to-cart, cart persistence, and English-only shopping UI copy.

### Modified Capabilities

## Impact

- Affected frontend code under `my-app/app`, `my-app/components`, `my-app/lib/products`, and `my-app/lib/shopping`
- Existing local cart/auth client contexts and public route layout behavior
- Legacy compatibility routing for `/products` and `/products/[slug]`
- Shared styling in `my-app/app/globals.css`
