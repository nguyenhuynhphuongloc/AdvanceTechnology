## Context

The current repository already has the main building blocks for this change, but they are unevenly implemented. `my-app` is a Next.js storefront that already consumes gateway-backed product APIs. `microservices/api-gateway` can proxy requests and validate JWT bearer tokens, but it currently relies on a shared `JWT_SECRET` and only protects selected route prefixes. `microservices/product-service` already supports catalog creation, list, detail, and related-product reads. By contrast, `microservices/authentication-service` and `microservices/inventory-service` are still Nest scaffolds with database wiring but no domain modules or useful endpoints.

This change is cross-cutting because the admin workflow spans frontend routing and session handling, token issuance and validation, catalog mutation, inventory mutation, environment configuration, and test coverage across service boundaries. The design must therefore minimize architectural churn and add only the missing pieces needed for a production-oriented admin flow.

## Goals / Non-Goals

**Goals:**
- Add an admin UI within the existing Next.js app for product and inventory operations.
- Implement real JWT issuance in `authentication-service` so admin login/logout becomes functional instead of assumed.
- Reuse the API gateway as the single browser-facing API entry point for admin requests.
- Add only the missing admin CRUD endpoints to `product-service` and the missing stock APIs to `inventory-service`.
- Protect admin-facing routes and requests so unauthenticated users cannot access product or inventory management.
- Keep environment-variable based configuration explicit and fail fast when critical auth or service URLs are missing.
- Define end-to-end validation for auth, protected routes, product CRUD, and inventory updates.

**Non-Goals:**
- Building a separate standalone admin application or introducing a new frontend framework.
- Replacing the API gateway with direct browser-to-service calls.
- Redesigning the catalog model already added to `product-service`.
- Implementing refresh-token rotation, SSO, or a full RBAC system beyond what admin-only access requires.
- Expanding inventory into reservation/confirmation workflows beyond the minimum needed for admin lookup and stock edits.

## Decisions

- **Place the admin UI inside `my-app` under a dedicated `/admin` route tree**: This reuses the existing Next.js runtime, styling pipeline, and API utilities instead of introducing a new deployable application.
  - Alternative: create a separate admin frontend project. Rejected because it adds deployment, configuration, and session duplication for a scope that can fit inside the existing app.
  - Implementation note: the route tree can live under `my-app/app/admin`, while shared utilities remain in tracked locations outside the ignored admin path if necessary.

- **Use `authentication-service` as the token issuer and `api-gateway` as the token verifier**: The gateway already has `JwtStrategy` and protected route guards, so the cleanest path is to make the auth service issue JWTs signed with the same configured secret and let the gateway remain the enforcement point for admin APIs.
  - Alternative: have the gateway both issue and verify tokens. Rejected because token issuance belongs to the authentication boundary, not the routing layer.
  - Alternative: temporary cookie or session-only admin auth without JWT. Rejected because the user explicitly requires JWT-based auth and protected authenticated requests.

- **Treat admin access as a role claim carried in the JWT**: The token payload should contain at least `id`, `email`, and `role`, and admin pages/API calls should require `role=admin`.
  - Alternative: allow any authenticated user to access admin routes. Rejected because it violates the requested admin-only workflow.
  - Alternative: add a separate permissions service. Rejected as unnecessary for the current scope.

- **Keep browser requests flowing through `/api/v1/*` on the gateway**: The admin UI should call gateway routes for auth, products, and inventory instead of contacting service-local ports directly.
  - Alternative: direct requests from the admin module to individual microservices. Rejected because it bypasses the existing gateway architecture and complicates deployment and secrets handling.

- **Extend `product-service` with minimal admin mutation endpoints instead of a parallel admin catalog service**: The service already owns product entities and create/list/detail logic, so update/delete/detail-by-id and admin list filtering should remain there.
  - Alternative: create a separate admin backend or duplicate catalog mutation logic elsewhere. Rejected because it fragments ownership and increases the risk of drift from the storefront product model.

- **Implement inventory as its own first-class module inside `inventory-service` with variant references back to `product-service`**: Inventory should store stock and status keyed by `productId`, `variantId`, and `sku`, while product descriptions remain in `product-service`.
  - Alternative: move stock quantities into `product-service`. Rejected because the architecture document already splits catalog from stock ownership and the user requested integration with the existing inventory service.

- **Use HTTP-only backend protection plus frontend route guards for admin UX**: Server components and middleware/layout checks should redirect unauthenticated users away from `/admin`, while the gateway still enforces bearer-token authentication on protected downstream calls.
  - Alternative: frontend-only protection. Rejected because it is insufficient for real security.

- **Persist the JWT in a single admin session mechanism and clear it fully on logout**: The simplest implementation is a server-readable cookie or a coordinated cookie/local-storage approach, but the chosen mechanism must support protected Next.js route checks and authenticated fetches from the admin UI.
  - Alternative: store tokens only in in-memory React state. Rejected because refresh/navigation would lose session state and break protected routes.

- **Ignore only the admin route/module path in `.gitignore`**: Because the user explicitly requested that the admin module not be pushed to GitHub, the ignore rule should target the concrete admin path, not broader frontend directories.
  - Alternative: ignore the whole `my-app` project or broad route folders. Rejected because it would hide unrelated tracked work.

## Risks / Trade-offs

- **JWT secret drift between auth service and gateway** -> Mitigation: document and validate shared JWT env vars in both services, and fail startup when they are missing.
- **Admin product mutations can diverge from storefront read models** -> Mitigation: keep write paths in `product-service` and reuse existing DTO/entity mapping instead of adding parallel models.
- **Inventory records may reference missing or deleted variants** -> Mitigation: validate referenced product/variant identifiers against `product-service` during write flows, or enforce a clear not-found/error contract when a variant is no longer valid.
- **Ignoring the admin module in Git can hide critical changes accidentally** -> Mitigation: constrain ignore rules to the dedicated admin path and keep shared libraries/config outside that path when they must remain tracked.
- **Frontend auth storage choice affects SSR protection and security posture** -> Mitigation: prefer a server-readable session mechanism that supports route protection and authenticated server-side fetches.

## Migration Plan

1. Implement JWT issuance and admin login/logout endpoints in `authentication-service`, including env validation and tests.
2. Add admin-aware route protection and auth forwarding behavior in `api-gateway` for product and inventory management paths.
3. Extend `product-service` with update/delete/admin-read capabilities and implement the new `inventory-service` domain module with stock query/update endpoints.
4. Build the `/admin` UI flows in `my-app`, wire them to gateway-backed auth/product/inventory APIs, and add logout/session clearing.
5. Add the targeted `.gitignore` rule for the admin module path and verify ignored files are not staged.
6. Run service-level and end-to-end tests, then smoke-test the full admin workflow in a local runtime before commit.

Rollback remains straightforward because the changes are additive: the new admin endpoints, inventory module, and admin routes can be reverted without undoing the existing storefront catalog flow.

## Open Questions

- Should the admin login use a seeded hardcoded admin user initially, or should this change also create the first persisted admin account bootstrap path?
- Should admin product management operate on product `id`, `slug`, or both for mutation endpoints? The current storefront is slug-based, but admin edit/delete flows are usually simpler and less brittle with IDs.
- Should inventory status be derived purely from quantity thresholds inside `inventory-service`, or exposed as an explicit stored field that admins can override?
