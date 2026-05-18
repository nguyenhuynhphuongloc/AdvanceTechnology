# Phase 5C API Usage

## Seller Auth APIs

### POST /api/v1/auth/login
**Used by**: `/seller/login` (new page)
**Purpose**: Real seller login
**Payload**: `{ email: string, password: string }`
**Response**: `{ accessToken: string, user: { id: string, email: string, role: string } }`
**Status**: ✅ Working (auth-service up)

### POST /api/v1/auth/register
**Used by**: `/seller/register` (new page)
**Purpose**: Real seller registration with role
**Payload**: `{ email: string, password: string, fullName: string, role: "seller" }`
**Response**: `{ accessToken: string, user: { id: string, email: string, role: string } }`
**Status**: ✅ Working (auth-service up)

### GET /api/v1/auth/admin/me
**Used by**: `lib/seller/auth-api.ts` (`getSellerSession`)
**Purpose**: Validate seller session / refresh user data
**Headers**: `Authorization: Bearer <token>`
**Response**: `{ id: string, email: string, role: string }`
**Status**: ✅ Working (auth-service up)

## Seller Shop APIs

### GET /api/v1/seller/shop
**Used by**: `lib/seller/shop-api.ts`, `seller/layout.tsx`, `seller/shop/page.tsx`
**Purpose**: Get seller's shop
**Headers**: `Authorization: Bearer <seller_token>`
**Response**: `Shop` object
**Status**: ⚠️ 502 (store-service down — Neon PostgreSQL)

### POST /api/v1/seller/shop
**Used by**: `seller/register/page.tsx`, `seller/shop/page.tsx`
**Purpose**: Create new shop for seller
**Headers**: `Authorization: Bearer <seller_token>`
**Payload**: `{ name: string, slug: string, description?: string, contactEmail?: string, contactPhone?: string, address?: string }`
**Response**: `Shop` object with `status: "pending"`
**Status**: ⚠️ 502 (store-service down)

### PATCH /api/v1/seller/shop
**Used by**: `seller/shop/page.tsx`
**Purpose**: Update seller's shop info
**Headers**: `Authorization: Bearer <seller_token>`
**Payload**: `UpdateShopPayload`
**Response**: `Shop` object
**Status**: ⚠️ 502 (store-service down)

## Page-to-API Mapping

| Page | Primary API | Status |
|---|---|---|
| `/seller/login` | `POST /api/v1/auth/login` | ✅ |
| `/seller/register` | `POST /api/v1/auth/register` + `POST /api/v1/seller/shop` | ✅ account, ⚠️ shop |
| `/seller/layout` (sidebar) | `GET /api/v1/seller/shop` | ⚠️ 502 |
| `/seller/shop` | `GET /api/v1/seller/shop` + `PATCH/POST` | ⚠️ 502 |
| `/seller/dashboard` | None (static stats) | ✅ |
| `/seller/products` | `GET /api/v1/seller/products` | Not tested in Phase 5C |
| `/seller/orders` | `GET /api/v1/seller/orders` | Not tested in Phase 5C |
| `/seller/inventory` | `GET /api/v1/seller/inventory` | Not tested in Phase 5C |

## Missing APIs

- `GET /api/v1/seller/me/profile` — seller profile (not used in Phase 5C, user data from auth)
- `PATCH /api/v1/seller/me/profile` — update seller profile (not used in Phase 5C)

## Token Strategy

Seller auth uses separate localStorage keys from buyer auth:
- `seller_token` — JWT from auth-service
- `seller_user` — `{ id, email, role }` object
- Falls back to `acme_token` / `acme_user` for backward compatibility in `shop-api.ts`
