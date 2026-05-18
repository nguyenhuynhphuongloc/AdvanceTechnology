# Service Database Map

> Generated: 2026-05-17  
> Scope: `microservices/*` in this repository. PostgreSQL databases were introspected directly from each service `.env`. `product-service` is configured for MongoDB Atlas; Atlas credentials were not present during this pass, so its collections below are derived from TypeORM Mongo entities and existing ERD docs.

## Overview

| Service | Database | Runtime access | Tables / collections | Notes |
|---|---|---:|---:|---|
| `api-gateway` | none | n/a | 0 | Routes traffic to backend services; no owned persistence. |
| `authentication-service` | PostgreSQL / Neon | OK | 3 | Owns login identities and OAuth links. Runtime also contains a legacy `store_settings` table. |
| `user-service` | PostgreSQL / Neon | OK | 6 | Owns user profiles, addresses, seller/buyer profiles, viewed products. |
| `store-service` | PostgreSQL / Neon | OK | 2 | Owns shops and global store settings. |
| `product-service` | MongoDB Atlas | Password pending | 6 | Owns product catalog collections. References shops/sellers logically. |
| `cart-service` | PostgreSQL / Neon | OK | 3 | Owns active cart state and legacy cart tables. |
| `inventory-service` | PostgreSQL / Neon | OK | 3 | Owns branch/inventory stock and inventory transaction ledger. |
| `order-service` | PostgreSQL / Neon | OK | 5 | Owns orders, order split by shop, item snapshots, and order events. |
| `payment-service` | PostgreSQL / Neon | OK | 2 | Owns payment transactions and refunds. |
| `notification-service` | PostgreSQL / Neon | OK | 3 | Owns templates plus notification/event logs. |

## Cross-Service Relationship Map

These links are mostly logical foreign keys. In a microservice setup, databases are separate, so cross-service references are stored as IDs and enforced by service/API calls or events, not by DB-level FK constraints.

| Source service/table.column | Target service/table.column | Relationship | Enforcement |
|---|---|---|---|
| `user-service.user_profiles.auth_id` | `authentication-service.auth_users.id` | A profile belongs to an auth account. | Logical FK; user service stores auth UUID. |
| `user-service.buyer_profiles.user_id` | `authentication-service.auth_users.id` | Buyer profile belongs to an auth user. | Logical FK. |
| `user-service.seller_profiles.user_id` | `authentication-service.auth_users.id` | Seller profile belongs to an auth user. | Logical FK. |
| `store-service.shops.seller_id` | `authentication-service.auth_users.id` / `user-service.seller_profiles.user_id` | A shop is owned by a seller. | Logical FK; seller lookup through auth/store APIs. |
| `product-service.products.shopId` | `store-service.shops.id` | Product belongs to a shop. | Logical FK; product service stores string UUID. |
| `product-service.products.sellerId` | `authentication-service.auth_users.id` | Product belongs to a seller. | Logical FK. |
| `product-service.product_variants.productId` | `product-service.products.id` | Product has many variants. | Same Mongo service, no relational FK. |
| `product-service.product_images.productId` | `product-service.products.id` | Product has many images. | Same Mongo service. |
| `cart-service.cart_state.userId` | `authentication-service.auth_users.id` | Cart belongs to authenticated user. | Logical FK. |
| `cart-service.cart_state.items[].productId` | `product-service.products.id` | Cart item references product snapshot. | JSON snapshot; validated through product API. |
| `cart-service.cart_state.items[].variantId` | `product-service.product_variants.id` | Cart item references variant snapshot. | JSON snapshot; validated through product API. |
| `cart-service.cart_state.items[].shopId` | `store-service.shops.id` | Cart item grouped by shop for checkout. | JSON snapshot. |
| `inventory-service.inventory_items.shop_id` | `store-service.shops.id` | Stock belongs to shop. | Logical FK; service checks shop ownership. |
| `inventory-service.inventory_items.product_id` | `product-service.products.id` | Stock tracks product. | Logical FK. |
| `inventory-service.inventory_items.variant_id` | `product-service.product_variants.id` | Stock tracks variant. | Logical FK. |
| `order-service.orders.auth_user_id` | `authentication-service.auth_users.id` | Buyer who placed order. | Logical FK. |
| `order-service.orders.user_address_id` | `user-service.user_addresses.id` or profile address ID | Shipping address source. | Snapshot stored in `shipping_address_snapshot`. |
| `order-service.shop_orders.shop_id` | `store-service.shops.id` | Parent order split into one order per shop. | Logical FK. |
| `order-service.shop_orders.seller_id` | `authentication-service.auth_users.id` | Seller responsible for shop order. | Logical FK. |
| `order-service.shop_order_items.product_id` | `product-service.products.id` | Ordered product snapshot. | Snapshot fields stored in order DB. |
| `order-service.shop_order_items.variant_id` | `product-service.product_variants.id` | Ordered variant snapshot. | Snapshot fields stored in order DB. |
| `payment-service.transactions.order_id` | `order-service.orders.id` | Payment attempt for an order. | Logical FK; payment events update order flow. |
| `payment-service.refunds.transaction_id` | `payment-service.transactions.id` | Refund belongs to payment transaction. | DB FK inside payment DB. |
| `notification-service.notification_logs.auth_user_id` | `authentication-service.auth_users.id` | Notification recipient user. | Logical FK. |
| `notification-service.notification_event_logs.order_id` | `order-service.orders.id` | Notification event related to order. | Logical FK string. |

