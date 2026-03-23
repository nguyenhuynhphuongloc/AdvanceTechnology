## ADDED Requirements

### Requirement: Admin product list supports search and filtering
The system SHALL provide an authenticated admin product list that returns products with enough metadata for management workflows and supports search and filter criteria relevant to catalog administration.

#### Scenario: Admin loads filtered product list
- **WHEN** an authenticated admin requests the product list with search text or filter parameters
- **THEN** the system returns matching products with identifiers, descriptive fields, and management-relevant summary data

### Requirement: Admin can view product details for management
The system SHALL provide an authenticated product detail view for admins that includes the full editable product payload and associated variant information.

#### Scenario: Admin opens a product detail record
- **WHEN** an authenticated admin selects a product from the admin list
- **THEN** the system returns the product's current catalog data, images, variants, and identifiers for editing

### Requirement: Admin can create products through the existing catalog service
The system SHALL allow authenticated admins to create products through gateway-backed product-service APIs without bypassing the current catalog ownership boundary.

#### Scenario: Admin creates a product
- **WHEN** an authenticated admin submits a valid create-product form
- **THEN** the product-service persists the new product and returns the created product record through the gateway

### Requirement: Admin can update products through the existing catalog service
The system SHALL allow authenticated admins to edit existing product records, including core catalog fields and variant-aware data needed by the current product model.

#### Scenario: Admin updates a product
- **WHEN** an authenticated admin submits valid edits for an existing product
- **THEN** the product-service persists the changes and the admin UI reflects the updated product state

### Requirement: Admin can delete products
The system SHALL allow authenticated admins to delete product records and remove them from subsequent admin list results.

#### Scenario: Admin deletes a product
- **WHEN** an authenticated admin confirms deletion for an existing product
- **THEN** the system deletes the product and the product no longer appears in admin product listings
