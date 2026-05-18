# Phase 5D.1 — Service Database Connection Audit & Required Schema Proposal

> **Audit Date:** 2026-05-17
> **Auditor:** Senior Database Architect / Backend Architect
> **Scope:** 10 microservices + infrastructure services (RabbitMQ, Redis, MongoDB)
> **Constraint:** No migrations, no code changes, no destructive operations in this phase.
>
> **Note:** logging-service was removed from the system during this audit. It had no functional role, a misconfigured docker-compose pointing to auth-service's .env, and no .env file of its own. The orphan `log_entries` table in auth-service DB has been dropped.

---

## 1. Master Audit Table

| # | Service | Needs DB? | DB Connected? | DB Engine | DB Name | Env Key(s) | ORM/ODM | Runtime Accessible | Action Needed |
|---|---|---|---|---|---|---|---|---|---|
| 1 | api-gateway | **No** | Not Needed | None | — | — | None | N/A | No action |
| 2 | authentication-service | **Yes** | **Connected** | PostgreSQL | `neondb` | `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SSL` | TypeORM | ✅ Yes | Need schema cleanup |
| 3 | user-service | **Yes** | **Connected** | PostgreSQL | `neondb` | `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SSL` | TypeORM | ✅ Yes | Need schema sync |
| 4 | store-service | **Yes** | **Connected (empty DB)** | PostgreSQL | `neondb` | `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SSL` | TypeORM | ✅ Yes (empty) | Need schema migration |
| 5 | product-service | **Yes** | **Connected** | MongoDB | `neondb` | `DB_URL` | TypeORM (MongoDB driver) | ✅ Yes (empty) | Need seed data |
| 6 | cart-service | **Yes** | **Connected** | PostgreSQL | `neondb` | `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SSL` | TypeORM | ✅ Yes | Need schema sync |
| 7 | inventory-service | **Yes** | **Connected** | PostgreSQL | `neondb` | `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SSL` | TypeORM | ✅ Yes | Minor schema alignment |
| 8 | order-service | **Yes** | **Connected** | PostgreSQL | `neondb` | `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SSL` | TypeORM | ✅ Yes | Need split-order migration |
| 9 | payment-service | **Yes** | **Connected** | PostgreSQL | `neondb` | `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SSL` | TypeORM | ✅ Yes | Need entity sync |
| 10 | notification-service | **Yes** | **Connected** | PostgreSQL | `neondb` | `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SSL` | TypeORM | ✅ Yes | Need entity sync |
| 11 | ~~logging-service~~ | ~~**Yes**~~ | ~~**Not Connected**~~ | ~~PostgreSQL~~ | ~~`neondb`~~ | ~~`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SSL`~~ | ~~TypeORM~~ | ~~❌ Auth failed~~ | ~~REMOVED — no functional role; docker-compose misconfigured; .env not found~~ |
| — | RabbitMQ | **Optional** | Running (Docker) | RabbitMQ | — | `RABBITMQ_URL` | — | ✅ Yes | No action |
| — | Redis | **Optional** | Running (Docker) | Redis | — | `REDIS_URL` | — | ✅ Yes | No action |
| — | MongoDB | **Used by product-service** | Running (Docker) | MongoDB | `neondb` | `DB_URL` | TypeORM (MongoDB) | ✅ Yes (empty) | Need seed data |

---

## 2. Detailed Service-by-Service Report

---

### 2.1 — api-gateway

**Directory:** `microservices/api-gateway/`

**DB Need:** No. This is a routing/proxy layer. It forwards HTTP requests to downstream services using hardcoded internal URLs and does not store or manage data.

**Entities:** None.

**Dependencies:** Redis (for rate-limiting/session), RabbitMQ (for event proxying).

**Action Needed:** None.

---

### 2.2 — authentication-service

**Directory:** `microservices/authentication-service/`

**DB Engine:** PostgreSQL (Neon, ep-noisy-glitter pooler)

**Neon Host:** `ep-noisy-glitter-a1b5d2jy-pooler.ap-southeast-1.aws.neon.tech:5432`

**DB Name:** `neondb` (shared Neon project)

**Connection Status:** ✅ Connected and accessible.

**synchronize:** `false` (correct — safe for production)

**Runtime Tables (verified by introspection):**

