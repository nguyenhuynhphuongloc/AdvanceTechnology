# Phase 4B Known Issues

## UI Issues

1. **Image upload not implemented** — All seller forms use URL input for images. No Cloudinary upload integration. Users must host images elsewhere and paste URLs.

2. **Shop status fetched on every layout load** — The seller layout calls `fetchMyShop()` on every page navigation. This creates redundant API calls. Should be cached in a React context or server-side. Not critical but a performance concern.

3. **Dashboard partial failures are silent** — Dashboard uses `Promise.allSettled` which means if one API fails, its stat shows 0 without any error message. A seller seeing 0 products might think their products were deleted. Consider adding error indicators for failed stats.

4. **`/seller/profile` route removed** — Deleted in favor of `/seller/shop`. If any external link, bookmarks, or documentation references `/seller/profile`, they will 404. Users will need to update bookmarks.

5. **Static generation fails for seller pages** — During `next build`, ECONNREFUSED errors occur for seller pages because backend services are not running. These are caught and render as client-side pages (not static). This is expected behavior. Runtime verification requires running services.

## API Gaps

6. **No dedicated seller analytics API** — Dashboard computes stats from product/order/inventory list endpoints. Works but inefficient. A dedicated `GET /api/v1/seller/analytics` endpoint would be better.

7. **No category list API for seller** — Product create/edit forms have hardcoded category options. A `GET /api/v1/categories` endpoint would allow dynamic categories.

8. **No product image upload API** — Seller forms submit image URLs directly. No `POST /api/v1/upload` endpoint exists. Cloudinary or similar would need integration.

9. **Shop status is read-only for sellers** — Seller cannot change shop status. If shop is rejected, there's no way to re-submit. Admin must re-approve. This is by design but may need a "Request Review" action in future.

10. **Variant inventory creation not connected to product creation** — When a seller creates a product with variants, inventory records are NOT automatically created. Seller must manually go to Inventory page to add stock for each variant. Consider auto-creating inventory records when product is created.

## Runtime Verification Needed

11. **Runtime not tested** — Build passed but services not running. Full runtime verification requires Docker or running microservices. Specifically:
    - Seller shop fetch on layout load
    - Product CRUD flow (create → list → edit → submit)
    - Inventory stock update
    - Order confirm/ship/cancel flow

12. **Auth token storage** — Seller layout and all pages rely on `localStorage.getItem('acme_token')` for auth. If token expires, pages silently fail API calls without re-authentication prompt.

## Pre-existing (Not Introduced by Phase 4B)

13. All warnings in build output (`<img>` instead of `<Image>`, unused vars) are pre-existing and not caused by Phase 4B changes.

14. `ShopOrderResponse` type in `lib/shopping/order-api.ts` doesn't include `shopNameSnapshot` — known issue from Phase 4A. Shop order items show `shopNameSnapshot` but the shop name in the parent context uses `shopId` prefix.

15. Admin order detail fetches from list endpoint — known issue from Phase 4A, not changed in Phase 4B.
