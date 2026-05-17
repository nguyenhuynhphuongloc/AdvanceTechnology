-- ============================================================
-- Migration: 001_create_shop_orders_and_shop_order_items
-- Service: order-service
-- Target: ep-cold-dream-a1rxuc3e-pooler PostgreSQL (neondb)
-- Purpose: Create split-order tables for marketplace multi-seller orders
-- Date: 2026-05-17
--
-- ROLLBACK:
--   DROP TABLE IF EXISTS shop_order_items;
--   DROP TABLE IF EXISTS shop_orders;
--   (No data is lost on rollback — tables are newly created here)
--
-- DESIGN DECISIONS:
--   - FK only to local orders.id (same service, same DB) — safe.
--   - NO FK to shops (store-service) — cross-service, logical ID only.
--   - NO FK to auth_users (auth-service) — cross-service, logical ID only.
--   - NO FK to product_variants (MongoDB) — cross-service, logical ID only.
--   - All cross-service references are stored as UUID varchar.
--   - Legacy tables (orders, order_items, order_events) are NOT modified.
--   - Existing orders (pre-migration) remain in the flat orders table.
--   - New orders after this migration will also populate shop_orders + shop_order_items.
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
-- ON DELETE CASCADE: if the parent order is deleted, remove its shop_orders
ALTER TABLE shop_orders ADD CONSTRAINT fk_shop_orders_order_id
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

-- Index: join shop_orders with parent orders
CREATE INDEX IF NOT EXISTS idx_shop_orders_order_id ON shop_orders(order_id);
-- Index: filter by shop for seller dashboard
CREATE INDEX IF NOT EXISTS idx_shop_orders_shop_id ON shop_orders(shop_id);
-- Index: filter by seller for seller order list
CREATE INDEX IF NOT EXISTS idx_shop_orders_seller_id ON shop_orders(seller_id);
-- Index: filter by status for order state queries
CREATE INDEX IF NOT EXISTS idx_shop_orders_status ON shop_orders(status);
-- Index: for seller order history sorted by date
CREATE INDEX IF NOT EXISTS idx_shop_orders_created_at ON shop_orders(created_at DESC);

CREATE TABLE IF NOT EXISTS shop_order_items (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_order_id          UUID NOT NULL,
  product_id             VARCHAR(255) NOT NULL,
  variant_id             VARCHAR(255) NOT NULL,
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
-- ON DELETE CASCADE: if parent shop_order is deleted, remove its items
ALTER TABLE shop_order_items ADD CONSTRAINT fk_shop_order_items_shop_order_id
  FOREIGN KEY (shop_order_id) REFERENCES shop_orders(id) ON DELETE CASCADE;

-- Index: join with parent shop_order
CREATE INDEX IF NOT EXISTS idx_shop_order_items_shop_order_id ON shop_order_items(shop_order_id);
-- Index: filter by product for analytics
CREATE INDEX IF NOT EXISTS idx_shop_order_items_product_id ON shop_order_items(product_id);
-- Index: filter by variant for inventory lookups
CREATE INDEX IF NOT EXISTS idx_shop_order_items_variant_id ON shop_order_items(variant_id);
