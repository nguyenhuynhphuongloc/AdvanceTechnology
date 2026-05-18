-- ============================================================
-- Migration: 002_create_shop_categories
-- Service: store-service
-- Purpose: Create seller shop category table
-- Date: 2026-05-18
-- ============================================================

CREATE TABLE IF NOT EXISTS shop_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id     UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_shop_categories_shop_slug
  ON shop_categories(shop_id, slug);

CREATE INDEX IF NOT EXISTS idx_shop_categories_shop_id
  ON shop_categories(shop_id);

CREATE INDEX IF NOT EXISTS idx_shop_categories_active
  ON shop_categories(shop_id, is_active);
