# Phase 5D — Database Reality Audit Report (v2 — Runtime Verified)

> Audit Date: 2026-05-17
> Auditor: Senior Full-stack Engineer
> Methodology: Source entity inspection + runtime Neon PostgreSQL introspection
> CRITICAL FINDING: Source code entities DO NOT match actual runtime database schema

---

## CRITICAL FINDING: Code vs Runtime Schema Mismatch

**The TypeORM entity files in `src/orders/entities/` describe a SPLIT-ORDER model (orders → shop_orders → shop_order_items) that NEVER existed in the actual production database.**

Runtime introspection of each Neon PostgreSQL database revealed the following ACTUAL schemas, which differ substantially from source entity definitions.

---

## 1. Infrastructure Overview

### 1.1 Docker Containers Status (verified)

All 14 containers running. All infrastructure services (RabbitMQ, Redis, MongoDB) healthy.

| Container | DB Connection | Status |
|---|---|---|
| mongodb | ✅ Connected | Collections exist but empty |
| product-service (MongoDB) | ✅ Connected | Data present but empty |
| authentication-service | ✅ Connected | Neon PG working |
| user-service | ✅ Connected | Neon PG working |
| inventory-service | ✅ Connected | Neon PG working |
| cart-service | ✅ Connected | Neon PG working |
| order-service | ✅ Connected | Neon PG working |
| payment-service | ✅ Connected | Neon PG working |
| notification-service | ✅ Connected | Neon PG working |
| store-service | ❌ NOT tested | (DB credential placeholder) |

### 1.2 Runtime Database Discrepancies Summary

| Service | Source Entity | Actual Runtime DB | Match? |
|---|---|---|---|
| order-service | orders + shop_orders + shop_order_items | orders + order_items + order_events | ❌ DIFFERENT |
| cart-service | carts + cart_items (int PK) | carts + cart_items (UUID) + cart_state | ⚠️ PARTIAL |
| user-service | buyer_profiles + seller_profiles + addresses | Same + user_profiles + user_viewed_products | ✅ MATCH |
| payment-service | transactions (minimal) | transactions + refunds | ⚠️ HAS REFUUNDS |
| notification-service | notification_logs | notification_logs + notification_event_logs + notification_templates | ⚠️ MORE TABLES |
| authentication-service | auth_users | auth_users + auth_oauth_providers | ⚠️ HAS OAUTH |
| inventory-service | inventory_items + branches | Same + inventory_transactions | ⚠️ HAS TRANSACTIONS |

---

## 2. Runtime Schema by Service

### 2.1 authentication-service — `neondb` (Neon PostgreSQL, ep-noisy-glitter)

**Runtime Tables**:

`auth_users` (5 rows):
```
id              UUID (PK)            NOT NULL
email           varchar             NOT NULL UNIQUE
password_hash   text                NOT NULL
role            auth_user_role      NOT NULL DEFAULT 'customer'
refresh_token   text                NULLABLE
is_active       boolean             NOT NULL DEFAULT true
created_at      timestamptz         NOT NULL
updated_at      timestamptz         NOT NULL
```

`auth_oauth_providers` (2 rows — NOT in source):
```
id              UUID (PK)            NOT NULL
user_id         UUID                 NOT NULL FK → auth_users
provider         auth_user_role       NOT NULL
provider_uid     varchar              NOT NULL
linked_at        timestamptz          NOT NULL
```

`log_entries` (1 row — service leak from logging-service):
```
id              UUID (PK)            NOT NULL
level           varchar              NOT NULL
source          varchar              NOT NULL
message         text                 NOT NULL
metadata        text                 NULLABLE
createdAt       timestamp           NOT NULL
```

`store_settings` (1 row — stored in auth DB, not store DB):
```
id              UUID (PK)            NOT NULL
storeName       varchar              NOT NULL DEFAULT 'Advance Technology'
logoImageUrl    varchar              NULLABLE
logoPublicId    varchar              NULLABLE
description     text                 NULLABLE
contactEmail    varchar              NULLABLE
contactPhone    varchar              NULLABLE
address         varchar              NULLABLE
createdAt       timestamp           NOT NULL
updatedAt       timestamp           NOT NULL
```

