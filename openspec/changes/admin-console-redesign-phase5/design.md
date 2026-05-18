# Design: Admin Console Redesign — Phase 5

## Context

The Admin Platform Console at 42% completion is the most critical gap in the marketplace. Eight pages are missing entirely, and six existing pages need verification. The existing AdminShell navigation is basic and lacks the management groups needed for marketplace operations. This design covers the approach for filling those gaps without expanding into backend work.

**Current state**: Admin pages exist for products, categories, inventory, orders, shop-orders, users, carts, payments, store-settings, logs, and notifications. Navigation has four groups: Overview, Catalog, Commerce, Customers, System.

**Constraints**:
- Backend APIs must be verified before building UI — do not rely on docs alone
- No backend implementation work beyond small fixes
- Must not break Buyer UI or Seller Center Phase 4B
- CSS/layout should be redesigned where existing patterns are poor
- Tailwind is available in the project

## Goals / Non-Goals

**Goals:**
- Complete all missing admin pages using real APIs where available
- Redesign admin navigation with new groups for marketplace operations
- Create shared admin component library for consistency
- Mark placeholder pages clearly when backend APIs are missing
- Pass `my-app` build

**Non-Goals:**
- Buyer UI redesign
- Seller UI redesign (Phase 4B is complete)
- Refund/commission backend implementation
- Payment split or settlement implementation
- Database schema changes
- Notification infrastructure

## Decisions

### Decision 1: Verify APIs from source code, not just docs

All admin API routes are verified against the actual gateway controller and backend service controller code before building UI. Gateway routes map to specific backend controllers:

| Group | Gateway Route | Backend Service |
|-------|-------------|----------------|
| Users | `AdminUserController` → `AUTH_SERVICE_URL` | `auth-service` — `AdminUsersController` |
| Seller Profiles | `AdminSellerProfilesController` → `USER_SERVICE_URL` | `user-service` — `AdminSellerProfilesController` |
| Shops | `AdminShopsController` → `STORE_SERVICE_URL` | `store-service` — `AdminShopsController` |
| Products | `AdminProductController` → `PRODUCT_SERVICE_URL` | `product-service` — `AdminProductController` |
| Moderation | `AdminProductModerationProxyController` → `PRODUCT_SERVICE_URL` | `product-service` — `AdminProductModerationController` |
| Orders | `AdminOrderController` → `ORDER_SERVICE_URL` | `order-service` — `AdminOrderController` |
| Shop Orders | `AdminShopOrderProxyController` → `ORDER_SERVICE_URL` | `order-service` — `AdminShopOrderController` |

**Rationale**: Docs can be stale. Verifying against source ensures the UI calls the correct endpoints. Any discrepancy gets written to `Known Issues` rather than guessed.

### Decision 2: Page strategy — real UI vs placeholder

Pages are classified into three tiers:

1. **Real UI** (API exists and verified): `seller-profiles`, `shop-approvals`, `product-approvals`, `users/[id]`, existing pages
2. **Computed UI** (no dedicated API, compute from existing): `analytics`
3. **Placeholder** (API missing): `sellers` (only list — no detail), `refunds`, `commissions`, `settings`

**Rationale**: Building placeholder pages with real UI components communicates "coming soon" without fabricating data. Users know the feature is planned, not broken.

### Decision 3: Shared component library

Create new reusable components in `components/admin/` rather than duplicating patterns across pages:
- `AdminPageHeader` — consistent title/subtitle/description per page
- `AdminStatCard` — metric display card with icon slot
- `AdminStatusBadge` — colored badge for status values
- `AdminEmptyState` — icon + message + optional CTA for empty lists
- `AdminLoadingState` — centered spinner for loading state
- `AdminActionBar` — search input + filter dropdown + action button row
- `AdminModal` — base modal wrapper
- `AdminConfirmDialog` — pre-built confirm dialog for approve/reject actions

**Rationale**: Consistent UI patterns reduce maintenance burden and make the admin console feel polished. The existing AdminProductsManager is a 1468-line monolith — shared components help avoid repeating that pattern.

### Decision 4: Navigation group structure

Expand AdminShell sidebar with five groups (removing "Customers", adding "Users & Sellers"):

