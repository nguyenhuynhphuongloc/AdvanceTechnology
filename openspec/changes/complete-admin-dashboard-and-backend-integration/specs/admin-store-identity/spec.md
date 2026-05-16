## ADDED Requirements

### Requirement: Store settings are persisted through a backend contract
The system SHALL provide a protected admin store settings API that persists store identity fields including store name, logo, description, contact email, contact phone, and address.

#### Scenario: Admin saves store settings
- **WHEN** an authenticated admin submits valid store settings
- **THEN** the backend persists the settings and returns the updated store identity resource

### Requirement: Store logo supports managed media references
The system SHALL support store logo updates through uploaded media or Cloudinary-linked assets represented in the store settings resource.

#### Scenario: Admin changes the logo
- **WHEN** an authenticated admin selects or uploads a new logo asset
- **THEN** the store settings resource stores the logo reference and the storefront can render the updated logo without manual code edits
