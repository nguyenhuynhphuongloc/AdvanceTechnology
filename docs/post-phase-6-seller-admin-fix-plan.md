# Post Phase 6 Seller/Admin Fix Plan

## 1. Seller Current Issues

### Root Cause of `name should not be empty`

The error comes from a **field name mismatch** between frontend and backend.

**Backend DTO** (`microservices/authentication-service/src/auth/dto/register.dto.ts`):

```typescript
export class RegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @IsString() @IsNotEmpty() name: string;  // ← requires "name"
  @IsString() @IsOptional() role?: string;
}
```

**Frontend payload** (`my-app/lib/seller/auth-api.ts`):

```typescript
// registerSeller sends:
{ email, password, fullName: '', role: 'seller' }
//                 ^^^^^^^^^ "fullName" instead of "name"
```

The frontend sends `fullName` but the backend expects `name`. When the form submits with `fullName: ''`, NestJS class-validator rejects it with `"name should not be empty"`.

**Fix:** Change `fullName` → `name` in `auth-api.ts` `registerSeller()`.

### Current Seller Register Flow

1. `/seller/register` — 2-step form
   - Step 1: email, password, confirmPassword, fullName, phone
   - Step 2: businessName, shopName, shopSlug, description, address
2. On submit → `register(email, password, fullName)` → `registerSeller({ email, password, fullName: '', role: 'seller' })`
3. Backend returns 400: `"name should not be empty"`
4. Register fails; shop creation never attempted

### Field Mapping Summary

| Form Field | Frontend Var | API Sent | Backend DTO |
|---|---|---|---|
| Full Name | `fullName` | `fullName` ❌ | `name` ✅ |
| Business Name | `businessName` | not sent | not applicable |
| Shop Name | `shopName` | sent to shop API ✅ | `name` in CreateShopDto |
| Shop Slug | `shopSlug` | sent to shop API ✅ | `slug` in CreateShopDto |
| Description | `description` | sent to shop API ✅ | `description` in CreateShopDto |
| Address | `address` | sent to shop API ✅ | `address` in CreateShopDto |

Note: `businessName` from the form is never sent anywhere. This is acceptable since the backend does not have a `businessName` field in any DTO.

### After Fix Flow

1. Register → `registerSeller({ name: fullName, email, password, role: 'seller' })`
2. Account created → token + user returned
3. Shop creation attempted → `createMyShop({ name: shopName, slug: shopSlug, ... })`
4. Success → redirect `/seller/dashboard`
5. Shop creation fails (store-service down) → redirect `/seller/shop` with warning banner

### Seller Login Redirect

- Login page: `router.push('/seller/dashboard')` on success ✅
- SellerShell guard: unauthenticated → `/seller/login` ✅
- Seller role check: non-seller → `/` ✅
- No redirect to `/product/account` ✅
- Login flow is already correct; only the register payload was broken.

### Seller Route Guard Behavior

- `/seller/login` → auth page (no guard)
- `/seller/register` → auth page (no guard)
- All other `/seller/*` → `SellerShell` checks:
  - No token → `/seller/login`
  - Role not `seller` or `admin` → `/` (home)
  - Has token → loads shop, renders sidebar + content
- Seller with no shop → sidebar shows "+ Setup your shop" link to `/seller/shop`
- Dashboard works regardless of shop status (uses `Promise.allSettled`)

### Admin Console Issues

The AdminShell navigation includes:

**Items to keep (already marketplace-aware):**
- Dashboard, Analytics, Users, Seller Profiles, Shop Approvals, Product Approvals
- Products, Categories, Inventory, Media Library, Orders, Shop Orders
- Payments, Store Settings (platform identity), Notifications

**Items that need renaming or clarification:**
- `Store Settings` → should be labeled `Platform Settings` or `Storefront Identity`
- `Branches` → This was the old "multi-branch inventory" concept. No `admin/branches/page.tsx` exists, but the nav references `/admin/logs` (no page exists). These need cleanup.
- `Admin Console` header still shows `Advance Technology` — acceptable as it's the platform name.

**Items to simplify/remove:**
- `Branches` in nav (AdminShell imports `ADMIN_INVENTORY_PATH` but `branches` nav item links to `/admin/inventory` anyway — this is confusing labeling)
- `Carts` — marketplace cart management is buyer-facing; admin cart view is unusual for marketplace model. Should be simplified.
- `Notifications` — notification service exists, but notification management in admin is questionable. Keep if service is real.
- `/admin/logs` — no page file exists; nav link will 404. Remove from nav.
- `Media Library` — acceptable for product images but no real backend upload yet.

**Pages that are already proper placeholders:**
- `commissions/page.tsx` — "coming soon" placeholder ✅
- `refunds/page.tsx` — "coming soon" placeholder ✅
- `sellers/page.tsx` — "Backend API not yet implemented" ✅

**Pages to keep as-is:**
- `shop-approvals/page.tsx` — real API via `AdminShopsController`
- `product-approvals/page.tsx` — real API via `AdminProductModerationProxyController`
- `seller-profiles/page.tsx` — real API via `AdminSellerProfilesController`

## 2. Files Planned to Change

| Area | File | Change |
|---|---|---|
| Seller Auth | `my-app/lib/seller/auth-api.ts` | Fix `fullName` → `name` in register payload |
| Admin Shell | `my-app/components/admin/AdminShell.tsx` | Remove `/admin/logs` from nav; simplify `Branches` label; rename `Store Settings` → `Platform Settings` |
| Admin Dashboard | `my-app/app/admin/page.tsx` | Rename "Store identity" section → "Platform Identity"; update CTA label; remove "Branches" stat if appropriate |
| Seller Register | `my-app/app/seller/register/page.tsx` | No code change needed (already passes `fullName` which maps to `name` via auth-api fix) |
| Seller Login | `my-app/app/seller/login/page.tsx` | No change needed |

## 3. Out of Scope

- No redesign of Buyer UI (Phase 6 marketplace)
- No review/rating feature
- No commission/settlement backend
- No refund backend
- No database schema changes
- No product/order/cart fixes (unless directly related)
- No new API endpoints
- No seller profile creation step (register → immediate shop creation is sufficient)
- No admin Users/Products full CRUD UI (those pages exist with placeholder/API hooks, no rewrite needed)

## 4. Seller Register Fix Detail

### Before (broken)

```typescript
// auth-api.ts registerSeller()
body: JSON.stringify({
  email: payload.email,
  password: payload.password,
  fullName: payload.fullName || '',   // ← wrong field name
  role: payload.role || 'seller',
}),
```

### After (fixed)

```typescript
// auth-api.ts registerSeller()
body: JSON.stringify({
  email: payload.email,
  password: payload.password,
  name: payload.fullName || '',
  role: payload.role || 'seller',
}),
```

### Also update RegisterPayload type:

```typescript
// Add name field to match backend RegisterDto
export interface RegisterPayload {
  email: string;
  password: string;
  fullName?: string;
  name?: string;  // ← add
  role?: string;
}
```

## 5. Admin Simplification Detail

### Changes to AdminShell nav items

1. Remove `{ href: "/admin/logs", label: "Logs", group: "System" }` — no page file exists
2. Rename `Store Settings` → `Platform Settings` (or keep but update description)
3. Rename `Branches` group label in dashboard — "Inventory" already covers branches concept

### Changes to Admin Dashboard

1. Rename "Store identity" section → "Platform Identity"
2. Update CTA "Edit storefront identity" → "Edit platform settings"
3. Remove "Branches" stat card or rename to "Inventory Locations"
4. Change "Add or edit product" → "Manage Products" in header CTA
