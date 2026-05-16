## ADDED Requirements

### Requirement: Shared storefront header uses icon-based cart access
The storefront SHALL expose cart access from the shopping cart icon in the shared header and SHALL NOT render a redundant standalone Cart text button in the primary navbar.

#### Scenario: Shopper opens cart from header icon
- **WHEN** a shopper clicks the cart icon in the shared storefront header
- **THEN** the storefront navigates to the current cart page and preserves the existing cart-page functionality

### Requirement: Shared storefront header links to stable auth entry routes
The storefront SHALL route Login and Register header actions to stable working storefront auth entry routes rather than fragile implementation-detail links.

#### Scenario: Login link resolves successfully
- **WHEN** a shopper clicks Login from the shared storefront header
- **THEN** the storefront opens a working Login route that renders the existing storefront auth experience without a 404

#### Scenario: Register link resolves successfully
- **WHEN** a shopper clicks Register from the shared storefront header
- **THEN** the storefront opens a working Register route that renders the existing storefront auth experience without a 404