## Event Links

All RabbitMQ traffic uses exchange `commerce.events`.

| Event | Publisher | Consumers / effect |
|---|---|---|
| `product.created` | `product-service` | `inventory-service` can create/track inventory records for new variants. |
| `order.created` | `order-service` legacy flow | `inventory-service` reserves stock. |
| `inventory.reserved` | `inventory-service` | `payment-service` starts/continues payment; `order-service` updates workflow; notification can log event. |
| `inventory.reservation_failed` | `inventory-service` | `order-service` marks failed/cancelled path; notification can log failure. |
| `payment.succeeded` | `payment-service` | `order-service` updates payment/order status; `inventory-service` commits stock; `notification-service` logs/sends success notification. |
| `payment.failed` | `payment-service` | `order-service` marks failed path; `inventory-service` releases reservation; `notification-service` logs/sends failure notification. |
| `order.cancelled` | `order-service` | `inventory-service` releases reserved stock; notification can log cancellation. |

## `authentication-service`

PostgreSQL host: Neon pooler in `.env`; database: `neondb`.

| Table | Rows | Purpose |
|---|---:|---|
| `auth_users` | 26 | Login identity, credential hash, role, refresh token, active flag. |
| `auth_oauth_providers` | 2 | OAuth account links for auth users. |
| `store_settings` | 1 | Runtime legacy/global settings table found in this DB; current store settings entity belongs to `store-service`. |

### `auth_users`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | `uuid` | no | Primary key, default `gen_random_uuid()`. |
| `email` | `varchar(255)` | no | Unique login email. |
| `password_hash` | `text` | no | Password hash, never expose in APIs. |
| `role` | enum `auth_user_role` | no | Values: `customer`, `admin`, `seller`; default `customer`. |
| `refresh_token` | `text` | yes | Current refresh token/session material. |
| `is_active` | `boolean` | no | Active/disabled flag, default `true`. |
| `created_at`, `updated_at` | `timestamptz` | no | Audit timestamps. |

### `auth_oauth_providers`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | `uuid` | no | Primary key. |
| `user_id` | `uuid` | no | FK to `auth_users.id`. |
| `provider` | enum `oauth_provider_type` | no | Values: `google`, `facebook`. |
| `provider_uid` | `varchar(255)` | no | Provider-side user ID. |
| `linked_at` | `timestamptz` | no | Link timestamp. |

