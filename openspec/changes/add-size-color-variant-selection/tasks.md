## 1. Variant Selection Audit

- [x] 1.1 Audit the current product detail page and add-to-cart panel to identify where passive size/color displays and combined variant selection are disconnected
- [x] 1.2 Confirm the variant-resolution rules using the existing `ProductDetailDto` shape and cart variant metadata

## 2. Selector Refactor

- [x] 2.1 Refactor the product detail selection flow to maintain separate selected size and selected color state derived from real product variants
- [x] 2.2 Replace passive size/color displays with interactive size and color selectors that clearly show default, hover, focus, selected, and disabled states
- [x] 2.3 Resolve the active variant from the selected size/color pair and update displayed price, SKU, and add-to-cart target accordingly

## 3. Verification

- [x] 3.1 Verify valid and invalid size/color combinations behave correctly and stay visually aligned with the dark storefront theme
- [x] 3.2 Verify Add to Cart still works for guests and uses the selected real variant metadata
