# Phase 5 Scope Recommendation

## Recommendation

**Phase 5 should focus exclusively on the Admin Platform Console.**

Rationale:
- Seller completion is already at 79% (Phase 4B just finished)
- Buyer completion is at 56%, with gaps primarily in shop directory and profile pages
- Admin completion is at 42%, with 8 completely missing pages and 6 unverified pages
- Admin platform is foundational — without it, marketplace operations (approvals, seller management, refunds) cannot happen
- Existing admin pages use server-side rendering with cookie-based auth (different from seller/buyer pattern)
- Admin UI uses a separate light theme (not dark) which is distinct from buyer/seller

## Phase 5 Sub-Phases

### Phase 5A: Admin Layout & Navigation Foundation

**Goal**: Redesign admin shell, add missing nav groups, create shared admin components.

**Files to change**:
- `components/admin/AdminShell.tsx` — Add new nav groups (Seller Management, Moderation, Finance)
- `components/admin/AdminPageHeader.tsx` — **NEW** — Consistent page header
- `components/admin/AdminStatCard.tsx` — **NEW** — Admin stat card with accent colors
- `components/admin/AdminStatusBadge.tsx` — **NEW** — Admin status badge
- `components/admin/AdminEmptyState.tsx` — **NEW** — Empty state
- `components/admin/AdminLoadingState.tsx` — **NEW** — Loading spinner
- `components/admin/AdminDataTable.tsx` — Enhance existing table component
- `components/admin/AdminActionBar.tsx` — **NEW** — Search + filter + action bar

**Files to create**:
- None (layout uses existing AdminShell nav items)

**Navigation groups to add to AdminShell**:

| Group | Items |
|-------|-------|
| Seller Management | Sellers, Seller Profiles, Shop Approvals |
| Moderation | Product Approvals |
| Finance | Refunds, Commissions |
| Analytics | Analytics |

**API readiness**: All existing admin APIs already available.

---

### Phase 5B: Admin Core Management Pages

**Goal**: Complete the core management pages that currently exist but need new UI or missing detail pages.

**1. Admin Sellers Page (`/admin/sellers`) — NEW**

| Item | Detail |
|------|--------|
| Route | `/admin/sellers` |
| New/Existing | **NEW** |
| API Available | `GET /api/v1/admin/sellers` (Phase 1 API contract — admin seller profiles) |
| API Status | Listed in Phase 1 contract but verify it works |
| UI Template | Table with: seller name, email, shop name, status, created date, actions |
| Actions | View seller detail, suspend/activate |

**2. Admin Seller Profiles Page (`/admin/seller-profiles`) — NEW**

| Item | Detail |
|------|--------|
| Route | `/admin/seller-profiles` |
| New/Existing | **NEW** |
| API Available | `GET /api/v1/admin/seller-profiles`, `PATCH /api/v1/admin/seller-profiles/:id/status` |
| API Status | Listed in Phase 1 contract — verify |
| UI Template | Table with: profile name, status, created date, actions |
| Actions | Approve/reject/suspend seller profile |

**3. Admin Shop Approvals Page (`/admin/shop-approvals`) — NEW**

| Item | Detail |
|------|--------|
| Route | `/admin/shop-approvals` |
| New/Existing | **NEW** |
| API Available | `GET /api/v1/admin/shops?status=pending`, `PATCH /api/v1/admin/shops/:id/approve`, `PATCH /api/v1/admin/shops/:id/reject` |
| API Status | Listed in Phase 1 contract — verify |
| UI Template | Pending shops table: name, seller, created date, review action |
| Actions | Approve, Reject (with reason), View detail |

**4. Admin Product Approvals Page (`/admin/product-approvals`) — NEW**

| Item | Detail |
|------|--------|
| Route | `/admin/product-approvals` |
| New/Existing | **NEW** |
| API Available | `GET /api/v1/admin/products?status=pending`, `PATCH /api/v1/admin/products/moderation/:id/approve`, `PATCH /api/v1/admin/products/moderation/:id/reject` |
| API Status | Listed in Phase 2A contract — verify |
| UI Template | Pending products table: image, name, shop, seller, price, review action |
| Actions | Approve, Reject (with reason), View detail |
| Note | AdminProductsManager currently handles all products — new page for pending-only |

