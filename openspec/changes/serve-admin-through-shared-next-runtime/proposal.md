## Why

The admin UI already exists inside `my-app/app/admin`, but the repository still carries a separate `dev:admin` script that assumes a second Next.js runtime on port `3010`. That split-runtime assumption is both incorrect for the current architecture and unreliable on Windows, where `PORT=3010 next dev` is Unix-style syntax.

## What Changes

- Remove the legacy separate-admin runtime assumption and treat `my-app/app/admin` as part of the single shared Next.js app.
- Update frontend package scripts so local development works on Windows without Unix-only environment variable syntax.
- Keep Docker Compose on one frontend container/runtime for `my-app`, exposed only on port `3009`.
- Document that admin is accessed through the shared frontend at `/admin`, not through a second frontend server.
- Validate that storefront and admin routes are served by the same Next.js runtime.

## Capabilities

### New Capabilities
- `shared-next-admin-runtime`: Defines the requirement that storefront and admin routes are served from one shared Next.js runtime on port `3009`.

### Modified Capabilities
- `containerized-dev-runtime`: Update the frontend local-runtime expectations so the shared `my-app` container is the only supported admin/storefront runtime in Docker and local dev.

## Impact

- Frontend scripts in `my-app/package.json`.
- Shared frontend container/runtime wiring in `docker-compose.yml`.
- Developer documentation in `README.md`.
- Validation of `my-app` routes under `/`, `/product`, and `/admin`.
