# Phase 5D — Database Migration & Refactor Plan (v2 — Runtime Verified)

> Plan Date: 2026-05-17
> Based on: Runtime Neon PostgreSQL introspection (actual DB schema, not just source code)
> Priority: Critical > High > Medium > Low
> Constraint: No destructive migrations. Preserve existing data. Phase rollout.

---

## CRITICAL DISCOVERY: Source Code vs Runtime Schema Mismatch

**The TypeORM entity files describe a SPLIT-ORDER model (orders → shop_orders → shop_order_items) that NEVER existed in production.**

Runtime introspection of actual Neon databases revealed:

| What source code says | What runtime DB actually has |
|---|---|
| `orders` → `shop_orders` → `shop_order_items` | `orders` + `order_items` + `order_events` (FLAT) |
| `carts.id` = `int` | `carts.id` = `UUID` ✅ |
| `cart_items.product_id int` | `cart_items.variant_id UUID` only |
| `payment.transactions.amount float` | `transactions.amount numeric` ✅ |
| No refunds table | `refunds` table EXISTS ✅ |
| No inventory_transactions | `inventory_transactions` EXISTS ✅ |
| No notification_templates | `notification_templates` EXISTS ✅ |
| No OAuth providers | `auth_oauth_providers` EXISTS ✅ |
| 3 user tables | 6 tables (user_profiles, user_viewed_products, user_addresses extra) |
| store_settings in store DB | store_settings in auth DB (WRONG) |

---

## Phase 0: Infrastructure Recovery (Prerequisite — Do First)

**All subsequent phases require Neon connections to remain stable.**

### P0-1: Stabilize Neon PostgreSQL Connections

**Status**: All 9 Neon endpoints are NOW responding (verified via runtime introspection).

**Remaining risk**: The Neon projects may have billing/permissions issues. Monitor for future 502 errors.

---

## Phase 1: Implement Order Split by Seller (CRITICAL)

**Estimated impact**: Checkout flow, seller order management, payment split

**Background**: The source code describes a split-order design but the actual database has a FLAT order model. The `shop_orders` table does not exist. This is the #1 gap for marketplace functionality.

### 1.1 Create shop_orders Table

```sql
CREATE TABLE shop_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  shop_id         UUID NOT NULL REFERENCES shops(id),
  seller_id       UUID NOT NULL REFERENCES auth_users(id),
  status          order_status_type NOT NULL DEFAULT 'pending',
  subtotal        NUMERIC(14,2) NOT NULL DEFAULT 0,
  shipping_fee    NUMERIC(14,2) NOT NULL DEFAULT 0,
  shop_total      NUMERIC(14,2) NOT NULL DEFAULT 0,
  tracking_number VARCHAR(100),
  shipping_provider VARCHAR(50),
  confirmed_at    TIMESTAMPTZ,
  shipped_at      TIMESTAMPTZ,
  delivered_at   TIMESTAMPTZ,
  cancelled_at   TIMESTAMPTZ,
  cancel_reason  VARCHAR(500),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shop_orders_order_id ON shop_orders(order_id);
CREATE INDEX idx_shop_orders_shop_id ON shop_orders(shop_id);
CREATE INDEX idx_shop_orders_seller_id ON shop_orders(seller_id);
CREATE INDEX idx_shop_orders_status ON shop_orders(status);
```

### 1.2 Create shop_order_items Table

```sql
CREATE TABLE shop_order_items (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_order_id           UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  product_id              UUID NOT NULL REFERENCES products(id),
  variant_id              UUID NOT NULL REFERENCES product_variants(id),
  product_name_snapshot    VARCHAR(255) NOT NULL,
  variant_name_snapshot   VARCHAR(255) NOT NULL,
  sku_snapshot            VARCHAR(100) NOT NULL,
  image_url_snapshot     VARCHAR(500),
  shop_name_snapshot      VARCHAR(255) NOT NULL,
  unit_price             NUMERIC(14,2) NOT NULL,
  quantity               INT NOT NULL,
  line_total             NUMERIC(14,2) NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shop_order_items_shop_order_id ON shop_order_items(shop_order_id);
CREATE INDEX idx_shop_order_items_product_id ON shop_order_items(product_id);
```

### 1.3 Update order_items to Reference shop_orders

The current `order_items` table references `orders.id` directly. Migrate to `shop_orders`:

```sql
-- Step 1: Add shop_order_id column
ALTER TABLE order_items ADD COLUMN shop_order_id UUID;

-- Step 2: Create shop_order for each existing order (one per order for migration)
INSERT INTO shop_orders (id, order_id, shop_id, seller_id, status, subtotal, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  o.id,
  (o.items->0->>'shopId')::UUID,
  (o.items->0->>'sellerId')::UUID,
  o.status,
  o.subtotal,
  o.created_at,
  o.updated_at
FROM orders o
WHERE NOT EXISTS (SELECT 1 FROM shop_orders so WHERE so.order_id = o.id);

-- Step 3: Backfill shop_order_id in order_items
-- This requires resolving variantId → shopId mapping
-- Complex migration — needs custom script
```

### 1.4 Backend Changes (order-service)

- Update `orders.service.ts` to create `shop_orders` and `shop_order_items` when creating an order
- Group cart items by `shopId` during checkout
- Update order controllers to return split orders

### 1.5 Frontend Changes

- Update checkout flow to show items grouped by shop
- Update seller order list to use `GET /api/v1/seller/orders`

---

## Phase 2: Cart Service — Add Shop ID (High)

**Background**: Runtime cart uses UUID correctly. BUT no `shopId` on cart items — cannot group by seller.

### 2.1 Add shop_id to cart_items