Internal FK: `auth_oauth_providers.user_id -> auth_users.id`.

## `user-service`

PostgreSQL host: Neon pooler in `.env`; database: `neondb`.

| Table | Rows | Purpose |
|---|---:|---|
| `user_profiles` | 3 | Runtime profile table keyed by auth ID. |
| `user_addresses` | 2 | Runtime address table for `user_profiles`. |
| `user_viewed_products` | 3 | Product viewing history. |
| `buyer_profiles` | 0 | Current entity for buyer profile, keyed by `user_id`. |
| `seller_profiles` | 0 | Current entity for seller profile, keyed by `user_id`. |
| `addresses` | 0 | Current entity for buyer profile addresses. Runtime includes both `buyer_profile_id` and generated `buyerProfileId`; this is a schema drift risk. |

### Main columns

| Table | Important columns |
|---|---|
| `user_profiles` | `id`, `auth_id`, `full_name`, `phone`, `gender`, `birthday`, `avatar_url`, `style_preferences`, `updated_at`. |
| `user_addresses` | `id`, `profile_id`, `label`, `full_name`, `phone`, `province`, `district`, `ward`, `street`, `is_default`. |
| `user_viewed_products` | `id`, `profile_id`, `product_id`, `viewed_at`. |
| `buyer_profiles` | `id`, `user_id`, `full_name`, `phone`, `avatar_url`, `default_address_id`, `created_at`, `updated_at`. |
| `seller_profiles` | `id`, `user_id`, `business_name`, `phone`, `tax_id`, `status`, `created_at`, `updated_at`. |
| `addresses` | `id`, `buyer_profile_id`, `buyerProfileId`, `full_name`, `phone`, `province`, `district`, `ward`, `street`, `is_default`, timestamps. |

Internal FKs: `user_addresses.profile_id -> user_profiles.id`, `user_viewed_products.profile_id -> user_profiles.id`, `addresses.buyerProfileId -> buyer_profiles.id`.

## `store-service`

PostgreSQL host: Neon pooler in `.env`; database: `neondb`.

| Table | Rows | Purpose |
|---|---:|---|
| `shops` | 16 | Seller shops and marketplace approval status. |
| `store_settings` | 1 | Store branding/contact settings. |

### `shops`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | `uuid` | no | Primary key. |
| `seller_id` | `uuid` | no | Logical FK to seller/auth user. |
| `name`, `slug` | `varchar(255)` | no | `slug` is unique. |
| `logo_url`, `banner_url`, `description` | text | yes | Shop media/content. |
| `contact_email`, `contact_phone`, `address` | varchar/text | yes | Shop contact info. |
| `status` | `varchar(20)` | no | `pending`, `approved`, `rejected`, `suspended`. |
| `commission_rate` | `decimal(5,2)` | no | Marketplace commission percentage. |
| `rejection_reason` | `text` | yes | Admin rejection note. |
| `created_at`, `updated_at` | timestamp | no | Audit timestamps. |

No DB-level FK to auth/user DB because it is a separate service.

## `product-service`

MongoDB Atlas URL in `.env`/root `.env`: `mongodb+srv://tiennguyen:***@product-service.nkkntfg.mongodb.net/neondb?...`. The real Atlas password was not available, so row counts were not available.

| Collection | Purpose | Important fields |
|---|---|---|
| `products` | Product catalog root. | `_id`, `id`, `name`, `slug`, `sku`, `description`, `basePrice`, `isActive`, `categoryId`, `collectionId`, `mainImagePublicId`, `shopId`, `sellerId`, `approvalStatus`, `rejectionReason`, `approvedAt`, `approvedBy`, timestamps. |
| `product_variants` | Sellable variants. | `_id`, `id`, `productId`, `sku`, `size`, `color`, `priceOverride`, `imageId`, `isActive`, timestamps. |
| `product_images` | Product media. | `_id`, `id`, `productId`, `imageUrl`, `publicId`, `altText`, `sortOrder`, `isMain`. |
| `categories` | Category tree. | `_id`, `id`, `name`, `slug`, `parentId`, timestamps. |
| `collections` | Product collections. | `_id`, `id`, `name`, `slug`. |
| `product_related` | Related-product edges. | `_id`, `id`, `productId`, `relatedProductId`, `sortOrder`. |

