# Spec: Admin User Detail

## ADDED Requirements

### Requirement: Admin shall access user detail page
The admin platform SHALL provide a user detail page accessible at `/admin/users/[id]` that displays complete user information.

#### Scenario: Admin navigates to user detail
- **WHEN** an admin navigates to `/admin/users/[id]` (either by clicking a user in the list or directly)
- **THEN** the page displays user information: email, name, role badge, isActive status, created date, updated date

#### Scenario: User not found
- **WHEN** the admin navigates to `/admin/users/:id` with an invalid ID
- **THEN** the page displays a "User not found" message with a link back to the user list

### Requirement: Admin shall toggle user active status
The admin platform SHALL allow admins to activate or deactivate user accounts.

#### Scenario: Admin deactivates a user
- **WHEN** an admin clicks "Deactivate" on an active user
- **THEN** the system calls `PATCH /api/v1/admin/users/:id/status` with `{ isActive: false }` and updates the status badge

#### Scenario: Admin activates an inactive user
- **WHEN** an admin clicks "Activate" on an inactive user
- **THEN** the system calls `PATCH /api/v1/admin/users/:id/status` with `{ isActive: true }` and updates the status badge

### Requirement: Admin shall change user role
The admin platform SHALL allow admins to change a user's role between customer, seller, and admin.

#### Scenario: Admin changes user role
- **WHEN** an admin selects a new role from a dropdown and confirms
- **THEN** the system calls `PATCH /api/v1/admin/users/:id/role` with `{ role: "<new-role>" }` and updates the role badge

### Requirement: Admin shall view linked profiles
The admin platform SHALL display any linked buyer profile and seller profile associated with the user account when data is available.

#### Scenario: Admin views user with linked buyer profile
- **WHEN** the user has a linked buyer profile
- **THEN** the page shows a "Buyer Profile" section with available details

#### Scenario: Admin views user with linked seller profile
- **WHEN** the user has a linked seller profile
- **THEN** the page shows a "Seller Profile" section with business name, status, and a link to the profile

#### Scenario: Admin views user with no linked profiles
- **WHEN** the user has no buyer or seller profile
- **THEN** the page shows "No linked profiles" in the respective sections

### Requirement: User detail shall use real APIs only
The admin platform SHALL NOT fabricate user data. When API calls fail, the page SHALL display an error state.

#### Scenario: User detail API call fails
- **WHEN** the `fetchAdminUserDetail` API call fails on page load
- **THEN** the page shows an error state with a "Retry" button and does not show placeholder data

#### Scenario: Status update API call fails
- **WHEN** the status update API call fails
- **THEN** the page shows an error toast and reverts the UI to the previous state
