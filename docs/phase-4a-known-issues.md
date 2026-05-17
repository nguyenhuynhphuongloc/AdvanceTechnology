# Phase 4A Known Issues

## Blocking

None — Phase 4A completed.

## Non-blocking

### UI Display

1. **Buyer order detail** shows `Shop #XXXXXXXX` instead of shop name
   - `ShopOrderResponse` type doesn't include `shopNameSnapshot`
   - Backend returns `items[].shopNameSnapshot` but not top-level
   - Workaround: display shopId prefix. Fix requires backend to include in response or frontend to fetch shop name separately.

2. **Admin order detail** fetches from list endpoint (no dedicated `/admin/orders/:id` API)
   - Currently calls `GET /api/v1/admin/orders` and filters by id
   - Fix: add dedicated detail endpoint to order-service

3. **Seller order detail** — same issue as buyer (no dedicated API)
   - Currently calls `GET /api/v1/seller/orders/:id` which exists and works ✅

### Auth / Service-to-Service

4. **Internal API has no service-to-service auth**
   - Gateway forwards `x-user-id` header
   - No HMAC or token between services
   - Phase 8+ scope

### Data

5. **No idempotency on checkout**
   - Multiple rapid clicks could create duplicate orders
   - Phase 8 scope

6. **Order status auto-sync is synchronous**
   - When all ShopOrders are `delivered`, parent Order status doesn't auto-update
   - Backend logic needs to sync parent Order status from ShopOrder statuses

### Out of Scope (Per Phase 4A Plan)

- Commission/refund/payment split (Phase 8)
- Review/rating system
- Notification system
- Shipping provider integration
- Commission calculation
- Seller payout/settlement
- UI redesign
