## Why

The current Docker setup supports multiple Compose profiles (`core`, `product-flow`, `cart-flow`, `checkout-flow`, `full-stack`). That flexibility is useful for development, but it creates uncertainty for QA because different flows can start different service combinations and produce inconsistent test results.

QA needs one stable local runtime that represents the broadest reliable website behavior before executing functional, API, UI, performance, security, and SEO testing.

## What Changes

- Consolidate the local Docker workflow into one default stable flow.
- Remove or de-emphasize profile-based startup paths from the primary documentation.
- Make `docker compose up -d --build` start the single QA-ready stack consistently.
- Keep service networking, ports, env loading, Redis, RabbitMQ, MongoDB, API Gateway, backend services, and `my-app` aligned for end-to-end testing.
- Update README/runtime notes so testers have one canonical startup command and one canonical URL map.

## Capabilities

### Modified Capabilities
- `docker-compose-orchestration`: Use one stable Compose startup path instead of multiple profile-driven flows.
- `containerized-dev-runtime`: Document one QA-ready runtime with predictable service availability and URLs.

## Impact

- Root `docker-compose.yml`.
- Root `.env` if `COMPOSE_PROFILES` is no longer needed.
- `README.md`, `ROUTES.md`, and any scripts/docs that mention profile-based startup.
- Testing documents may reference the stable runtime after implementation.

## Out of Scope

- Changing business logic or API behavior.
- Removing service source code.
- Adding new automated tests in this change.
- Deploying to production.
