## ADDED Requirements

### Requirement: Canonical product routes remain visually consistent with the shared storefront
The canonical `/product` listing and `/product/:slug` detail routes SHALL use the same dark storefront visual system for layout, spacing, typography, surfaces, and interactive elements as the rest of the public storefront.

#### Scenario: Product route styling matches storefront shell
- **WHEN** a shopper navigates between the home page, product listing, product detail, and search routes
- **THEN** the product routes feel like part of the same shared storefront through consistent dark theme tokens, spacing, borders, buttons, and typography

### Requirement: Product detail variant selection is visually integrated with the storefront
The storefront SHALL present product variant selection with polished dark-theme styling for closed, focused, open, hovered, and selected states.

#### Scenario: Variant selector matches premium storefront styling
- **WHEN** a shopper interacts with the variant selector on `/product/:slug`
- **THEN** the control uses storefront-aligned colors and interaction states instead of bright browser-default styling

### Requirement: Guest add-to-cart remains available after product polish changes
The storefront SHALL preserve guest add-to-cart behavior while applying product-page and selector styling refinements.

#### Scenario: Guest still adds product after selector update
- **WHEN** a guest shopper selects a product variant and clicks Add to Cart
- **THEN** the storefront adds the product to the guest cart without requiring login