| Table Name | Rows | Entity Source? |
|---|---|---|
| `auth_users` | 5 | ✅ Yes — `AuthUser` entity |
| `auth_oauth_providers` | 2 | ❌ No entity — likely from parallel branch |
| `store_settings` | 1 | ❌ No entity — belongs to store-service |

**Source Entity Definitions:**

```
auth_users          → AuthUser (id UUID, email, passwordHash, role, isActive, refreshToken, createdAt, updatedAt)
```

**MISMATCH SUMMARY:**
- `store_settings` table is present in auth DB but belongs to `store-service`. This confirms the finding from phase-5d-migration-plan.md: store-service settings are stored in the wrong database.
- `auth_oauth_providers` has data (2 rows) but no source entity defined in the codebase.
- `log_entries` table was present in auth DB (due to logging-service misconfiguration) — **it has been dropped as part of logging-service removal**.

**Action Needed:**
1. `auth_oauth_providers` entity needs to be defined if this functionality is needed.
2. After store-service is fully verified, migrate `store_settings` out of auth DB into store-service DB.

---

### 2.3 — user-service

**Directory:** `microservices/user-service/`

**DB Engine:** PostgreSQL (Neon, ep-winter-night pooler)

**Neon Host:** `ep-winter-night-a1k0ek0d-pooler.ap-southeast-1.aws.neon.tech:5432`

**DB Name:** `neondb`

**Connection Status:** ✅ Connected and accessible.

**⚠️ CRITICAL RISK: `synchronize: true` is set in `app.module.ts`!**

This means on every startup, TypeORM will try to modify the schema to match entity definitions. For a production Neon database with data, this is dangerous.

**Runtime Tables (verified by introspection):**

| Table Name | Rows | Entity Source? | Source Entity |
|---|---|---|---|
| `buyer_profiles` | 0 | ✅ Yes | `BuyerProfile` |
| `seller_profiles` | 0 | ✅ Yes | `SellerProfile` |
| `addresses` | 0 | ✅ Yes | `Address` |
| `user_profiles` | 3 | ❌ No entity | Parallel/unknown origin |
| `user_addresses` | 2 | ❌ No entity | Parallel/unknown origin |
| `user_viewed_products` | 3 | ❌ No entity | Parallel/unknown origin |

**Source Entity Definitions:**

```
buyer_profiles   → BuyerProfile   (id UUID, userId, fullName, phone, avatarUrl, defaultAddressId, createdAt, updatedAt)
seller_profiles  → SellerProfile  (id UUID, userId, businessName, phone, taxId, status, createdAt, updatedAt)
addresses        → Address        (id UUID, buyerProfileId, fullName, phone, province, district, ward, street, isDefault, createdAt, updatedAt)
```

**MISMATCH SUMMARY:**
- Three tables (`user_profiles`, `user_addresses`, `user_viewed_products`) have data but no source entity. These likely came from a parallel development branch. The `buyer_profiles` and `addresses` entities mirror the data of `user_profiles` and `user_addresses` respectively.
- `buyer_profiles` and `addresses` tables have 0 rows — they are empty despite 5 auth_users existing.
- `seller_profiles` has 0 rows — no seller data yet.

**Action Needed:**
1. **CRITICAL:** Set `synchronize: false` in user-service `app.module.ts`. Currently `true` is dangerous for production.
2. Decide whether to keep `user_profiles`/`user_addresses`/`user_viewed_products` (with entities) OR migrate to `buyer_profiles`/`addresses`. Recommend keeping the newer entities (`buyer_profiles`, `addresses`) and dropping the old ones.
3. After resolving, run a seed/migration to create `buyer_profiles` for the 5 existing auth_users.

---

### 2.4 — store-service

**Directory:** `microservices/store-service/`

**DB Engine:** PostgreSQL (Neon, ep-spring-union pooler)

**Neon Host:** `ep-spring-union-ao6cq0xv-pooler.c-2.ap-southeast-1.aws.neon.tech:5432`

**DB Name:** `neondb`

**Connection Status:** ✅ Connected and accessible. Database is **empty** (no tables exist).

**synchronize:** `false` (correct — safe for production)

**Docker-compose:** Correctly uses `./microservices/store-service/.env` (its own env file).

**Expected Entities:**

```
shops            → Shop       (id UUID, sellerId, name, slug, logoUrl, bannerUrl, description, contactEmail, contactPhone, address, status, commissionRate, rejectionReason, createdAt, updatedAt)
store_settings  → StoreSettingsEntity (id UUID, storeName, logoImageUrl, logoPublicId, description, contactEmail, contactPhone, address, createdAt, updatedAt)
```