**5. Admin Users Detail Page (`/admin/users/[id]`) — NEW**

| Item | Detail |
|------|--------|
| Route | `/admin/users/[id]` |
| New/Existing | **NEW** |
| API Available | `GET /api/v1/admin/users/:id` (Phase 1 contract) |
| API Status | Listed — verify |
| UI Template | User detail: email, role, isActive, created date, linked buyer profile, linked seller profile |
| Actions | Toggle isActive, change role |

**6. Admin Categories Management Enhancement (`/admin/categories`)**

| Item | Detail |
|------|--------|
| Route | `/admin/categories` (existing) |
| New/Existing | **Existing — needs redesign** |
| API Available | `GET /api/v1/admin/categories`, `POST`, `PATCH`, `DELETE` |
| API Status | Needs verification |
| UI needed | Full CRUD table: name, slug, parent, product count, actions |
| Note | Check if current page has proper CRUD or just read-only |

---

### Phase 5C: Admin Commerce Pages

**Goal**: Complete order/finance management pages.

**1. Admin Order Detail Enhancement (`/admin/orders/[id]`)**

| Item | Detail |
|------|--------|
| Route | `/admin/orders/[id]` (existing — Phase 4A) |
| New/Existing | **Existing — needs redesign** |
| API Available | Uses `fetchAdminOrders` (list endpoint) since no dedicated detail endpoint |
| Issue | Phase 4A noted: "Admin order detail fetches from list endpoint — no dedicated detail endpoint" |
| Action Needed | Either use the same approach (pass full data from list) or request new API |
| UI needed | Full order: buyer info, all shopOrders, financial breakdown, status override |

**2. Admin Refunds Page (`/admin/refunds`) — NEW**

| Item | Detail |
|------|--------|
| Route | `/admin/refunds` |
| New/Existing | **NEW** |
| API Available | None yet |
| API Status | **MISSING** — no refund API in any phase contract |
| Recommendation | **Placeholder page only** — show "Refunds management coming soon" |
| Note | Backend refund flow not implemented yet |

**3. Admin Commissions Page (`/admin/commissions`) — NEW**

| Item | Detail |
|------|--------|
| Route | `/admin/commissions` |
| New/Existing | **NEW** |
| API Available | None yet |
| API Status | **MISSING** — commission API not in any phase contract |
| Recommendation | **Placeholder page only** — show "Commission tracking coming soon" |
| Note | Commission calculation not implemented yet |

**4. Admin Payments Enhancement (`/admin/payments`)**

| Item | Detail |
|------|--------|
| Route | `/admin/payments` (existing) |
| New/Existing | **Existing — needs verification** |
| API Available | `GET /api/v1/admin/payments` |
| UI needed | Payment table: payment ID, order ID, amount, method, status, date |
| Actions | View detail, initiate refund (placeholder) |

---

### Phase 5D: Admin Reports & System

**1. Admin Analytics Page (`/admin/analytics`) — NEW**

| Item | Detail |
|------|--------|
| Route | `/admin/analytics` |
| New/Existing | **NEW** |
| API Available | None (compute from existing APIs) |
| UI Template | Charts/stats: revenue, orders, top products, top shops, user growth |
| Implementation | Use `fetchAdminOrders`, `fetchAdminProducts`, `fetchAdminUsers` to compute stats |
| Recommendation | Simple stats first — no chart library dependency |

**2. Admin Settings Page (`/admin/settings`) — NEW**

| Item | Detail |
|------|--------|
| Route | `/admin/settings` |
| New/Existing | **NEW** |
| API Available | `GET /api/v1/admin/store-settings`, `PATCH /api/v1/admin/store-settings` |
| UI Template | Tabs: Store Identity, Platform Config, API Keys, System Config |
| Note | Redirect from generic `/admin/settings` to `/admin/store-settings` OR create unified settings page |

---

