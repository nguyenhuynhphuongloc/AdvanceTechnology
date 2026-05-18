# Phase 5C — Seller Auth & Shop Onboarding Notes

## Summary

Phase 5C replaced the fake localStorage-based seller auth with real JWT-based auth tied to the backend `authentication-service`. The `/seller/login` and `/seller/register` pages were rewritten from scratch with a clean white+orange theme and no longer reuse `AccountPageClient`. Seller auth is now fully isolated from buyer auth.

## Files Changed

### New Files
| File | Change |
|---|---|
| `my-app/lib/seller/auth-api.ts` | Real API client for seller auth — login, register, session management |
| `my-app/lib/seller/auth-context.tsx` | React context with real JWT storage (`seller_token`, `seller_user`) |

### Modified Files
| File | Change |
|---|---|
| `my-app/app/seller/layout.tsx` | Replaced fake `useAuth()` with `useSellerAuth()`, new light theme sidebar, `SellerAuthProvider` wrapping |
| `my-app/app/seller/login/page.tsx` | Complete rewrite — white+orange branding panel + login form, real API call |
| `my-app/app/seller/register/page.tsx` | Complete rewrite — 2-step onboarding (account + shop setup), real API |
| `my-app/app/seller/shop/page.tsx` | Replaced `useAuth()` with `useSellerAuth()` |
| `my-app/app/seller/dashboard/page.tsx` | Replaced `useAuth()` with `useSellerAuth()`, `user.name` → `user.email` |
| `my-app/app/seller/orders/page.tsx` | Replaced `useAuth()` with `useSellerAuth()` |
| `my-app/app/seller/orders/[id]/page.tsx` | Replaced `useAuth()` with `useSellerAuth()` |
| `my-app/lib/seller/shop-api.ts` | Updated `getAuthHeaders()` to use `seller_token` (falls back to `acme_token`) |

## Seller Login Changes

- **Before**: Reused `AccountPageClient`, used fake localStorage auth, dark theme
- **After**: Standalone page, white+orange theme, left branding panel + right login card
- Real `POST /api/v1/auth/login` call
- Token stored as `seller_token`, user stored as `seller_user`
- Success redirects to `/seller/dashboard`
- Error messages handled gracefully
- Link to `/seller/register`
- Link back to storefront `/`

## Seller Register Changes

- **Before**: Reused `AccountPageClient`, used fake localStorage auth, dark theme
- **After**: Standalone page, white+orange theme, 2-step multi-step form
- Step 1: Account (fullName, email, phone, password, confirmPassword)
- Step 2: Business/Shop (businessName, shopName, shopSlug auto-generated, description, address)
- Real `POST /api/v1/auth/register` with `role: "seller"`
- Attempts shop creation via `POST /api/v1/seller/shop`
- If shop creation fails (store-service down) → shows warning message, still redirects to `/seller/shop`
- Success redirects to `/seller/dashboard`

## Route Guard Changes

- Seller layout now uses `SellerAuthProvider` wrapping `SellerShell`
- `/seller/login` and `/seller/register` render without sidebar
- All other `/seller/*` routes require `seller_token` in localStorage
- No token → redirect to `/seller/login`
- Token present → loads shop from `GET /api/v1/seller/shop`
- If no shop → shows "Setup your shop" link in sidebar
- Logout clears both `seller_token` and `seller_user`

## Redirect Behavior

- Seller login success → `/seller/dashboard` ✅ (was: `/product/account`)
- Seller register success → `/seller/dashboard` or `/seller/shop` (if shop creation failed)
- Seller logout → redirect handled by layout auth gate → `/seller/login`
- Customer trying to access seller pages → redirected to `/seller/login`
- No more `/product/account` links from seller flow ✅

## Auth Token Strategy

| Key | Purpose |
|---|---|
| `seller_token` | Seller JWT from real auth API |
| `seller_user` | Seller user object `{ id, email, role }` |
| `acme_token` | Buyer token (still used by buyer auth, unchanged) |
| `acme_user` | Buyer user object (unchanged) |

## Build Status

- `npm run build` in my-app: ✅ **PASSED**
- All TypeScript errors resolved
- Only pre-existing warnings (no new lint errors introduced by Phase 5C)
- All 47 static/dynamic pages generated successfully

## Test Results (Static)

| Route | Status |
|---|---|
| `/seller/login` | ✅ Build OK, standalone white+orange page |
| `/seller/register` | ✅ Build OK, 2-step form |
| `/seller` | ✅ Build OK, redirects to dashboard |
| `/seller/dashboard` | ✅ Build OK, uses new auth context |
| `/seller/shop` | ✅ Build OK, uses new auth context |
| `/seller/orders` | ✅ Build OK, uses new auth context |
| `/seller/orders/[id]` | ✅ Build OK, uses new auth context |
| `/seller/products` | ✅ Build OK, no auth changes needed |
| `/seller/inventory` | ✅ Build OK, no auth changes needed |

## Known Issues

See `docs/phase-5c-known-issues.md` for full details.

## Backward Compatibility

- Buyer login/register at `/product/account` and `/login`/`/register` unchanged ✅
- Admin auth unchanged ✅
- Phase 4B Seller Center pages (products, orders, inventory) not redesigned ✅
- Phase 5 Admin Console not affected ✅
- Store-service remains down (Neon PostgreSQL) — shop creation fails gracefully

## Next Phase Recommendation

- Fix store-service Neon PostgreSQL connection (infrastructure, not Phase 5C scope)
- Implement real buyer auth (replace fake localStorage with real API)
- Phase 6 buyer UI redesign
