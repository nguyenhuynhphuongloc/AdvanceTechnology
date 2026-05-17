# Phase 3: Entity-Relationship Diagram

> **Ngày**: 16 May 2026
> **Phase**: 3 — Checkout, Order Split & Payment Foundation
> **Databases**: PostgreSQL (order-service, cart-service, inventory-service, store-service, user-service) + MongoDB (product-service)

---

## Full Marketplace ERD (Phase 3 Scope)

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
        timestamptz created_at
    }

    PRODUCT_VARIANT {
        string id PK "UUID string"
        string product_id FK "→ PRODUCT.id"
        varchar sku UK "Unique"
        varchar size
        varchar color
        decimal price_override nullable
        boolean is_active "default: true"
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
        uuid shop_id nullable "→ SHOP.id"
        string product_id nullable "→ PRODUCT.id"
        string variant_id nullable "→ PRODUCT_VARIANT.id"
        varchar sku nullable
        int stock ">= 0"
        int reserved_stock ">= 0"
        int low_stock_threshold "default: 10"
        timestamptz updated_at
    }

    %% =====================================================================
    %% ORDER SERVICE (PostgreSQL) — Phase 3
    %% =====================================================================

    ORDER {
        uuid id PK "Primary key, UUID"
        uuid buyer_id FK "→ AUTH_USER.id"
        varchar order_number UK "ORD-YYYYMMDD-XXXXXX"
        varchar status "pending | awaiting_payment | paid | processing | partially_shipped | shipped | delivered | cancelled | refunded"
        varchar payment_status "pending | paid | failed | refunded | partially_refunded"
        varchar payment_method "cod | stripe | vnpay | momo"
        jsonb shipping_address_snapshot
        decimal subtotal "14,2"
        decimal shipping_fee "14,2"
        decimal total_amount "14,2"
        varchar currency "default: VND"
        varchar note nullable
        timestamptz cancelled_at nullable
        varchar cancel_reason nullable
        timestamptz created_at
        timestamptz updated_at
    }

    SHOP_ORDER {
        uuid id PK "Primary key, UUID"
        uuid order_id FK "→ ORDER.id, CASCADE"
        uuid shop_id FK "→ SHOP.id"
        uuid seller_id FK "→ AUTH_USER.id"
        varchar status "pending | confirmed | processing | shipped | delivered | cancelled | refund_requested | refunded"
        decimal subtotal "14,2"
        decimal shipping_fee "14,2"
        decimal shop_total "14,2"
        varchar tracking_number nullable
        varchar shipping_provider nullable
        timestamptz estimated_delivery nullable
        timestamptz confirmed_at nullable
        timestamptz shipped_at nullable
        timestamptz delivered_at nullable
        timestamptz cancelled_at nullable
        varchar cancel_reason nullable
        timestamptz created_at
        timestamptz updated_at
    }

    SHOP_ORDER_ITEM {
        uuid id PK "Primary key, UUID"
        uuid shop_order_id FK "→ SHOP_ORDER.id, CASCADE"
        uuid product_id "→ PRODUCT.id"
        uuid variant_id "→ PRODUCT_VARIANT.id"
        varchar product_name_snapshot
        varchar variant_name_snapshot
        varchar sku_snapshot
        varchar image_url_snapshot
        varchar shop_name_snapshot
        decimal unit_price "14,2"
        int quantity
        decimal line_total "14,2"
        timestamptz created_at
    }

    %% =====================================================================
    %% PAYMENT SERVICE (PostgreSQL)
    %% =====================================================================

    PAYMENT_TRANSACTION {
        uuid id PK "Primary key, UUID"
        varchar order_id "→ ORDER.id"
        varchar method "cod | stripe | vnpay | momo"
        float amount
        varchar status "pending | paid | failed | refunded"
        varchar gateway_ref nullable
        varchar client_secret nullable
        timestamptz created_at
        timestamptz updated_at
    }

    %% =====================================================================
    %% RELATIONSHIPS
    %% =====================================================================

    AUTH_USER ||--o{ ORDER : "places"
    AUTH_USER ||--o| SHOP : "owns exactly one shop"
    SHOP ||--o{ PRODUCT : "sells many products"
    AUTH_USER ||--o{ PRODUCT : "sells many products"

    PRODUCT ||--o{ PRODUCT_VARIANT : "has many variants"
    PRODUCT_VARIANT }o--o| PRODUCT : "belongs to"

    CART_STATE ||--o{ "CART_STATE.items" } : "contains CartItemSnapshot objects"

    %% CartItemSnapshot → variantId → PRODUCT_VARIANT
    %% CartItemSnapshot → shopId → SHOP

    PRODUCT_VARIANT ||--o| INVENTORY_ITEM : "tracked by"
    SHOP ||--o{ INVENTORY_ITEM : "stocks"

    %% ORDER RELATIONSHIPS
    ORDER ||--o{ SHOP_ORDER : "split into"
    SHOP_ORDER }o--o| SHOP : "belongs to"
    SHOP_ORDER }o--o| AUTH_USER : "seller"

    SHOP_ORDER ||--o{ SHOP_ORDER_ITEM : "contains"
    SHOP_ORDER_ITEM }o--o| PRODUCT_VARIANT : "references"
    SHOP_ORDER_ITEM }o--o| PRODUCT : "references"

    %% PAYMENT RELATIONSHIPS
    ORDER ||--o{ PAYMENT_TRANSACTION : "has"
    PAYMENT_TRANSACTION ||--o| ORDER : "for order"

    %% =====================================================================
    %% CartItemSnapshot Structure (Phase 2B)
    %% =====================================================================

    note for CART_STATE.items {
        "CartItemSnapshot JSON structure (Phase 2B):
        {
          itemId: string
          variantId: string        → PRODUCT_VARIANT.id
          productId: string         → PRODUCT.id
          shopId: string           → SHOP.id (KEY for grouping)
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
        availableStock = stock - reservedStock
        Legacy items: shopId = null"
    }
```

---

## Database Mapping

### order-service (PostgreSQL)

| Table | Notes |
|-------|-------|
| `orders` | Phase 3 — marketplace Order with UUID, buyerId |
| `shop_orders` | Phase 3 — per-shop order, CASCADE on order delete |
| `shop_order_items` | Phase 3 — item snapshots, CASCADE on shop_order delete |

### inventory-service (PostgreSQL)

| Table | Notes |
|-------|-------|
| `inventory_items` | Phase 2B fields + reservedStock |

### cart-service (PostgreSQL)

| Table | Notes |
|-------|-------|
| `cart_state` | Phase 2B — CartItemSnapshot JSON with shopId |

### payment-service (PostgreSQL)

| Table | Notes |
|-------|-------|
| `transactions` | Phase 1 — payment records, orderId is string |

---

## Key Design Decisions

### 1. Order Split Model

- **1 Order = 1 buyer's checkout session**
- **1 Order → n ShopOrder**: One per shop in the cart
- **1 ShopOrder → n ShopOrderItem**: One per cart item
- **Rationale**: Enables per-shop fulfillment, tracking, and payment split

### 2. Snapshot Design

- All item data (name, price, image, shopName) is snapshotted at checkout time
- Stored in `shop_order_items` table — immutable records
- Cart `unitPriceSnapshot` used as source of truth at checkout
- Rationale: Price changes after checkout don't affect existing orders

### 3. Stock Reservation Flow

```
Checkout → Reserve (reservedStock += qty)
  └→ Payment Success / Delivered → Commit (stock -= qty, reservedStock -= qty)
  └→ Cancel / Fail → Release (reservedStock -= qty)
```
- Prevents overselling without immediate stock deduction
- Available stock = stock - reservedStock

### 4. Order Status Sync

Parent Order status is auto-derived from ShopOrder statuses:
- All cancelled → Order cancelled
- All delivered → Order delivered
- All shipped → Order shipped
- Any shipped → Order partially_shipped
- Any confirmed/processing/pending → Order processing

---

## What's NOT in Phase 3

| Entity | Phase | Notes |
|--------|-------|-------|
| Payment split per shop | Phase 8 | Commission/settlement |
| Refund flow | Phase 8 | Refund request, approval |
| Shipping provider | Phase 8 | Real tracking integration |
| Review/Rating | Phase 4+ | Post-delivery reviews |
| Multi-warehouse | Future | Advanced inventory |

---

*Document generated by Senior Backend Architect / Full-stack Engineer Agent*
*Last updated: 16 May 2026*
