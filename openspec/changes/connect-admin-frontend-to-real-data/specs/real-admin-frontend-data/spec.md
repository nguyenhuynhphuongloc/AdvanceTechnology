## ADDED Requirements

### Requirement: Admin login must use real backend authentication
The admin frontend SHALL authenticate through the existing admin auth API instead of bypassing login locally, and successful login SHALL establish a real admin session that is used for subsequent protected admin requests.

#### Scenario: Admin login succeeds
- **WHEN** an admin submits valid credentials on `/admin/login`
- **THEN** the frontend calls `/api/v1/auth/admin/login`, persists the resulting authenticated session using the project’s admin session pattern, and redirects the user to `/admin`

#### Scenario: Admin login fails
- **WHEN** an admin submits invalid credentials on `/admin/login`
- **THEN** the frontend shows an authentication error and does not navigate to `/admin`

### Requirement: Admin dashboard must use real product and inventory data
The admin dashboard SHALL load supported sections from the existing backend-backed admin APIs through the shared admin API client instead of rendering hardcoded demo arrays.

#### Scenario: Products section loads real data
- **WHEN** an authenticated admin opens the products section
- **THEN** the frontend loads data from `/api/v1/admin/products` through the admin API layer and renders loading, error, empty, or success states based on the real response

#### Scenario: Inventory section loads real data
- **WHEN** an authenticated admin opens the inventory section
- **THEN** the frontend loads data from `/api/v1/admin/inventory` through the admin API layer and renders loading, error, empty, or success states based on the real response

### Requirement: Unsupported admin sections must not fake data
The admin frontend SHALL not display hardcoded demo values for sections whose backend endpoints are not yet implemented.

#### Scenario: Orders or users backend support is unavailable
- **WHEN** an admin opens a dashboard section without a real supporting backend endpoint
- **THEN** the UI shows a clearly labeled unavailable state instead of fake counts, rows, or stats

### Requirement: Overview stats must be derived from real supported data only
The dashboard overview SHALL derive visible stats only from backend-supported product and inventory data already fetched by the admin frontend.

#### Scenario: Overview renders supported stats
- **WHEN** the dashboard has loaded real products and inventory data
- **THEN** it displays derived stats such as total products, active products, or low-stock inventory counts without inventing unsupported values
