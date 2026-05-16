## MODIFIED Requirements

### Requirement: Admin Dashboard Layout and Routing
The system MUST provide a centralized Admin Dashboard accessible at `/admin`.

#### Scenario: Admin access
- **WHEN** an authenticated user with admin role navigates to `/admin`
- **THEN** they see the admin layout with a sidebar navigation for Products, Categories, Inventory, Branches, Orders, Payments, Carts, Users, Store Settings, Notifications, and Logs

### Requirement: Admin Product Management
The admin dashboard MUST allow administrators to view and manage products.

#### Scenario: View product list
- **WHEN** an admin navigates to `/admin/products`
- **THEN** they see a paginated list of all products fetched from the `product-service` via the API gateway with linked category and variant context

## ADDED Requirements

### Requirement: Admin dashboard summarizes real operational data
The admin dashboard SHALL present overview cards and summary sections derived only from backend-backed admin APIs.

#### Scenario: Dashboard loads operational summaries
- **WHEN** the admin dashboard loads successfully
- **THEN** product, order, inventory, payment, user, and low-stock summaries are rendered only from real API responses and unsupported metrics are omitted or shown as unavailable

### Requirement: Admin dashboard links into owning workflows
The admin dashboard SHALL provide quick actions and summary links that route admins into the domain module that owns the underlying data.

#### Scenario: Admin selects a quick action
- **WHEN** an admin clicks a dashboard action for products, media, orders, payments, store settings, or branches
- **THEN** the admin is routed to the corresponding admin module instead of a placeholder surface