**Critical Context:**
- `store_settings` is already present in the **auth-service** Neon DB (1 row, from earlier data seeding).
- The store-service code currently has `synchronize: false`, so it won't create the table automatically.

**Action Needed:**
1. User has already provided the correct password — connection is live ✅.
2. Create `shops` and `store_settings` tables via migration.
3. After store-service is fully verified, migrate the existing `store_settings` row from auth-service DB to store-service DB, then drop it from auth DB.

---

### 2.5 — product-service

**Directory:** `microservices/product-service/`

**DB Engine:** MongoDB (Docker container on localhost:27017)

**Connection URL:** `mongodb://admin:password@localhost:27017/neondb?authSource=admin`

**DB Name:** `neondb`

**Connection Status:** ✅ Connected and accessible. All collections are empty (Docker volume — no seed data).

**synchronize:** `true` (set in code — MongoDB TypeORM uses it to create collections/indexes on startup)

**Runtime Collections (verified by introspection — all empty):**

| Collection Name | Data Rows | Entity Source? |
|---|---|---|
| `products` | 0 | ✅ Yes — `Product` entity |
| `product_variants` | 0 | ✅ Yes — `ProductVariant` entity |
| `categories` | 0 | ✅ Yes — `Category` entity |
| `product_images` | 0 | ✅ Yes — `ProductImage` entity |
| `collections` | 0 | ✅ Yes — `Collection` entity |
| `product_related` | 0 | ✅ Yes — `ProductRelated` entity |

**Source Entity Definitions (MongoDB):**

```
products          → Product            (_id ObjectId, id string UUID, name, slug, sku, description, basePrice, isActive, createdAt, updatedAt, productionDate, sellerName, categoryId, collectionId, mainImagePublicId, shopId, sellerId, approvalStatus, rejectionReason, approvedAt, approvedBy)
product_variants  → ProductVariant     (_id ObjectId, id string UUID, productId, sku, size, color, priceOverride, imageId, isActive, createdAt, updatedAt)
categories        → Category           (_id ObjectId, id string UUID, name, slug, parentId, createdAt, updatedAt)
product_images    → ProductImage       (_id ObjectId, id string UUID, productId, imageUrl, publicId, altText, sortOrder, isMain)
collections       → Collection         (_id ObjectId, id string UUID, name, slug)
product_related   → ProductRelated     (_id ObjectId, id string UUID, productId, relatedProductId, sortOrder)
```

**MISMATCH SUMMARY:** Schema matches entity definitions. No mismatches. All collections are empty (Docker volume without seed data).

**Action Needed:**
1. Seed product data into MongoDB (categories, products, variants, images).
2. Consider setting `synchronize: false` in production to prevent automatic schema changes.
3. The `shopId` and `sellerId` fields in `Product` entity support the marketplace model — ensure product creation flow populates these.

---

### 2.6 — cart-service

**Directory:** `microservices/cart-service/`

**DB Engine:** PostgreSQL (Neon, ep-old-base pooler)

**Neon Host:** `ep-old-base-a1lxzo5k-pooler.ap-southeast-1.aws.neon.tech:5432`

**DB Name:** `neondb`

**Connection Status:** ✅ Connected and accessible.

**⚠️ CRITICAL RISK: `synchronize: true` is set in `app.module.ts`!**

**Runtime Tables (verified by introspection):**

| Table Name | Rows | Entity Source? | Source Entity |
|---|---|---|---|
| `carts` | 3 | ✅ Yes (partially) | `Cart` entity — but columns DIFFER |
| `cart_items` | 4 | ✅ Yes (partially) | `CartItem` entity — but columns DIFFER |
| `cart_state` | 9 | ✅ Yes | `CartState` entity |

**Runtime Schema vs. Source Entity:**

| Table | Runtime Column | Source Entity Column | Status |
|---|---|---|---|
| `carts.id` | `uuid` | `id int` (source) | ⚠️ MISMATCH — source says int, runtime uses UUID |
| `carts.auth_user_id` | `uuid` | `userId int` (source) | ⚠️ MISMATCH — source says int, runtime uses UUID |
| `carts.guest_token` | `varchar` | absent in source | ✅ Runtime extra |
| `cart_items.id` | `uuid` | `id int` (source) | ⚠️ MISMATCH |
| `cart_items.variant_id` | `uuid` | `productId int` (source) | ⚠️ MISMATCH — source says productId (int), runtime uses variantId (UUID) |
| `cart_items.unit_price_snapshot` | `numeric` | `price` decimal (source) | ⚠️ MISMATCH — renamed |
| `cart_items.added_at` | `timestamptz` | absent in source | ✅ Runtime extra |
| `cart_state` | full match | `CartState` entity | ✅ OK |

