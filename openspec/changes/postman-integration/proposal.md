## Why

Manual API validation is currently ad hoc and not aligned to the gateway-first architecture. A shared, structured Postman workspace will make debugging faster, reduce misunderstandings across services, and complement existing Jest e2e coverage.

## What Changes

- Add a standard Postman workspace structure aligned to the API gateway and microservices.
- Define environments for local and shared testing, including JWT token handling.
- Document a consistent Postman-driven workflow for gateway validation and service debugging.
- Add lightweight repo artifacts for collection storage and collaboration.

## Capabilities

### New Capabilities
- `postman-api-testing`: Standardized Postman collections, environments, and workflow for gateway-first API validation and debugging.

### Modified Capabilities
<!-- None. -->

## Impact

- API Gateway request/response testing and debugging process.
- Developer workflow and onboarding documentation.
- Repository structure for shared Postman artifacts.
