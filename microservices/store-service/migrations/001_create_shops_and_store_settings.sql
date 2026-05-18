-- ============================================================
-- Migration: 001_create_shops_and_store_settings
-- Service: store-service
-- Target: ep-spring-union-ao6cq0xv-pooler PostgreSQL (neondb)
-- Purpose: Create marketplace shop management tables
-- Date: 2026-05-17
--
-- ROLLBACK:
--   DROP TABLE IF EXISTS shop_order_items;
--   DROP TABLE IF EXISTS shop_orders;
--   (No data is lost on rollback — tables are newly created here)
--
-- NOTES:
--   - store_settings is NOT dropped from auth-service DB in this migration.
--   - After store-service is verified, a separate migration will copy the
--     store_settings row from auth DB to store DB.
-- ============================================================

CREATE TABLE IF NOT EXISTS shops (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id           UUID NOT NULL,
  name                VARCHAR(255) NOT NULL,
  slug                VARCHAR(255) NOT NULL UNIQUE,
  logo_url            TEXT,
  banner_url          TEXT,
  description         TEXT,
  contact_email       VARCHAR(255),
  contact_phone       VARCHAR(20),
  address             TEXT,
  status              VARCHAR(20) NOT NULL DEFAULT 'pending',
  commission_rate     DECIMAL(5,2) NOT NULL DEFAULT 0,
  rejection_reason    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- seller_id is unique: one shop per seller
CREATE UNIQUE INDEX IF NOT EXISTS idx_shops_seller_id ON shops(seller_id);

-- slug is unique for SEO-friendly shop URLs
CREATE UNIQUE INDEX IF NOT EXISTS idx_shops_slug ON shops(slug);

-- Filter by status (pending, active, suspended, rejected)
CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status);

-- Filter by seller for shop lookup
CREATE INDEX IF NOT EXISTS idx_shops_created_at ON shops(created_at DESC);

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
