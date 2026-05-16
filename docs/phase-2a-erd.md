# Phase 2A: Entity-Relationship Diagram

> **Ngày**: 16 May 2026
> **Phase**: 2A — Product & Catalog Marketplace Foundation
> **Database**: MongoDB (product-service) + PostgreSQL (store-service)

---

## Full Product Catalog ERD (Phase 2A Scope)

```mermaid
erDiagram
    %% =====================================================================
    %% AUTHENTICATION SERVICE (Phase 1)
    %% =====================================================================

    AUTH_USER {
        uuid id PK "Primary key, UUID"
        varchar email UK "Unique email"
        varchar role "customer | seller | admin"
        boolean is_active
        timestamptz created_at
    }

    %% =====================================================================
    %% STORE SERVICE (Phase 1)
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
    %% PRODUCT SERVICE (Phase 2A) — MongoDB
    %% =====================================================================

    PRODUCT {
        string id PK "UUID string, API-facing"
        string shop_id FK nullable "→ SHOP.id, UUID string"
        string seller_id FK nullable "→ AUTH_USER.id, UUID string"
        varchar name
        varchar slug UK "Unique index"
        varchar sku UK "Unique index"
        text description
        decimal base_price
        boolean is_active "default: true"
        varchar approval_status "draft | pending | approved | rejected | hidden"
        text rejection_reason nullable
        timestamptz approved_at nullable
        string approved_by nullable "admin user ID"
        string category_id nullable
        string collection_id nullable
        string main_image_public_id nullable
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
        string image_id nullable "→ PRODUCT_IMAGE.id"
        boolean is_active "default: true"
        timestamptz created_at
    }

    PRODUCT_IMAGE {
        string id PK "UUID string"
        string product_id FK "→ PRODUCT.id"
        string image_url
        string public_id "Cloudinary publicId"
        varchar alt_text nullable
        int sort_order
        boolean is_main
    }

    CATEGORY {
        string id PK "UUID string"
        varchar name
        varchar slug UK "Unique"
        string parent_id nullable "→ CATEGORY.id"
        timestamptz created_at
        timestamptz updated_at
    }

    PRODUCT_RELATED {
        string id PK "UUID string"
        string product_id FK "→ PRODUCT.id"
        string related_product_id FK "→ PRODUCT.id"
        int sort_order
    }

    %% =====================================================================
    %% RELATIONSHIPS
    %% =====================================================================

    AUTH_USER ||--o| SHOP : "owns exactly one"
    SHOP ||--o{ PRODUCT : "has many products"
    AUTH_USER ||--o{ PRODUCT : "sells many products"
    PRODUCT ||--o{ PRODUCT_VARIANT : "has many variants"
    PRODUCT ||--o{ PRODUCT_IMAGE : "has many images"
    PRODUCT_VARIANT }o--o| PRODUCT_IMAGE : "optional variant image"
    PRODUCT ||--o{ PRODUCT_RELATED : "has related products"
    PRODUCT }o--o{ PRODUCT_RELATED : "is related to"
    CATEGORY ||--o{ PRODUCT : "categorizes products"
    CATEGORY ||--o| CATEGORY : "has parent category"
```

---

## Database Mapping

### product-service (MongoDB)

| Collection | Type | Notes |
|-----------|------|-------|
| `products` | MongoDB | Thêm marketplace fields |
| `product_variants` | MongoDB | Giữ nguyên |
| `product_images` | MongoDB | Giữ nguyên |
| `categories` | MongoDB | Giữ nguyên |
| `product_related` | MongoDB | Giữ nguyên |
| `collections` | MongoDB | Giữ nguyên |

### store-service (PostgreSQL)

| Table | Notes |
|-------|-------|
| `shops` | Phase 1 entity |

---

## Key Design Decisions

### 1. Shop → Product (1:N)

- Mỗi `SHOP` có nhiều `PRODUCT`
- `PRODUCT.shopId` là string UUID tham chiếu đến `SHOP.id`
- Không có DB-level FK constraint trong MongoDB
- Validation `shopId` được thực hiện ở service layer

### 2. Product Approval Lifecycle

```
draft → pending → approved
               ↘ rejected → pending (seller re-submit)
               ↘ hidden (admin hide)
```

- **draft**: Seller tạo nhưng chưa gửi duyệt
- **pending**: Chờ admin duyệt (trạng thái mặc định của product mới)
- **approved**: Public thấy được
- **rejected**: Seller có thể sửa và re-submit
- **hidden**: Admin ẩn do vi phạm

### 3. Public Visibility Rules

| Product Type | Public Listing | Public Detail |
|-------------|----------------|---------------|
| Legacy (không shopId) | ✅ Always | ✅ Always |
| Marketplace (có shopId, approved) | ✅ | ✅ |
| Marketplace (có shopId, pending) | ❌ | 404 |
| Marketplace (có shopId, rejected) | ❌ | 404 |
| Marketplace (có shopId, hidden) | ❌ | 404 |

### 4. Slug Uniqueness

- `slug` unique toàn hệ thống (giữ nguyên từ trước)
- Phase sau có thể đổi thành `/shops/:shopSlug/products/:productSlug`

### 5. Variant for Cart/Order (Phase 2B Ready)

- `ProductVariant` đã có `id` (UUID string) — sẵn sàng cho cart/order
- RabbitMQ `product.created` event đã publish `variants: [{variantId, sku}]`

---

## What's NOT in Phase 2A

| Entity | Phase | Notes |
|--------|-------|-------|
| Cart / CartItem | Phase 2B | Cần thêm shopId, variantId |
| Order / ShopOrder | Phase 3 | Multi-shop order splitting |
| InventoryItem | Phase 2B | Stock per variant per shop |
| Commission / Settlement | Phase 3 | Per-shop revenue tracking |

---

*Document generated by Senior Backend Architect / Full-stack Engineer Agent*
*Last updated: 16 May 2026*
