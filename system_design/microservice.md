MICROSERVICES
AUTH-SERVICE
-- =========================================================
-- AUTH SERVICE
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_user_role') THEN
        CREATE TYPE auth_user_role AS ENUM ('customer', 'admin');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'oauth_provider_type') THEN
        CREATE TYPE oauth_provider_type AS ENUM ('google', 'facebook');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS auth_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role auth_user_role NOT NULL DEFAULT 'customer',
    refresh_token TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_oauth_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    provider oauth_provider_type NOT NULL,
    provider_uid VARCHAR(255) NOT NULL,
    linked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_auth_oauth_providers_user
        FOREIGN KEY (user_id)
        REFERENCES auth_users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_auth_oauth_provider_uid
        UNIQUE (provider, provider_uid),

    CONSTRAINT uq_auth_user_provider
        UNIQUE (user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_auth_users_email
    ON auth_users(email);

CREATE INDEX IF NOT EXISTS idx_auth_users_is_active
    ON auth_users(is_active);

CREATE INDEX IF NOT EXISTS idx_auth_oauth_user_id
    ON auth_oauth_providers(user_id);

CREATE OR REPLACE FUNCTION set_auth_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auth_users_updated_at ON auth_users;

CREATE TRIGGER trg_auth_users_updated_at
BEFORE UPDATE ON auth_users
FOR EACH ROW
EXECUTE FUNCTION set_auth_users_updated_at();
USER_SERVICE
-- =========================================================
-- USER SERVICE
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
        CREATE TYPE gender_type AS ENUM ('male', 'female', 'other');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    gender gender_type,
    birthday DATE,
    avatar_url TEXT,
    style_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    label VARCHAR(100) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    street VARCHAR(255) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_user_addresses_user_profile
        FOREIGN KEY (profile_id)
        REFERENCES user_profiles(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_viewed_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL,
    product_id UUID NOT NULL,
    viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_user_viewed_products_user_profile
        FOREIGN KEY (profile_id)
        REFERENCES user_profiles(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_id
    ON user_profiles(auth_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_phone
    ON user_profiles(phone);

CREATE INDEX IF NOT EXISTS idx_user_addresses_profile_id
    ON user_addresses(profile_id);

CREATE INDEX IF NOT EXISTS idx_user_addresses_is_default
    ON user_addresses(is_default);

CREATE INDEX IF NOT EXISTS idx_user_viewed_products_profile_id
    ON user_viewed_products(profile_id);

CREATE INDEX IF NOT EXISTS idx_user_viewed_products_product_id
    ON user_viewed_products(product_id);

CREATE INDEX IF NOT EXISTS idx_user_viewed_products_profile_viewed_at
    ON user_viewed_products(profile_id, viewed_at DESC);

CREATE OR REPLACE FUNCTION set_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON user_profiles;

CREATE TRIGGER trg_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION set_user_profiles_updated_at();
-- =========================================================
-- PRODUCT SERVICE
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(150) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID,
    description TEXT,
    base_price NUMERIC(12,2) NOT NULL CHECK (base_price >= 0),
    image_url TEXT,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_products_collection
        FOREIGN KEY (collection_id)
        REFERENCES collections(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    size VARCHAR(100),
    color VARCHAR(100),
    price_override NUMERIC(12,2) CHECK (price_override >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_product_variants_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_pairings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    paired_with_product_id UUID NOT NULL,
    pair_count INT NOT NULL DEFAULT 1 CHECK (pair_count > 0),

    CONSTRAINT fk_product_pairings_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_product_pairings_paired_product
        FOREIGN KEY (paired_with_product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_product_pairings_not_self
        CHECK (product_id <> paired_with_product_id),

    CONSTRAINT uq_product_pairings_unique
        UNIQUE (product_id, paired_with_product_id)
);

CREATE INDEX IF NOT EXISTS idx_collections_slug
    ON collections(slug);

CREATE INDEX IF NOT EXISTS idx_products_collection_id
    ON products(collection_id);

CREATE INDEX IF NOT EXISTS idx_products_is_active
    ON products(is_active);

CREATE INDEX IF NOT EXISTS idx_products_created_at
    ON products(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id
    ON product_variants(product_id);

CREATE INDEX IF NOT EXISTS idx_product_variants_is_active
    ON product_variants(is_active);

CREATE INDEX IF NOT EXISTS idx_product_pairings_product_id
    ON product_pairings(product_id);

CREATE INDEX IF NOT EXISTS idx_product_pairings_paired_with_product_id
    ON product_pairings(paired_with_product_id);

CREATE OR REPLACE FUNCTION set_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_products_updated_at();
-- =========================================================
-- INVENTORY SERVICE
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_transaction_type') THEN
        CREATE TYPE inventory_transaction_type AS ENUM (
            'restock',
            'sale',
            'reserve',
            'release',
            'refund'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL UNIQUE,
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    reserved_stock INT NOT NULL DEFAULT 0 CHECK (reserved_stock >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_inventory_items_reserved_le_stock
        CHECK (reserved_stock <= stock)
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID NOT NULL,
    type inventory_transaction_type NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    ref_order_id UUID,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_inventory_transactions_item
        FOREIGN KEY (inventory_item_id)
        REFERENCES inventory_items(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_variant_id
    ON inventory_items(variant_id);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item_id
    ON inventory_transactions(inventory_item_id);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_ref_order_id
    ON inventory_transactions(ref_order_id);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_occurred_at
    ON inventory_transactions(occurred_at DESC);

CREATE OR REPLACE FUNCTION set_inventory_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_inventory_items_updated_at ON inventory_items;

CREATE TRIGGER trg_inventory_items_updated_at
BEFORE UPDATE ON inventory_items
FOR EACH ROW
EXECUTE FUNCTION set_inventory_items_updated_at();
-- =========================================================
-- CART SERVICE
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID,
    guest_token VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_carts_owner_required
        CHECK (
            auth_user_id IS NOT NULL
            OR guest_token IS NOT NULL
        )
);

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL,
    variant_id UUID NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price_snapshot NUMERIC(12,2) NOT NULL CHECK (unit_price_snapshot >= 0),
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id)
        REFERENCES carts(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_cart_items_cart_variant
        UNIQUE (cart_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_carts_auth_user_id
    ON carts(auth_user_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_carts_auth_user_id_not_null
    ON carts(auth_user_id)
    WHERE auth_user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_carts_guest_token_not_null
    ON carts(guest_token)
    WHERE guest_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id
    ON cart_items(cart_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id
    ON cart_items(variant_id);

CREATE OR REPLACE FUNCTION set_carts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_carts_updated_at ON carts;

CREATE TRIGGER trg_carts_updated_at
BEFORE UPDATE ON carts
FOR EACH ROW
EXECUTE FUNCTION set_carts_updated_at();
-- =========================================================
-- ORDER SERVICE
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_type') THEN
        CREATE TYPE order_status_type AS ENUM (
            'pending',
            'confirmed',
            'shipping',
            'delivered',
            'cancelled'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_payment_method_type') THEN
        CREATE TYPE order_payment_method_type AS ENUM (
            'cod',
            'momo',
            'paypal',
            'stripe'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_event_type') THEN
        CREATE TYPE order_event_type AS ENUM (
            'created',
            'paid',
            'shipped',
            'delivered',
            'cancelled'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID,
    user_address_id UUID,
    is_guest BOOLEAN NOT NULL DEFAULT FALSE,
    shipping_address_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    shipping_fee NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    status order_status_type NOT NULL DEFAULT 'pending',
    payment_method order_payment_method_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_orders_total_amount
        CHECK (total_amount >= subtotal),

    CONSTRAINT chk_orders_guest_consistency
        CHECK (
            (is_guest = TRUE AND auth_user_id IS NULL)
            OR
            (is_guest = FALSE)
        )
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    variant_id UUID NOT NULL,
    sku VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    image_url TEXT,

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    event order_event_type NOT NULL,
    note TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_order_events_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_orders_auth_user_id
    ON orders(auth_user_id);

CREATE INDEX IF NOT EXISTS idx_orders_user_address_id
    ON orders(user_address_id);

CREATE INDEX IF NOT EXISTS idx_orders_status
    ON orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_created_at
    ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
    ON order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_variant_id
    ON order_items(variant_id);

CREATE INDEX IF NOT EXISTS idx_order_events_order_id
    ON order_events(order_id);

CREATE INDEX IF NOT EXISTS idx_order_events_occurred_at
    ON order_events(occurred_at DESC);

CREATE OR REPLACE FUNCTION set_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_orders_updated_at();
-- =========================================================
-- PAYMENT SERVICE
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_type') THEN
        CREATE TYPE payment_method_type AS ENUM (
            'cod',
            'vnpay',
            'stripe'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_type') THEN
        CREATE TYPE payment_status_type AS ENUM (
            'pending',
            'success',
            'failed',
            'refunded'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'refund_status_type') THEN
        CREATE TYPE refund_status_type AS ENUM (
            'pending',
            'approved',
            'rejected'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    method payment_method_type NOT NULL,
    status payment_status_type NOT NULL DEFAULT 'pending',
    gateway_ref VARCHAR(255),
    gateway_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    reason TEXT,
    status refund_status_type NOT NULL DEFAULT 'pending',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,

    CONSTRAINT fk_refunds_transaction
        FOREIGN KEY (transaction_id)
        REFERENCES transactions(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transactions_order_id
    ON transactions(order_id);

CREATE INDEX IF NOT EXISTS idx_transactions_status
    ON transactions(status);

CREATE INDEX IF NOT EXISTS idx_transactions_method
    ON transactions(method);

CREATE INDEX IF NOT EXISTS idx_transactions_created_at
    ON transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_refunds_transaction_id
    ON refunds(transaction_id);

CREATE INDEX IF NOT EXISTS idx_refunds_status
    ON refunds(status);

CREATE INDEX IF NOT EXISTS idx_refunds_requested_at
    ON refunds(requested_at DESC);

CREATE OR REPLACE FUNCTION set_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_transactions_updated_at ON transactions;

CREATE TRIGGER trg_transactions_updated_at
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION set_transactions_updated_at();
-- =========================================================
-- NOTIFICATION SERVICE
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM (
            'order_confirm',
            'shipped',
            'payment_fail',
            'recommendation'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_channel_type') THEN
        CREATE TYPE notification_channel_type AS ENUM (
            'email',
            'sms',
            'zalo'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status_type') THEN
        CREATE TYPE notification_status_type AS ENUM (
            'sent',
            'failed',
            'pending'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(150) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL,
    auth_user_id UUID,
    type notification_type NOT NULL,
    channel notification_channel_type NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    status notification_status_type NOT NULL DEFAULT 'pending',
    error_msg TEXT,
    sent_at TIMESTAMPTZ,

    CONSTRAINT fk_notification_logs_template
        FOREIGN KEY (template_id)
        REFERENCES notification_templates(id)
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_notification_templates_key
    ON notification_templates(key);

CREATE INDEX IF NOT EXISTS idx_notification_logs_template_id
    ON notification_logs(template_id);

CREATE INDEX IF NOT EXISTS idx_notification_logs_auth_user_id
    ON notification_logs(auth_user_id);

CREATE INDEX IF NOT EXISTS idx_notification_logs_type
    ON notification_logs(type);

CREATE INDEX IF NOT EXISTS idx_notification_logs_channel
    ON notification_logs(channel);

CREATE INDEX IF NOT EXISTS idx_notification_logs_status
    ON notification_logs(status);

CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at
    ON notification_logs(sent_at DESC);

CREATE OR REPLACE FUNCTION set_notification_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notification_templates_updated_at ON notification_templates;

CREATE TRIGGER trg_notification_templates_updated_at
BEFORE UPDATE ON notification_templates
FOR EACH ROW
EXECUTE FUNCTION set_notification_templates_updated_at();
