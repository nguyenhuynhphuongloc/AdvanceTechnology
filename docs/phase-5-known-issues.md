# Phase 5 — Known Issues

## Missing Backend APIs

### High Priority

#### 1. `GET /api/v1/admin/sellers` — No seller list endpoint

**Status**: Missing. No controller exists at this path.

**Impact**: `/admin/sellers` page shows placeholder "Backend API not yet implemented" message.

**Recommendation**: Backend team should implement a seller management list endpoint that returns sellers with their linked shop and user information.

---

#### 2. `GET /api/v1/admin/sellers/:id` — No seller detail endpoint

**Status**: Missing. No controller exists.

**Impact**: Cannot build a seller detail view page.

**Recommendation**: Implement alongside the list endpoint above.

---

### Medium Priority

#### 3. `GET /api/v1/admin/refunds` — No refund management API

**Status**: Missing. No controller exists.

**Impact**: `/admin/refunds` page shows placeholder "Refund management coming soon" message.

**Recommendation**: Refund flow is Phase 8 scope. Not blocking Phase 5 completion.

---

#### 4. `GET /api/v1/admin/commissions` — No commission tracking API

**Status**: Missing. No controller exists.

**Impact**: `/admin/commissions` page shows placeholder "Commission tracking coming soon" message.

**Recommendation**: Commission system is Phase 8 scope. Not blocking Phase 5 completion.

---

## Runtime Issues (Not Verified)

### Build Verified, Runtime Not Tested

All Phase 5 pages pass TypeScript compilation and Next.js build. However, **no runtime testing was performed** because backend microservices were not running.

The following should be verified manually once all services are up:

- [ ] `/admin/seller-profiles` — API response shape matches `AdminSellerProfile` type
- [ ] `/admin/shop-approvals` — `fetchAdminShops({ status: "pending" })` returns correct data
- [ ] `/admin/product-approvals` — `fetchAdminModerationProducts({ status: "pending" })` returns correct data
- [ ] `/admin/users/[id]` — User detail loads and actions work
- [ ] `/admin/analytics` — All 4 API calls succeed and compute correct totals

---

## API Contract Issues

### 5. Seller Profile API — Email Field Not Exposed

**Issue**: The `user-service` `AdminSellerProfilesController` returns seller profiles but may not include seller email/contact info. The UI displays `businessName`, `status`, `createdAt` only.

**Impact**: Admin cannot see seller email in the seller profiles list.

**Current Behavior**: Email field is not in the response, so it is not displayed.

**Recommendation**: Check `user-service` seller profile entity and add email to the response if available. Update `AdminSellerProfile` type in `lib/admin/types.ts`.

---

### 6. Product Moderation — `approvalStatus` Filter Parameter

**Issue**: Phase 2A contract references `GET /api/v1/admin/products?status=pending` for pending products. However, the actual `AdminProductController.getAdminProducts()` uses `AdminProductQueryDto` which may filter by `isActive` / `status` rather than `approvalStatus`.

**Current Behavior**: Phase 5 page calls `fetchAdminModerationProducts({ status: "pending" })` — this may need to use a different query parameter name.

**Verification Needed**: Check `AdminProductQueryDto` in `product-service` to see what query params are supported. May need to update frontend to match.

**Workaround**: If `status=pending` doesn't work, the page should call the dedicated moderation endpoint or use `GET /api/v1/admin/products` with the correct filter parameter.

---

### 7. Seller Profile Status — `status` vs `approvalStatus`

**Issue**: Seller profiles use `status` field directly (pending/approved/rejected/suspended), not `approvalStatus`. Product moderation uses `status` field (pending/approved/rejected). Both differ slightly in naming.

**Impact**: Low — `AdminStatusBadge` handles the normalization automatically.

**Current Behavior**: Badge correctly displays based on status value.

---

## UI Issues

### 8. Seller Profiles — Detail Page Not Built

**Issue**: Task 4.5 (`app/admin/seller-profiles/[id]/page.tsx`) was not implemented.

**Impact**: Admin can view and manage seller profiles from the list, but cannot navigate to a detail view.

**Workaround**: Use the existing seller profile data from the list to make decisions. Detail view is not critical for the approval workflow.

---

### 9. Product Image in Product Approvals — `<img>` Tag

**Issue**: `product-approvals/page.tsx` uses `<img>` tag for product thumbnails instead of Next.js `<Image />`.

**Impact**: Build warning (not error). Slower LCP, higher bandwidth usage.

**Recommendation**: Replace with `next/image` when product images are from a known domain or configure image domains in `next.config.js`.

---

### 10. Analytics — `useCallback` Exhaustive Deps Warning

**Issue**: Original `loadAll` callback referenced `data` in its closure. Fixed by initializing `newData` inline instead of spreading from state.

**Status**: Fixed. Verified in build.

---

## Design Decisions

### 11. `/admin/settings` Redirect vs Unified Settings

**Decision**: Redirect `/admin/settings` to `/admin/store-settings` using Next.js `redirect()`.

**Rationale**: No unified settings page exists, and building one would require defining what settings belong in "unified" vs "store-specific". Simple redirect keeps the nav item functional.

**Alternative**: Could create a settings landing page with links to store settings and other config. Deferred.

---

## Out of Scope (Will Not Fix in Phase 5)

- Buyer shop directory pages (`/shops`, `/shops/[slug]`) — Phase 6
- Buyer profile/addresses pages (`/profile`, `/addresses`) — Phase 6
- Refund backend implementation — Phase 8
- Commission backend implementation — Phase 8
- Payment split/settlement — Phase 8
- Email/notification infrastructure — separate work
- Seller analytics page — Phase 6
- `<img>` → `<Image />` migration — minor, deferred