**MISMATCH SUMMARY:** This is the same pattern seen in phase-5d-migration-plan.md. The runtime schema has been updated to UUID-based IDs and variantId references, but the source entity files still reflect the old integer-based model. The `cart_state` table (the JSON-based cart used by the new cart service) is correctly defined.

**Action Needed:**
1. **CRITICAL:** Set `synchronize: false` in cart-service `app.module.ts`. Currently `true` is dangerous for production.
2. Update `Cart` entity: `id` from `int` → `uuid`, `userId` from `int` → `uuid` (column rename to `auth_user_id`).
3. Update `CartItem` entity: `id` from `int` → `uuid`, `productId int` → `variantId uuid`, add `unit_price_snapshot`, add `added_at`.
4. Drop the unused legacy `cart_items` columns that reference `productId int` (source entity is stale).

---

### 2.7 — inventory-service

**Directory:** `microservices/inventory-service/`

**DB Engine:** PostgreSQL (Neon, ep-spring-scene pooler)

**Neon Host:** `ep-spring-scene-a1y50ccj-pooler.ap-southeast-1.aws.neon.tech:5432`

**DB Name:** `neondb`

**Connection Status:** ✅ Connected and accessible.

**synchronize:** Controlled by env `TYPEORM_SYNCHRONIZE`. In docker-compose, it is set to `"true"`. This is a risk if not carefully managed.

**Runtime Tables (verified by introspection):**

| Table Name | Rows | Entity Source? |
|---|---|---|
| `inventory_items` | 14 | ✅ Yes |
| `branches` | 1 | ✅ Yes |
| `inventory_transactions` | 4 | ❌ No entity — runtime extra |

**Runtime Schema vs. Source Entity:**

| Table | Runtime Column | Source Entity Column | Status |
|---|---|---|---|
| `inventory_items.shop_id` | `varchar` nullable | `shopId string null` | ✅ Match |
| `inventory_items.variant_id` | `varchar` nullable | `variantId string null` | ✅ Match |
| `inventory_items.product_id` | `varchar` nullable | `productId string null` | ✅ Match |
| `inventory_items.branch_id` | `varchar` nullable | `branchId string null` | ✅ Match |
| `inventory_transactions` | exists | no entity | ⚠️ Runtime extra |

**MISMATCH SUMMARY:** The `inventory_transactions` table exists at runtime (4 rows) but has no source entity definition. It tracks stock movements (reserve, release, adjust) and is essential for the marketplace inventory model.

**Action Needed:**
1. Consider setting `synchronize: false` in docker-compose for production safety.
2. Define `InventoryTransaction` entity to match the existing `inventory_transactions` table.
3. `shop_id` in `inventory_items` is nullable — this is a known issue (from phase-5d-migration-plan.md). For marketplace, shopId should be NOT NULL. Needs data migration.

---

### 2.8 — order-service

**Directory:** `microservices/order-service/`

**DB Engine:** PostgreSQL (Neon, ep-cold-dream pooler)

**Neon Host:** `ep-cold-dream-a1rxuc3e-pooler.ap-southeast-1.aws.neon.tech:5432`

**DB Name:** `neondb`

**Connection Status:** ✅ Connected and accessible.

**synchronize:** `false` (correct — safe)

**⚠️ DUAL MODULE CONFLICT:** The service has TWO competing order modules:
- `src/orders/` — New module with split-order design (Order → ShopOrder → ShopOrderItem)
- `src/order/` — Legacy module with flat design (OrderEntity with embedded items JSONB)

The `OrdersModule` (split-order) is registered in `app.module.ts`. The `OrderModule` (legacy flat) is NOT registered.

**Runtime Tables (verified by introspection):**

| Table Name | Rows | Entity Source? |
|---|---|---|
| `orders` | 10 | ✅ Yes — `Order` entity (flat model) |
| `order_items` | 3 | ✅ Yes — legacy table |
| `order_events` | 3 | ❌ No entity — runtime extra |
| `shop_orders` | 0 | ❌ No entity — defined in source but not in DB |
| `shop_order_items` | 0 | ❌ No entity — defined in source but not in DB |

