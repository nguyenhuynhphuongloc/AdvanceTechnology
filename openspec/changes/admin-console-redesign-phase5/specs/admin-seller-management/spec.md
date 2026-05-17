# Spec: Admin Seller Management

## ADDED Requirements

### Requirement: Admin shall manage seller profiles
The admin platform SHALL provide a seller profile management page accessible at `/admin/seller-profiles` that lists all seller profiles with their business name, status, and timestamps.

#### Scenario: Admin views seller profile list
- **WHEN** an admin navigates to `/admin/seller-profiles`
- **THEN** the page displays a table of all seller profiles with columns: Business Name, Status, Created At, Actions

#### Scenario: Admin filters seller profiles by status
- **WHEN** an admin selects a status filter (e.g., "pending", "approved", "suspended")
- **THEN** the table updates to show only profiles matching the selected status

#### Scenario: Admin approves a seller profile
- **WHEN** an admin clicks "Approve" on a pending seller profile
- **THEN** the system calls `PATCH /api/v1/admin/seller-profiles/:id/status` with `{ status: "approved" }` and refreshes the list

#### Scenario: Admin rejects a seller profile
- **WHEN** an admin clicks "Reject" on a seller profile
- **THEN** the system calls `PATCH /api/v1/admin/seller-profiles/:id/status` with `{ status: "rejected" }` and refreshes the list

#### Scenario: Admin suspends a seller profile
- **WHEN** an admin clicks "Suspend" on an approved seller profile
- **THEN** the system calls `PATCH /api/v1/admin/seller-profiles/:id/status` with `{ status: "suspended" }` and refreshes the list

### Requirement: Admin shall manage shop registrations
The admin platform SHALL provide a shop management page accessible at `/admin/shops` that lists all shops with filtering by status.

#### Scenario: Admin views all shops
- **WHEN** an admin navigates to `/admin/shops`
- **THEN** the page displays a table of all shops with columns: Shop Name, Seller, Status, Created At, Actions

#### Scenario: Admin filters shops by status
- **WHEN** an admin applies a status filter (e.g., "pending", "approved", "suspended", "rejected")
- **THEN** the table updates to show only shops matching the selected status

### Requirement: Admin shall access the shop approvals queue
The admin platform SHALL provide a shop approval queue page accessible at `/admin/shop-approvals` that displays only shops with `status=pending`.

#### Scenario: Admin views pending shop approvals
- **WHEN** an admin navigates to `/admin/shop-approvals`
- **THEN** the page shows only shops with `status=pending`, displaying: Shop Name, Seller Name, Description, Submission Date, Actions

#### Scenario: Admin approves a pending shop
- **WHEN** an admin clicks "Approve" on a pending shop
- **THEN** the system calls `PATCH /api/v1/admin/shops/:id/approve` and refreshes the list

#### Scenario: Admin rejects a pending shop with reason
- **WHEN** an admin clicks "Reject" and provides a rejection reason
- **THEN** the system calls `PATCH /api/v1/admin/shops/:id/reject` with `{ rejectionReason: "<reason>" }` and refreshes the list

#### Scenario: Admin suspends an approved shop
- **WHEN** an admin clicks "Suspend" on an approved shop
- **THEN** the system calls `PATCH /api/v1/admin/shops/:id/suspend` and refreshes the list

### Requirement: Admin shall view seller profile detail
The admin platform SHALL provide a seller profile detail view accessible at `/admin/seller-profiles/:id` showing full profile information.

#### Scenario: Admin views seller profile detail
- **WHEN** an admin navigates to `/admin/seller-profiles/:id`
- **THEN** the page displays the full seller profile including business name, status, created date, and linked shop information

### Requirement: Seller profile management shall use real APIs only
The admin platform SHALL NOT fabricate seller profile data. When the API call fails, the page SHALL display an error state with a retry action.

#### Scenario: API call fails during seller profile list load
- **WHEN** the `fetchAdminSellerProfiles` API call fails
- **THEN** the page shows an error banner with the error message and a "Retry" button

#### Scenario: API call fails during status update
- **WHEN** the status update API call fails
- **THEN** the page shows an error toast and does NOT update the list optimistically

### Requirement: Seller management placeholder for missing API
When the `/api/v1/admin/sellers` API does not exist, the admin platform SHALL show a placeholder page at `/admin/sellers` that clearly indicates the feature is not yet implemented.

#### Scenario: Admin navigates to sellers page without backend support
- **WHEN** an admin navigates to `/admin/sellers` and the backend API does not exist
- **THEN** the page displays a clear "Coming Soon" or "Backend not implemented" message without fake data
