# Phase 5D.2–5D.4 Database Runtime Plan

> **Plan Date:** 2026-05-17
> **Auditor:** Senior Database Architect / Backend Architect
> **Constraint:** No destructive migration. No data loss. No `synchronize: true`. User confirmation required before applying migrations.

---

## 1. Summary

### 1.1 Objective

Align all TypeORM source entities with the actual runtime database schema across all 10 microservices. Prepare and execute safe database migrations for new marketplace tables (`shops`, `store_settings`, `shop_orders`, `shop_order_items`) without losing existing data.

### 1.2 Services Affected

| # | Service | DB Engine | Status |
|---|---|---|---|
| 1 | api-gateway | None | No action needed |
| 2 | authentication-service | PostgreSQL (Neon) | Schema cleanup only |
| 3 | user-service | PostgreSQL (Neon) | `synchronize` risk + orphan tables |
| 4 | store-service | PostgreSQL (Neon) | Empty DB — needs tables |
| 5 | product-service | MongoDB (Docker) | No entity changes needed |
| 6 | cart-service | PostgreSQL (Neon) | `synchronize` risk + entity mismatch |
| 7 | inventory-service | PostgreSQL (Neon) | `synchronize` risk + missing entity |
| 8 | order-service | PostgreSQL (Neon) | Missing split-order tables + dual module |
| 9 | payment-service | PostgreSQL (Neon) | Missing entity + type mismatch |
| 10 | notification-service | PostgreSQL (Neon) | Missing entities + type mismatch |

### 1.3 Databases Affected

| Neon Endpoint | Service | Tables Affected |
|---|---|---|
| `ep-noisy-glitter` | authentication-service | `auth_oauth_providers` (orphan entity needed) |
| `ep-winter-night` | user-service | `buyer_profiles`, `addresses` (empty); `user_profiles`, `user_addresses`, `user_viewed_products` (orphan, 8 rows) |
| `ep-spring-union` | store-service | **empty** — `shops`, `store_settings` must be created |
| `ep-old-base` | cart-service | `carts`, `cart_items`, `cart_state` (entity mismatch) |
| `ep-spring-scene` | inventory-service | `inventory_items`, `branches`, `inventory_transactions` (missing entity) |
| `ep-cold-dream` | order-service | `orders`, `order_items`, `order_events` exist; `shop_orders`, `shop_order_items` missing |
| `ep-fancy-glade` | payment-service | `transactions`, `refunds` (missing entity) |
| `ep-shy-cell` | notification-service | `notification_logs`, `notification_templates`, `notification_event_logs` (missing entities) |

### 1.4 Principal Risks

| Risk | Severity | Mitigation |
|---|---|---|
| `synchronize: true` overwriting runtime schema on service restart | 🔴 CRITICAL | Disable immediately |
| Dual module conflict in order-service | 🟠 HIGH | Identify active module, deprecate legacy |
| Missing FK plan causing cross-service coupling | 🟠 HIGH | Logical IDs only, no physical FKs across services |
| Legacy orphan tables (`user_profiles`, etc.) conflicting with new entities | 🟡 MEDIUM | Add entities for orphan tables, or document decision |
| `shop_orders` FK to `orders` creating coupling | 🟡 MEDIUM | Only FK `shop_orders.order_id → orders.id`, no cross-service FKs |
| store-settings row in wrong DB (auth-service) | 🟡 MEDIUM | Create new row in store DB, leave old row until verified |

---

## 2. Current Critical Findings (from Phase 5D.1)

