## ADDED Requirements

### Requirement: Public storefront pages share a unified dark theme system
The Next.js storefront SHALL use a centralized dark theme system for public user-facing pages so shared surfaces, typography, spacing accents, borders, and interactive states remain visually consistent across the storefront.

#### Scenario: Public pages render with shared tokens
- **WHEN** a user visits the home page, search page, product listing page, or product detail page
- **THEN** those pages use the same dark theme tokens and shared visual treatment for backgrounds, text, surfaces, borders, and primary actions

### Requirement: Shared storefront UI elements are visually consistent
The storefront SHALL apply the same dark-themed presentation rules to shared layout and discovery elements including headers, footers, cards, buttons, form controls, filters, pagination areas, and content sections used by public pages.

#### Scenario: Shared components match across routes
- **WHEN** a user navigates between storefront pages that reuse catalog or search components
- **THEN** headers, cards, filters, buttons, empty states, loading states, and error states follow the same visual language instead of route-specific styling

### Requirement: Legacy public pages are aligned to the storefront theme
The storefront SHALL align any existing public-facing page that currently uses a conflicting light or demo presentation with the same shared dark storefront theme without replacing the current architecture.

#### Scenario: Legacy page no longer breaks theme consistency
- **WHEN** a user opens an existing legacy storefront route such as `/HomePage`
- **THEN** the route presents content using the same dark storefront theme and shared layout direction as the rest of the public storefront
