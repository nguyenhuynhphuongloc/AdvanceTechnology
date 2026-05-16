## ADDED Requirements

### Requirement: Branch Schema and Data Modeling
The system MUST support a Branch entity to represent physical store locations and link inventory to specific branches.

#### Scenario: Creating a branch
- **WHEN** an admin creates a new branch via the API
- **THEN** a new Branch record is created and available for assigning inventory

#### Scenario: Inventory by Branch
- **WHEN** inventory is updated for a product
- **THEN** the inventory update MUST specify the `branchId` to adjust the stock at that specific location
