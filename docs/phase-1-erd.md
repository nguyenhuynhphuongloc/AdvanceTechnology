# Phase 1: Entity-Relationship Diagram

> **Ngày**: 16 May 2026
> **Phase**: 1 — Core Identity & Shop Foundation
> **Database**: PostgreSQL (user-service, store-service) + PostgreSQL (authentication-service)

---

## Full Marketplace ERD (Phase 1 Scope)

```mermaid
erDiagram
    %% =====================================================================
    %% AUTHENTICATION SERVICE
    %% =====================================================================

    AUTH_USER {
        uuid id PK "Primary key, UUID"
        varchar email UK "Unique email"
        varchar password_hash "bcrypt hashed"
        varchar role "customer | seller | admin"
        boolean is_active "default: true"
        varchar refresh_token nullable
        timestamptz created_at
        timestamptz updated_at
    }

    %% =====================================================================
    %% USER SERVICE
    %% =====================================================================

    BUYER_PROFILE {
        uuid id PK "Primary key, UUID"
        uuid user_id FK UK "→ AUTH_USER.id, Unique"
        varchar full_name
        varchar phone nullable
        varchar avatar_url nullable
        uuid default_address_id FK nullable "→ ADDRESS.id"
        timestamptz created_at
        timestamptz updated_at
    }

    SELLER_PROFILE {
        uuid id PK "Primary key, UUID"
        uuid user_id FK UK "→ AUTH_USER.id, Unique"
        varchar business_name
        varchar phone nullable
        varchar tax_id nullable
        varchar status "pending | approved | rejected | suspended"
        timestamptz created_at
        timestamptz updated_at
    }

    ADDRESS {
        uuid id PK "Primary key, UUID"
        uuid buyer_profile_id FK "→ BUYER_PROFILE.id"
        varchar full_name
        varchar phone
        varchar province
        varchar district
        varchar ward
        varchar street
        boolean is_default "default: false"
        timestamptz created_at
        timestamptz updated_at
    }

    %% =====================================================================
    %% STORE SERVICE (MARKETPLACE)
    %% =====================================================================

    SHOP {
        uuid id PK "Primary key, UUID"
        uuid seller_id FK UK "→ AUTH_USER.id, Unique (1 shop per seller)"
        varchar name
        varchar slug UK "Unique URL-friendly name"
        varchar logo_url nullable
        varchar banner_url nullable
        text description nullable
        varchar contact_email nullable
        varchar contact_phone nullable
        text address nullable
        varchar status "pending | approved | rejected | suspended"
        decimal commission_rate "default: 0.00"
        text rejection_reason nullable
        timestamptz created_at
        timestamptz updated_at
    }

    %% =====================================================================
    %% RELATIONSHIPS
    %% =====================================================================

    AUTH_USER ||--o| BUYER_PROFILE : "has optional"
    AUTH_USER ||--o| SELLER_PROFILE : "has optional"
    AUTH_USER ||--|| SHOP : "owns exactly one"
    BUYER_PROFILE ||--o{ ADDRESS : "has many"
    BUYER_PROFILE ||--o| ADDRESS : "has default (optional)"

    %% =====================================================================
    %% NOTES
    %% =====================================================================

    note for AUTH_USER {
        "Role values: 'customer' (buyer), 'seller', 'admin'
         JWT payload: { id, email, role }
         UUID primary key — consistent across all services"
    }

    note for BUYER_PROFILE {
        "Auto-created on first access (GET /users/me/profile)
         One buyer profile per authenticated user"
    }

    note for SELLER_PROFILE {
        "Created by admin or via seller registration flow
         Status: pending → approved (by admin)
         Each user has max 1 seller profile"
    }

    note for SHOP {
        "One shop per seller (seller_id is UNIQUE)
         Shop starts with status='pending'
         Only approved shops visible to public buyers
         Seller sees their own shop regardless of status"
    }
```

---

## Database Mapping

### authentication-service

| Table | Engine | Host |
|-------|--------|------|
| `auth_users` | PostgreSQL | Neon Tech |

### user-service

| Table | Engine | Host |
|-------|--------|------|
| `buyer_profiles` | PostgreSQL | Neon Tech |
| `seller_profiles` | PostgreSQL | Neon Tech |
| `addresses` | PostgreSQL | Neon Tech |

### store-service

| Table | Engine | Host |
|-------|--------|------|
| `shops` | PostgreSQL | Neon Tech |
| `store_settings` | PostgreSQL | Neon Tech |

---

## Key Design Decisions

### 1. User Identity (UUID)

All new tables use `UUID` for primary keys and foreign keys to match `AUTH_USER.id` (which is UUID). This ensures:

- Consistent user identification across all services
- No type mismatch when joining user data across microservices
- Future-proof for distributed systems

### 2. Shop-Seller Relationship

- **One-to-One**: Each seller (AUTH_USER with role='seller') has exactly ONE shop
- `SHOP.seller_id` is UNIQUE constraint
- Seller cannot create a second shop (409 Conflict)
- Enables future multi-shop support by removing UNIQUE constraint

### 3. Shop Status Lifecycle

```
pending → approved → suspended
       ↘ rejected
       ↙ (restore)
suspended → approved
```

- **pending**: New shop, awaiting admin review
- **approved**: Visible to public, can sell
- **rejected**: Admin rejected, seller can edit and re-submit
- **suspended**: Admin suspended active shop

### 4. Buyer vs. Seller

- Every AUTH_USER can optionally have a BUYER_PROFILE (created on first access)
- Every AUTH_USER can optionally have a SELLER_PROFILE (created by admin or registration flow)
- A user can be both a buyer and a seller simultaneously
- Role is stored on AUTH_USER, not on profiles

### 5. Address Scope

- Addresses belong to BUYER_PROFILE, not directly to AUTH_USER
- Buyer profile is auto-created, so addresses work for any authenticated user
- Only one address can be `is_default = true` per buyer profile

---

## What's NOT in Phase 1 ERD (Future Phases)

These entities will be added in later phases:

| Entity | Phase | Notes |
|--------|-------|-------|
| Product | Phase 2 | Will have `shopId FK → SHOP.id` |
| ProductVariant | Phase 2 | Will have `productId FK → PRODUCT.id` |
| Cart / CartItem | Phase 2 | Will have `shopId FK → SHOP.id` |
| Order / ShopOrder / ShopOrderItem | Phase 3 | Multi-shop order splitting |
| Payment / Refund / Commission | Phase 3 | Per-shop payment tracking |
| InventoryItem | Phase 2 | Will have `shopId FK → SHOP.id` |
| ProductReview / ShopReview | Phase 4 | Buyer reviews |
| Notification | Phase 4 | Seller-specific notifications |

---

*Document generated by Software Architect / Backend Architect Agent*
*Last updated: 16 May 2026*