**Assessment**: ✅ Marketplace-ready. Has OAuth table. Role enum. Store settings stored here (not in store-service DB).

---

### 2.2 order-service — `neondb` (Neon PostgreSQL, ep-cold-dream)

**CRITICAL: Runtime schema does NOT match source entities.**

**Source claimed**: `orders`, `shop_orders`, `shop_order_items` — with order-split-by-seller design.
**Actual runtime**: `orders`, `order_items`, `order_events` — flat order model.

**Runtime Tables**:

`orders` (10 rows):
```
id                      UUID (PK)            NOT NULL
auth_user_id            UUID                 NULLABLE
user_address_id         UUID                 NULLABLE
is_guest                boolean             NOT NULL DEFAULT false
shipping_address_snapshot jsonb               NOT NULL DEFAULT '{}'
subtotal                numeric             NOT NULL
shipping_fee             numeric             NOT NULL DEFAULT 0
total_amount            numeric             NOT NULL
status                  order_status_type   NOT NULL DEFAULT 'pending'
payment_method          payment_method_type NOT NULL
created_at              timestamptz         NOT NULL
updated_at              timestamptz         NOT NULL
items                   jsonb               NOT NULL DEFAULT '[]'
recipient_email         varchar             NULLABLE
failure_reason          text                 NULLABLE
correlation_id          varchar              NULLABLE
```

`order_items` (3 rows):
```
id              UUID (PK)            NOT NULL
order_id        UUID                 NOT NULL FK → orders
variant_id      UUID                 NOT NULL
sku             varchar              NOT NULL
product_name    varchar              NOT NULL
variant_name    varchar              NULLABLE
unit_price      numeric             NOT NULL
quantity        int                  NOT NULL
image_url       text                 NULLABLE
```

`order_events` (3 rows):
```
id              UUID (PK)            NOT NULL
order_id        UUID                 NOT NULL FK → orders
event           USER-DEFINED         NOT NULL  (order_status_type)
note            text                 NULLABLE
occurred_at     timestamptz         NOT NULL DEFAULT now()
```

**Assessment**: ❌ **CRITICAL ARCHITECTURAL PROBLEM**.
- The actual DB has a FLAT order model — one order per buyer, no shop split.
- No `shop_orders` table means **order split by seller is NOT implemented in production**.
- `items` is embedded as jsonb in the orders table (flat design).
- `order_items` is a separate table but not split by seller.
- Source code describes a split-order model that was designed but never deployed.
- Frontend Phase 3/4A code may assume split-order but backend doesn't support it.

---

### 2.3 cart-service — `neondb` (Neon PostgreSQL, ep-old-base)

**Runtime Tables**:

`carts` (3 rows):
```
id              UUID (PK)            NOT NULL
auth_user_id     UUID                 NULLABLE
guest_token     varchar              NULLABLE
created_at      timestamptz         NOT NULL
updated_at      timestamptz         NOT NULL
```

`cart_items` (4 rows):
```
id                  UUID (PK)            NOT NULL
cart_id              UUID                 NOT NULL FK → carts
variant_id           UUID                 NOT NULL
quantity            int                  NOT NULL
unit_price_snapshot numeric             NOT NULL
added_at             timestamptz         NOT NULL DEFAULT now()
```

`cart_state` (9 rows — NOT in source):
```
id              UUID (PK)            NOT NULL
userId          varchar              NULLABLE
guestToken      varchar              NULLABLE
ownerKey        varchar              NOT NULL
items           text                 NOT NULL DEFAULT '[]'  -- serialized JSON
createdAt      timestamp            NOT NULL
updatedAt      timestamp            NOT NULL
```

**Assessment**: ⚠️ **Source entity is OUTDATED**.
- Runtime uses UUID PKs, NOT int as source entity claims.
- Runtime has `unit_price_snapshot` (good — price at time of adding).
- Runtime has `cart_state` table for Redis-like state persistence.
- No `shop_id` on cart_items — checkout split still not supported.
- No `product_id` — only `variant_id`. Product info denormalized elsewhere.