| # | Finding | Service | Severity |
|---|---|---|---|
| F1 | `synchronize: true` — will destroy data on restart | user-service | 🔴 CRITICAL |
| F2 | `synchronize: true` — will destroy data on restart | cart-service | 🔴 CRITICAL |
| F3 | `TYPEORM_SYNCHRONIZE=true` in docker-compose | inventory-service | 🔴 CRITICAL |
| F4 | DB is empty, `shops` + `store_settings` tables missing | store-service | 🔴 CRITICAL |
| F5 | `shop_orders` + `shop_order_items` tables missing in runtime | order-service | 🔴 CRITICAL |
| F6 | Cart entity: `id int` vs runtime `uuid`; `productId int` vs runtime `variantId uuid` | cart-service | 🟠 HIGH |
| F7 | Payment entity: `amount float` vs runtime `numeric`; separate string cols vs runtime `jsonb` | payment-service | 🟠 HIGH |
| F8 | `inventory_transactions` table (4 rows) has no source entity | inventory-service | 🟠 HIGH |
| F9 | `refunds` table (1 row) has no source entity | payment-service | 🟠 HIGH |
| F10 | `notification_templates` (3 rows) + `notification_event_logs` (1 row) have no source entities | notification-service | 🟠 HIGH |
| F11 | `order_events` table (3 rows) has no source entity | order-service | 🟡 MEDIUM |
| F12 | Dual module conflict: `src/orders/` vs `src/order/` | order-service | 🟡 MEDIUM |
| F13 | `auth_oauth_providers` table (2 rows) has no source entity | authentication-service | 🟡 MEDIUM |
| F14 | Orphan tables `user_profiles`, `user_addresses`, `user_viewed_products` in user-service DB | user-service | 🟡 MEDIUM |
| F15 | `store_settings` in auth-service DB (should be in store-service) | auth-service | 🟡 MEDIUM |

---

## 3. Execution Phases

### Phase 5D.2 — Entity Alignment & Migration Preparation

**Goal:** Fix `synchronize` risks, update source entities to match runtime schema, create migration SQL files. **No migration applied to DB.**

Steps:
1. Fix `synchronize: true` in user-service, cart-service
2. Fix `TYPEORM_SYNCHRONIZE=true` in inventory-service docker-compose
3. Update cart-service entities to match runtime UUID schema
4. Update payment-service `PaymentTransactionEntity` to match runtime
5. Add `RefundEntity` to payment-service
6. Add `InventoryTransactionEntity` to inventory-service
7. Update notification-service entities
8. Review order-service dual module
9. Create migration SQL for store-service (`shops`, `store_settings`)
10. Create migration SQL for order-service (`shop_orders`, `shop_order_items`)
11. Create user confirmation document

### Phase 5D.3 — Apply Migrations After User Confirmation

**Goal:** Apply migrations to databases only after user explicitly confirms.

Steps:
1. Apply store-service migration (`shops`, `store_settings`)
2. Verify tables created
3. Apply order-service migration (`shop_orders`, `shop_order_items`)
4. Verify tables created
5. Do NOT drop legacy tables
6. Do NOT touch `store_settings` in auth DB

### Phase 5D.4 — Runtime Verification

**Goal:** Verify all services build and runtime schema is correct.

Steps:
1. Build all affected services
2. Smoke test API endpoints
3. Verify marketplace order flow with split orders

---

## 4. Files Planned to Change

### Phase 5D.2 (Code Changes — No DB Impact)

