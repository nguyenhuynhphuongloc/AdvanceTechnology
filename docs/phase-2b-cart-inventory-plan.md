# Phase 2B: Cart & Inventory Marketplace Foundation — Plan

> **Ngày**: 16 May 2026
> **Phase**: 2B — Cart & Inventory Marketplace Foundation
> **Trạng thái**: In Progress

---

## 1. Current Cart-Service Findings

### 1.1 Database Architecture

- **Engine**: Hybrid — Redis for primary cart data + TypeORM (PostgreSQL) for CartState entity
- **Pattern**: CartState entity has `items: CartItemData[]` embedded as JSON (Redis serialization)
- **Cart identification**: `userId: string` (UUID-compatible) OR `guestToken: string`
- **Key**: `CART:{userId}` or `CART:GUEST:{guestToken}`
- **TypeORM entity**: `CartState` — used for DB persistence (synchronize: false)
- **Redis persistence**: Primary storage in Redis; TypeORM is backup/sync target

### 1.2 CartState Entity (current)

```typescript
// cart-service/src/cart/entities/cart-state.entity.ts
CartState {
  id: string              // UUID, @PrimaryColumn
  userId: string          // UUID string, @Column nullable
  guestToken: string      // @Column nullable
  items: CartItemData[]   // JSON column, embedded array
  createdAt: Date
  updatedAt: Date
}

CartItemData {
  productId: string
  variantId: string
  quantity: number
  addedAt: string (ISO)
}
```

### 1.3 Cart APIs (current)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/v1/carts/me` | Optional JWT + guestToken | Get current cart |
| POST | `/api/v1/carts/me/items` | Optional JWT + guestToken | Add item |
| DELETE | `/api/v1/carts/me/items/:variantId` | Optional JWT + guestToken | Remove by variantId |
| DELETE | `/api/v1/carts/me` | Optional JWT + guestToken | Clear cart |
| POST | `/api/v1/carts/merge` | JWT required | Merge guest into user cart |
| GET | `/api/v1/admin/carts` | Admin | List all carts |
| GET | `/api/v1/admin/carts/:id` | Admin | Get cart by ID |

### 1.4 Key Issues Found

1. **No shopId in CartItemData** — cannot group by shop
2. **No snapshot fields** — cannot display cart without fetching product data
3. **DELETE by variantId** — cannot handle multiple items with same variant from different shops
4. **No product validation** — can add deleted/inactive products to cart
5. **CartState.userId type** — `string` but no explicit UUID validation
6. **Cart identification bug**: Guest flow uses `guestToken` in header/key but CartState entity has `guestToken` column — need to verify how merge works with `x-guest-token` header

---

## 2. Current Inventory-Service Findings

### 2.1 Database Architecture

- **Engine**: TypeORM + PostgreSQL (synchronize: false in production, true in dev)
- **InventoryItemEntity**: Main entity with UUID primary key
- **BranchModule exists** but **BranchEntity is NOT in `src/inventory/entities/`** — likely in `src/branch/entities/`

### 2.2 InventoryItem Entity (current)

```typescript
// inventory-service/src/inventory/entities/inventory-item.entity.ts
InventoryItemEntity {
  id: string              // UUID, @PrimaryGeneratedColumn('uuid')
  productId: string       // UUID string, @Column()
  variantId: string       // UUID string, @Column()
  branchId: string       // UUID string, @Column() nullable
  sku: string            // @Column() nullable
  stock: number          // @Column('int') default 0
  reservedStock: number   // @Column('int') default 0
  lowStockThreshold: number // @Column('int') default 0
  createdAt: Date
  updatedAt: Date
}
```

### 2.3 Inventory APIs (current)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/v1/inventory/items` | Admin | Upsert inventory item |
| GET | `/api/v1/inventory/items/:variantId` | Admin | Get inventory by variantId |
| GET | `/api/v1/admin/inventory` | Admin | Search inventory (with filters) |
| PATCH | `/api/v1/admin/inventory/:id` | Admin | Update stock |
| GET/POST/PATCH/DELETE | `/api/v1/admin/branches` | Admin | Branch CRUD |

### 2.4 Key Issues Found

