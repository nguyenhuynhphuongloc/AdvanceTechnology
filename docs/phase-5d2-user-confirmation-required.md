# User Confirmation Required Before Applying Migrations

> **Status:** Phase 5D.2 COMPLETE — Migration files prepared, waiting for user confirmation.
> **Date:** 2026-05-17
>
> **⛔ DO NOT APPLY MIGRATIONS WITHOUT EXPLICIT USER CONFIRMATION.**

---

## Migration Files Created

| Service | Migration File | Tables Created | Location |
|---|---|---|---|
| store-service | `001_create_shops_and_store_settings.sql` | `shops`, `store_settings` | `microservices/store-service/migrations/` |
| order-service | `001_create_shop_orders_and_shop_order_items.sql` | `shop_orders`, `shop_order_items` | `microservices/order-service/migrations/` |

---

## Code Files Changed (Phase 5D.2 — No DB Impact)

| Service | File | Change |
|---|---|---|
| user-service | `src/app.module.ts` | `synchronize: true` → `false` |
| cart-service | `src/app.module.ts` | `synchronize: true` → `false` |
| docker-compose.yml | — | `TYPEORM_SYNCHRONIZE=true` → `false` (inventory-service) |
| cart-service | `src/cart/entities/cart.entity.ts` | `id int` → `uuid`; `userId` → `authUserId uuid`; added `guestToken` |
| cart-service | `src/cart/entities/cart-item.entity.ts` | `id int` → `uuid`; `productId int` → `variantId uuid`; added `unitPriceSnapshot`, `addedAt` |
| payment-service | `src/payment/entities/payment-transaction.entity.ts` | `amount float` → `numeric`; added `gatewayPayload jsonb`; removed `clientSecret` |
| payment-service | `src/payment/entities/refund.entity.ts` | **NEW** — `RefundEntity` for `refunds` table |
| payment-service | `src/payment/payment.service.ts` | Updated to use `gatewayPayload` instead of separate string fields |
| payment-service | `src/payment/payment.module.ts` | Registered `RefundEntity` |
| inventory-service | `src/inventory/entities/inventory-transaction.entity.ts` | **NEW** — `InventoryTransactionEntity` for `inventory_transactions` table |
| inventory-service | `src/inventory/inventory.module.ts` | Registered `InventoryTransactionEntity` |
| notification-service | `src/notification/entities/notification-log.entity.ts` | Added `templateId`, `authUserId`, `channel`, `errorMsg`, `sentAt`; removed non-existent `orderId` |
| notification-service | `src/notification/entities/notification-template.entity.ts` | **NEW** — `NotificationTemplateEntity` for `notification_templates` table |
| notification-service | `src/notification/entities/notification-event-log.entity.ts` | **NEW** — `NotificationEventLogEntity` for `notification_event_logs` table |
| notification-service | `src/notification/notification.service.ts` | Fixed broken `orderId` references; removed from DB writes and search queries |
| notification-service | `src/notification/notification.module.ts` | Registered `NotificationTemplateEntity`, `NotificationEventLogEntity` |
| order-service | `src/orders/entities/order-event.entity.ts` | **NEW** — `OrderEventEntity` for `order_events` table |
| order-service | `src/orders/orders.module.ts` | Registered `OrderEventEntity` |
| authentication-service | `src/auth/entities/auth-oauth-provider.entity.ts` | **NEW** — `AuthOAuthProviderEntity` for `auth_oauth_providers` table |
| authentication-service | `src/auth/auth.module.ts` | Registered `AuthOAuthProviderEntity` |

---

## What Will Happen If You Confirm

