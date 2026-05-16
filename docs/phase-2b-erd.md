# Phase 2B: Entity-Relationship Diagram

> **Ngày**: 16 May 2026
> **Phase**: 2B — Cart & Inventory Marketplace Foundation
> **Databases**: PostgreSQL (cart-service, inventory-service, store-service, user-service) + MongoDB (product-service)

---

## Full Cart & Inventory ERD (Phase 2B Scope)

```mermaid
erDiagram
    %% =====================================================================
    %% AUTHENTICATION SERVICE
    %% =====================================================================

    AUTH_USER {
        uuid id PK "Primary key, UUID"
        varchar email UK "Unique email"
        varchar role "customer | seller | admin"
        boolean is_active
        timestamptz created_at
    }

    %% =====================================================================
    %% STORE SERVICE
    %% =====================================================================

    SHOP {
        uuid id PK "Primary key, UUID"
        uuid seller_id FK UK "→ AUTH_USER.id, Unique (1 shop per seller)"
        varchar name
        varchar slug UK "Unique URL-friendly name"
        varchar status "pending | approved | rejected | suspended"
        text rejection_reason nullable
        timestamptz created_at
        timestamptz updated_at
    }

    %% =====================================================================
    %% PRODUCT SERVICE (MongoDB)
    %% =====================================================================

    PRODUCT {
        string id PK "UUID string"
        string shop_id FK nullable "→ SHOP.id, UUID string"
        string seller_id FK nullable "→ AUTH_USER.id, UUID string"
        varchar name
        varchar slug UK "Unique index"
        varchar sku UK "Unique index"
        decimal base_price
        boolean is_active "default: true"
        varchar approval_status "draft | pending | approved | rejected | hidden"
        text rejection_reason nullable
        timestamptz approved_at nullable
        string approved_by nullable "admin user ID"
        timestamptz created_at
        timestamptz updated_at
    }

    PRODUCT_VARIANT {
        string id PK "UUID string"
        string product_id FK "→ PRODUCT.id"
        varchar sku UK "Unique"
        varchar size
        varchar color
        decimal price_override nullable
        string image_id nullable
        boolean is_active "default: true"
        timestamptz created_at
    }

    %% =====================================================================
    %% CART SERVICE (PostgreSQL)
    %% =====================================================================

    CART_STATE {
        uuid id PK "Primary key, UUID"
        uuid user_id nullable UK "→ AUTH_USER.id"
        varchar guest_token nullable UK
        varchar owner_key UK unique "cart:user:{userId} or cart:guest:{guestToken}"
        json items "CartItemSnapshot[]"
        timestamptz created_at
        timestamptz updated_at
    }

    %% =====================================================================
    %% INVENTORY SERVICE (PostgreSQL)
    %% =====================================================================

    INVENTORY_ITEM {
        uuid id PK "Primary key, UUID"
        uuid shop_id nullable "→ SHOP.id (logical FK, no DB constraint)"
        string product_id nullable "→ PRODUCT.id"
        string variant_id nullable "→ PRODUCT_VARIANT.id"
        uuid branch_id nullable "legacy — to be deprecated"
        varchar sku nullable
        int stock ">= 0"
        int reserved_stock ">= 0"
        int low_stock_threshold "default: 10"
        timestamptz updated_at
    }

    %% =====================================================================
    %% RELATIONSHIPS
    %% =====================================================================

    AUTH_USER ||--o| SHOP : "owns exactly one"
    SHOP ||--o{ PRODUCT : "sells many products"
    AUTH_USER ||--o{ PRODUCT : "sells many products"

    PRODUCT ||--o{ PRODUCT_VARIANT : "has many variants"
    PRODUCT_VARIANT }o--o| PRODUCT : "belongs to"

    CART_STATE ||--o{ "CART_STATE.items" } : "contains CartItemSnapshot objects"

    %% Note: CartItemSnapshot is a JSON array inside CART_STATE.items column
    %% The relationships below describe the logical data in CartItemSnapshot

    PRODUCT_VARIANT ||--o| INVENTORY_ITEM : "tracked by"
    SHOP ||--o{ INVENTORY_ITEM : "stocks"

    %% =====================================================================
    %% CartItemSnapshot Structure (stored in CART_STATE.items JSON column)
    %% =====================================================================

    note for CART_STATE.items {
        "CartItemSnapshot JSON structure:
        {
          itemId: string           // client-safe unique ID
          variantId: string        // → PRODUCT_VARIANT.id
          productId: string         // → PRODUCT.id
          shopId: string           // → SHOP.id
          productNameSnapshot: string
          variantNameSnapshot: string
          skuSnapshot: string
          imageUrlSnapshot: string
          shopNameSnapshot: string
          unitPriceSnapshot: number
          quantity: number
          addedAt: string (ISO)
        }"
    }

    note for INVENTORY_ITEM {
        "shopId + variantId is unique (Index)
        ProductVariant tracked by InventoryItem per shop
        Legacy items have shopId = null"
    }

    note for PRODUCT {
        "Legacy products: shopId = null
        Marketplace products: shopId not null, approvalStatus required"
    }
```

---

## Database Mapping

### cart-service (PostgreSQL)

| Table | Notes |
|-------|-------|
| `cart_state` | Cart + embedded CartItemSnapshot JSON |

### inventory-service (PostgreSQL)

| Table | Notes |
|-------|-------|
| `inventory_items` | Added shopId, lowStockThreshold; unique (shopId, variantId) |

### store-service (PostgreSQL)

| Table | Notes |
|-------|-------|
| `shops` | Phase 1 entity |

### product-service (MongoDB)

| Collection | Notes |
|-----------|-------|
| `products` | Phase 2A marketplace fields |
| `product_variants` | Phase 2A — has id (UUID string) |

---

## Key Design Decisions

### 1. CartItemSnapshot as JSON Column

- CartItemSnapshot data is stored inside the `cart_state.items` JSONB column in PostgreSQL
- This is a practical choice — Redis is the primary storage for cart, TypeORM is backup
- Snapshot fields (productName, price, etc.) capture the state at time of add-to-cart
- `shopId` enables grouping by shop in the response

### 2. InventoryItem shopId Design

- `shopId` is nullable to support legacy items (shopId = null)
- No DB-level FK constraint to SHOP (MongoDB reference)
- Unique constraint on `(shopId, variantId)` — prevents duplicate inventory per shop
- `lowStockThreshold` added as explicit threshold field

### 3. Product Variant Validation

- Cart and inventory services call the product-service internal endpoint
- Validates: product exists, variant exists, variant isActive, approvalStatus = approved
- Returns snapshot data: name, price, imageUrl for cart display

### 4. Available Stock

- `availableStock = stock - reservedStock`
- This is a computed field returned in API responses, not stored in DB
- Status is computed: in-stock / low-stock / out-of-stock

### 5. Seller Inventory Scope

- Seller inventory is scoped to their own shop
- Seller ID → Shop ID via store-service internal endpoint
- Seller cannot create/manage inventory for another shop's products

---

## What's NOT in Phase 2B

|| Entity | Phase | Notes |
|--------|-------|-------|
| Order / ShopOrder | Phase 3 | Multi-shop order splitting |
| Stock reservation at cart | Phase 3 | Stock validated at checkout |
| Payment / Refund / Commission | Phase 3 | Per-shop payment |
| Review / Rating | Future | Buyer reviews |
| Seller Dashboard UI | Future | Seller management interface |

---

*Document generated by Senior Backend Architect / Full-stack Engineer Agent*
*Last updated: 16 May 2026*