1. **No shopId in InventoryItemEntity** — cannot manage stock per shop
2. **Branch entity location unknown** — not in `src/inventory/entities/`
3. **Unique constraint**: `(productId, variantId)` via unique index — will conflict with `(shopId, variantId)` needed for marketplace
4. **No seller inventory API** — seller cannot manage their own stock
5. **Stock validation**: `stock >= reservedStock` is NOT enforced in entity validation
6. **No product/variant validation** — can create inventory for non-existent products

---

## 3. Current Product-Service Data Needed for Cart/Inventory

### 3.1 Existing Internal Endpoints

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `GET /api/v1/internal/shops/by-seller/:sellerId` | Get shop by sellerId | Internal only (store-service) |

### 3.2 Missing Internal Endpoint

- **No internal endpoint** to validate product/variant for cart or inventory services
- Cart-service and inventory-service need to validate:
  - Product exists and has `shopId`
  - Product is `isActive = true`
  - Product `approvalStatus = 'approved'`
  - Variant exists and is `isActive = true`
  - Variant belongs to the product
  - Shop is approved/suspended status check

---

## 4. Current Store-Service Internal Endpoints

### 4.1 Existing Internal Endpoints

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `GET /api/v1/internal/shops/by-seller/:sellerId` | Get shop by sellerId | Internal only (store-service) |

### 4.2 Missing Internal Endpoint

- **No internal endpoint** to get shop by ID for inventory-service
- Need: `GET /api/v1/internal/shops/:id`

---

## 5. Exact Files Planned to Change

### 5.1 product-service

| File | Change | Notes |
|------|--------|-------|
| `src/product/product.controller.ts` | **ADD** InternalProductsController | New controller for internal variant validation |
| `src/product/product.service.ts` | **ADD** `getProductVariantForInternal()` | Returns variant data for cart/inventory validation |
| `src/product/product.module.ts` | **ADD** InternalProductsController | Register new controller |

### 5.2 store-service

| File | Change | Notes |
|------|--------|-------|
| `src/shops/shops.controller.ts` | **ADD** `GET /api/v1/internal/shops/:id` | Get shop by ID for inventory-service |
| `src/shops/shops.service.ts` | **ADD** `getShopById()` | New method |

### 5.3 cart-service

| File | Change | Notes |
|------|--------|-------|
| `src/cart/entities/cart-state.entity.ts` | **MODIFY** CartItemData interface | Add marketplace fields |
| `src/cart/cart.service.ts` | **REWRITE** | Add shopId, snapshot, validation, group-by-shop logic |
| `src/cart/cart.controller.ts` | **MODIFY** | Update response to group by shop; add itemId-based remove/update |
| `src/cart/dto/add-cart-item.dto.ts` | **MODIFY** | Add productId, variantId, quantity |
| `src/cart/dto/update-cart-item.dto.ts` | **NEW** | Quantity update DTO |
| `src/cart/dto/merge-cart.dto.ts` | **NEW** | Guest token merge DTO |
| `src/cart/cart.module.ts` | **ADD** HttpModule | For calling product-service |

### 5.4 inventory-service

| File | Change | Notes |
|------|--------|-------|
| `src/inventory/entities/inventory-item.entity.ts` | **MODIFY** | Add shopId, make branchId nullable |
| `src/inventory/inventory.service.ts` | **REWRITE** | Add shopId validation, seller inventory methods |
| `src/inventory/inventory.controller.ts` | **ADD** SellerInventoryController | New seller-specific controller |
| `src/inventory/dto/inventory.dto.ts` | **ADD** | Seller inventory DTOs |
| `src/app.module.ts` | **ADD** HttpModule | For calling product/store services |
| `src/inventory/inventory.module.ts` | **ADD** | Register new controller |

### 5.5 api-gateway

| File | Change | Notes |
|------|--------|-------|
| `src/modules/routes/v1/routes.controller.ts` | **ADD** 2 new proxy controllers | SellerInventoryController, InternalProductsProxyController |
| `src/modules/routes/routes.module.ts` | **ADD** | Register new controllers |

---

## 6. Compatibility Risks