Logical relationships: `products.shopId -> store-service.shops.id`, `products.sellerId -> authentication-service.auth_users.id`, `product_variants.productId -> products.id`, `product_images.productId -> products.id`, `products.categoryId -> categories.id`, `products.collectionId -> collections.id`, `product_related.productId/relatedProductId -> products.id`.

## `cart-service`

PostgreSQL host: Neon pooler in `.env`; database: `neondb`.

| Table | Rows | Purpose |
|---|---:|---|
| `cart_state` | 14 | Current cart implementation with JSON item snapshots. |
| `carts` | 3 | Legacy cart owner table. |
| `cart_items` | 2 | Legacy normalized cart line items. |

### `cart_state`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | `uuid` | no | Primary key. |
| `userId` | `varchar` | yes | Logical auth user ID; unique. |
| `guestToken` | `varchar` | yes | Guest cart token; unique. |
| `ownerKey` | `varchar` | no | Unique owner key such as `cart:user:{id}` or `cart:guest:{token}`. |
| `items` | `text` | no | TypeORM `simple-json` array of cart item snapshots. |
| `createdAt`, `updatedAt` | timestamp | no | Audit timestamps. |

`cart_state.items[]` stores `itemId`, `variantId`, `productId`, `shopId`, product/variant/shop name snapshots, `skuSnapshot`, `imageUrlSnapshot`, `unitPriceSnapshot`, `quantity`, `addedAt`.

Internal FK: `cart_items.cart_id -> carts.id`.

## `inventory-service`

PostgreSQL host: Neon pooler in `.env`; database: `neondb`.

| Table | Rows | Purpose |
|---|---:|---|
| `inventory_items` | 40 | Stock per variant/shop/branch. |
| `inventory_transactions` | 4 | Immutable stock movement ledger. |
| `branches` | 1 | Branch/warehouse records. |

### `inventory_items`

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | `uuid` | no | Primary key. |
| `shop_id` | `varchar` | yes | Logical FK to `store-service.shops.id`. |
| `variant_id` | `varchar` | yes | Logical FK to `product-service.product_variants.id`. |
| `product_id` | `varchar` | yes | Logical FK to `product-service.products.id`. |
| `branch_id` | `varchar` | yes | Branch reference. |
| `sku` | `varchar` | yes | Variant SKU snapshot. |
| `stock` | `int` | no | Physical stock. |
| `reserved_stock` | `int` | no | Reserved stock for checkout/payment flow. |
| `low_stock_threshold` | `int` | no | Alert threshold. |
| `updated_at` | timestamp | no | Update timestamp. |

Internal FK: `inventory_transactions.inventory_item_id -> inventory_items.id`. Logical unique rule in entity: `(shopId, variantId)`.

## `order-service`

PostgreSQL host: Neon pooler in `.env`; database: `neondb`.

| Table | Rows | Purpose |
|---|---:|---|
| `orders` | 12 | Parent checkout order. |
| `shop_orders` | 2 | Per-shop split of an order. |
| `shop_order_items` | 3 | Per-shop item snapshots. |
| `order_items` | 3 | Legacy normalized order items. |
| `order_events` | 3 | Order lifecycle audit events. |

### `orders`

| Column group | Columns |
|---|---|
| Identity | `id`, `order_number`, `auth_user_id`, `user_address_id`. |
| Status/payment | `status`, `payment_status`, `payment_method`, `failure_reason`, `correlation_id`. |
| Money | `subtotal`, `shipping_fee`, `total_amount`, `currency`. |
| Shipping/snapshot | `shipping_address_snapshot`, `items`, `recipient_email`, `note`. |
| Cancellation | `cancelled_at`, `cancel_reason`. |
| Audit | `created_at`, `updated_at`. |

