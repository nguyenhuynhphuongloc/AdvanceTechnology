## ADDED Requirements

### Requirement: Admin can browse payment records
The system SHALL provide protected admin payment APIs and UI screens for listing and filtering payment transactions.

#### Scenario: Admin opens payments module
- **WHEN** an authenticated admin navigates to the payments page
- **THEN** the UI loads payment records from a protected admin payment endpoint with totals, status, order linkage, and timestamps

### Requirement: Admin can inspect payment detail in context
The system SHALL allow admins to inspect individual payment records and their related orders through linked admin workflows.

#### Scenario: Admin inspects a payment
- **WHEN** an authenticated admin selects a payment record
- **THEN** the system shows payment details together with the related order reference and current payment state
