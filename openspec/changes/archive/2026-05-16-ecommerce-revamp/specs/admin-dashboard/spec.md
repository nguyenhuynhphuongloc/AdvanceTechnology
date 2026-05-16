## ADDED Requirements

### Requirement: Admin Dashboard Layout and Routing
The system MUST provide a centralized Admin Dashboard accessible at `/admin`.

#### Scenario: Admin access
- **WHEN** an authenticated user with admin role navigates to `/admin`
- **THEN** they see the admin layout with a sidebar navigation for Products, Inventory, Users, and Orders

### Requirement: Admin Product Management
The admin dashboard MUST allow administrators to view and manage products.

#### Scenario: View product list
- **WHEN** an admin navigates to `/admin/products`
- **THEN** they see a paginated list of all products fetched from the `product-service` via the API gateway