### 6.1 Cart-Service Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| CartItemData schema change | Redis data with old schema may lack shopId | Graceful fallback: treat missing shopId as legacy item |
| DELETE by variantId conflict | New cart may have same variantId from different shops | Add `itemId`-based DELETE as primary, keep variantId as fallback |
| Product validation adds latency | Every add-to-cart calls product-service | Make it async/error-tolerant in Phase 2B |
| Guest token merge conflict | Same variant from different shops in guest vs user cart | Phase 2B: just add quantities; Phase 3 handles multi-shop order |

### 6.2 Inventory-Service Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Adding shopId changes unique constraint | Existing (productId, variantId) constraint may conflict | Add unique constraint (shopId, variantId); productId no longer unique alone |
| Branch entity unknown | If branchId is used, adding shopId may cause issues | Keep branchId nullable; add note in Known Issues |
| Seller inventory upsert race condition | Two sellers upserting same variant | Unique constraint (shopId, variantId) prevents this per shop |

### 6.3 Product-Service Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Internal endpoint exposure | If exposed publicly, gives product data to anyone | Only expose via gateway with internal guard; use service-to-service URL |
| Performance under load | Internal validation on every cart add | Add caching (TTL 60s) for variant validation |

---

## 7. Step-by-Step Implementation Plan

### Step 1: Product-Service — Internal Variant Validation Endpoint

**Goal**: Add endpoint for cart/inventory services to validate product variants.

**Actions:**
1. Add `InternalProductsController` with `GET /api/v1/internal/products/:productId/variants/:variantId`
2. Add `getProductVariantForInternal(productId, variantId)` to ProductService
3. Response: `{ productId, variantId, shopId, sellerId, productName, variantName, sku, imageUrl, unitPrice, approvalStatus, isActive, shopStatus }`
4. Validate product exists, variant exists, variant belongs to product
5. Register in product.module.ts
6. **Do NOT expose via gateway** — internal use only

**Decision**: Use service-to-service HTTP call (product-service URL from env) rather than RabbitMQ for simplicity.

### Step 2: Store-Service — Internal Shop By ID Endpoint

**Goal**: Add endpoint for inventory-service to get shop by ID.

**Actions:**
1. Add `getShopById(id)` to ShopsService
2. Add `GET /api/v1/internal/shops/:id` to InternalShopsController
3. Register in shops.module.ts
4. **Do NOT expose via gateway** — internal use only

### Step 3: Cart-Service — Schema & Business Logic

**Goal**: Update CartItemData and cart service to support marketplace.

**Actions:**
1. Update CartItemData interface with new fields:
   - `shopId: string`
   - `productNameSnapshot: string`
   - `variantNameSnapshot: string`
   - `skuSnapshot: string`
   - `imageUrlSnapshot: string`
   - `shopNameSnapshot: string`
   - `unitPriceSnapshot: number`

2. Update CartService:
   - Add `addItem()`: validate via product-service internal endpoint → extract shopId + snapshots → add/update cart
   - Add `updateItemQuantity()`: update by itemId (new primary method)
   - Keep `removeItem()`: remove by itemId (new primary), variantId as fallback
   - Add `getCartGroupedByShop()`: group items by shopId for response
   - Add `validateProductVariant()`: call product-service internal endpoint
   - Keep `mergeGuestCart()`: merge guest cart into user cart

3. Update CartController:
   - Add `PATCH /api/v1/carts/me/items/:itemId` for quantity update
   - Keep `DELETE /api/v1/carts/me/items/:itemId` for remove by itemId
   - Keep `DELETE /api/v1/carts/me/items/:variantId` for backward compatibility

4. Update CartModule: add HttpModule for calling product-service

**Stock validation decision**: Phase 2B will NOT validate stock at add-to-cart time. Stock validation will be done in Phase 3 during checkout. Add `stockWillBeValidatedAtCheckout: true` in cart response or notes.

### Step 4: Inventory-Service — Schema & Seller APIs

**Goal**: Add shopId to inventory and create seller inventory management.

**Actions:**
1. Update InventoryItemEntity:
   - Add `shopId: string` (required, no FK constraint — MongoDB reference)
   - Keep `branchId` nullable
   - Change unique constraint to `(shopId, variantId)` — drop old `(productId, variantId)` if safe
   - Add `availableStock: number` as a computed/getter (stock - reservedStock)

