## Context

The current repo already has a shared storefront shell and working guest cart flow, but the follow-up UX details are not fully resolved. The header still exposes Cart both as a text nav item and as the cart icon, which is redundant for the desired shopping chrome. Login and Register are currently linked directly from the shared header through query-param account routes, but the requested UX expects stable storefront auth entry points that do not behave like brittle implementation details. On the product detail page, the current variant picker is a native `<select>` with only basic dark styling, so open-state, option, and interaction styling still feel out of place relative to the rest of the storefront.

The product listing and detail pages are already live-data pages under `/product`, so this change should stay focused on shell/navigation polish, auth route integration, and consistent storefront presentation. Backend services are not the problem here; the remaining work is inside the Next.js storefront.

## Goals / Non-Goals

**Goals:**
- Remove redundant Cart text navigation and make the cart icon the primary cart entry point.
- Establish stable working Login and Register routes for storefront users by reusing the existing account experience cleanly.
- Tighten `/product` and `/product/[slug]` styling so the product experience fully matches the shared dark storefront system.
- Replace or restyle the variant selector so all interaction states look premium and integrated with the storefront.
- Preserve guest add-to-cart, current cart behavior, and existing catalog/backend flows.

**Non-Goals:**
- Redesigning the full auth/account experience beyond routing integration needed for storefront entry points.
- Changing the backend cart or auth architecture.
- Reworking admin auth pages or admin navigation.
- Replacing the existing canonical `/product` route family.

## Decisions

### 1. Use the cart icon as the only primary cart entry in the shared header
Remove the Cart text item from the shared header nav config and keep cart access through the existing cart icon, which already surfaces item count and better fits the shopping-shell design.

Why:
- The header currently duplicates the same destination twice.
- The cart icon is already the stronger shopping affordance and frees space for a cleaner primary nav.

Alternative considered:
- Keep both text and icon cart entry points. Rejected because it keeps redundant navigation and visual clutter.

### 2. Introduce stable storefront auth aliases instead of exposing query-mode links in the shared header
Audit the existing account implementation and route the shared header to stable `/login` and `/register` storefront entry points backed by the current account client or thin wrappers around it. Preserve `/product/account` as an internal compatibility path if needed.

Why:
- Query-param links in the shared header expose an implementation detail and are the most likely place for routing regressions or 404 reports.
- Stable top-level auth entry routes are clearer for users and easier to preserve over time.

Alternative considered:
- Keep the header pointing directly to `/product/account?mode=...`. Rejected because the request explicitly calls out those routes as broken/undesired header destinations.

### 3. Keep product-page polish inside the existing shared theme system
Refine spacing, container widths, surface treatments, and typography hierarchy for `/product` and `/product/[slug]` by using the current global storefront tokens and shared shell primitives rather than introducing a second styling pattern.

Why:
- The storefront already has the right theme direction; the remaining issue is consistency, not a missing design system.
- Reusing the existing token layer keeps the follow-up change small and safe.

Alternative considered:
- Rebuild the product routes with a new component/style stack. Rejected because it is larger than the problem requires.

### 4. Replace the native variant dropdown with a storefront-controlled selector if native styling remains insufficient
The default implementation should attempt theme-safe styling first, but the design should allow promoting the selector to a custom listbox/radio-group style control if browser-native option styling prevents a premium dark open state.

Why:
- Native `<select>` styling is limited across browsers, especially for option hover/open states.
- The request explicitly requires polished open/selected/focus/hover behavior, which a custom selector can guarantee if needed.

Alternative considered:
- Accept browser-default dropdown behavior with token-colored borders only. Rejected because it does not satisfy the requested polish.

## Risks / Trade-offs

- [Top-level `/login` and `/register` routes may overlap future auth architecture] -> Mitigation: implement them as thin wrappers over the existing account page/client so route ownership stays simple.
- [Native select styling may still vary across browsers] -> Mitigation: document the custom-selector fallback in the implementation plan and choose it if visual QA fails.
- [Product-page styling tweaks could drift from the shared shell again] -> Mitigation: keep adjustments inside global storefront tokens and shared primitives rather than page-only ad hoc styles.

## Migration Plan

1. Add the follow-up OpenSpec change artifacts for header/auth/product polish.
2. Audit the existing storefront account route implementation and establish stable Login/Register entry routes.
3. Update the shared header nav config and header component so Cart is icon-only.
4. Refine `/product` and `/product/[slug]` layout/styling against the shared storefront tokens.
5. Upgrade the variant selector styling, choosing a custom selector if native styling cannot meet the dark-theme requirements.
6. Verify guest cart, cart icon navigation, auth entry links, and visual consistency across the storefront.

## Open Questions

- Whether the eventual long-term storefront auth experience should stay account-page based or become separate dedicated pages after this routing cleanup.
- Whether the variant selector can remain a themed native control in the target browsers, or should be upgraded immediately to a custom selector for consistency.
