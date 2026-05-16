## ADDED Requirements

### Requirement: Admin media operations require Admin authorization
The API Gateway SHALL require valid Admin authorization for media operations that upload, list, delete, or otherwise manage Cloudinary assets.

#### Scenario: Admin media request succeeds
- **WHEN** a request to an Admin media management endpoint includes a valid Admin JWT
- **THEN** the gateway forwards the request to the appropriate downstream service

#### Scenario: Missing Admin token is rejected
- **WHEN** a request to an Admin media management endpoint has no valid Admin JWT
- **THEN** the gateway returns `401 Unauthorized` and does not forward the request

#### Scenario: Non-Admin role is rejected
- **WHEN** a request to an Admin media management endpoint has a valid JWT without Admin role
- **THEN** the gateway returns `403 Forbidden` or equivalent authorization failure and does not create, list, update, or delete media assets