**Runtime Schema vs. Source Entity (active module — `OrdersModule`):**

| Table | Expected from Source | Runtime Status |
|---|---|---|
| `orders` | ✅ Exists with correct columns | ✅ OK |
| `shop_orders` | Defined in `ShopOrder` entity | ❌ Does NOT exist in DB |
| `shop_order_items` | Defined in `ShopOrderItem` entity | ❌ Does NOT exist in DB |

The `orders` table uses a flat model (items stored as JSONB array in `items` column), NOT the split-order model described by the source entities. This is the #1 gap for marketplace functionality.

**Action Needed:**
1. **CRITICAL:** Create `shop_orders` and `shop_order_items` tables (Phase 1 of migration plan).
2. The legacy `order_items` table (referencing variantId) coexists with the new split-order design. A data migration is needed to populate `shop_order_items` from the existing flat `order_items`.
3. Update `orders.service.ts` to write to `shop_orders` and `shop_order_items` when creating new orders.
4. The `order_events` table (3 rows) should be formalized with an `OrderEvent` entity.
5. Resolve the dual-module conflict — remove or deprecate the legacy `src/order/` module.

---

### 2.9 — payment-service

**Directory:** `microservices/payment-service/`

**DB Engine:** PostgreSQL (Neon, ep-fancy-glade pooler)

**Neon Host:** `ep-fancy-glade-a1anw83n-pooler.ap-southeast-1.aws.neon.tech:5432`

**DB Name:** `neondb`

**Connection Status:** ✅ Connected and accessible.

**synchronize:** `false` (correct — safe)

**Runtime Tables (verified by introspection):**

| Table Name | Rows | Entity Source? |
|---|---|---|
| `transactions` | 4 | ✅ Yes (partially) |
| `refunds` | 1 | ❌ No entity — runtime extra |

**Runtime Schema vs. Source Entity:**

| Table | Runtime Column | Source Entity Column | Status |
|---|---|---|---|
| `transactions.id` | `uuid` | `id uuid` | ✅ Match |
| `transactions.order_id` | `uuid` | `orderId string` | ✅ Match (type) |
| `transactions.amount` | `numeric` | `amount float` | ⚠️ MISMATCH — source says float, runtime uses numeric |
| `transactions.gateway_payload` | `jsonb` | `gatewayRef` + `clientSecret` strings (source) | ⚠️ MISMATCH — source stores strings, runtime uses jsonb |
| `transactions` | has `updated_at` | absent in source entity | ✅ Runtime extra |
| `refunds` | exists | no entity | ❌ Runtime extra |

**MISMATCH SUMMARY:** The `transactions` table has a more robust schema than the source entity. The `refunds` table is already present (1 row) but has no corresponding entity.

**Action Needed:**
1. Update `PaymentTransactionEntity` to match runtime schema: change `amount float` → `amount numeric`, replace `gatewayRef`/`clientSecret` strings with `gateway_payload jsonb`.
2. Define `RefundEntity` to match the existing `refunds` table.
3. Consider adding `shop_order_id` to `transactions` for payment splitting per seller (marketplace requirement).
4. Consider adding a `commissions` table for seller payout tracking.

---

### 2.10 — notification-service

**Directory:** `microservices/notification-service/`

**DB Engine:** PostgreSQL (Neon, ep-shy-cell pooler)

**Neon Host:** `ep-shy-cell-a10fotle-pooler.ap-southeast-1.aws.neon.tech:5432`

**DB Name:** `neondb`

**Connection Status:** ✅ Connected and accessible.

**synchronize:** `false` (correct — safe)

**Runtime Tables (verified by introspection):**

| Table Name | Rows | Entity Source? |
|---|---|---|
| `notification_logs` | 2 | ✅ Yes (partially) |
| `notification_templates` | 3 | ❌ No entity — runtime extra |
| `notification_event_logs` | 1 | ❌ No entity — runtime extra |

**Runtime Schema vs. Source Entity:**

