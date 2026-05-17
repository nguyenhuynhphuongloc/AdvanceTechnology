# Missing Pages & Routes

This document lists all missing, broken, and mock routes across Buyer, Seller, and Admin UI in `my-app`.

---

## Buyer Missing Routes

### Critical (High Priority)

#### 1. `/shops` — Shop Directory Page

| Item | Detail |
|------|--------|
| Route | `/shops` |
| Purpose | Public listing of all approved shops |
| Current | Does not exist |
| Priority | High — needed for marketplace discovery |
| Notes | Public page, no auth needed |

**UI elements needed**:
- Shop cards grid: logo, name, description, product count, rating placeholder
- Search by shop name
- Sort by: newest, popular
- Pagination

**API needed**: `GET /api/v1/shops` (available in Phase 1 contract — approved shops only)

#### 2. `/shops/[slug]` — Public Shop Page

| Item | Detail |
|------|--------|
| Route | `/shops/[slug]` |
| Purpose | Public shop profile with product listings |
| Current | Does not exist |
| Priority | High — needed for marketplace discovery |
| Notes | Public page, no auth needed |

**UI elements needed**:
- Shop banner + logo + name + description + contact
- Shop status (approved/rejected — show only approved)
- Product grid filtered by shop
- Contact info

**API needed**: `GET /api/v1/shops/:slug` + `GET /api/v1/shops/:slug/products` (Phase 2A contract)

#### 3. `/shops/[slug]/products` — Shop Products (optional)

| Item | Detail |
|------|--------|
| Route | `/shops/[slug]/products` |
| Purpose | Filtered products from a specific shop |
| Current | Does not exist |
| Priority | Medium |
| Notes | Could be handled within `/shops/[slug]` page as a tab/section |

**Recommendation**: Integrate into `/shops/[slug]` page rather than separate route.

#### 4. `/profile` — Buyer Profile Page

| Item | Detail |
|------|--------|
| Route | `/profile` |
| Purpose | Buyer profile management |
| Current | Does not exist |
| Priority | Medium |
| Notes | Needs auth |

**UI elements needed**:
- Profile form: fullName, phone, avatarUrl
- Default address selection
- Links to addresses

**API needed**: `GET /api/v1/users/me/profile`, `PATCH /api/v1/users/me/profile` (Phase 1 contract)

#### 5. `/addresses` — Buyer Addresses Management

| Item | Detail |
|------|--------|
| Route | `/addresses` |
| Purpose | Manage shipping addresses |
| Current | Does not exist |
| Priority | Medium |
| Notes | Needs auth |

**UI elements needed**:
- Address list with default indicator
- Add/edit/delete address forms
- Set default address

**APIs needed**:
- `GET /api/v1/users/me/addresses` (Phase 1 contract)
- `POST /api/v1/users/me/addresses` (Phase 1 contract)
- `PATCH /api/v1/users/me/addresses/:id` (Phase 1 contract)
- `DELETE /api/v1/users/me/addresses/:id` (Phase 1 contract)

### Low Priority

#### 6. `/notifications` — Buyer Notifications

| Item | Detail |
|------|--------|
| Route | `/notifications` |
| Purpose | Buyer order notifications |
| Current | Does not exist |
| Priority | Low |

---

## Seller Missing Routes

### Medium Priority

#### 1. `/seller/analytics` — Seller Analytics Dashboard

| Item | Detail |
|------|--------|
| Route | `/seller/analytics` |
| Purpose | Sales analytics for seller |
| Current | Does not exist |
| Priority | Medium |

**UI elements needed**:
- Revenue chart (simple, using computed data)
- Orders over time
- Top products by revenue
- Inventory alerts

**Implementation approach**: Compute from existing seller APIs (no new API needed):
- `fetchSellerOrders` → revenue, orders
- `fetchSellerProducts` → top products
- `fetchSellerInventory` → low stock alerts

**Recommendation**: Quick win — can be built in 1-2 days using existing APIs.

#### 2. `/seller/notifications` — Seller Notifications

| Item | Detail |
|------|--------|
| Route | `/seller/notifications` |
| Purpose | Order status change notifications |
| Current | Does not exist |
| Priority | Medium |

**UI elements needed**:
- Notification list: type, message, timestamp, read/unread
- Mark as read

**API status**: **MISSING** — no notification API in any phase contract. Requires notification infrastructure.

**Recommendation**: Placeholder page until notification system is built.

#### 3. `/seller/settings` — Seller Settings

| Item | Detail |
|------|--------|
| Route | `/seller/settings` |
| Purpose | Payout settings, notification preferences |
| Current | Does not exist |
| Priority | Low |

**UI elements needed**:
- Stripe account connection (placeholder)
- Notification preferences (placeholder)
- Account settings

**Recommendation**: Placeholder page — payout requires Stripe Connect integration.

---

## Admin Missing Routes

### High Priority

#### 1. `/admin/sellers` — Seller Management

| Item | Detail |
|------|--------|
| Route | `/admin/sellers` |
| Purpose | List and manage all sellers |
| Current | Does not exist |
| Priority | High |

