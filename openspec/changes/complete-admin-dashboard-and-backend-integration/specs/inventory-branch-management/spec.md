## MODIFIED Requirements

### Requirement: Database Schema Synchronization for Branches
The `inventory-service` SHALL maintain a PostgreSQL schema that correctly reflects its entity definitions, specifically the `branches` table and `branch_id` column in `inventory_items`.

#### Scenario: Multi-branch inventory tracking
- **WHEN** an inventory item is created or updated
- **THEN** it must be strictly associated with a valid `branchId` representing the physical warehouse location and remain queryable through admin inventory workflows

## ADDED Requirements

### Requirement: Admin branch management is available through protected APIs
The system SHALL expose protected admin APIs for listing, creating, updating, and deleting branches used by inventory workflows.

#### Scenario: Admin creates a branch
- **WHEN** an authenticated admin submits a valid branch payload
- **THEN** a new branch record is created and becomes available for inventory assignment and store settings management

### Requirement: Admin inventory views include branch context
The system SHALL expose branch-aware inventory search and update flows for the admin interface.

#### Scenario: Admin reviews stock by branch
- **WHEN** an authenticated admin queries inventory records
- **THEN** the response includes branch identifiers and stock context sufficient to manage inventory by branch
