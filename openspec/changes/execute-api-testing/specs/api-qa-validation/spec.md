## ADDED Requirements

### Requirement: API tests are executed gateway-first
The QA process SHALL execute documented API scenarios through the API Gateway before using direct service URLs for debugging.

#### Scenario: Tester validates an endpoint
- **WHEN** a documented gateway endpoint exists
- **THEN** the tester sends the primary request through `http://localhost:3000`

### Requirement: API status and response evidence is recorded
The QA process SHALL record status code, response body summary, auth context, and actual result for each tested endpoint.

#### Scenario: API test fails
- **WHEN** an endpoint returns an unexpected response
- **THEN** the tester records the request, response, expected result, and suspected owner service

### Requirement: Auth and validation cases are included
The QA process SHALL include success, missing auth, forbidden role, missing required fields, invalid types, and boundary value cases.

#### Scenario: Protected endpoint is tested
- **WHEN** a protected endpoint is tested
- **THEN** valid token, missing token, and wrong-role cases are covered where applicable
