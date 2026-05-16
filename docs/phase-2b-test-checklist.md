# Phase 2B: Test Checklist

> **Ngày**: 16 May 2026
> **Phase**: 2B — Cart & Inventory Marketplace Foundation

---

## Setup

1. Start all services (docker-compose up)
2. Register admin account
3. Register seller account
4. Admin login → get admin JWT
5. Seller login → get seller JWT
6. Seller tạo shop: `POST /api/v1/seller/shop`
7. Admin approve shop: `PATCH /api/v1/admin/shops/:shopId/approve`
8. Seller tạo product với variants: `POST /api/v1/seller/products`
9. Admin approve product: `PATCH /api/v1/admin/products/moderation/:id/approve`

---

## Cart Flow

### Marketplace Cart Tests

- [ ] **C-01**: Customer add approved product variant to cart → Success, item appears in cart
- [ ] **C-02**: Customer add same variant twice → Quantity increases
- [ ] **C-03**: Customer add product variant → Cart item has correct `shopId`, `productId`, `variantId`
- [ ] **C-04**: GET cart → Response grouped by shop correctly
- [ ] **C-05**: Update item quantity via PATCH → Quantity updated
- [ ] **C-06**: Remove item by itemId → Item removed
- [ ] **C-07**: Clear cart → Cart empty
- [ ] **C-08**: Cart response includes snapshot fields (name, price, image, sku)
- [ ] **C-09**: Cart groups show correct shopNameSnapshot and shopSubtotal
- [ ] **C-10**: Cart totalItems = sum of all item quantities
- [ ] **C-11**: Cart subtotal = sum of (unitPriceSnapshot × quantity) for all items

### Cart Validation Tests

- [ ] **C-20**: Add pending product → 400 `"Product is not available for purchase"`
- [ ] **C-21**: Add rejected product → 400
- [ ] **C-22**: Add hidden product → 400
- [ ] **C-23**: Add inactive variant → 400 `"Product or variant not found"`
- [ ] **C-24**: Add invalid productId/variantId → 400
- [ ] **C-25**: Legacy product (no shopId) → 400 `"Legacy product must be assigned to a shop"`

### Guest Cart Tests

- [ ] **C-30**: Guest add item with `x-guest-token` header → Success
- [ ] **C-31**: Guest GET cart with `x-guest-token` → Returns guest cart
- [ ] **C-32**: Guest cart grouped by shop correctly

### Merge Cart Tests

- [ ] **C-40**: User login → Merge guest cart into user cart → Items combined
- [ ] **C-41**: Same variant in both carts → Quantities added together
- [ ] **C-42**: Merge non-existent guest token → Returns user cart unchanged

---

## Inventory Flow

### Seller Inventory Tests

- [ ] **I-01**: Seller list inventory → Only sees items from their shop
- [ ] **I-02**: Seller create inventory for their product → Success
- [ ] **I-03**: Seller create inventory for product from another shop → 400
- [ ] **I-04**: Seller create inventory for non-existent variant → 404
- [ ] **I-05**: Seller update stock for their variant → Success
- [ ] **I-06**: Seller update stock < reservedStock → 400
- [ ] **I-07**: Seller update inventory for variant from another shop → 404
- [ ] **I-08**: Seller upsert existing variant → Stock updated
- [ ] **I-09**: Seller list with `lowStockOnly=true` → Only low stock items
- [ ] **I-10**: Seller list with search query → Filtered results

### Admin Inventory Tests

- [ ] **I-20**: Admin list all inventory → All items from all shops
- [ ] **I-21**: Admin filter by shopId → Only items from that shop
- [ ] **I-22**: Admin filter by `lowStockOnly` → Low stock items
- [ ] **I-23**: Admin update stock → Success
- [ ] **I-24**: Admin upsert item with shopId → Success

### Backward Compatibility (Inventory)

- [ ] **I-30**: `POST /api/v1/inventory/items` → Still works
- [ ] **I-31**: `GET /api/v1/inventory/items/:variantId` → Still works
- [ ] **I-32**: `GET /api/v1/admin/inventory` → Still works
- [ ] **I-33**: `PATCH /api/v1/admin/inventory/:id` → Still works
- [ ] **I-34**: Branch APIs → Still work

---

## Security Tests

- [ ] **SEC-01**: Unauthenticated call `/api/v1/seller/inventory` → 401
- [ ] **SEC-02**: Customer role call `/api/v1/seller/inventory` → 403
- [ ] **SEC-03**: Seller call `/api/v1/admin/inventory` → 403
- [ ] **SEC-04**: Seller cannot access other seller's inventory
- [ ] **SEC-05**: Admin upsert item with shopId → Success
- [ ] **SEC-06**: Unauthenticated call cart → 401 (but OptionalJwt allows)
- [ ] **SEC-07**: Internal endpoints not accessible via public gateway

---

## Internal Endpoint Tests

- [ ] **INT-01**: `GET /api/v1/internal/products/:id/variants/:vid` → Returns variant data
- [ ] **INT-02**: Internal endpoint → 404 for invalid product/variant
- [ ] **INT-03**: `GET /api/v1/internal/shops/:id` → Returns shop data

---

## End-to-End Flow

- [ ] **E2E-01**: Seller create product → Admin approve → Customer add to cart → Item in cart grouped by shop
- [ ] **E2E-02**: Seller upsert inventory → Stock updated → Customer sees updated (Phase 3)
- [ ] **E2E-03**: Multiple products from same shop → One group in cart
- [ ] **E2E-04**: Products from multiple shops → Multiple groups in cart
- [ ] **E2E-05**: Guest cart → Login → Cart merged into user account

---

## Build Verification

- [ ] product-service: `npm run build` → ✅ Pass
- [ ] store-service: `npm run build` → ✅ Pass
- [ ] cart-service: `npm run build` → ✅ Pass
- [ ] inventory-service: `npm run build` → ✅ Pass
- [ ] api-gateway: `npm run build` → ✅ Pass

---

## Known Issues (Do NOT Fix in Phase 2B)

- [ ] **KI-01**: Order-service broken after cart changes → Document; rebuild in Phase 3
- [ ] **KI-02**: Internal endpoints have no service-to-service auth → Fix in Phase 3
- [ ] **KI-03**: Stock not validated at add-to-cart → Validate at checkout Phase 3
- [ ] **KI-04**: Branch entity location unknown → Investigate in Phase 3
- [ ] **KI-05**: Legacy products (no shopId) cannot be added to cart → Admin assign shop

---

*Document generated by Senior Backend Architect / Full-stack Engineer Agent*
*Last updated: 16 May 2026*
