# Spec: Admin Moderation Queue

## ADDED Requirements

### Requirement: Admin shall access the product approvals queue
The admin platform SHALL provide a product moderation queue page accessible at `/admin/product-approvals` that displays products pending approval.

#### Scenario: Admin views pending product approvals
- **WHEN** an admin navigates to `/admin/product-approvals`
- **THEN** the page displays a table of products with `approvalStatus=pending` (or `status=pending`), showing: Product Image, Name, Shop, Category, Price, Submission Date, Actions

#### Scenario: Admin filters product approvals by shop
- **WHEN** an admin applies a shop filter
- **THEN** the table updates to show only products from the selected shop

### Requirement: Admin shall approve a pending product
The admin platform SHALL allow admins to approve products from the moderation queue.

#### Scenario: Admin approves a pending product
- **WHEN** an admin clicks "Approve" on a pending product
- **THEN** the system calls `PATCH /api/v1/admin/products/moderation/:id/approve` and refreshes the queue

### Requirement: Admin shall reject a pending product with reason
The admin platform SHALL allow admins to reject products from the moderation queue with a mandatory rejection reason.

#### Scenario: Admin rejects a product with reason
- **WHEN** an admin clicks "Reject", enters a rejection reason, and confirms
- **THEN** the system calls `PATCH /api/v1/admin/products/moderation/:id/reject` with `{ rejectionReason: "<reason>" }` and refreshes the queue

#### Scenario: Admin submits rejection without reason
- **WHEN** an admin clicks "Reject" and attempts to submit without entering a reason
- **THEN** the form shows a validation error and does not submit

### Requirement: Admin shall hide an approved product
The admin platform SHALL allow admins to hide approved products from the public catalog.

#### Scenario: Admin hides a product
- **WHEN** an admin clicks "Hide" on an approved product
- **THEN** the system calls `PATCH /api/v1/admin/products/moderation/:id/hide` and refreshes the queue

### Requirement: Admin shall view pending product detail before acting
The admin platform SHALL allow admins to preview product details before taking moderation action.

#### Scenario: Admin previews product detail
- **WHEN** an admin clicks on a product row or a "View" button
- **THEN** the page shows product detail including description, variants, images, and shop information in a modal or detail view

### Requirement: Product moderation shall use real APIs only
The admin platform SHALL NOT fabricate product moderation data. When the API call fails, the page SHALL display an error state.

#### Scenario: API call fails during moderation action
- **WHEN** the approve/reject/hide API call fails
- **THEN** the page shows an error toast and does NOT update the list optimistically

### Requirement: Admin shall access existing product catalog management
The admin platform SHALL ensure the existing `/admin/products` page continues to work without regression.

#### Scenario: Admin navigates to product catalog
- **WHEN** an admin navigates to `/admin/products`
- **THEN** the existing AdminProductsManager page loads and functions correctly

#### Scenario: Admin uses product search and filters
- **WHEN** an admin searches for a product or applies category/status filters
- **THEN** the product table updates with results from `fetchAdminProducts`