---

### 2.4 user-service — `neondb` (Neon PostgreSQL, ep-winter-night)

**Runtime Tables** (match source with additions):

`buyer_profiles` (0 rows):
```
id              UUID (PK)            NOT NULL
user_id         UUID                 NOT NULL UNIQUE FK → auth_users
full_name       varchar              NOT NULL
phone           varchar              NULLABLE
avatar_url      text                 NULLABLE
default_address_id UUID               NULLABLE
created_at      timestamp            NOT NULL
updated_at      timestamp            NOT NULL
```

`seller_profiles` (0 rows):
```
id              UUID (PK)            NOT NULL
user_id         UUID                 NOT NULL UNIQUE FK → auth_users
business_name   varchar              NOT NULL
phone           varchar              NULLABLE
tax_id          varchar              NULLABLE
status          varchar              NOT NULL DEFAULT 'pending'
created_at      timestamp            NOT NULL
updated_at      timestamp            NOT NULL
```

`addresses` (0 rows):
```
id              UUID (PK)            NOT NULL
buyer_profile_id UUID                 NOT NULL FK → buyer_profiles
full_name       varchar              NOT NULL
phone           varchar              NOT NULL
province        varchar              NOT NULL
district        varchar              NOT NULL
ward            varchar              NOT NULL
street          varchar              NOT NULL
is_default      boolean              NOT NULL DEFAULT false
created_at      timestamp            NOT NULL
updated_at      timestamp            NOT NULL
buyerProfileId  UUID                 NULLABLE  -- duplicate column, nullable
```

**Additional tables NOT in source**:

`user_profiles` (3 rows):
```
id              UUID (PK)            NOT NULL
auth_id         UUID                 NOT NULL FK → auth_users
full_name       varchar              NOT NULL
phone           varchar              NULLABLE
gender          USER-DEFINED         NULLABLE
birthday        date                 NULLABLE
avatar_url      text                 NULLABLE
style_preferences jsonb             NOT NULL DEFAULT '{}'
updated_at      timestamptz         NOT NULL
```

`user_viewed_products` (3 rows):
```
id              UUID (PK)            NOT NULL
profile_id      UUID                 NOT NULL
product_id      UUID                 NOT NULL
viewed_at       timestamptz         NOT NULL
```

`user_addresses` (2 rows):
```
id              UUID (PK)            NOT NULL
profile_id      UUID                 NOT NULL
label           varchar              NOT NULL
full_name       varchar              NOT NULL
phone           varchar              NOT NULL
province        varchar              NOT NULL
district        varchar              NOT NULL
ward            varchar              NOT NULL
street          varchar              NOT NULL
is_default      boolean              NOT NULL DEFAULT false
```

**Assessment**: ✅ Matches source mostly. Has extra tables (`user_profiles`, `user_viewed_products`) that are NOT in source entities. Dual address table pattern (`addresses` + `user_addresses`) suggests a migration was done.

---

### 2.5 inventory-service — `neondb` (Neon PostgreSQL, ep-spring-scene)

**Runtime Tables**:

`inventory_items` (14 rows):
```
id                  UUID (PK)            NOT NULL
stock               int                  NOT NULL DEFAULT 0
reserved_stock       int                  NOT NULL DEFAULT 0
sku                 varchar              NULLABLE
branch_id           varchar              NULLABLE
variant_id          varchar              NULLABLE
product_id          varchar              NULLABLE
updated_at          timestamp            NOT NULL
shop_id             varchar              NULLABLE
low_stock_threshold int                  NOT NULL DEFAULT 10
```

`inventory_transactions` (4 rows — NOT in source):
```
id                  UUID (PK)            NOT NULL
inventory_item_id    UUID                 NOT NULL FK → inventory_items
type                USER-DEFINED         NOT NULL
quantity            int                  NOT NULL
ref_order_id        UUID                 NULLABLE (FK to order, NOT order_id)
occurred_at         timestamptz         NOT NULL DEFAULT now()
```