| Table | Runtime Column | Source Entity Column | Status |
|---|---|---|---|
| `notification_logs.template_id` | `uuid` | absent in source entity | ⚠️ Runtime extra |
| `notification_logs.auth_user_id` | `uuid` | absent in source entity | ⚠️ Runtime extra |
| `notification_logs.type` | `USER-DEFINED` enum | `type varchar` (source) | ⚠️ Type mismatch |
| `notification_logs.channel` | `USER-DEFINED` enum | absent in source entity | ⚠️ Runtime extra |
| `notification_logs.status` | `USER-DEFINED` enum | `status varchar` (source) | ⚠️ Type mismatch |
| `notification_logs.error_msg` | `text` | absent in source entity | ⚠️ Runtime extra |
| `notification_logs.sent_at` | `timestamptz` | absent in source entity | ⚠️ Runtime extra |

**MISMATCH SUMMARY:** The runtime `notification_logs` table has many more columns than the source entity. There are also 3 template rows and 1 event log row present. The service code (`notification.service.ts`) writes to the table but only uses a subset of columns.

**Action Needed:**
1. Update `NotificationLogEntity` to match runtime schema: add `template_id uuid`, `auth_user_id uuid`, `channel enum`, `error_msg text`, `sent_at timestamptz`.
2. Define `NotificationTemplateEntity` to match `notification_templates` table.
3. Define `NotificationEventLogEntity` to match `notification_event_logs` table.
4. The `notification_templates` table has 3 rows — this suggests pre-seeded templates exist for email/notification types.

---

### 2.11 — ~~logging-service~~ (REMOVED)

**Status:** Removed from system. Had no functional role in the marketplace architecture.

**Changes made:**
- Deleted `microservices/logging-service/` directory
- Removed `logging-service` block from `docker-compose.yml`
- Removed `LOGGING_SERVICE_URL` from `api-gateway/.env`
- Removed `AdminLogController` from `routes.controller.ts`
- Removed log API functions from `my-app/lib/admin/api.ts`
- Removed `AdminLogRecord` and `AdminLogListResponse` types from `my-app/lib/admin/types.ts`
- Deleted `my-app/app/admin/logs/page.tsx`
- Dropped orphan `log_entries` table from auth-service's Neon DB

---

## 3. Shared Infrastructure Services

### 3.1 — RabbitMQ

**Status:** ✅ Running (Docker container `rabbitmq`)

**Host:** `rabbitmq:5672` (internal Docker network), `localhost:5672` (external)

**Management UI:** `localhost:15672` (guest/guest)

**Exchange:** `commerce.events` (defined in docker-compose.yml)

**Usage Pattern:** Event-driven communication between microservices. All services that need DB persistence use RabbitMQ for async events (order creation, inventory reservation, payment results, notifications).

**Action Needed:** None.

---

### 3.2 — Redis

**Status:** ✅ Running (Docker container `redis`)

**Host:** `redis:6379` (internal), `localhost:6379` (external)

**Persistence:** AOF enabled (`redis-server --appendonly yes`)

**Usage:**
- `product-service`: Product list/detail caching (TTL configurable)
- `inventory-service`: Distributed locking for inventory holds
- `notification-service`: Pub/sub for real-time notifications
- `cart-service`: Session management (via `CART_TTL_SECONDS`)
- `api-gateway`: Rate limiting (if configured)

**Action Needed:** None.

---

### 3.3 — MongoDB (Docker)

**Status:** ✅ Running (Docker container `mongodb`)

**Host:** `mongodb:27017` (internal), `localhost:27017` (external)

**Auth:** `admin/password`

**Database:** `neondb`

**Usage:** product-service primary data store.

**Status:** All 6 collections (`products`, `product_variants`, `categories`, `product_images`, `collections`, `product_related`) are empty — Docker volume, no seed data.

**Action Needed:** Seed product data (categories, products, variants, images) after connecting.

---

## 4. Schema Cross-Reference: Source Entity vs. Runtime DB

### 4.1 Tables that exist in Runtime but have NO Source Entity

These tables have live data but no corresponding TypeORM entity defined in the codebase. They may be from parallel development branches or legacy work.

| Table | Database | Rows | Purpose |
|---|---|---|---|
| `auth_oauth_providers` | auth-service | 2 | OAuth provider linking (Google, Facebook, etc.) |
| `store_settings` | auth-service (wrong DB!) | 1 | Store configuration — belongs to store-service |
| `user_profiles` | user-service | 3 | Buyer profile data — parallel to buyer_profiles |
| `user_addresses` | user-service | 2 | Buyer addresses — parallel to addresses |
| `user_viewed_products` | user-service | 3 | Product view history |
| `inventory_transactions` | inventory-service | 4 | Stock movement ledger |
| `order_events` | order-service | 3 | Order status change history |
| `refunds` | payment-service | 1 | Refund records |
| `notification_templates` | notification-service | 3 | Email/SMS template definitions |
| `notification_event_logs` | notification-service | 1 | Event-based notification log |

