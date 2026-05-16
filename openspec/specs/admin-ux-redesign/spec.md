## ADDED Requirements

### Requirement: Admin shall use a structured management shell
The Admin UI SHALL provide a consistent shell with sidebar/feature navigation, topbar, breadcrumb, main content area, profile/logout controls, notification affordance, and responsive behavior.

#### Scenario: Admin navigates between modules
- **WHEN** an admin moves between dashboard, products, orders, users, inventory, media library, or settings
- **THEN** the active navigation, breadcrumb, and page header clearly indicate location and available actions

### Requirement: Admin sidebar shall expose required feature groups
The Admin sidebar SHALL include Dashboard, Products, Categories, Inventory, Orders, Payments, Users, Carts, Media Library, Store Settings, Logs when data exists, and Notifications when data exists.

#### Scenario: Admin opens media management
- **WHEN** an admin needs to manage Cloudinary/media assets
- **THEN** Media Library is available from Admin navigation and is not exposed as a public storefront route

### Requirement: Admin dashboard shall summarize real operations data
The dashboard SHALL show stat cards, charts when real data exists, recent orders, low stock products, and quick actions without fake data.

#### Scenario: Dashboard data is unavailable
- **WHEN** dashboard metrics cannot be loaded
- **THEN** the dashboard shows loading, empty, or error states that explain the condition without fabricating numbers

### Requirement: Admin modules shall use consistent data table behavior
Admin list modules SHALL use consistent table patterns with search, filters, sorting, pagination, row actions, loading states, empty states, and error states.

#### Scenario: Admin filters a table
- **WHEN** an admin applies a search or filter on a data table
- **THEN** the table updates without losing pagination context unexpectedly and shows a clear empty state if no records match

### Requirement: Admin products shall support catalog management workflows
The products module SHALL support searching/filtering/sorting products, adding products, editing products, deleting products with confirmation, uploading or selecting product images, managing variants, and assigning products or variants to branches where backend support exists.

#### Scenario: Admin edits product media
- **WHEN** an admin uploads or selects product images
- **THEN** the UI shows upload progress, preview, failure feedback, and the selected main/gallery/variant image associations

### Requirement: Admin media library shall manage assets safely
The media library SHALL show a grid of assets, upload images, preview images, copy URLs, indicate linked/unlinked status, and block deletion of assets linked to products.

#### Scenario: Admin tries to delete linked media
- **WHEN** an admin attempts to delete an asset that is linked to a product
- **THEN** the UI prevents deletion and explains which product or usage blocks the action when available

### Requirement: Admin orders shall expose order visibility and supported actions
The orders module SHALL show order list filters, order detail, status, date, user, payment links, item details, and status update controls only when supported by backend APIs.

#### Scenario: Admin opens order detail
- **WHEN** an admin selects an order
- **THEN** the UI shows order items, customer/user reference, status, payment reference if available, total, and lifecycle information

### Requirement: Admin users shall link account, cart, and orders context
The users module SHALL show user list, user detail, role badge, active state, and links to the user's cart and orders where data is available.

#### Scenario: Admin reviews a user account
- **WHEN** an admin opens a user detail view
- **THEN** the UI shows identity information and links or summaries for related cart and order records instead of treating carts as detached from users

### Requirement: Admin store settings shall control public store identity
Store Settings SHALL allow admins to manage store name, logo, branches, contact information, and preview how the logo/name appear in the public header.

#### Scenario: Admin updates public logo
- **WHEN** an admin uploads or changes the store logo
- **THEN** the settings page shows a preview of the public header using the new logo before or after save according to the final implementation workflow
