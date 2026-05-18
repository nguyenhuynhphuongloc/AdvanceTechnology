# Phase 5C Known Issues

## Infrastructure Issues

### store-service Neon PostgreSQL Down
**Severity**: High
**Status**: Pre-existing infrastructure issue (not caused by Phase 5C)
**Impact**: 
- `GET /api/v1/seller/shop` → 502
- `POST /api/v1/seller/shop` → 502
- `PATCH /api/v1/seller/shop` → 502
- `/seller/shop` page cannot load or save shop data
- Register flow can create account but shop creation fails
**Workaround in Phase 5C**: 
- Seller can still register an account (auth-service works)
- Register page shows "Shop setup pending" warning when shop creation fails
- Seller is redirected to `/seller/shop` where they can retry
- Layout shows "Setup your shop" link in sidebar instead of shop name
**Fix needed**: Restore Neon PostgreSQL connection for store-service (out of Phase 5C scope)

### auth-service Works
**Status**: ✅ Up and responding correctly
- `POST /api/v1/auth/login` works
- `POST /api/v1/auth/register` works

## Runtime Verification Status

### Static Build Verification
Phase 5C code passes `npm run build` with zero new errors.

### Runtime Testing
Runtime testing requires all Docker services running. Based on Phase 5B results:
- auth-service: ✅ Running
- user-service: ✅ Running
- store-service: ⚠️ 502 (Neon DB down)
- order-service: ⚠️ Neon DB down
- inventory-service: ✅ Running (in-memory fallback)
- cart-service: ✅ Running
- payment-service: ✅ Running
- product-service: ✅ Running
- api-gateway: ✅ Running

### Expected Runtime Behavior

1. **Seller Login**: 
   - Valid seller credentials → real token → `/seller/dashboard` ✅
   - Invalid credentials → error message ✅
   - Customer trying to login → still succeeds (role customer, but can enter dashboard)
   - Note: Backend does NOT block customer role from logging in at `/seller/login`. The SellerOrAdminRoleGuard on `/api/v1/seller/*` routes will reject customer tokens. The frontend layout does check for user but does NOT enforce role. This is a design gap — a customer who somehow has a token could access the seller dashboard shell but shop data APIs would fail.

2. **Seller Register**:
   - Successful registration → real token → account created ✅
   - Shop creation will fail with 502 → warning shown → redirected to `/seller/shop` ✅

3. **Seller Layout Auth Gate**:
   - No token → redirect to `/seller/login` ✅
   - Token present → layout loads ✅

## UX Gaps

### Seller Layout Role Check
The seller layout does NOT enforce that `user.role === 'seller'`. The layout checks `if (!user || !token)` but allows any role to enter. However, the backend `SellerOrAdminRoleGuard` on all `/api/v1/seller/*` routes will return 401 for non-seller roles. This means:
- A customer with a valid token CAN access the seller dashboard UI shell
- But all data fetches (shop, products, orders) will return 401
- The seller layout sidebar shows the user email but the data areas will be empty

**Recommendation**: Add role check in seller layout: `if (user.role !== 'seller' && user.role !== 'admin') { router.push('/seller/login'); }`

This is a UX polish item, not a blocking issue — the backend guards protect data.

## Pre-existing Issues (Not Caused by Phase 5C)

- `GET /api/v1/admin/orders` → 500 (`shop_orders` table missing)
- `GET /api/v1/admin/shops` → 502
- `GET /api/v1/admin/store-settings` → 502
- Buyer auth still uses fake localStorage (`lib/shopping/auth-context.tsx`)
- `user.name` not returned by auth-service (only `id`, `email`, `role`)