| Group | Items |
|-------|-------|
| Overview | Dashboard |
| Users & Sellers | Users, Sellers*, Seller Profiles* |
| Moderation | Shop Approvals*, Product Approvals* |
| Catalog | Products, Categories, Inventory, Media Library |
| Commerce | Orders, Shop Orders, Payments, Carts |
| Finance | Refunds*, Commissions* |
| Analytics | Analytics* |
| System | Store Settings, Logs, Notifications |

*= new pages in Phase 5

**Rationale**: Grouping by operational domain (moderation, sellers) rather than raw data type (users vs shops) reflects how marketplace admins actually work. Seller profiles and shops are semantically related — both need approval workflows.

### Decision 5: No new CSS framework — Tailwind only

The project already uses Tailwind. All new components use Tailwind utility classes. Admin-specific CSS variables (e.g., `admin-accent`, `admin-surface`) are preserved and reused.

**Rationale**: Consistency with existing codebase. Adding CSS modules or styled-components would increase build complexity and diverge from the existing pattern.

### Decision 6: API client additions

Add new functions to `lib/admin/api.ts` following the existing pattern:
- All functions call `adminRequest<T>()` with token
- No mock data or fallback behavior
- Errors are thrown, not swallowed
- Response types added to `lib/admin/types.ts`

**Rationale**: The existing `adminRequest` pattern is clean and consistent. New functions follow the same contract. Types ensure compile-time safety.

## Risks / Trade-offs

[Risk] **Missing `/api/v1/admin/sellers` endpoint** → Mitigation: Create `/admin/sellers` as a redirect/alias to `/admin/seller-profiles` using existing `fetchAdminSellerProfiles()`, or create a placeholder with a note. Do NOT build a fake list from incomplete data.

[Risk] **`AdminProductModerationController` path mismatch** — Gateway proxies to `PRODUCT_SERVICE_URL/api/v1/admin/products/moderation` but the controller in product-service is at that exact path → Mitigation: Already verified the paths match. No action needed.

[Risk] **User detail from auth-service vs user-service** — Admin user detail comes from `auth-service` (AdminUsersController), but linked buyer/seller profiles come from `user-service` → Mitigation: `/admin/users/[id]` page makes two parallel calls. Show linked profiles section only if data exists.

[Risk] **Admin order detail endpoint** — Phase 4A noted "uses list endpoint". Order service now has `GET /:orderId` → Mitigation: Use the new detail endpoint for cleaner `/admin/orders/[id]` implementation.

[Risk] **Gateway `AdminRoleGuard` dependency** — All admin routes use `AdminRoleGuard` → Mitigation: No changes needed. Guard is already wired up in the gateway.

[Risk] **Build break from Tailwind config** → Mitigation: Verify `tailwind.config.js` includes `my-app/` content paths before building.

## Migration Plan

1. Add nav items to `AdminShell.tsx` — sidebar navigation only, no breaking change
2. Add shared components — additive, no breaking change
3. Add API client functions — additive, no breaking change
4. Add page routes — additive, no breaking change
5. Run `cd my-app && npm run build` — verify no TypeScript errors
6. Document any runtime issues in `phase-5-known-issues.md`

**Rollback**: If build fails or a page breaks existing functionality, revert the specific page file. No database migrations needed since this is frontend-only work plus verified backend APIs.

## Open Questions

1. Should `/admin/sellers` redirect to `/admin/seller-profiles` or show a placeholder with a note about missing backend?
   — **Decision**: Placeholder page with clear "Backend API not yet implemented" message and a link to the Known Issues doc.

2. Should the `AdminProductModerationController` GET endpoint return products by `approvalStatus` or does it return all products?
   — **Decision**: Check `getAdminProducts(query)` supports `approvalStatus` filter. If not, use `status=pending` query param on the existing `GET /api/v1/admin/products` endpoint.

3. Should `AdminShopOrdersController` PATCH endpoint for status updates use the existing `AdminUpdateShopOrderStatusDto`?
   — **Decision**: Yes — `updateAdminShopOrderStatus()` already calls `PATCH /api/v1/admin/shop-orders/:id/status` with the correct DTO.

4. Does the seller-profile API return seller email/contact info, or only businessName and status?
   — **Decision**: Verify by checking `user-service` response. If email is missing, display "N/A" and note in Known Issues that seller email is not exposed in the seller-profile API.