| Service | File | Change | Risk |
|---|---|---|---|
| user-service | `src/app.module.ts` | `synchronize: true` → `false` | 🔴 None — safe |
| cart-service | `src/app.module.ts` | `synchronize: true` → `false` | 🔴 None — safe |
| inventory-service | docker-compose.yml | `TYPEORM_SYNCHRONIZE=true` → `false` | 🔴 None — safe |
| cart-service | `src/cart/entities/cart.entity.ts` | Update `Cart` entity to match runtime UUID schema | 🟡 LOW — no DB change |
| cart-service | `src/cart/entities/cart-item.entity.ts` | Update `CartItem` entity to match runtime UUID schema | 🟡 LOW — no DB change |
| payment-service | `src/payment/entities/payment-transaction.entity.ts` | Fix `amount` type, add `gateway_payload jsonb` | 🟡 LOW — no DB change |
| payment-service | `src/payment/entities/refund.entity.ts` | **NEW** — `RefundEntity` matching `refunds` table | 🟡 LOW — no DB change |
| payment-service | `src/payment/payment.module.ts` | Register `RefundEntity` in TypeORM forFeature | 🟡 LOW — no DB change |
| inventory-service | `src/inventory/entities/inventory-transaction.entity.ts` | **NEW** — `InventoryTransactionEntity` | 🟡 LOW — no DB change |
| inventory-service | `src/inventory/inventory.module.ts` | Register entity | 🟡 LOW — no DB change |
| notification-service | `src/notification/entities/notification-log.entity.ts` | Add missing runtime columns | 🟡 LOW — no DB change |
| notification-service | `src/notification/entities/notification-template.entity.ts` | **NEW** — `NotificationTemplateEntity` | 🟡 LOW — no DB change |
| notification-service | `src/notification/entities/notification-event-log.entity.ts` | **NEW** — `NotificationEventLogEntity` | 🟡 LOW — no DB change |
| notification-service | `src/notification/notification.module.ts` | Register new entities | 🟡 LOW — no DB change |
| order-service | `src/orders/entities/order-event.entity.ts` | **NEW** — `OrderEventEntity` | 🟡 LOW — no DB change |
| order-service | `src/orders/orders.module.ts` | Register `OrderEventEntity` | 🟡 LOW — no DB change |
| authentication-service | `src/auth/entities/auth-oauth-provider.entity.ts` | **NEW** — entity for `auth_oauth_providers` | 🟡 LOW — no DB change |
| authentication-service | `src/auth/auth.module.ts` | Register entity | 🟡 LOW — no DB change |

### Phase 5D.2 (New Migration Files — SQL Only)

| Service | File | Purpose | Apply Now? |
|---|---|---|---|
| store-service | `migrations/001_create_shops_and_store_settings.sql` | Create `shops` and `store_settings` tables | ❌ No — wait for confirmation |
| order-service | `migrations/001_create_shop_orders_and_shop_order_items.sql` | Create `shop_orders` and `shop_order_items` tables | ❌ No — wait for confirmation |

### Phase 5D.3 (Migration Execution)

| Service | Tables | Action | Rollback Plan |
|---|---|---|---|
| store-service | `shops`, `store_settings` | `CREATE TABLE` | `DROP TABLE IF EXISTS` |
| order-service | `shop_orders`, `shop_order_items` | `CREATE TABLE` | `DROP TABLE IF EXISTS` |

---

## 5. Migration Details

### 5.1 store-service Migration — `shops` + `store_settings`

**File:** `microservices/store-service/migrations/001_create_shops_and_store_settings.sql`

**Target DB:** `ep-spring-union-ao6cq0xv-pooler.c-2.ap-southeast-1.aws.neon.tech`

**Current state:** Empty (no tables)

**Rollback:** `DROP TABLE IF EXISTS shop_order_items; DROP TABLE IF EXISTS shop_orders;`

```sql
-- ============================================================
-- Migration: 001_create_shops_and_store_settings
-- Service: store-service
-- Target: ep-spring-union PostgreSQL
-- Purpose: Create marketplace shop management tables
-- Rollback: DROP TABLE IF EXISTS store_settings; DROP TABLE IF EXISTS shops;
-- ============================================================

CREATE TABLE IF NOT EXISTS shops (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id           UUID NOT NULL,
  name                VARCHAR(255) NOT NULL,
  slug                VARCHAR(255) NOT NULL UNIQUE,
  logo_url            TEXT,
  banner_url          TEXT,
  description        TEXT,
  contact_email       VARCHAR(255),
  contact_phone      VARCHAR(20),
  address            TEXT,
  status             VARCHAR(20) NOT NULL DEFAULT 'pending',
  commission_rate    DECIMAL(5,2) NOT NULL DEFAULT 0,
  rejection_reason   TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_shops_seller_id ON shops(seller_id);

CREATE TABLE IF NOT EXISTS store_settings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name          VARCHAR(255) NOT NULL DEFAULT 'Advance Technology',
  logo_image_url      VARCHAR(255),
  logo_public_id      VARCHAR(255),
  description         TEXT,
  contact_email       VARCHAR(255),
  contact_phone       VARCHAR(255),
  address             VARCHAR(255),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 5.2 order-service Migration — `shop_orders` + `shop_order_items`

**File:** `microservices/order-service/migrations/001_create_shop_orders_and_shop_order_items.sql`

**Target DB:** `ep-cold-dream-a1rxuc3e-pooler.ap-southeast-1.aws.neon.tech`

**Current state:** `orders` (10 rows), `order_items` (3 rows), `order_events` (3 rows) exist. `shop_orders` and `shop_order_items` do NOT exist.

**Rollback:** `DROP TABLE IF EXISTS shop_order_items; DROP TABLE IF EXISTS shop_orders;`

**Design decision:** FK only to local `orders.id`. No FK to store-service `shops`. No FK to auth-service `auth_users`. No FK to MongoDB products. All cross-service references are logical (UUID stored as `varchar`).

```sql
-- ============================================================
-- Migration: 001_create_shop_orders_and_shop_order_items
-- Service: order-service
-- Target: ep-cold-dream PostgreSQL
-- Purpose: Create split-order tables for marketplace
-- Rollback: DROP TABLE IF EXISTS shop_order_items; DROP TABLE IF EXISTS shop_orders;
-- Note: Legacy tables (orders, order_items, order_events) are NOT modified or dropped
-- Note: No FK to shops (store-service) or auth_users (auth-service)
-- Note: No FK to product_variants (MongoDB) — logical UUID references only
-- ============================================================

