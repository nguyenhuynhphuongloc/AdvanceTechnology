## 1. OpenSpec And Storefront Audit

- [x] 1.1 Create the `unify-storefront-shell-and-guest-cart` OpenSpec change and capture proposal, design, and spec requirements for shared shell and guest-cart behavior
- [x] 1.2 Audit the current public storefront routes and components to identify duplicated headers, mixed theme surfaces, and non-English or broken-encoding storefront strings

## 2. Shared Storefront Shell

- [x] 2.1 Add a typed storefront branding configuration source for brand name, logo text, and primary navigation links
- [x] 2.2 Create reusable shared storefront header and footer components that can be applied across home, search, product listing, detail, and cart pages
- [x] 2.3 Centralize any remaining black-theme shell styles and shared interactive treatments in the existing global styling layer

## 3. Canonical Catalog And Guest Cart

- [x] 3.1 Refactor the client cart model to accept live catalog product snapshots and preserve optional selected variant metadata
- [x] 3.2 Add product-detail add-to-cart with variant selection support using the live catalog payload and shared cart context
- [x] 3.3 Remove auth gating from add-to-cart and cart-page access while preserving existing local account behavior for logged-in users
- [x] 3.4 Keep `/product` canonical and ensure `/products` routes remain compatibility-only wrappers or redirects

## 4. Public UI Standardization

- [x] 4.1 Apply the shared storefront shell across `/`, `/search`, `/product`, `/product/[slug]`, and `/product/cart`
- [x] 4.2 Replace non-English or broken-encoding public storefront copy with English labels, messages, and aria text
- [x] 4.3 Verify guest-cart persistence, logged-in shopping chrome, route compatibility, and consistent public theme behavior across the affected pages