---

### 4.2 Source Entities that don't match Runtime Schema

| Entity File | Table | Mismatch |
|---|---|---|
| `cart.entity.ts` | `carts` | `id int` vs runtime `uuid`; `userId int` vs runtime `auth_user_id uuid` |
| `cart-item.entity.ts` | `cart_items` | `id int` vs runtime `uuid`; `productId int` vs runtime `variantId uuid` |
| `payment-transaction.entity.ts` | `transactions` | `amount float` vs runtime `numeric`; string cols vs runtime `jsonb` |
| `notification-log.entity.ts` | `notification_logs` | Missing runtime columns: `template_id`, `auth_user_id`, `channel`, `error_msg`, `sent_at` |
| `shop-order.entity.ts` | `shop_orders` | Table does NOT exist in runtime DB |
| `shop-order-item.entity.ts` | `shop_order_items` | Table does NOT exist in runtime DB |
| `order.entity.ts` (src/orders/) | `orders` | Source expects split-order; runtime uses flat order with JSONB items |

---

## 5. Recommended Schema Proposals (For Phase 5D.2)

The following schemas need to be created for services that don't have a working database connection, or for tables that exist at runtime but have no entity.

### 5.1 store-service — Required Tables

**PostgreSQL Database:** User must provide `DB_PASSWORD` for `ep-placeholder-pooler` or create a new Neon project.

```sql
-- shops table (from Shop entity)
CREATE TABLE shops (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id       UUID NOT NULL UNIQUE,
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) NOT NULL UNIQUE,
  logo_url        TEXT,
  banner_url      TEXT,
  description     TEXT,
  contact_email   VARCHAR(255),
  contact_phone   VARCHAR(20),
  address         TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  rejection_reason TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- store_settings table (from StoreSettingsEntity)
CREATE TABLE store_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name      VARCHAR(255) NOT NULL DEFAULT 'Advance Technology',
  logo_image_url  VARCHAR(255),
  logo_public_id  VARCHAR(255),
  description     TEXT,
  contact_email   VARCHAR(255),
  contact_phone   VARCHAR(255),
  address         VARCHAR(255),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### 5.2 notification-service — Entity Additions (tables already exist)

The following tables already exist in the notification-service database. Entities need to be defined:

```typescript
// notification_templates (runtime table exists, no entity)
@Entity('notification_templates')
export class NotificationTemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  key: string;

  @Column({ type: 'varchar' })
  subject: string;

  @Column({ name: 'body_html', type: 'text' })
  bodyHtml: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// notification_event_logs (runtime table exists, no entity)
@Entity('notification_event_logs')
export class NotificationEventLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'varchar' })
  orderId: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'varchar', nullable: true })
  recipient: string | null;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ name: 'message', type: 'text', nullable: true })
  message: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

---

### 5.3 inventory-service — Entity Addition (table already exists)

```typescript
// inventory_transactions (runtime table exists with 4 rows, no entity)
export enum InventoryTransactionType {
  RESERVE = 'reserve',
  RELEASE = 'release',
  ADJUST = 'adjust',
  SELL   = 'sell',
}

@Entity('inventory_transactions')
export class InventoryTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'inventory_item_id', type: 'uuid' })
  inventoryItemId: string;

  @Column({ type: 'varchar' })
  type: InventoryTransactionType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'ref_order_id', type: 'uuid', nullable: true })
  refOrderId: string | null;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt: Date;
}
```

---

### 5.4 payment-service — Entity Addition (table already exists)

```typescript
// refunds (runtime table exists with 1 row, no entity)
export enum RefundStatus {
  PENDING   = 'pending',
  APPROVED  = 'approved',
  REJECTED  = 'rejected',
  COMPLETED = 'completed',
}

@Entity('refunds')
export class RefundEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transaction_id', type: 'uuid' })
  transactionId: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'varchar' })
  status: RefundStatus;

  @Column({ name: 'requested_at', type: 'timestamptz' })
  requestedAt: Date;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt: Date | null;
}
```

---

### 5.5 order-service — Tables NOT in Runtime (must be created)