CREATE TABLE IF NOT EXISTS shop_orders (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id             UUID NOT NULL,
  shop_id              UUID NOT NULL,
  seller_id            UUID NOT NULL,
  status               VARCHAR(24) NOT NULL DEFAULT 'pending',
  subtotal             DECIMAL(14,2) NOT NULL DEFAULT 0,
  shipping_fee         DECIMAL(14,2) NOT NULL DEFAULT 0,
  shop_total           DECIMAL(14,2) NOT NULL DEFAULT 0,
  tracking_number      VARCHAR(100),
  shipping_provider    VARCHAR(50),
  estimated_delivery   TIMESTAMPTZ,
  confirmed_at         TIMESTAMPTZ,
  shipped_at           TIMESTAMPTZ,
  delivered_at         TIMESTAMPTZ,
  cancelled_at         TIMESTAMPTZ,
  cancel_reason        VARCHAR(500),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FK only to local orders table (same service DB)
ALTER TABLE shop_orders ADD CONSTRAINT fk_shop_orders_order_id
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_shop_orders_order_id ON shop_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_shop_id ON shop_orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_seller_id ON shop_orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders(status);

CREATE TABLE IF NOT EXISTS shop_order_items (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_order_id          UUID NOT NULL,
  product_id             VARCHAR(255) NOT NULL,   -- logical reference to product (MongoDB)
  variant_id             VARCHAR(255) NOT NULL,   -- logical reference to variant (MongoDB)
  product_name_snapshot  VARCHAR(255) NOT NULL,
  variant_name_snapshot  VARCHAR(255),
  sku_snapshot           VARCHAR(100),
  image_url_snapshot     VARCHAR(500),
  shop_name_snapshot     VARCHAR(255),
  unit_price            DECIMAL(14,2) NOT NULL,
  quantity              INT NOT NULL,
  line_total             DECIMAL(14,2) NOT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FK only to local shop_orders table (same service DB)
ALTER TABLE shop_order_items ADD CONSTRAINT fk_shop_order_items_shop_order_id
  FOREIGN KEY (shop_order_id) REFERENCES shop_orders(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_shop_order_items_shop_order_id ON shop_order_items(shop_order_id);
CREATE INDEX IF NOT EXISTS idx_shop_order_items_product_id ON shop_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_shop_order_items_variant_id ON shop_order_items(variant_id);
```

---

## 6. Entity Files to Update / Create

### 6.1 cart-service — `Cart` + `CartItem`

Update `Cart` entity:
- `id` from `int` → `uuid`
- `userId int` → `authUserId uuid` (column rename)
- Add `guestToken varchar` nullable

Update `CartItem` entity:
- `id` from `int` → `uuid`
- `productId int` → `variantId uuid`
- Add `unitPriceSnapshot numeric`
- Add `addedAt timestamptz`

### 6.2 payment-service — `PaymentTransaction` + `RefundEntity`

Update `PaymentTransactionEntity`:
- `amount float` → `amount numeric`
- Replace `gatewayRef string` + `clientSecret string` with `gatewayPayload jsonb`
- Add `updatedAt`

Create `RefundEntity` matching `refunds` table (id, transactionId, amount, reason, status, requestedAt, processedAt).

### 6.3 inventory-service — `InventoryTransactionEntity`

Create entity matching `inventory_transactions` table (id, inventoryItemId, type, quantity, refOrderId, occurredAt).

### 6.4 notification-service — 3 new entities

1. Update `NotificationLogEntity` — add `templateId`, `authUserId`, `channel`, `errorMsg`, `sentAt`
2. Create `NotificationTemplateEntity` — `id`, `key`, `subject`, `bodyHtml`, `updatedAt`
3. Create `NotificationEventLogEntity` — `id`, `orderId`, `type`, `recipient`, `status`, `message`, `createdAt`

### 6.5 order-service — `OrderEventEntity`

Create `OrderEventEntity` matching `order_events` table (id, orderId, event, note, occurredAt).

### 6.6 authentication-service — `AuthOAuthProviderEntity`

Create `AuthOAuthProviderEntity` matching `auth_oauth_providers` table (id, userId, provider, providerUid, linkedAt).

---

## 7. Known Issues / Out of Scope

### Out of Scope (Phase 5D.2–5D.4)

| Item | Reason |
|---|---|
| Backfill `shop_id` for existing `inventory_items` rows | Needs product → shopId resolution from MongoDB; separate phase |
| Migrate legacy `orders` to split-order model | Complex data migration; orders have embedded JSONB items; handled separately |
| Migrate `store_settings` row from auth DB to store DB | Data copy operation; handled after store-service is verified working |
| Drop orphan tables (`user_profiles`, `user_addresses`, `user_viewed_products`) | Have 8 rows of data; decision deferred |
| Add `commissions` table for seller payout | Requires shop_orders to exist first |
| Add `shop_order_id` to `transactions` table | Requires shop_orders to exist first |
| Resolve dual module conflict (`src/order/` vs `src/orders/`) | Legacy module not registered but files exist; requires code review |
| Seed MongoDB product data | Separate data seeding step |

### Known Issues

| # | Issue | Service | Action |
|---|---|---|---|
| K1 | `carts` and `cart_items` tables exist alongside `cart_state` — unclear which is source of truth | cart-service | Document as known issue; `cart_state` appears to be the active implementation |
| K2 | `buyer_profiles` and `addresses` tables are empty despite 5 auth_users | user-service | Needs buyer profile creation for existing users; out of scope |
| K3 | Legacy `src/order/` module files still exist | order-service | Module not registered; deprecation deferred |
| K4 | `user_profiles`, `user_addresses`, `user_viewed_products` have 8 rows but no entity | user-service | Orphan tables from parallel development; entity needed to prevent TypeORM conflict |

---

## 8. Execution Order

```
Phase 5D.2 (Entity Alignment & Migration Prep)
│
├── 1. Fix synchronize risks (user, cart, inventory)
├── 2. Update cart-service entities
├── 3. Update payment-service entities (+ RefundEntity)
├── 4. Add inventory-service InventoryTransactionEntity
├── 5. Update notification-service entities (3 new)
├── 6. Review order-service entities (OrderEventEntity)
├── 7. Add auth-oauth-provider entity
├── 8. Create store-service migration SQL file
├── 9. Create order-service migration SQL file
├── 10. Create user confirmation doc
│
├── 📄 STOP — User must confirm before Phase 5D.3
│
Phase 5D.3 (Apply Migrations)
│
├── 1. Apply store-service migration
├── 2. Verify shops + store_settings tables exist
├── 3. Apply order-service migration
├── 4. Verify shop_orders + shop_order_items tables exist
│
Phase 5D.4 (Runtime Verification)
│
├── 1. Build all affected services
├── 2. Smoke test APIs
└── 3. Verify marketplace order flow
```