### store-service migration (ep-spring-union)
```sql
CREATE TABLE shops (
  id UUID PRIMARY KEY,
  seller_id UUID NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  logo_url TEXT,
  banner_url TEXT,
  description TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
-- + 4 indexes on shops
CREATE TABLE store_settings (
  id UUID PRIMARY KEY,
  store_name VARCHAR(255) NOT NULL,
  logo_image_url VARCHAR(255),
  logo_public_id VARCHAR(255),
  description TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(255),
  address VARCHAR(255),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### order-service migration (ep-cold-dream)
```sql
CREATE TABLE shop_orders (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  shop_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(14,2),
  shipping_fee DECIMAL(14,2),
  shop_total DECIMAL(14,2),
  tracking_number VARCHAR(100),
  shipping_provider VARCHAR(50),
  estimated_delivery TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_reason VARCHAR(500),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
-- FK: shop_orders.order_id → orders.id (same DB, same service)
-- + 5 indexes on shop_orders
CREATE TABLE shop_order_items (
  id UUID PRIMARY KEY,
  shop_order_id UUID NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  variant_id VARCHAR(255) NOT NULL,
  product_name_snapshot VARCHAR(255),
  variant_name_snapshot VARCHAR(255),
  sku_snapshot VARCHAR(100),
  image_url_snapshot VARCHAR(500),
  shop_name_snapshot VARCHAR(255),
  unit_price DECIMAL(14,2),
  quantity INT,
  line_total DECIMAL(14,2),
  created_at TIMESTAMPTZ
);
-- FK: shop_order_items.shop_order_id → shop_orders.id (same DB, same service)
-- + 3 indexes on shop_order_items
```

---

## What Will NOT Happen (Correctly Skipped)

- ❌ `store_settings` in auth-service DB — NOT dropped
- ❌ `carts` / `cart_items` tables — NOT dropped
- ❌ Legacy `orders`, `order_items`, `order_events` — NOT modified
- ❌ `user_profiles`, `user_addresses`, `user_viewed_products` — NOT dropped
- ❌ `synchronize: true` — NOT re-enabled anywhere
- ❌ Legacy data migration of existing orders to split-order model

---

## Before Applying Migration, User Must Confirm

- [ ] Đã backup/schema export từ tất cả các DB Neon bị ảnh hưởng
- [ ] Đã đọc và hiểu migration file
- [ ] Đồng ý tạo `shops` table trong store-service DB
- [ ] Đồng ý tạo `store_settings` table trong store-service DB
- [ ] Đồng ý tạo `shop_orders` table trong order-service DB
- [ ] Đồng ý tạo `shop_order_items` table trong order-service DB
- [ ] Đồng ý **không drop** legacy `orders`, `order_items`, `order_events`
- [ ] Đồng ý **không migrate** legacy orders cũ (flat model) sang split-order
- [ ] Đồng ý **không drop** `store_settings` trong auth-service DB
- [ ] Chấp nhận rủi ro nếu chưa backup

---

## Commands to Apply Migrations

**⚠️ Chỉ chạy sau khi user xác nhận.**

```powershell
# === STORE-SERVICE MIGRATION ===
# Target: ep-spring-union-ao6cq0xv-pooler PostgreSQL
# Connect and run:
#   microservices/store-service/migrations/001_create_shops_and_store_settings.sql

# === ORDER-SERVICE MIGRATION ===
# Target: ep-cold-dream-a1rxuc3e-pooler PostgreSQL
# Connect and run:
#   microservices/order-service/migrations/001_create_shop_orders_and_shop_order_items.sql

# === VERIFY TABLES CREATED ===
# After migration, run on each DB:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

---

## Rollback Plan

Nếu cần rollback (trước khi có dữ liệu thật):

```sql
-- store-service rollback
DROP TABLE IF EXISTS store_settings;
DROP TABLE IF EXISTS shops;

-- order-service rollback
DROP TABLE IF EXISTS shop_order_items;
DROP TABLE IF EXISTS shop_orders;
```

---

## Current Status

```
✅ Phase 5D.2 — Entity Alignment & Migration Preparation: COMPLETE
⏳ User Confirmation: PENDING
⏳ Phase 5D.3 — Apply Migrations: NOT STARTED
⏳ Phase 5D.4 — Runtime Verification: NOT STARTED
```

**Tôi đang chờ xác nhận của bạn trước khi chạy migration.**
