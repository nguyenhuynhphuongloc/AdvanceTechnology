## MODIFIED Requirements

### Requirement: Home page shall present real storefront merchandising
The home page SHALL include a clear header, settings-driven logo/name, search, category navigation, hero/banner, featured products, new arrivals, optional best sellers when data exists, and footer shop information.

#### Scenario: Home page renders without fake merchandising data
- **WHEN** featured, new arrival, or best seller data is unavailable
- **THEN** the page shows an honest empty or fallback state instead of fake products or public Cloudinary media listings

## ADDED Requirements

### Requirement: Storefront identity shall use persisted store settings
The public storefront SHALL load store name, logo, and contact-facing identity data from persisted store settings, with frontend config used only as fallback when backend settings are unavailable.

#### Scenario: Admin updates store identity
- **WHEN** store settings are changed by an admin
- **THEN** the storefront header, footer, and home branding surfaces render the updated store name and logo without requiring code changes
