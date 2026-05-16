## Context

The system is a gateway-first NestJS microservice architecture with existing Jest/Supertest e2e tests. Manual API testing is currently inconsistent across services. The project already references Postman for manual testing but lacks a shared, structured workspace and a repeatable workflow. This change introduces a consistent Postman structure aligned to the API Gateway and service boundaries.

## Goals / Non-Goals

**Goals:**
- Provide a single Postman workspace structured by gateway routes and service ownership.
- Standardize environments (local and shared) with JWT token handling.
- Define a repeatable workflow for API testing and debugging that complements automated tests.
- Store Postman artifacts in-repo for collaboration and review.

**Non-Goals:**
- Replace automated tests or add new automated test suites.
- Change service APIs or add new endpoints.
- Introduce a full API documentation system (Swagger/OpenAPI) as part of this change.

## Decisions

- **Gateway-first collection structure**: Organize collections by API Gateway routes, with service-specific subfolders for debugging. This mirrors actual client usage and reduces confusion about routing.
  - Alternative: per-service collections only. Rejected because it does not validate gateway behavior (auth, proxy, headers, errors).
- **Two primary environments (local, shared/staging)**: Keep minimal environments to avoid drift and reduce maintenance. Each environment includes base URLs and auth variables.
  - Alternative: multiple per-developer environments. Rejected due to fragmentation and inconsistent variables.
- **JWT token automation via pre-request**: Use a login request and store `accessToken` in environment variables for protected routes.
  - Alternative: manual token copy/paste. Rejected due to error-prone workflows.
- **Store artifacts under `postman/` in repo**: Keep collections and environments versioned and reviewable.
  - Alternative: rely on Postman cloud workspace only. Rejected because it is not visible in code review and can drift from code.

## Risks / Trade-offs

- **Collections drift from code** → Mitigate by lightweight update checklist when endpoints change and linking Postman updates to PRs.
- **JWT automation fails when auth changes** → Mitigate by keeping auth requests and token parsing minimal and documented.
- **Team uses different Postman versions** → Mitigate by storing JSON exports and documenting minimum Postman version used.

## Migration Plan

1. Create initial Postman collections and environments in-repo.
2. Validate against local gateway and at least one microservice.
3. Share workspace usage instructions with the team and add to onboarding docs.
4. Optionally mirror the in-repo collection to a Postman team workspace.

## Open Questions

- Which base URL should be used for shared/staging environment, and who owns it?
- Should we include optional Postman CLI checks for CI later?
