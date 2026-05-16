## MODIFIED Requirements

### Requirement: Postman collection matches the current API testing matrix
The Postman workspace SHALL stay aligned with the endpoint matrix documented in `Document_Testing/API_Testing.md`.

#### Scenario: Endpoint is added to the API matrix
- **WHEN** an endpoint is included in the API testing document
- **THEN** the Postman collection is checked for a matching request or a documented reason for manual testing outside Postman

#### Scenario: Environment variables are needed
- **WHEN** an API request requires a base URL, token, test user, product, SKU, or inventory value
- **THEN** the Postman environment provides a variable or the test document marks the missing input