**API available**: `GET /api/v1/admin/sellers` (Phase 1 contract — needs verification)

**UI elements needed**:
- Seller table: name, email, shop name, status, joined date
- Search/filter by status
- View seller detail
- Suspend/activate seller

**Missing API**: `GET /api/v1/admin/sellers/:id` (seller detail) — needs to be requested

#### 2. `/admin/seller-profiles` — Seller Profile Management

| Item | Detail |
|------|--------|
| Route | `/admin/seller-profiles` |
| Purpose | Manage seller profiles |
| Current | Does not exist |
| Priority | High |

**API available**: `GET /api/v1/admin/seller-profiles`, `PATCH /api/v1/admin/seller-profiles/:id/status` (Phase 1 contract — needs verification)

**UI elements needed**:
- Profile table: businessName, status, seller email
- Approve/reject/suspend actions

#### 3. `/admin/shop-approvals` — Shop Approval Queue

| Item | Detail |
|------|--------|
| Route | `/admin/shop-approvals` |
| Purpose | Review pending shop registrations |
| Current | Does not exist |
| Priority | High |

**API available**:
- `GET /api/v1/admin/shops?status=pending` (Phase 1 contract)
- `PATCH /api/v1/admin/shops/:id/approve` (Phase 1 contract)
- `PATCH /api/v1/admin/shops/:id/reject` (Phase 1 contract)
- `PATCH /api/v1/admin/shops/:id/suspend` (Phase 1 contract)

**UI elements needed**:
- Pending shops table: shop name, seller, description, contact, submission date
- Approve button → `PATCH /approve`
- Reject button → `PATCH /reject` with reason input
- View detail link

#### 4. `/admin/product-approvals` — Product Approval Queue

| Item | Detail |
|------|--------|
| Route | `/admin/product-approvals` |
| Purpose | Review pending product submissions |
| Current | Does not exist |
| Priority | High |

**API available**:
- `GET /api/v1/admin/products?status=pending` (Phase 2A contract)
- `PATCH /api/v1/admin/products/moderation/:id/approve` (Phase 2A contract)
- `PATCH /api/v1/admin/products/moderation/:id/reject` (Phase 2A contract)
- `PATCH /api/v1/admin/products/moderation/:id/hide` (Phase 2A contract)

**UI elements needed**:
- Pending products table: image, name, shop, category, price, submission date
- Preview product details
- Approve → `PATCH /approve`
- Reject → `PATCH /reject` with reason input
- Hide → `PATCH /hide`

### Medium Priority

#### 5. `/admin/users/[id]` — User Detail

| Item | Detail |
|------|--------|
| Route | `/admin/users/[id]` |
| Purpose | User detail with linked buyer/seller profiles |
| Current | Does not exist |
| Priority | Medium |

**API available**:
- `GET /api/v1/admin/users/:id` (Phase 1 contract)
- `PATCH /api/v1/admin/users/:id/status` (Phase 1 contract)
- `PATCH /api/v1/admin/users/:id/role` (Phase 1 contract)

**UI elements needed**:
- User info card: email, role, status, dates
- Toggle active status
- Change role (customer/seller/admin)
- Linked buyer profile if exists
- Linked seller profile if exists
- User's orders (if any)

#### 6. `/admin/analytics` — Admin Analytics Dashboard

| Item | Detail |
|------|--------|
| Route | `/admin/analytics` |
| Purpose | Platform-wide analytics |
| Current | Does not exist |
| Priority | Medium |

**Implementation approach**: Compute from existing admin APIs:
- `fetchAdminOrders` → revenue, order volume
- `fetchAdminUsers` → user growth
- `fetchAdminProducts` → product growth
- `fetchAdminPayments` → payment stats

**UI elements needed**:
- Revenue overview
- Order volume over time
- Top products by revenue
- Top shops by revenue
- User registration growth
- Low stock alerts

#### 7. `/admin/orders/[id]` — Order Detail Enhancement

| Item | Detail |
|------|--------|
| Route | `/admin/orders/[id]` |
| Purpose | Full order detail with shopOrders |
| Current | Exists (Phase 4A) but uses list endpoint |
| Priority | Medium |

**Issue**: Phase 4A noted: "Admin order detail fetches from list endpoint — no dedicated detail endpoint"

**Current approach**: Uses `fetchAdminOrders` (list) and filters by ID. Works but inefficient.

**Recommendation**: Keep current approach OR request dedicated `GET /api/v1/admin/orders/:id` endpoint.

### Low Priority

#### 8. `/admin/refunds` — Refund Management (Placeholder)

| Item | Detail |
|------|--------|
| Route | `/admin/refunds` |
| Purpose | Process refund requests |
| Current | Does not exist |
| Priority | Low |

**API status**: **MISSING** — No refund API in any phase contract.

**Recommendation**: Placeholder page — "Refund management coming soon"

#### 9. `/admin/commissions` — Commission Tracking (Placeholder)

| Item | Detail |
|------|--------|
| Route | `/admin/commissions` |
| Purpose | View platform commission |
| Current | Does not exist |
| Priority | Low |

