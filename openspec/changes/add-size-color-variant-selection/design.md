## Context

The product detail route already fetches `ProductDetailDto` with `variants`, `availableSizes`, and `availableColors`, and the current `AddToCartPanel` already adds a chosen variant to the cart. The gap is UX and resolution logic: the current panel uses one combined variant selector, while the detail page separately renders sizes and colors as static labels. That means shoppers do not get an intuitive size-first or color-first selection flow, invalid combinations are not surfaced explicitly, and the visible size/color lists are disconnected from the actual variant that will be added to cart.

This change should stay inside the existing storefront architecture. The live catalog API already provides the data needed for size/color-driven resolution, and the cart already supports variant metadata. The work is therefore focused on frontend state derivation, selector UX, and clear synchronization between the chosen size, chosen color, and resolved variant.

## Goals / Non-Goals

**Goals:**
- Render dedicated size and color selectors from real variant data on the product detail page.
- Keep selected size and selected color visually highlighted in the existing dark storefront theme.
- Disable or otherwise clearly mark invalid size/color combinations based on the real variant set.
- Resolve the active variant from the chosen size and color so displayed price, SKU, and add-to-cart variant stay correct.
- Preserve guest add-to-cart behavior and current cart integration.

**Non-Goals:**
- Changing the backend product detail contract.
- Redesigning the full product detail layout outside the variant-selection area.
- Introducing a new dependency or component library for selectors.
- Reworking the cart storage format beyond what is needed to keep selected variant metadata consistent.

## Decisions

### 1. Drive selectors from real variant combinations, not from the flattened available lists alone
Build the size and color option state from `product.variants`, then use `availableSizes` and `availableColors` only as supporting display data if needed.

Why:
- The variant array is the actual source of truth for valid combinations.
- Flat lists alone cannot tell whether `size A + color B` is valid.

Alternative considered:
- Use only `availableSizes` and `availableColors` as independent option lists. Rejected because it cannot resolve invalid pairings safely.

### 2. Track size and color as separate selection dimensions and derive the active variant from both
The UI should keep separate `selectedSize` and `selectedColor` state, derive the matching variant from those values, and update the displayed active variant fields whenever a valid combination exists.

Why:
- The request explicitly requires dedicated size and color selectors.
- Separate selection state makes highlighting and invalid-combination handling predictable.

Alternative considered:
- Keep storing only a selected variant ID and infer size/color secondarily. Rejected because it keeps the UI interaction model backwards.

### 3. Auto-initialize selection from the real variant set with a valid default
If there is exactly one valid variant, preselect it. Otherwise, initialize from the first valid variant so the page has a consistent active state, then update disabled states dynamically as the shopper changes one dimension.

Why:
- The UX expectation calls for clean preselection when only one valid variant exists.
- A valid default avoids an ambiguous or broken initial add-to-cart state.

Alternative considered:
- Force the shopper to choose both fields before any variant becomes active. Rejected because it adds friction when the data already has a safe default.

### 4. Use storefront-controlled button groups instead of native selects
Render size and color options as controlled buttons/chips so hover, selected, focus, and disabled states can be fully styled in the dark storefront theme.

Why:
- Native form controls are harder to style consistently across browsers.
- The storefront already uses custom interactive surfaces that align better with chip-like selectors.

Alternative considered:
- Keep or reintroduce native `<select>` controls for size and color. Rejected because it does not meet the requested premium interaction polish.

## Risks / Trade-offs

- [Variant data may contain uneven combinations] -> Mitigation: compute valid options from the actual variant set and disable combinations that do not resolve.
- [Changing one dimension may invalidate the currently selected counterpart] -> Mitigation: when a selection becomes invalid, automatically move to the nearest valid matching variant for the newly chosen dimension.
- [Detail page already shows passive size/color lists] -> Mitigation: replace those passive displays with the new interactive selectors so there is one authoritative selection UI.

## Migration Plan

1. Add the new OpenSpec change artifacts for size/color-driven variant selection.
2. Refactor `AddToCartPanel` to maintain separate size/color selection state and active variant derivation.
3. Replace passive size/color displays on the detail page with interactive selectors tied to the active variant.
4. Add storefront selector styles for default, hover, focus, selected, and disabled states.
5. Verify active variant price/SKU and add-to-cart behavior for valid and invalid combinations.

## Open Questions

- Whether the product detail page should show an explicit “Unavailable combination” message if the user briefly lands on an invalid pair before auto-correction, or simply prevent that state by immediately moving to a valid counterpart.
