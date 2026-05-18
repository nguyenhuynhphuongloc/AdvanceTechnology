# Phase 5C Plan — Seller Auth & Shop Onboarding Fix

## 1. Current Findings

### Root Problem: Fake Auth
`lib/shopping/auth-context.tsx` uses `localStorage` to fake login/register. It never calls a real API. `AccountPageClient` (reused by seller login/register) calls `useAuth()` which is fake — it just reads/writes `acme_users` and `acme_user` in localStorage.

### Why Seller Login Redirects Wrong
`AccountPageClient`:
- `handleLogin()` calls `useAuth.login()` → fake localStorage check → always "success" → `router.push(redirectTo || PRODUCT_LIST_PATH)`
- Seller login page passes `redirectTo="/seller/dashboard"` which is correct, BUT since auth is fake, any credentials work and `user` gets set in localStorage.
- The `seller/layout.tsx` checks `useAuth()` → sees fake user → loads shop from `fetchMyShop()` → which calls real API but gets 401 because no real token.

### Why `/product/account` Is Linked
`AccountPageClient` renders a "Go to Dashboard" link pointing to `/product/account` when user is logged in (line 104). This is the buyer account page, not seller.

### Store-Service is Down
`store-service` returns 502 (Neon PostgreSQL issue) — so `fetchMyShop()` will always fail, `createMyShop()` will fail. Seller onboarding cannot create a real shop.

### Auth Context Used by Seller Layout
`seller/layout.tsx` uses `useAuth()` from `lib/shopping/auth-context.tsx` — the fake auth. It reads `acme_user` from localStorage. Since the fake auth sets role="seller" when registering as seller, the layout sees the user and loads shop.

### Real APIs Available
- `POST /api/v1/auth/login` → auth-service → returns `{ accessToken, user: { id, email, role } }`
- `POST /api/v1/auth/register` → auth-service → returns `{ accessToken, user: { id, email, role } }` with `role` field supported
- `GET /api/v1/auth/me` → needs `GET /api/v1/auth/me` (currently only via `/api/v1/auth/admin/me` with JWT)
- `GET /api/v1/seller/shop` → store-service (currently 502)
- `POST /api/v1/seller/shop` → store-service (currently 502)
- `PATCH /api/v1/seller/shop` → store-service (currently 502)
- `GET /api/v1/seller/me/profile` → user-service → seller profile
- `PATCH /api/v1/seller/me/profile` → user-service → seller profile

## 2. Required Route Behavior

| Route | Expected Behavior |
|---|---|
| `/seller` | If logged in (real token) → `/seller/dashboard`; else → `/seller/login` |
| `/seller/login` | Real login API, success → `/seller/dashboard` (or `/seller/shop` if no shop) |
| `/seller/register` | Real register API, then onboarding flow |
| `/seller/dashboard` | Real auth gate, seller only |
| `/seller/shop` | Real auth gate, create/update shop |

## 3. Implementation Plan

### A. Create Real Seller Auth Context + API Client
**New file**: `my-app/lib/seller/auth-context.tsx`
- Uses real `POST /api/v1/auth/login` and `POST /api/v1/auth/register`
- Stores JWT token in `seller_token` localStorage key (separate from buyer `acme_token`)
- Stores user in `seller_user` localStorage key (separate from buyer)
- Exposes `login()`, `register()`, `logout()`, `user`
- Does NOT affect buyer auth context

**New file**: `my-app/lib/seller/auth-api.ts`
- `loginSeller({ email, password })` → real API call
- `registerSeller({ email, password, fullName, role })` → real API call
- `getCurrentSellerSession(token)` → calls `/api/v1/auth/admin/me`

### B. New Seller Login Page
**Replace**: `my-app/app/seller/login/page.tsx`
- White + orange theme (NOT dark)
- Left: branding panel ("Start selling on our marketplace" + 3 benefits)
- Right: login card with email + password
- On success: call real API, store token+user, redirect to `/seller/dashboard`
- On error: show API error message
- On register link → `/seller/register`

### C. New Seller Register Page
**Replace**: `my-app/app/seller/register/page.tsx`
- White + orange theme
- 2-step form:
  - Step 1: Account (email, password, confirmPassword, fullName, phone)
  - Step 2: Business + Shop (businessName, shopName, shopSlug, description, address)
- On submit:
  1. Call `POST /api/v1/auth/register` with role="seller"
  2. If store-service is up: call `POST /api/v1/seller/shop`
  3. If store-service is down: redirect to `/seller/shop` for later
  4. Redirect to `/seller/dashboard`
- On shop creation failure: still register account, show "Shop setup pending" message, redirect `/seller/shop`

### D. Update Seller Layout
**Modify**: `my-app/app/seller/layout.tsx`
- Replace `useAuth()` (fake) with `useSellerAuth()` (real)
- On `/seller/login` and `/seller/register`: render children without sidebar
- On other routes: require real seller token
- If no seller token → redirect `/seller/login`
- If role is not seller/admin → show forbidden
- Fetch shop after login (will fail gracefully if store-service is down)

### E. Update Seller Login/Register to NOT use AccountPageClient
Both pages currently import `AccountPageClient` — replace entirely with new components.

### F. Seller Landing Page
**Modify**: `my-app/app/seller/page.tsx`
- If logged in as seller → redirect `/seller/dashboard`
- If not logged in → show welcome page with CTA buttons

## 4. Infrastructure Limitation

**store-service is DOWN** (Neon PostgreSQL). This means:
- `POST /api/v1/seller/shop` → 502
- `GET /api/v1/seller/shop` → 502
- `PATCH /api/v1/seller/shop` → 502

**Workaround for Phase 5C**:
- Seller can still register an account (auth-service works ✅)
- Seller register page shows shop setup form, but on submit, if shop creation fails, show "Shop setup pending — please complete later" and redirect to `/seller/shop`
- `/seller/shop` page will try to create shop via API, fail with 502, show appropriate error + retry button
- This is documented as known infrastructure issue, NOT a Phase 5C code bug

## 5. Files Planned to Change

| Area | File | Change |
|---|---|---|
| Auth | `my-app/lib/seller/auth-context.tsx` | NEW — real seller auth context |
| Auth | `my-app/lib/seller/auth-api.ts` | NEW — real API calls |
| Login | `my-app/app/seller/login/page.tsx` | REPLACE — new white+orange UI |
| Register | `my-app/app/seller/register/page.tsx` | REPLACE — new white+orange multi-step |
| Layout | `my-app/app/seller/layout.tsx` | MODIFY — use real auth, light auth pages |
| Landing | `my-app/app/seller/page.tsx` | MODIFY — redirect or welcome |

## 6. Out of Scope

- Buyer auth (still uses fake localStorage for now)
- Admin auth (already has real JWT via admin API)
- Fixing store-service Neon PostgreSQL (infrastructure)
- Buyer UI redesign
- Seller dashboard/products/orders/inventory pages
- Phase 6 buyer features