`branches` (1 row):
```
id              UUID (PK)            NOT NULL
name            varchar              NOT NULL UNIQUE
location        varchar              NULLABLE
is_active       boolean              NOT NULL DEFAULT true
created_at      timestamp            NOT NULL
updated_at      timestamp            NOT NULL
```

**Assessment**: ✅ Better than source — has `inventory_transactions` for audit log. `ref_order_id` (not `order_id`) avoids circular dependency. No composite unique constraint on (shop_id, variant_id) in runtime.

---

### 2.6 payment-service — `neondb` (Neon PostgreSQL, ep-fancy-glade)

**Runtime Tables**:

`transactions` (4 rows):
```
id              UUID (PK)            NOT NULL
order_id        UUID                 NOT NULL
amount          numeric             NOT NULL  (NOT float — source entity was wrong)
method          payment_method_type NOT NULL
status          payment_status_type NOT NULL DEFAULT 'pending'
gateway_ref    varchar              NULLABLE
gateway_payload jsonb               NOT NULL DEFAULT '{}'
created_at      timestamptz         NOT NULL
updated_at      timestamptz         NOT NULL
```

`refunds` (1 row — NOT in source entity):
```
id              UUID (PK)            NOT NULL
transaction_id  UUID                 NOT NULL FK → transactions
amount          numeric             NOT NULL
reason          text                 NULLABLE
status          refund_status_type  NOT NULL DEFAULT 'pending'
requested_at    timestamptz         NOT NULL DEFAULT now()
processed_at    timestamptz          NULLABLE
```

**Assessment**: ✅ Better than source. Has proper refunds table! `amount` is `numeric` (correct), not `float`. `gateway_payload` jsonb stores full gateway response.

---

### 2.7 notification-service — `neondb` (Neon PostgreSQL, ep-shy-cell)

**Runtime Tables**:

`notification_logs` (2 rows):
```
id              UUID (PK)            NOT NULL
template_id     UUID                 NOT NULL FK → notification_templates
auth_user_id    UUID                 NOT NULL FK → auth_users
type            notification_type   NOT NULL
channel         notification_channel NOT NULL
recipient       varchar              NOT NULL
status          notification_status NOT NULL DEFAULT 'pending'
error_msg       text                 NULLABLE
sent_at         timestamptz          NULLABLE
```

`notification_templates` (3 rows — NOT in source):
```
id              UUID (PK)            NOT NULL
key             varchar              NOT NULL UNIQUE
subject         varchar              NOT NULL
body_html       text                 NOT NULL
updated_at      timestamptz         NOT NULL
```

`notification_event_logs` (1 row):
```
id              UUID (PK)            NOT NULL
order_id        varchar              NOT NULL
type            varchar              NOT NULL
recipient       varchar              NULLABLE
status          varchar              NOT NULL
message         text                 NULLABLE
created_at      timestamptz         NOT NULL
```

**Assessment**: ✅ Better than source. Has `notification_templates` and proper user linkage. `channel` enum for email/SMS/push.

---

### 2.8 product-service — MongoDB

**Collections** (all empty):
- `products` — entity matches source (see Section 2.3 of v1 report)
- `product_variants` — entity matches source
- `product_images` — entity matches source
- `categories` — entity matches source
- `collections` — entity matches source
- `product_related` — entity matches source

---

## 3. Cross-Service Relationship Map (ACTUAL RUNTIME)

```
auth_users (auth-service, Neon)
  │
  ├── 1:1 ──→ buyer_profiles (user-service) [by user_id]
  ├── 1:1 ──→ seller_profiles (user-service) [by user_id]
  ├── 1:1 ──→ user_profiles (user-service) [by auth_id]
  └── 1:N ──→ auth_oauth_providers (auth-service) [by user_id]

orders (order-service, Neon)
  ├── 1:N ──→ order_items (order-service) [by order_id]
  └── 1:N ──→ order_events (order-service) [by order_id]

inventory_items (inventory-service)
  └── 1:N ──→ inventory_transactions (inventory-service) [by inventory_item_id]

transactions (payment-service, Neon)
  └── 1:N ──→ refunds (payment-service) [by transaction_id]

notification_logs (notification-service)
  └── 1:1 ──→ notification_templates (notification-service) [by template_id]

store_settings: stored in auth-service's DB (not store-service's DB) ← WRONG LOCATION

carts (cart-service, Neon)
  └── 1:N ──→ cart_items (cart-service) [by cart_id]
```

