## ADDED Requirements

### Requirement: Database Schema Synchronization for Branches
The `inventory-service` SHALL maintain a PostgreSQL schema that correctly reflects its entity definitions, specifically the `branches` table and `branch_id` column in `inventory_items`.

#### Scenario: Multi-branch inventory tracking
- **WHEN** an inventory item is created or updated
- **THEN** it must be strictly associated with a valid `branchId` representing the physical warehouse location.