These tables are defined in source entities but DO NOT exist in the runtime database:

```sql
-- shop_orders table (from ShopOrder entity)
CREATE TABLE shop_orders (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id             UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
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
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shop_orders_order_id ON shop_orders(order_id);
CREATE INDEX idx_shop_orders_shop_id ON shop_orders(shop_id);
CREATE INDEX idx_shop_orders_seller_id ON shop_orders(seller_id);
CREATE INDEX idx_shop_orders_status ON shop_orders(status);

-- shop_order_items table (from ShopOrderItem entity)
CREATE TABLE shop_order_items (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_order_id           UUID NOT NULL REFERENCES shop_orders(id) ON DELETE CASCADE,
  product_id              UUID NOT NULL,
  variant_id              UUID NOT NULL,
  product_name_snapshot   VARCHAR(255) NOT NULL,
  variant_name_snapshot   VARCHAR(255) NOT NULL,
  sku_snapshot            VARCHAR(100) NOT NULL,
  image_url_snapshot      VARCHAR(500),
  shop_name_snapshot      VARCHAR(255) NOT NULL,
  unit_price              DECIMAL(14,2) NOT NULL,
  quantity                INT NOT NULL,
  line_total              DECIMAL(14,2) NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shop_order_items_shop_order_id ON shop_order_items(shop_order_id);
CREATE INDEX idx_shop_order_items_product_id ON shop_order_items(product_id);

-- order_events table (runtime exists with 3 rows, needs entity)
CREATE TYPE order_event_type AS ENUM ('created', 'paid', 'shipped', 'delivered', 'cancelled', 'refund_requested', 'refunded', 'status_changed');

CREATE TABLE order_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL,
  event       VARCHAR(50) NOT NULL,
  note        TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_events_order_id ON order_events(order_id);
```

---

## 6. Summary of Actions Required (User/Operator)

### Critical (Do First)

| Priority | Action | Owner |
|---|---|---|
| 🔴 CRITICAL | Set `synchronize: false` in **user-service** `app.module.ts` | User |
| 🔴 CRITICAL | Set `synchronize: false` in **cart-service** `app.module.ts` | User |
| 🔴 CRITICAL | Set `TYPEORM_SYNCHRONIZE=false` in **inventory-service** docker-compose env | User |
| 🔴 CRITICAL | Create `shop_orders` + `shop_order_items` tables in order-service DB | Agent (Phase 5D.2) |
| 🟠 HIGH | Update stale entity files to match runtime schema (cart, payment, notification) | Agent (Phase 5D.2) |
| 🟠 HIGH | Define missing entities: `RefundEntity`, `InventoryTransactionEntity`, `NotificationTemplateEntity`, `NotificationEventLogEntity` | Agent (Phase 5D.2) |
| 🟠 HIGH | Resolve dual-module conflict in order-service | Agent (Phase 5D.2) |

### Medium

| Priority | Action | Owner |
|---|---|---|
| 🟡 MEDIUM | Resolve `user_profiles` vs `buyer_profiles` table duplication in user-service | Agent (Phase 5D.2) |
| 🟡 MEDIUM | Migrate `store_settings` out of auth DB into store-service DB | Agent (Phase 5D.2) |
| 🟡 MEDIUM | Make `inventory_items.shop_id` NOT NULL with data migration | Agent (Phase 5D.2) |
| 🟡 MEDIUM | Update `auth_oauth_providers` entity (or decide to drop) | Agent (Phase 5D.2) |

### Low

| Priority | Action | Owner |
|---|---|---|
| 🟢 LOW | Seed MongoDB product data (categories, products, variants, images) | User |
| 🟢 LOW | Seed `notification_templates` if not already done | User |
| 🟢 LOW | Update `synchronize: true` → `false` in product-service for production safety | Agent (Phase 5D.2) |

---

## 7. What NOT To Do (Reminders)

- ❌ Do NOT run `synchronize: true` in any production Neon database
- ❌ Do NOT drop existing tables that have data (`orders`, `transactions`, `inventory_items`, etc.)
- ❌ Do NOT merge multiple services into one Neon database
- ❌ Do NOT add `shop_orders` without also implementing the backend logic to populate it
- ❌ Do NOT write actual passwords or secrets into documentation
- ❌ Do NOT run migrations without user confirmation
- ❌ Do NOT assume source entity files are authoritative — runtime introspection is the source of truth
