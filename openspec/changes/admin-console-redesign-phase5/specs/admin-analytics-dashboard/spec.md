# Spec: Admin Analytics Dashboard

## ADDED Requirements

### Requirement: Admin shall access analytics dashboard
The admin platform SHALL provide an analytics page accessible at `/admin/analytics` that displays platform-wide metrics.

#### Scenario: Admin navigates to analytics page
- **WHEN** an admin navigates to `/admin/analytics`
- **THEN** the page loads and displays platform metrics derived from existing admin APIs

### Requirement: Analytics shall display key platform metrics
The analytics page SHALL display computed metrics including total orders, total revenue, total users, total products, and recent activity.

#### Scenario: Analytics loads with available data
- **WHEN** the analytics page loads
- **THEN** the page fetches data from `fetchAdminOrders`, `fetchAdminUsers`, `fetchAdminProducts`, and `fetchAdminPayments` to compute and display: Total Orders, Total Revenue, Total Users, Total Products, Recent Orders (last 5)

#### Scenario: Analytics shows computed revenue
- **WHEN** the analytics page has loaded order data
- **THEN** the total revenue is computed as the sum of `totalAmount` from all orders and displayed with currency formatting

### Requirement: Analytics shall handle missing data gracefully
The analytics page SHALL handle partial data availability by showing available metrics and indicating unavailable ones.

#### Scenario: Analytics has partial data
- **WHEN** some API calls succeed and others fail
- **THEN** the page displays available metrics with a note that some data could not be loaded, without showing placeholder values

#### Scenario: Analytics has no data
- **WHEN** all API calls return empty results
- **THEN** the page shows a clean "No data available" state for each metric card

### Requirement: Analytics shall not fabricate data
The analytics page SHALL NOT show fake or computed numbers that do not come from real API responses. When an API is unavailable, the corresponding metric card SHALL show an error or unavailable state.

#### Scenario: Orders API unavailable
- **WHEN** the `fetchAdminOrders` API call fails
- **THEN** the orders and revenue metric cards show "Unable to load" instead of fabricated numbers

### Requirement: Analytics shall compute from existing APIs without new endpoints
The analytics page SHALL derive all metrics from existing admin API endpoints without requiring new backend analytics endpoints.

#### Scenario: Analytics derives metrics from existing endpoints
- **WHEN** the analytics page needs order count
- **THEN** it calls `fetchAdminOrders` and counts `response.items.length`
- **WHEN** the analytics page needs user count
- **THEN** it calls `fetchAdminUsers` and counts `response.items.length`
- **WHEN** the analytics page needs product count
- **THEN** it calls `fetchAdminProducts` and counts `response.items.length`
- **WHEN** the analytics page needs payment data
- **THEN** it calls `fetchAdminPayments` and computes payment status breakdown
