## 1. Remove split-runtime admin assumptions

- [x] 1.1 Audit `my-app/package.json`, `docker-compose.yml`, and documentation for `3010`, `dev:admin`, or any separate admin runtime logic
- [x] 1.2 Update `my-app/package.json` to remove Unix-only or separate-admin scripts and keep only the scripts needed for the shared Next.js runtime
- [x] 1.3 Confirm the shared frontend runtime on port `3009` remains the only supported local admin runtime path

## 2. Keep Docker and routing on the shared frontend runtime

- [x] 2.1 Verify `docker-compose.yml` uses only the shared `my-app` frontend service on port `3009` and remove any stray separate admin runtime wiring if present
- [x] 2.2 Validate that `/admin` is served by the same `my-app` Next.js app as `/` and product routes without introducing a second frontend app

## 3. Update developer workflow documentation

- [x] 3.1 Document the root cause and the removal of the old `3010`-based admin assumption
- [x] 3.2 Document the final Windows run commands for the shared frontend runtime
- [x] 3.3 Document the final local URLs for storefront and admin, including confirmation that admin is now served from `http://localhost:3009/admin`

## 4. Validate the final setup

- [x] 4.1 Verify the final package scripts no longer depend on `PORT=3010`
- [x] 4.2 Verify Docker Compose still exposes only the shared frontend runtime on port `3009`
- [x] 4.3 Verify the shared runtime serves `/`, the supported product route, and `/admin`