**API status**: **MISSING** — No commission API in any phase contract.

**Recommendation**: Placeholder page — "Commission tracking coming soon"

#### 10. `/admin/settings` — Admin Settings (Redirect)

| Item | Detail |
|------|--------|
| Route | `/admin/settings` |
| Purpose | Generic settings redirect |
| Current | Does not exist |
| Priority | Low |

**Recommendation**: Redirect to `/admin/store-settings` or create unified settings page.

---

## Existing Routes Needing Redesign

### Buyer Routes

| Route | Issue | Priority |
|-------|-------|----------|
| `/login` | Uses simple redirect — not unified with `/product/account` | Low |
| `/register` | Uses simple redirect — not unified with `/product/account` | Low |
| `/product/account` | Same component reused for login/register — design is basic | Low |

### Seller Routes

| Route | Issue | Priority |
|-------|-------|----------|
| `/seller/login` | Uses AccountPageClient — basic styling | Low |
| `/seller/register` | Uses AccountPageClient — basic styling | Low |

---

## Existing Mock Routes Needing Real API

### No mock routes currently in Phase 4B seller pages

All Phase 4B seller pages now use real APIs. No mock/localStorage data sources remain for seller pages.

### Buyer Pages

| Route | Current Status | Notes |
|-------|--------------|-------|
| `/product/account` | localStorage auth | Not mock data — auth storage pattern |
| `/product/chat` | n8n webhook | Intentional external integration |

---

## Missing API List

### Buyer APIs

| API | Endpoint | Status | Notes |
|-----|----------|--------|-------|
| Shop listing | `GET /api/v1/shops` | Available | Phase 1 contract — needs UI |
| Shop by slug | `GET /api/v1/shops/:slug` | Available | Phase 1 contract — needs UI |
| Shop products | `GET /api/v1/shops/:slug/products` | Available | Phase 2A contract — needs UI |
| Buyer profile | `GET /api/v1/users/me/profile` | Available | Phase 1 contract — needs UI |
| Update profile | `PATCH /api/v1/users/me/profile` | Available | Phase 1 contract — needs UI |
| Address list | `GET /api/v1/users/me/addresses` | Available | Phase 1 contract — needs UI |
| Create address | `POST /api/v1/users/me/addresses` | Available | Phase 1 contract — needs UI |
| Update address | `PATCH /api/v1/users/me/addresses/:id` | Available | Phase 1 contract — needs UI |
| Delete address | `DELETE /api/v1/users/me/addresses/:id` | Available | Phase 1 contract — needs UI |

### Seller APIs

| API | Endpoint | Status | Notes |
|-----|----------|--------|-------|
| Seller analytics | `GET /api/v1/seller/analytics` | **MISSING** | Compute from existing APIs instead |
| Seller notifications | `GET /api/v1/seller/notifications` | **MISSING** | Notification infrastructure needed |
| Seller payout | `GET /api/v1/seller/payouts` | **MISSING** | Phase 8 scope |
| Category list | `GET /api/v1/categories` | **MISSING** | Hardcoded categories in product forms |

### Admin APIs

| API | Endpoint | Status | Notes |
|-----|----------|--------|-------|
| Seller list | `GET /api/v1/admin/sellers` | Available | Phase 1 — needs UI + verify |
| Seller detail | `GET /api/v1/admin/sellers/:id` | **MISSING** | Request from backend |
| Sellers by shop | `GET /api/v1/admin/sellers/:id/products` | **MISSING** | Request from backend |
| Shop approvals | `GET /api/v1/admin/shops?status=pending` | Available | Phase 1 — needs UI |
| Product approvals | `GET /api/v1/admin/products?status=pending` | Available | Phase 2A — needs UI |
| Refund list | `GET /api/v1/admin/refunds` | **MISSING** | Phase 8 scope |
| Refund action | `PATCH /api/v1/admin/refunds/:id` | **MISSING** | Phase 8 scope |
| Commission list | `GET /api/v1/admin/commissions` | **MISSING** | Phase 8 scope |
| Analytics endpoint | `GET /api/v1/admin/analytics` | **MISSING** | Compute from existing APIs |
| User orders | `GET /api/v1/admin/users/:id/orders` | **MISSING** | Request from backend |

---

## Summary

| Category | Count | Items |
|----------|-------|-------|
| Buyer missing routes | 5 | /shops, /shops/[slug], /profile, /addresses, /notifications |
| Seller missing routes | 3 | /analytics, /notifications, /settings |
| Admin missing routes | 10 | /sellers, /seller-profiles, /shop-approvals, /product-approvals, /users/[id], /analytics, /refunds, /commissions, /settings, /orders/[id] redesign |
| Routes needing redesign | 5 | /login, /register, /product/account, /seller/login, /seller/register |
| Routes needing real API | 0 | None — Phase 4B completed all seller API work |
| Missing Buyer APIs | 0 | All buyer APIs available, just need UI |
| Missing Seller APIs | 2 | analytics (compute), notifications (infra) |
| Missing Admin APIs | 6 | detail endpoints, refunds, commissions, analytics |
