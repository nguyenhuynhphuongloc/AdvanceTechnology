# Post Phase 6 Seller/Admin Fix — Known Issues

Generated: 2025-07-14

## Seller Flow

| # | Issue | Impact | Resolution |
|---|---|---|---|
| 1 | store-service returns 502 | Shop creation fails during register | Bring store-service online; register still succeeds, user redirected to `/seller/shop` |
| 2 | Runtime not fully tested | Build passed, runtime test pending | Start all services and test full seller flow |

## Admin Pages (Placeholder)

| Page | Route | Status |
|---|---|---|
| Sellers | `/admin/sellers` | Placeholder — no backend API |
| Refunds | `/admin/refunds` | Placeholder — no backend API |
| Commissions | `/admin/commissions` | Placeholder — no backend API |

## Missing APIs

| API | Impact |
|---|---|
| `GET /api/v1/admin/sellers` | `/admin/sellers` shows placeholder |
| `GET /api/v1/admin/refunds` | `/admin/refunds` shows placeholder |
| `GET /api/v1/admin/commissions` | `/admin/commissions` shows placeholder |
| Buyer Profile API | `/marketplace/profile` is shell only |
| Buyer Address API | `/marketplace/addresses` is shell only |

## Pre-existing Warnings (Not introduced by this fix)

- `<img>` element warnings across codebase — consider migrating to `next/image`
- Unused variable warnings in some files
- store-service 502 — MongoDB/Neon PostgreSQL connectivity issue

## Out of Scope

- No backend changes made
- No new API endpoints created
- No database schema changes
- No Buyer UI changes
- No Seller Center page redesign
- No Admin page redesign