### Split-order tables

| Table | Important columns |
|---|---|
| `shop_orders` | `id`, `order_id`, `shop_id`, `seller_id`, `status`, `subtotal`, `shipping_fee`, `shop_total`, tracking/shipping timestamps, cancellation fields, timestamps. |
| `shop_order_items` | `id`, `shop_order_id`, `product_id`, `variant_id`, product/variant/sku/image/shop snapshots, `unit_price`, `quantity`, `line_total`, `created_at`. |
| `order_items` | Legacy item table: `id`, `order_id`, `variant_id`, `sku`, `product_name`, `variant_name`, `unit_price`, `quantity`, `image_url`. |
| `order_events` | `id`, `order_id`, `event`, `note`, `occurred_at`. |

Internal FKs: `shop_orders.order_id -> orders.id`, `shop_order_items.shop_order_id -> shop_orders.id`, `order_items.order_id -> orders.id`, `order_events.order_id -> orders.id`.

## `payment-service`

PostgreSQL host: Neon pooler in `.env`; database: `neondb`.

| Table | Rows | Purpose |
|---|---:|---|
| `transactions` | 4 | Payment attempts against orders. |
| `refunds` | 1 | Refund requests against payment transactions. |

### Main columns

| Table | Important columns |
|---|---|
| `transactions` | `id`, `order_id`, `amount`, `method`, `status`, `gateway_ref`, `gateway_payload`, `created_at`, `updated_at`. |
| `refunds` | `id`, `transaction_id`, `amount`, `reason`, `status`, `requested_at`, `processed_at`. |

Internal FK: `refunds.transaction_id -> transactions.id`. Cross-service logical FK: `transactions.order_id -> order-service.orders.id`.

## `notification-service`

PostgreSQL host: Neon pooler in `.env`; database: `neondb`.

| Table | Rows | Purpose |
|---|---:|---|
| `notification_templates` | 3 | Message templates keyed by type. |
| `notification_logs` | 2 | Rendered/sent notification records. |
| `notification_event_logs` | 1 | Raw event-consumption logs. |

### Main columns

| Table | Important columns |
|---|---|
| `notification_templates` | `id`, `key`, `subject`, `body_html`, `updated_at`. |
| `notification_logs` | `id`, `template_id`, `auth_user_id`, `type`, `channel`, `recipient`, `status`, `error_msg`, `sent_at`. |
| `notification_event_logs` | `id`, `order_id`, `type`, `recipient`, `status`, `message`, `created_at`. |

Internal FK: `notification_logs.template_id -> notification_templates.id`. Event log `order_id` is a cross-service logical reference to `order-service.orders.id`.

## Schema Drift / Follow-Up Notes

| Area | Finding | Risk |
|---|---|---|
| `authentication-service` | Runtime DB contains `store_settings`, although store settings are owned by `store-service`. | Possible legacy table or accidental schema sync; avoid writing to it from auth service. |
| `user-service` | Runtime has both legacy `user_profiles/user_addresses` and current `buyer_profiles/seller_profiles/addresses`. | Code/API may be split across old and new schema; migrations should clarify canonical profile tables. |
| `user-service.addresses` | Runtime has both `buyer_profile_id` and `buyerProfileId`; FK uses `buyerProfileId`. | TypeORM naming mismatch can break address relations or create duplicate columns. |
| `order-service` | Runtime has both `orders/items` JSON flow and legacy `order_items`, plus newer shop split tables. | Checkout/order APIs must consistently use one model or maintain compatibility deliberately. |
| `product-service` | MongoDB Atlas could not be introspected because the real Atlas password was not present. | Replace `<db_password>`, run migration/audit, then update row counts and actual collection indexes. |