## Priority Ranking

| Priority | Page | Reason |
|----------|------|--------|
| 1 | `/admin/sellers` | High — needed to manage sellers |
| 2 | `/admin/seller-profiles` | High — linked to seller approval workflow |
| 3 | `/admin/shop-approvals` | High — critical for marketplace ops |
| 4 | `/admin/product-approvals` | High — admin product moderation |
| 5 | `/admin/users/[id]` | Medium — user management enhancement |
| 6 | `/admin/orders/[id]` redesign | Medium — better order detail |
| 7 | `/admin/analytics` | Medium — admin visibility |
| 8 | `/admin/payments` redesign | Medium — payment visibility |
| 9 | `/admin/categories` redesign | Low — if not already complete |
| 10 | `/admin/refunds` | Low — placeholder only |
| 11 | `/admin/commissions` | Low — placeholder only |
| 12 | `/admin/settings` | Low — redirect or placeholder |

---

## API Availability Summary for Phase 5

### APIs Already Available (verify they work)

| API | Endpoint | Phase | Purpose |
|-----|----------|-------|---------|
| List sellers | `GET /api/v1/admin/sellers` | Phase 1 | Seller list |
| Seller profiles | `GET /api/v1/admin/seller-profiles` | Phase 1 | Seller profile list |
| Approve shop | `PATCH /api/v1/admin/shops/:id/approve` | Phase 1 | Shop approval |
| Reject shop | `PATCH /api/v1/admin/shops/:id/reject` | Phase 1 | Shop rejection |
| Product list | `GET /api/v1/admin/products` | Phase 2A | Product list with filters |
| Approve product | `PATCH /api/v1/admin/products/moderation/:id/approve` | Phase 2A | Product approval |
| Reject product | `PATCH /api/v1/admin/products/moderation/:id/reject` | Phase 2A | Product rejection |
| Users | `GET /api/v1/admin/users` | Phase 1 | User list |
| User detail | `GET /api/v1/admin/users/:id` | Phase 1 | User detail |
| Categories | `GET /api/v1/admin/categories` | Phase 2A | Category list |
| Payments | `GET /api/v1/admin/payments` | Phase 3 | Payment list |
| Store settings | `GET /api/v1/admin/store-settings` | Phase 1 | Store settings |

### APIs Missing (do not implement in Phase 5 — request in separate backend phase)

| API | Status | Reason |
|-----|--------|--------|
| Seller detail | **MISSING** | No `GET /api/v1/admin/sellers/:id` |
| Refund list | **MISSING** | No refund API in contract |
| Refund action | **MISSING** | No refund API in contract |
| Commission list | **MISSING** | No commission API in contract |
| Commission calculation | **MISSING** | No commission API in contract |
| Seller product list by seller | **MISSING** | `GET /api/v1/admin/sellers/:id/products` |
| Analytics/summary | **MISSING** | No dedicated analytics API — compute from existing |

### Backend Changes Needed (request from backend team)

Before Phase 5 UI work, these backend endpoints may be needed:

1. `GET /api/v1/admin/sellers/:id` — Seller detail with shop and profile info
2. `GET /api/v1/admin/sellers/:id/products` — Products by seller
3. `GET /api/v1/admin/refunds` — Refund list (Phase 8 scope)
4. `PATCH /api/v1/admin/refunds/:id` — Process refund (Phase 8 scope)
5. `GET /api/v1/admin/commissions` — Commission tracking (Phase 8 scope)

---

## Out of Phase 5 Scope

- **Buyer shop directory pages** (`/shops`, `/shops/[slug]`) — defer to Phase 6
- **Buyer profile/addresses pages** (`/profile`, `/addresses`) — defer to Phase 6
- **Seller analytics page** — defer to Phase 6 (can reuse pattern from Phase 4B)
- **Seller notifications** — defer to Phase 6
- **Refund flow** — backend not ready, Phase 8
- **Commission/payment split** — backend not ready, Phase 8
- **Email/notification system** — separate infrastructure task
- **Shipping provider integration** — Phase 3 already noted as out of scope