**Critical missing relationships**:
- ❌ No link between `orders` and `shops` — flat order, no seller split
- ❌ No link between `cart_items` and `shops` — cannot group by seller
- ❌ No link between `inventory_items` and `shops` (shop_id nullable, not FK)
- ❌ No link between `transactions` and `shops` or `shop_orders`
- ❌ `store_settings` stored in wrong database

---

## 4. Actual Data Model Issues

### 4.1 Critical Issues

| # | Issue | Severity | Evidence |
|---|---|---|---|
| C1 | Order split by seller NOT implemented | CRITICAL | `shop_orders` table does NOT exist. Runtime only has flat `orders` table. Source entities describe split-order model that was never deployed. | |
| C2 | Source code entities are stale/outdated | CRITICAL | `order.entity.ts` claims `orders` table with `OneToMany → shop_orders` but actual DB has no `shop_orders`. `CartItem` source uses `int` PK but runtime uses `UUID`. | |
| C3 | `store_settings` in wrong DB | HIGH | Store settings stored in auth-service's `neondb`, not store-service's DB. Store-service has no access to its own config. | |
| C4 | No `shop_id` on cart items | HIGH | Cannot group cart by seller for checkout split | |
| C5 | Buyer profile tables have no data | MEDIUM | All `buyer_profiles`, `addresses` tables are empty (0 rows) despite 5 users in `auth_users` | |

### 4.2 Source vs Runtime Corrections

| Service | Source Entity Says | Actual Runtime |
|---|---|---|
| order-service | `orders`, `shop_orders`, `shop_order_items` | `orders` (flat), `order_items`, `order_events` |
| cart-service | `carts.id int`, `cart_items.id int` | `carts.id UUID`, `cart_items.id UUID` |
| cart-service | `cart_items.product_id int` | `cart_items.variant_id UUID` only, no product_id |
| payment-service | `transactions.amount float` | `transactions.amount numeric` (correct) |
| payment-service | No `refunds` table | `refunds` table EXISTS (good!) |
| notification-service | `notification_logs` only | `notification_logs` + `notification_templates` + `notification_event_logs` |
| user-service | 3 tables | 6 tables (user_profiles, user_viewed_products, user_addresses extra) |
| inventory-service | No transactions table | `inventory_transactions` EXISTS (audit trail) |
| authentication-service | `auth_users` only | `auth_users` + `auth_oauth_providers` + `log_entries` + `store_settings` (wrong DB) |

---

## 5. Positive Findings

| # | Finding | Significance |
|---|---|---|
| +1 | `refunds` table exists in payment-service | Structured refund model IS implemented |
| +2 | `inventory_transactions` table exists | Stock audit trail IS implemented |
| +3 | `notification_templates` table exists | Template-based notifications IS implemented |
| +4 | `auth_oauth_providers` table exists | OAuth login support IS present |
| +5 | Cart uses UUID, not int (runtime) | Better than source entity claimed |
| +6 | `unit_price_snapshot` in cart_items | Price snapshot prevents cart price drift |
| +7 | `order_events` table for order history | Event sourcing-like pattern for order lifecycle |

---

## 6. Unknown Items

- **store-service DB** (`ep-placeholder-pooler`) was not introspected (placeholder password in .env)
- **mongodb** collections are all empty — cannot verify actual product data structure
- `user_profiles`, `user_viewed_products`, `user_addresses` tables in user-service have data but no source entity — these may be from a parallel/concurrent development branch
- `log_entries` and `store_settings` in auth DB suggest these tables migrated from logging-service/store-service respectively
