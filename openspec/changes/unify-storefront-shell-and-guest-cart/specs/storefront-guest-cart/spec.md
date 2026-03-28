## ADDED Requirements

### Requirement: Guests can add live catalog products to the cart
The storefront SHALL allow unauthenticated users to add products from the canonical product listing and product detail pages to the client cart without being redirected to login.

#### Scenario: Guest adds product from product detail
- **WHEN** a guest user selects a product on `/product/:slug` and clicks Add to Cart
- **THEN** the storefront adds the selected live catalog item to the cart and keeps the user on the storefront flow without requiring authentication

### Requirement: Guest cart persists using the existing client persistence mechanism
The storefront SHALL persist guest cart contents using the current client-side persistence approach so cart state survives refreshes and navigation.

#### Scenario: Guest cart survives refresh
- **WHEN** a guest adds an item to the cart and refreshes the page
- **THEN** the previously added cart items are restored from client persistence

### Requirement: Product detail supports variant-aware cart additions
The storefront SHALL expose variant selection on product detail pages when variants are available and SHALL preserve the chosen variant in the stored cart item metadata.

#### Scenario: Selected variant is preserved in cart
- **WHEN** a product has variants and the shopper selects one before adding it to the cart
- **THEN** the resulting cart item stores enough variant information to display and distinguish the chosen option in the cart

### Requirement: Cart page remains available to guests and logged-in users
The storefront SHALL allow both guests and logged-in users to open the cart page and interact with cart quantities using the same client cart state.

#### Scenario: Guest can review cart contents
- **WHEN** a guest opens `/product/cart`
- **THEN** the page renders the cart contents, totals, and cart controls instead of redirecting to login
