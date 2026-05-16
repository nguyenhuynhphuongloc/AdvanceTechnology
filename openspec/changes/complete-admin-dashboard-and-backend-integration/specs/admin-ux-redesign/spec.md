## MODIFIED Requirements

### Requirement: Admin sidebar shall expose required feature groups
The Admin sidebar SHALL include Dashboard, Products, Categories, Inventory, Branches, Orders, Payments, Users, Carts, Media Library, Store Settings, Logs, and Notifications as real operational destinations.

#### Scenario: Admin opens media management
- **WHEN** an admin needs to manage Cloudinary/media assets
- **THEN** Media Library is available from Admin navigation and is not exposed as a public storefront route

### Requirement: Admin dashboard shall summarize real operations data
The dashboard SHALL show stat cards, charts when real data exists, recent orders, low stock products, and quick actions without fake data.

#### Scenario: Dashboard data is unavailable
- **WHEN** dashboard metrics cannot be loaded
- **THEN** the dashboard shows loading, empty, or error states that explain the condition without fabricating numbers

### Requirement: Admin modules shall use consistent data table behavior
Admin list modules SHALL use consistent table patterns with search, filters, sorting, pagination, row actions, loading states, empty states, and error states across products, categories, inventory, branches, orders, payments, carts, users, notifications, and logs where data exists.

#### Scenario: Admin filters a table
- **WHEN** an admin applies a search or filter on a data table
- **THEN** the table updates without losing pagination context unexpectedly and shows a clear empty state if no records match

### Requirement: Admin products shall support catalog management workflows
The products module SHALL support searching/filtering/sorting products, adding products, editing products, deleting products with confirmation, uploading or selecting product images, managing variants, and linking product metadata to categories while surfacing inventory and branch context through supported backend flows.

#### Scenario: Admin edits product media
- **WHEN** an admin uploads or selects product images
- **THEN** the UI shows upload progress, preview, failure feedback, and the selected main/gallery/variant image associations

### Requirement: Admin store settings shall control public store identity
Store Settings SHALL allow admins to manage store name, logo, branches, contact information, and preview how the logo/name appear in the public header using persisted backend settings instead of frontend-only defaults.

#### Scenario: Admin updates public logo
- **WHEN** an admin uploads or changes the store logo
- **THEN** the settings page saves the updated store identity and the public header preview reflects the persisted logo and store name

## ADDED Requirements

### Requirement: Admin branches shall be manageable from the dashboard
The admin UI SHALL provide a branch management surface for creating, editing, listing, and removing branches through protected admin APIs.

#### Scenario: Admin manages branches
- **WHEN** an admin opens the branches workflow from inventory or store settings
- **THEN** the UI shows branch records with create, edit, and delete actions backed by the branch-owning service
