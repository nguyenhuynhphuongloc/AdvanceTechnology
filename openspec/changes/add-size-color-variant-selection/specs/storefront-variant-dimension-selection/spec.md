## ADDED Requirements

### Requirement: Product detail supports separate size and color selection
The storefront SHALL render dedicated size and color selectors on the canonical product detail page using real product variant data.

#### Scenario: Shopper selects a size
- **WHEN** a shopper clicks an available size option on `/product/:slug`
- **THEN** the selected size becomes visually highlighted and the detail page updates the active variant state using that size together with the current color selection

#### Scenario: Shopper selects a color
- **WHEN** a shopper clicks an available color option on `/product/:slug`
- **THEN** the selected color becomes visually highlighted and the detail page updates the active variant state using that color together with the current size selection

### Requirement: Invalid size and color combinations are not selectable as active variants
The storefront SHALL disable or otherwise clearly mark size and color options that do not form a valid product variant with the current opposite-dimension selection.

#### Scenario: Invalid color is unavailable for selected size
- **WHEN** a shopper has selected a size and a color option does not exist for that size in the real variant set
- **THEN** that color option is shown as unavailable and cannot be used to add an invalid variant to cart

### Requirement: Active variant resolves from the current size and color pair
The storefront SHALL derive the active variant, SKU, price, and add-to-cart target from the current size and color selections.

#### Scenario: Variant-specific price updates
- **WHEN** a shopper changes size or color to a different valid variant
- **THEN** the displayed active variant details update to match the resolved real variant

### Requirement: Add to Cart uses the currently resolved variant
The storefront SHALL add the currently resolved variant to the cart for both guests and logged-in users.

#### Scenario: Guest adds selected variant to cart
- **WHEN** a guest shopper chooses a valid size and color combination and clicks Add to Cart
- **THEN** the cart receives the correct resolved variant metadata without requiring login
