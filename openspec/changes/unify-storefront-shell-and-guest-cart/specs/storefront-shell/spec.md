## ADDED Requirements

### Requirement: Public storefront routes use a shared configurable shell
The Next.js storefront SHALL render the home page, search page, canonical product listing, canonical product detail, and cart page using one shared public shell that exposes configurable branding and primary navigation.

#### Scenario: Shared header appears across public routes
- **WHEN** a user visits `/`, `/search`, `/product`, `/product/:slug`, or `/product/cart`
- **THEN** the page renders the same storefront header and footer structure with the configured logo or logo text, brand name, and primary navigation links

### Requirement: Storefront branding is configurable without hardcoded header text
The storefront SHALL load public brand name and logo presentation from a typed frontend configuration source instead of hardcoding them directly in route-specific components.

#### Scenario: Branding configuration updates the header
- **WHEN** the storefront branding configuration changes its brand name or logo text
- **THEN** the shared public header reflects the updated branding without requiring route-level component edits

### Requirement: Canonical public catalog navigation uses the `/product` route family
The storefront SHALL treat `/product` and `/product/:slug` as the canonical public catalog routes while preserving safe compatibility behavior for legacy `/products` URLs.

#### Scenario: Legacy product URL resolves safely
- **WHEN** a user opens `/products` or `/products/:slug`
- **THEN** the storefront redirects or forwards the request to the canonical `/product` route representing the same catalog state

### Requirement: Public storefront copy is standardized in English
The storefront SHALL use English-only labels and accessible text across shared navigation, catalog, cart, and related public-facing controls.

#### Scenario: Public pages no longer show mixed-language copy
- **WHEN** a user browses the public storefront
- **THEN** buttons, nav links, empty states, aria labels, and shopping messages appear in English without broken-encoding text
