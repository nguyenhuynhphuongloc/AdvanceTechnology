## Context

The current Next.js storefront has converged partway toward a unified catalog flow, but the public experience still spans two component families. `ProductCatalogHeader`, `ShoppingHeader`, and cart/account chrome duplicate branding and navigation; public pages share some dark-theme tokens but still mix inline styling, route-specific layouts, and inconsistent interaction patterns. The cart is already persisted in `localStorage`, yet both the old shopping card flow and the cart page still assume authentication should gate shopping. Product detail pages use live API data but currently stop short of exposing a real add-to-cart interaction wired into the cart context.

This change is frontend-heavy and cross-cutting because it touches route layout, reusable storefront components, shopping state typing, and compatibility behavior between the canonical `/product` flow and legacy `/products` URLs. The existing product-service and gateway contracts are sufficient for the current scope, so the implementation should stay inside the Next.js app unless a real backend gap appears during wiring.

## Goals / Non-Goals

**Goals:**
- Introduce a reusable storefront shell/header layer for `/`, `/search`, `/product`, `/product/[slug]`, and `/product/cart`.
- Centralize black-theme tokens in the current global styling layer and reuse them across public storefront surfaces.
- Keep `/product` and `/product/[slug]` as canonical public catalog routes while preserving safe compatibility for `/products`.
- Add detail-page add-to-cart wired to the existing client cart and support variant selection when variants exist.
- Remove login gating from guest cart interactions while preserving the local auth experience where it already exists.
- Standardize public storefront UI copy in English and remove mojibake strings.

**Non-Goals:**
- Redesigning admin pages or admin auth.
- Introducing a backend settings API for storefront branding.
- Replacing the current local auth/cart architecture with a server-side cart system.
- Adding new backend product or inventory APIs unless implementation proves they are necessary.

## Decisions

### 1. Use one configurable storefront shell for all public pages
Create a typed storefront config module that exposes brand name, logo text, and primary navigation metadata, then reuse one shared header/footer/shell layer across public storefront routes.

Why:
- Branding and primary navigation are currently duplicated in multiple headers and the cart page.
- A typed config keeps the header reusable now and easy to connect to future backend settings later.

Alternative considered:
- Leave separate `ShoppingHeader` and `ProductCatalogHeader` components in place and only align their styling. Rejected because it preserves duplication and drift.

### 2. Expand the cart item model to support live catalog snapshots
Refactor the cart context away from the old mock product type so cart items can store a product snapshot with string IDs, slug, image, category, and optional selected variant metadata.

Why:
- Live catalog/detail APIs use string IDs and expose variant data that the current numeric mock-product cart shape cannot represent cleanly.
- One shared cart snapshot type allows both legacy shopping cards and live detail pages to add items consistently.

Alternative considered:
- Keep the current mock product shape and coerce live products into it ad hoc. Rejected because it loses slug/variant data and keeps the cart coupled to obsolete demo models.

### 3. Preserve localStorage guest-cart persistence and remove auth blockers
Keep `localStorage` as the supported guest-cart mechanism, but remove auth redirects from add-to-cart actions and cart page access. The existing auth context remains available for optional account chrome and local login/register flows.

Why:
- Guest persistence already exists and satisfies the requirement without backend changes.
- The current auth gate is a UI restriction rather than a cart-storage limitation.

Alternative considered:
- Require a broader auth/cart redesign before supporting guests. Rejected because it is unnecessary for this scope.

### 4. Keep `/product` canonical and treat `/products` as compatibility-only
Continue routing the live storefront through `/product` and `/product/[slug]`, while keeping `/products` and `/products/[slug]` as redirects or thin wrappers.

Why:
- The current repo already groups cart and account under `/product`, and internal route helpers already point there.
- One route family reduces drift between live catalog pages and shopping pages.

Alternative considered:
- Switch the canonical storefront back to `/products`. Rejected because it would reintroduce route fragmentation with cart/account pages.

### 5. Standardize English-only storefront copy as part of the shell refactor
Update public-facing shopping, cart, account, and navigation labels while the shared shell and cart interactions are being refactored.

Why:
- The remaining Vietnamese and broken-encoding strings are concentrated in the same public UI components being touched by this change.
- Fixing them in the same pass avoids carrying inconsistent copy into the new shared shell.

Alternative considered:
- Treat copy cleanup as a separate follow-up. Rejected because the user-facing inconsistency would remain in the finished storefront.

## Risks / Trade-offs

- [Dirty worktree includes storefront files] -> Mitigation: read current file contents before editing, preserve unrelated user changes, and keep patches scoped to the planned behaviors.
- [Cart schema change could invalidate previously stored guest carts] -> Mitigation: normalize stored cart items on read so older entries remain usable after the new snapshot shape is introduced.
- [Moving public pages onto one shared header can break route-specific controls] -> Mitigation: keep the shell configurable with optional search actions, active nav hints, and slot-based page content rather than forcing identical behavior on every page.
- [Detail-page variant selection may not match future backend cart semantics] -> Mitigation: store the selected variant as cart item metadata without inventing a new checkout API contract.

## Migration Plan

1. Add the new OpenSpec change artifacts and align them with the implemented storefront behavior.
2. Introduce the storefront config and shared public header/footer/shell components.
3. Refactor the cart context to support live catalog item snapshots and backward-compatible guest-cart persistence.
4. Update `/`, `/search`, `/product`, `/product/[slug]`, and `/product/cart` to use the shared shell and English-only copy.
5. Preserve `/products` compatibility redirects and verify internal navigation points to `/product`.
6. Run targeted verification for route flow, guest cart persistence, and logged-in account/cart chrome.

## Open Questions

- Whether future backend settings should provide a full logo asset URL or continue to rely on text-based branding for the shared header.
- Whether the local auth/account experience should later be restyled onto the same dark shell, or kept as a separate account-focused surface.
