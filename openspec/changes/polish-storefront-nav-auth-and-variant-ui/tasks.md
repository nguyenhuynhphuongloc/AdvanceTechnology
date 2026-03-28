## 1. Audit And Routing Decisions

- [x] 1.1 Audit the shared header, cart entry points, existing auth pages, and current product-route styling gaps in the storefront codebase
- [x] 1.2 Confirm the stable storefront auth routes to use for Login and Register, reusing existing account pages or adding thin route wrappers if needed

## 2. Header And Auth Entry Polish

- [x] 2.1 Remove the standalone Cart text item from the primary storefront navbar and keep cart access through the cart icon
- [x] 2.2 Update the shared storefront header so the cart icon continues to route correctly to the current cart page
- [x] 2.3 Wire Login and Register header links to stable working storefront auth routes and preserve compatibility for existing account routing if required

## 3. Product Experience Polish

- [x] 3.1 Refine `/product` and `/product/[slug]` spacing, typography, surfaces, and shared controls to fully match the dark storefront design system
- [x] 3.2 Restyle or replace the product-detail variant selector so its closed, open, hover, focus, selected, and disabled states match the storefront theme
- [x] 3.3 Verify guest add-to-cart, live product detail data, and cart-page behavior still work after the UI and routing polish
