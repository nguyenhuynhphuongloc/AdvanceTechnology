# Proposal: Admin Console Redesign — Phase 5

## Why

The Admin Platform Console is at 42% completion with 8 missing pages and 6 unverified pages, making it the most critical gap in the marketplace. Without it, admins cannot manage seller approvals, product moderation, or platform-wide operations. Phase 4B completed the Seller Center (79%), and Phase 5 must complete the Admin Platform to unlock the full marketplace workflow.

## What Changes

### New Admin Pages
- `/admin/sellers` — Seller management list with status controls
- `/admin/seller-profiles` — Seller profile management with approve/reject/suspend actions
- `/admin/shop-approvals` — Pending shop registration review queue with approve/reject
- `/admin/product-approvals` — Pending product moderation queue with approve/reject/hide
- `/admin/users/[id]` — User detail page with linked buyer/seller profiles
- `/admin/analytics` — Platform-wide analytics computed from existing APIs
- `/admin/refunds` — Placeholder page (backend not ready)
- `/admin/commissions` — Placeholder page (backend not ready)
- `/admin/settings` — Unified or redirect to `/admin/store-settings`

### Navigation & Layout Redesign
- Expand AdminShell sidebar with new groups: **Seller Management**, **Moderation**, **Finance**, **Analytics**
- Add missing nav items under existing and new groups
- Redesign admin navigation CSS — cleaner, more professional, distinct from Seller Center

### Shared Admin Components
- `AdminPageHeader` — Consistent page header with title, subtitle, breadcrumbs
- `AdminStatCard` — Stat card with icon, value, label, trend indicator
- `AdminStatusBadge` — Status badge with color variants
- `AdminEmptyState` — Empty state with icon, message, optional CTA
- `AdminLoadingState` — Loading spinner/skeleton
- `AdminActionBar` — Search + filter + action row
- `AdminModal` / `AdminConfirmDialog` — Modal patterns for approve/reject confirmations

### API Client Additions
- `fetchAdminSellerProfiles()`, `fetchAdminSellerProfileDetail()`, `updateAdminSellerProfileStatus()`
- `fetchAdminShops()`, `approveShop()`, `rejectShop()`, `suspendShop()`, `restoreShop()`
- `fetchAdminProducts(query)` with `approvalStatus` filter, `approveProduct()`, `rejectProduct()`, `hideProduct()`
- `fetchAdminUserDetail()`, `updateAdminUserStatus()`, `updateAdminUserRole()`
- `fetchAdminCategories()` — already exists, verify

### Type Definitions
- `AdminSellerProfile`, `AdminSellerProfileListResponse`
- `AdminShopRecord`, `AdminShopListResponse`
- `AdminModerationProduct`, `AdminModerationProductListResponse`
- `AdminUserDetail`

## Capabilities

### New Capabilities
- `admin-seller-management`: Seller and seller profile management pages with moderation workflow (approve/reject/suspend)
- `admin-moderation-queue`: Shop approval and product approval review queues
- `admin-user-detail`: User detail view with linked profiles and status/role controls
- `admin-analytics-dashboard`: Simple analytics page computed from existing admin APIs
- `admin-navigation-redesign`: Redesigned admin shell with expanded navigation groups

### Modified Capabilities
- `admin-ux-redesign`: Extend sidebar nav groups and add shared component library for consistency

## Impact

### Frontend (`my-app`)
- New pages: `app/admin/sellers/`, `app/admin/seller-profiles/`, `app/admin/shop-approvals/`, `app/admin/product-approvals/`, `app/admin/users/[id]/`, `app/admin/analytics/`, `app/admin/refunds/`, `app/admin/commissions/`, `app/admin/settings/`
- New components: `components/admin/AdminPageHeader.tsx`, `AdminStatCard.tsx`, `AdminStatusBadge.tsx`, `AdminEmptyState.tsx`, `AdminLoadingState.tsx`, `AdminActionBar.tsx`, `AdminModal.tsx`
- Updated: `components/admin/AdminShell.tsx` (nav items), `lib/admin/api.ts`, `lib/admin/types.ts`, `lib/admin/constants.ts`

### Backend (verified — no changes needed for API routes)
- All required admin endpoints already exist in gateway routes and backend services
- No gateway route additions required
- No backend controller additions required

### APIs Verified
| API | Gateway Route | Backend Controller | Status |
|-----|-------------|-------------------|--------|
| `GET /api/v1/admin/users` | ✅ Exists | `auth-service` | OK |
| `GET /api/v1/admin/users/:id` | ✅ Exists | `auth-service` | OK |
| `PATCH /api/v1/admin/users/:id/status` | ✅ Exists | `auth-service` | OK |
| `PATCH /api/v1/admin/users/:id/role` | ✅ Exists | `auth-service` | OK |
| `GET /api/v1/admin/seller-profiles` | ✅ Exists | `user-service` | OK |
| `GET /api/v1/admin/seller-profiles/:id` | ✅ Exists | `user-service` | OK |
| `PATCH /api/v1/admin/seller-profiles/:id/status` | ✅ Exists | `user-service` | OK |
| `GET /api/v1/admin/shops` | ✅ Exists | `store-service` | OK |
| `PATCH /api/v1/admin/shops/:id/approve` | ✅ Exists | `store-service` | OK |
| `PATCH /api/v1/admin/shops/:id/reject` | ✅ Exists | `store-service` | OK |
| `PATCH /api/v1/admin/shops/:id/suspend` | ✅ Exists | `store-service` | OK |
| `PATCH /api/v1/admin/shops/:id/restore` | ✅ Exists | `store-service` | OK |
| `GET /api/v1/admin/products` | ✅ Exists | `product-service` | OK |
| `PATCH /api/v1/admin/products/moderation/:id/approve` | ✅ Exists | `product-service` | OK |
| `PATCH /api/v1/admin/products/moderation/:id/reject` | ✅ Exists | `product-service` | OK |
| `PATCH /api/v1/admin/products/moderation/:id/hide` | ✅ Exists | `product-service` | OK |
| `GET /api/v1/admin/orders` | ✅ Exists | `order-service` | OK |
| `GET /api/v1/admin/orders/:id` | ✅ Exists | `order-service` | OK |
| `GET /api/v1/admin/shop-orders` | ✅ Exists | `order-service` | OK |
| `GET /api/v1/admin/inventory` | ✅ Exists | `inventory-service` | OK |
| `GET /api/v1/admin/payments` | ✅ Exists | `payment-service` | OK |
| `GET /api/v1/admin/categories` | ✅ Exists | `product-service` | OK |
| `GET /api/v1/admin/store-settings` | ✅ Exists | `store-service` | OK |
| `GET /api/v1/admin/logs` | ✅ Exists | `api-gateway` | OK |
| `GET /api/v1/admin/notifications` | ✅ Exists | `notification-service` | OK |
| `GET /api/v1/admin/sellers` | ❌ Missing | No controller | Known Issue |
| `GET /api/v1/admin/sellers/:id` | ❌ Missing | No controller | Known Issue |
| `GET /api/v1/admin/refunds` | ❌ Missing | No controller | Known Issue |
| `GET /api/v1/admin/commissions` | ❌ Missing | No controller | Known Issue |

### Out of Scope
- Buyer UI redesign
- Seller UI redesign
- Refund backend (Phase 8)
- Commission backend (Phase 8)
- Payment split / settlement
- Notification infrastructure
- Database schema redesign
