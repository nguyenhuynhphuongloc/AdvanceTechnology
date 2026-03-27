## Context

The admin area currently has a mismatch between frontend behavior and backend capabilities. The backend already exposes real database-backed admin authentication, product management, and inventory management endpoints through the API gateway, and the frontend already contains an `admin/api.ts` client for calling those endpoints. However, the login page still bypasses authentication, and the dashboard still renders hardcoded demo arrays for overview, products, inventory, users, and orders.

This change is primarily a frontend integration task, but it crosses auth flow, route protection, dashboard data loading, and user messaging about unsupported backend sections. The implementation should preserve the current admin layout and route structure while replacing fake data flow with real data flow.

## Goals / Non-Goals

**Goals:**
- Replace the fake admin login flow with real authentication against `/api/v1/auth/admin/login`.
- Require a valid admin session for `/admin` routes and validate that session with `/api/v1/auth/admin/me` where needed.
- Load real product and inventory data through the existing admin API client.
- Derive dashboard stats only from backend-supported product/inventory data.
- Show explicit loading, error, empty, and unavailable states instead of fake placeholders pretending to be real.
- Preserve the existing admin UI layout as much as practical.

**Non-Goals:**
- Redesign the entire admin UI.
- Add new backend order or user admin endpoints in this change.
- Invent fake order/user data to make unsupported sections look complete.
- Replace the existing admin API client with direct ad hoc `fetch` calls from components.

## Decisions

### Decision: Keep the existing admin API layer as the frontend integration boundary

All admin frontend data and auth requests should continue to flow through `my-app/lib/admin/api.ts`, with extensions added there only when the UI needs additional helpers. UI components should not bypass that layer.

Rationale:
- The API layer already exists and encapsulates gateway base URL resolution, auth headers, and error handling.
- Reusing it keeps the admin frontend architecture coherent.

Alternatives considered:
- Let each admin component call `fetch` directly. Rejected because it spreads auth/header/error logic across the UI.

### Decision: Persist admin auth in the current frontend session pattern and validate before rendering protected pages

The implementation should store the successful admin login token in the existing session mechanism used by the admin frontend, then use `/api/v1/auth/admin/me` to confirm that the stored token still maps to a valid admin session. Protected admin routes should redirect to `/admin/login` when no valid session exists.

Rationale:
- The README already documents an `admin_session` cookie pattern, so the frontend should align with that runtime contract.
- Real route protection matters more than simply hiding buttons in the dashboard.

Alternatives considered:
- Keep a client-only redirect after login without session validation. Rejected because it preserves the current bypass.

### Decision: Make product and inventory sections real now, and mark orders/users as unavailable

Products and inventory should be wired to their real backend endpoints immediately because the necessary APIs already exist. Orders and users should not display fabricated values; instead, those sections should show clear “not available yet” states until matching admin endpoints exist.

Rationale:
- This matches the actual backend support level.
- It avoids misleading operators with numbers that do not come from the database.

Alternatives considered:
- Keep fake order/user cards until the backend catches up. Rejected because it violates the requirement not to present demo data as real.

### Decision: Derive overview stats from fetched product and inventory data only

The overview panel should compute metrics such as total products, active products, total inventory rows, and low-stock inventory rows from the real API responses already loaded for supported sections. Unsupported metrics should be omitted or replaced with a clearly unavailable state.

Rationale:
- This makes the overview honest and immediately useful without needing new backend aggregation endpoints.

Alternatives considered:
- Add backend stats endpoints first. Rejected because it is unnecessary for the minimum real-data scope requested here.

## Risks / Trade-offs

- [Frontend session storage may diverge from existing middleware expectations] -> Mitigation: align the implementation with the current admin session pattern already referenced in project docs and route protection.
- [Order and user views may feel incomplete after fake data is removed] -> Mitigation: present explicit unavailable states and list the missing backend endpoints in documentation or the final implementation summary.
- [Dashboard may need multiple API requests before rendering] -> Mitigation: use a simple loading strategy and derive overview stats from already fetched product/inventory responses.
- [Unauthorized/expired sessions may create noisy UX] -> Mitigation: centralize auth error handling so expired sessions redirect cleanly back to `/admin/login`.

## Migration Plan

1. Audit the current admin login page, dashboard component, and API helpers.
2. Implement real login and session persistence using the existing admin API layer.
3. Add admin-session validation for protected pages.
4. Replace fake dashboard data with real products and inventory API reads.
5. Convert unsupported orders/users sections to explicit unavailable states.
6. Validate login, protected-route behavior, and dashboard data loading.

Rollback:
- Revert the frontend auth and dashboard integration changes if they block the admin UI, but do not restore hardcoded demo data as the long-term default.

## Open Questions

- Whether the existing admin middleware already reads the same session token format the updated login flow will write, or whether a small shared utility is needed to keep cookie handling consistent.
- Whether admin product CRUD and inventory mutation actions should be wired in the same change if the existing dashboard currently only needs read-first visibility.
