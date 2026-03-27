## Context

The repository already implements admin UI routes inside the main Next.js application under `my-app/app/admin`, and Docker Compose already runs only one frontend container on port `3009`. The remaining inconsistency is in developer runtime setup: `my-app/package.json` still exposes a `dev:admin` script that assumes a separate admin server on port `3010`, using Unix-style `PORT=3010 next dev` syntax that is unreliable on Windows.

This leaves the codebase with two conflicting stories about admin runtime. The actual architecture is a single Next.js app with storefront and admin routes, but the scripts still imply a split-runtime model. The change should remove that ambiguity without restructuring the frontend.

## Goals / Non-Goals

**Goals:**
- Make the shared-runtime model explicit: storefront and admin are both served by the same `my-app` Next.js process.
- Remove legacy `3010`-based admin startup logic from package scripts and documentation.
- Keep Docker Compose on a single `my-app` container exposed at `3009`.
- Validate that `/`, `/product`, and `/admin` are all served by the same frontend runtime.
- Keep the setup reliable on Windows.

**Non-Goals:**
- Split admin into a separate frontend application.
- Redesign the route tree under `my-app/app/admin`.
- Change the public frontend port away from `3009`.
- Introduce new infrastructure or new containers.

## Decisions

### Decision: Treat `/admin` as a first-class route subtree of `my-app`

The implementation will formalize the architecture that already exists in code: `my-app/app/admin` is part of the same Next.js application as the storefront. All admin access will go through `http://localhost:3009/admin` in local development.

Rationale:
- This matches the current App Router layout and middleware behavior.
- It avoids a second dev server, a second port, and duplicated frontend runtime logic.
- It keeps the project structure stable.

Alternatives considered:
- Keep a dedicated admin dev server on `3010`. Rejected because it conflicts with the current route structure and creates unnecessary Windows/runtime complexity.
- Split admin into a second Next.js app. Rejected because it is out of scope and would redesign the frontend architecture.

### Decision: Remove Unix-only admin script instead of replacing it with another separate-runtime script

The `dev:admin` script should be removed or collapsed into the normal shared frontend development flow rather than rewritten with Windows-compatible environment syntax.

Rationale:
- The problem is not only Windows shell syntax; the deeper issue is that the script encodes the wrong runtime model.
- Keeping only the scripts needed for the shared runtime reduces confusion.

Alternatives considered:
- Replace `PORT=3010 next dev` with a Windows-safe equivalent. Rejected because it preserves the unnecessary separate-admin runtime.

### Decision: Keep Docker Compose on a single `my-app` container exposed at `3009`

The root `docker-compose.yml` will continue to use one `my-app` service, one container, and one exposed port for both storefront and admin routes. The change should confirm there is no extra admin container or port mapping and document that `/admin` is served through the existing frontend runtime.

Rationale:
- Compose already matches the desired architecture.
- The fix should preserve that clean setup and remove only stale assumptions around it.

Alternatives considered:
- Add a second frontend service for admin in Compose. Rejected because it directly violates the goal.

### Decision: Validate routing at the shared-runtime boundary

Validation should focus on proving that the same Next.js app serves the storefront root, product routes, and admin routes under the same port. That can be done through build/runtime checks and documentation without changing route ownership.

Rationale:
- The change is about runtime unification, so the verification must be route-based rather than just script-based.

## Risks / Trade-offs

- [Developers may still expect a dedicated admin command] -> Mitigation: remove the stale script and document the single shared run command clearly.
- [Documentation may still mention admin as a separate runtime in overlooked places] -> Mitigation: search for `3010`, `dev:admin`, and separate admin startup wording during implementation.
- [A route under `/product` might actually use `/products` in the app] -> Mitigation: validate against the real route structure and document the exact supported URLs that exist in the codebase.

## Migration Plan

1. Audit frontend scripts, compose config, and docs for separate-admin runtime assumptions.
2. Remove the legacy `3010` startup logic from `my-app/package.json`.
3. Confirm `docker-compose.yml` continues to use only the shared `my-app` runtime on `3009`.
4. Update documentation with the final Windows run commands and shared URLs.
5. Validate that the shared runtime serves storefront and admin routes from the same app.

Rollback:
- Revert the script and documentation cleanup if it blocks local development unexpectedly, but do not introduce a second frontend runtime as the default path.

## Open Questions

- Whether the storefront route the team wants documented is `/product` or `/products`, since the request mentions `/product` while existing README content references `/products`.
