## ADDED Requirements

### Requirement: Admins can list user accounts from the current account store
The system SHALL expose a read-only admin users endpoint backed by the current account source of truth so the admin dashboard can render real user data instead of an unavailable placeholder.

#### Scenario: Admin retrieves the user list
- **WHEN** an authenticated admin requests the admin users list
- **THEN** the backend returns account records with identifiers, email, role, active state, and timestamps from the current persisted user/account store

### Requirement: Admins can inspect a user account detail
The system SHALL expose a read-only admin user detail endpoint so the admin dashboard can inspect a specific user account.

#### Scenario: Admin retrieves a user detail
- **WHEN** an authenticated admin requests a specific user account by its identifier
- **THEN** the backend returns the persisted account record if it exists

#### Scenario: Requested user does not exist
- **WHEN** an authenticated admin requests an unknown user identifier
- **THEN** the backend returns a not-found response and does not fabricate a placeholder user
