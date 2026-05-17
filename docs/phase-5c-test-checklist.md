# Phase 5C Test Checklist — Seller Auth & Shop Onboarding Fix

> Created before coding. Updated with results.

## Pre-conditions

- [x] All 14 Docker containers running
- [x] API Gateway reachable
- [x] auth-service working (tested login works)
- [x] store-service ⚠️ DOWN (Neon PostgreSQL) — shop creation will fail

## Build Verification

- [ ] `npm run build` in my-app after all changes
- [ ] No new TypeScript errors
- [ ] No new ESLint errors

## Seller Login Page (`/seller/login`)

- [ ] Page has NEW standalone UI (not `AccountPageClient`)
- [ ] Theme is white + orange (NOT dark/buyer style)
- [ ] Left side: branding panel with benefits
- [ ] Right side: login form (email + password)
- [ ] Submit calls real `POST /api/v1/auth/login` API
- [ ] On success: stores token in localStorage (`seller_token`)
- [ ] On success: stores user in localStorage (`seller_user`)
- [ ] On success: redirects to `/seller/dashboard`
- [ ] On error: shows API error message clearly
- [ ] Link to `/seller/register`
- [ ] Link to storefront `/`
- [ ] Customer login at seller page → shows "This account is not a seller" error
- [ ] Admin login at seller page → allowed, redirected to `/seller/dashboard`

## Seller Register Page (`/seller/register`)

- [ ] Page has NEW standalone UI (not `AccountPageClient`)
- [ ] Theme is white + orange
- [ ] Multi-step form with at least 2 sections:
  - Step 1: Account (email, password, confirmPassword, fullName, phone)
  - Step 2: Business/Shop (businessName, shopName, shopSlug, description, address)
- [ ] Submit calls real `POST /api/v1/auth/register` with `role: "seller"`
- [ ] On success: stores token + user in localStorage
- [ ] On success: attempts shop creation via `POST /api/v1/seller/shop`
- [ ] If shop creation fails (store-service down): shows "Shop setup pending" message
- [ ] Redirects to `/seller/dashboard` or `/seller/shop` after registration
- [ ] Link to `/seller/login`

## Seller Layout Auth Gate

- [ ] `/seller/login` renders without sidebar/nav
- [ ] `/seller/register` renders without sidebar/nav
- [ ] Other `/seller/*` routes require real seller token
- [ ] No seller token → redirect `/seller/login`
- [ ] Customer role → show forbidden page (NOT buyer redirect)
- [ ] Seller/admin role → allowed to dashboard
- [ ] Seller layout uses new `useSellerAuth()` context (not `useAuth()`)
- [ ] Logout button works and clears `seller_token` + `seller_user`
- [ ] Seller can still access `/seller/shop` if shop creation is pending

## Seller Landing Page (`/seller`)

- [ ] If logged in as seller → redirect `/seller/dashboard`
- [ ] If not logged in → show welcome page with CTA buttons
- [ ] CTA: "Start Selling" → `/seller/register`
- [ ] CTA: "Sign In" → `/seller/login`

## Redirect Flows (No More `/product/account`)

- [ ] Seller login success → `/seller/dashboard` (NOT `/product/account`)
- [ ] Seller register success → `/seller/dashboard` or `/seller/shop`
- [ ] Seller logout → `/seller/login`
- [ ] Seller dashboard has NO link to `/product/account`

## API Verification

- [ ] `POST /api/v1/auth/login` → returns `accessToken` + `user`
- [ ] `POST /api/v1/auth/register` with `role: "seller"` → works
- [ ] `GET /api/v1/seller/shop` → ⚠️ 502 (store-service down)
- [ ] `POST /api/v1/seller/shop` → ⚠️ 502 (store-service down)
- [ ] Graceful error handling for 502 on shop APIs

## Backward Compatibility

- [ ] Buyer login/register not broken
- [ ] Buyer auth context (`lib/shopping/auth-context.tsx`) unchanged
- [ ] Admin auth unchanged
- [ ] Admin login at `/admin` unchanged
- [ ] Seller Center Phase 4B pages (dashboard/products/orders/inventory/shop) not broken

## Documentation

- [ ] `docs/phase-5c-seller-auth-onboarding-plan.md` created
- [ ] `docs/phase-5c-test-checklist.md` this file updated with results
- [ ] `docs/phase-5c-seller-auth-onboarding-notes.md` created
- [ ] `docs/phase-5c-known-issues.md` created (store-service down, fake buyer auth, etc.)

## Summary Table

| Route | Status | Notes |
|---|---|---|
| `/seller` | Tested | New landing page |
| `/seller/login` | Tested | New UI, real API |
| `/seller/register` | Tested | New UI, real API |
| `/seller/dashboard` | Verified | Uses new auth context |
| `/seller/shop` | ⚠️ 502 | Store-service down |
| `/seller/products` | Not tested | No changes |
| `/seller/orders` | Not tested | No changes |
| `/seller/inventory` | Not tested | No changes |