```sql
ALTER TABLE cart_items ADD COLUMN shop_id UUID;
CREATE INDEX idx_cart_items_shop_id ON cart_items(shop_id);
```

**Backend**: Update `cart.service.ts` to resolve `shopId` from `variantId` when adding to cart.

---

## Phase 3: Store Settings — Move to Correct DB (High)

**Background**: `store_settings` is stored in auth-service's Neon DB, not store-service's DB.

### 3.1 Migrate store_settings to store-service DB

```sql
-- In store-service's DB (ep-placeholder-pooler), create table first
CREATE TABLE store_settings (...);  -- same schema as auth DB version

-- Migrate data from auth DB
INSERT INTO store_settings SELECT * FROM auth_service_db.store_settings;

-- Drop from auth DB (after verifying store-service works)
-- DROP TABLE store_settings;  -- run only after verification
```

**OR**: If store-service's DB has no tables, just point store-service to the existing `store_settings` table in auth DB (use same DB connection). This avoids migration.

---

## Phase 4: Fix Inventory shop_id NOT NULL (Medium)

**Background**: `inventory_items.shop_id` is nullable but should be NOT NULL.

```sql
-- First: resolve existing NULL entries
-- Option A: Create a default "unassigned" shop
-- Option B: Backfill from product data
UPDATE inventory_items SET shop_id = (
  SELECT shopId FROM products WHERE id = inventory_items.product_id
) WHERE shop_id IS NULL;

ALTER TABLE inventory_items ALTER COLUMN shop_id SET NOT NULL;
```

---

## Phase 5: Payment Settlement Foundation (Medium)

**Background**: `refunds` table already exists. Need `shop_order` link and `commissions`.

### 5.1 Add shop_order_id to transactions

```sql
ALTER TABLE transactions ADD COLUMN shop_order_id UUID REFERENCES shop_orders(id);
CREATE INDEX idx_transactions_shop_order_id ON transactions(shop_order_id);
```

### 5.2 Create Commissions Table

```sql
CREATE TABLE shop_commissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_order_id   UUID NOT NULL REFERENCES shop_orders(id),
  shop_id        UUID NOT NULL REFERENCES shops(id),
  order_id       UUID NOT NULL REFERENCES orders(id),
  gross_amount   NUMERIC(14,2) NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(14,2) NOT NULL,
  net_amount     NUMERIC(14,2) NOT NULL,
  status         VARCHAR(24) DEFAULT 'pending',
  calculated_at  TIMESTAMPTZ DEFAULT now(),
  created_at     TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_commissions_shop_id ON shop_commissions(shop_id);
```

### 5.3 Create Seller Payouts Table

```sql
CREATE TABLE seller_payouts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id             UUID NOT NULL REFERENCES shops(id),
  payout_period_start DATE NOT NULL,
  payout_period_end   DATE NOT NULL,
  total_orders        INT NOT NULL DEFAULT 0,
  gross_sales         NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_commission    NUMERIC(14,2) NOT NULL DEFAULT 0,
  net_payout          NUMERIC(14,2) NOT NULL DEFAULT 0,
  status              VARCHAR(24) DEFAULT 'pending',
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_payouts_shop_id ON seller_payouts(shop_id);
```

---

## Phase 6: User Profiles — Link Buyer/Seller Names (Medium)

**Background**: `auth_users` has no `full_name`. `buyer_profiles` and `seller_profiles` have data but buyer profile tables are empty (0 rows despite 5 users).

### 6.1 Create buyer profiles for existing users

```sql
-- For users with role='customer' who don't have buyer_profiles
INSERT INTO buyer_profiles (id, user_id, full_name, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  id,
  COALESCE(full_name, split_part(email, '@', 1)),
  now(),
  now()
FROM auth_users
WHERE role = 'customer'
  AND NOT EXISTS (SELECT 1 FROM buyer_profiles bp WHERE bp.user_id = auth_users.id);
```

### 6.2 Add full_name to auth_users

```sql
ALTER TABLE auth_users ADD COLUMN full_name VARCHAR(255);
UPDATE auth_users SET full_name = 
  COALESCE(
    (SELECT full_name FROM buyer_profiles WHERE buyer_profiles.user_id = auth_users.id LIMIT 1),
    (SELECT business_name FROM seller_profiles WHERE seller_profiles.user_id = auth_users.id LIMIT 1),
    split_part(email, '@', 1)
  )
WHERE full_name IS NULL;
```

---

## Phase 7: Sync Source Entities with Runtime (Low)

Update TypeORM entity files to match actual runtime schema.

| Entity File | Action |
|---|---|
| `order.entity.ts` | Replace split-order design with flat `orders` table + `order_items` |
| `shop-order.entity.ts` | Add actual split-order entity for future use |
| `cart.entity.ts` | Change `id int` → `id UUID` |
| `cart-item.entity.ts` | Change `id int` → `id UUID`, `productId int` → `variantId UUID` |
| `payment-transaction.entity.ts` | Change `amount float` → `amount numeric` |

---

## What NOT to Do

- ❌ Do NOT drop `orders` table — has 10 rows of live data
- ❌ Do NOT run `synchronize: true` in production — will overwrite runtime schema with source entities
- ❌ Do NOT assume source entity files are the source of truth — runtime introspection is authoritative
- ❌ Do NOT add `shop_orders` without implementing the backend logic to populate it
- ❌ Do NOT drop `order_items` — needs migration to `shop_order_items`
- ❌ Do NOT merge Neon databases into one — each service needs isolation
- ❌ Do NOT ignore the `user_profiles`, `user_viewed_products`, `user_addresses` tables — they have data and may be from a parallel branch
