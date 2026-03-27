## Why

The product detail page already receives real variant data, but the current UX only exposes a single combined variant picker and separate passive lists of sizes and colors. Shoppers cannot clearly select size and color independently, see invalid combinations, or understand which exact variant will be added to cart.

## What Changes

- Refactor the product detail page to render dedicated size and color selectors derived from real backend variant data.
- Visually highlight the selected size and selected color and clearly distinguish unavailable combinations from selectable options.
- Resolve the active variant from the current size and color selections so SKU, price, and add-to-cart target stay consistent with real product variant data.
- Preserve guest add-to-cart behavior and the existing dark storefront design system while upgrading product detail interactions.
- Keep routing and backend integration unchanged and avoid hardcoded size or color values.

## Capabilities

### New Capabilities
- `storefront-variant-dimension-selection`: Product detail size/color selection, active variant resolution, unavailable-combination handling, and add-to-cart integration based on real catalog variants.

### Modified Capabilities

## Impact

- Affected product detail UI under `my-app/app/product/[slug]` and `my-app/components/storefront/AddToCartPanel.tsx`
- Shared dark-theme styling in `my-app/app/globals.css`
- Existing cart integration in `my-app/lib/shopping/cart-context.tsx`
- No expected backend API changes; the change depends on existing variant data returned by the catalog APIs