2. Update InventoryService:
   - Add `createInventory()`: create inventory with shopId + variantId validation
   - Add `updateInventoryByVariant()`: seller updates by variantId
   - Add `listSellerInventory()`: seller lists their shop's inventory
   - Add `validateProductVariant()`: call product-service internal endpoint
   - Update existing admin methods to support shopId filter
   - Add `checkProductBelongsToShop()`: validate product belongs to seller's shop

3. Add SellerInventoryController:
   - `GET /api/v1/seller/inventory` — list seller's inventory
   - `POST /api/v1/seller/inventory` — create/upsert inventory
   - `PATCH /api/v1/seller/inventory/:variantId` — update stock
   - Guard: seller | admin

4. Update app.module.ts: add HttpModule for calling product/store services

### Step 5: API-Gateway — New Routes

**Goal**: Route new cart and inventory endpoints.

**Actions:**
1. Add `SellerInventoryProxyController`:
   - `GET /api/v1/seller/inventory` → inventory-service (SellerOrAdminRoleGuard)
   - `POST /api/v1/seller/inventory` → inventory-service (SellerOrAdminRoleGuard)
   - `PATCH /api/v1/seller/inventory/:variantId` → inventory-service (SellerOrAdminRoleGuard)

2. Ensure existing routes preserved:
   - Cart routes: unchanged proxy paths
   - Admin inventory routes: unchanged

### Step 6: Backward Compatibility

**Goal**: Ensure existing APIs still work.

**Cart:**
- `DELETE /api/v1/carts/me/items/:variantId` → if itemId not found by variantId, return 404
- Cart response adds new fields but old fields still present
- Guest token handling: unchanged

**Inventory:**
- Admin inventory APIs unchanged (shopId added as filter)
- Branch APIs: unchanged

**Product:**
- All Phase 2A APIs unchanged

### Step 7: Build & Verify

**Goal**: Ensure all services compile and build successfully.

**Commands:**
```bash
# Build order (dependencies first)
npm run build  # product-service
npm run build  # store-service
npm run build  # cart-service
npm run build  # inventory-service
npm run build  # api-gateway
```

---

## 8. Legacy Data Strategy

### 8.1 Legacy Cart Items (pre-Phase 2B)

- Cart items without `shopId` are considered legacy
- Legacy items can still be displayed/removed but cannot be added to cart
- **Decision**: Don't migrate old cart data. Legacy items in existing carts will show with `shopId: null` and cart service should handle gracefully
- Cart display: legacy items shown in a "Legacy items" group with warning

### 8.2 Legacy Inventory Items (pre-Phase 2B)

- Inventory items without `shopId` are considered legacy
- Legacy inventory items are visible in admin inventory but seller cannot manage them
- **Decision**: Admin should migrate legacy inventory to shops or mark as invalid
- Admin can filter by `shopId: null` to see legacy items

### 8.3 Legacy Products (no shopId)

- Products without `shopId` cannot be added to cart in marketplace flow
- Cart service will return 400: `"Legacy product must be assigned to a shop before purchase"`
- Admin should use `PATCH /admin/products/moderation/:id/assign-shop` to assign legacy products

---

## 9. Known Issues

| # | Severity | Issue | Resolution |
|---|----------|-------|-----------|
| 1 | Medium | Cart uses Redis primary, TypeORM backup — schema sync complexity | CartItemData changes written to Redis JSON; TypeORM CartState also updated |
| 2 | Medium | BranchEntity location unknown in inventory-service | Keep branchId nullable; don't remove; add investigation in Phase 3 |
| 3 | Low | DELETE by variantId may conflict with multi-shop items | Primary method is itemId; variantId as fallback alias |
| 4 | Low | Stock not validated at add-to-cart | Phase 3 checkout will validate; document in API response |
| 5 | Low | Internal endpoints have no service-to-service auth | Add internal API key header in Phase 3 |
| 6 | Low | Order-service broken due to cart changes from Phase 2B | Document in Known Issues; rebuild order in Phase 3 |

---

## 10. Out of Scope (Phase 2B)

- Order split / ShopOrder / ShopOrderItem
- Payment split
- Commission / Settlement
- Review / Rating
- Seller dashboard UI
- Full checkout flow
- Stock reservation on add-to-cart
- Multi-warehouse / branch management

---

*Plan created: 16 May 2026*
