## ADDED Requirements

### Requirement: UI shall provide responsive loading, empty, and error states
Storefront and Admin pages SHALL define visible loading, empty, and error states for data-dependent views.

#### Scenario: Data request is slow
- **WHEN** a page waits for product, cart, checkout, order, user, inventory, media, or settings data
- **THEN** the UI shows a skeleton or progress state that preserves layout and avoids blank content

### Requirement: Stable data shall avoid unnecessary refetching
The frontend SHALL avoid unnecessary repeated API requests for stable data such as categories, store settings, and eligible catalog data where caching or revalidation can be safely used.

#### Scenario: User navigates between catalog pages
- **WHEN** the user navigates between storefront pages that reuse stable category or settings data
- **THEN** the UI should not refetch unchanged stable data on every route transition unless required by freshness rules

### Requirement: Large admin and catalog lists shall paginate
Product, order, user, inventory, media, and catalog list views SHALL use pagination or equivalent incremental loading for large datasets.

#### Scenario: Admin opens a large orders list
- **WHEN** the orders dataset contains many records
- **THEN** the admin table loads a bounded page of records with controls to navigate through additional pages

### Requirement: Search and filter inputs shall avoid excessive API calls
Search and filter controls SHALL debounce text input or otherwise prevent duplicate high-frequency API calls while preserving responsive feedback.

#### Scenario: User types in a search field
- **WHEN** a user types multiple characters quickly in a search field
- **THEN** the UI waits briefly or batches updates so it does not issue one network request per keystroke unnecessarily

### Requirement: Product and media images shall optimize perceived performance
Product and media image rendering SHALL use lazy loading for below-the-fold assets, fixed dimensions or aspect ratios to avoid layout shift, and placeholders or fallback states for slow or failed images.

#### Scenario: Image is below the fold
- **WHEN** an image is not initially visible
- **THEN** it may be lazy loaded without causing layout shift when it appears

### Requirement: Public and admin layouts shall be separated for performance and clarity
Public storefront routes and Admin routes SHALL keep layout state, navigation, and client-only behavior separated so admin-specific UI does not slow or complicate public storefront pages.

#### Scenario: User opens public storefront
- **WHEN** a shopper visits a public route
- **THEN** the route does not initialize admin-only navigation, admin-only data loading, or admin-only client state
