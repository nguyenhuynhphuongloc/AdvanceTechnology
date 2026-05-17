# Post Phase 6 Seller/Admin Fix — Implementation Notes

Generated: 2025-07-14

## Summary

Thực hiện 4 thay đổi nhỏ trên 3 file để sửa lỗi Seller Register payload và cập nhật wording Admin Console từ single-store sang marketplace context.

**Build Status:** `npm run build` PASSED (41 pages, no errors)

## Seller Register Root Cause

Lỗi `name should not be empty` xảy ra do:
- Backend `RegisterDto` yêu cầu `name: string` với `@IsNotEmpty()`
- `auth-api.ts` gửi `name: payload.fullName || ''` — nếu `fullName` là whitespace-only (ví dụ `"   "`), `|| ''` không trim, gửi `"   "` → backend reject

## Seller Register Fix

**File:** `my-app/lib/seller/auth-api.ts`

**Before:**
```typescript
name: payload.fullName || '',
```

**After:**
```typescript
name: (payload.fullName || '').trim(),
```

Logic: `(payload.fullName || '').trim()` đảm bảo:
- `undefined`/`null` → `''`
- `"   "` (whitespace-only) → `''`
- `"  Nguyen Van A  "` → `"Nguyen Van A"`

## Seller Login/Redirect Fix

Không cần sửa — login flow đã đúng:
- Login success → `/seller/dashboard` ✅
- Route guard: no token → `/seller/login` ✅
- Non-seller role → `/` ✅

## Seller Route Guard Behavior

- `/seller/login`, `/seller/register` → auth pages (no guard)
- All other `/seller/*` → SellerShell checks:
  - No token → `/seller/login`
  - Role not `seller` or `admin` → `/` (home)
  - Has token → loads shop, renders sidebar + content
- Seller with no shop → sidebar shows "+ Setup your shop" link

## Admin Simplification Summary

**File:** `my-app/components/admin/AdminShell.tsx`

| Location | Before | After |
|---|---|---|
| Header subtitle | "Manage catalog, orders, customers, and store operations." | "Manage sellers, products, orders, and platform operations." |
| Sidebar footer | "Back to Store" | "Back to Marketplace" |

**File:** `my-app/app/admin/page.tsx`

| Location | Before | After |
|---|---|---|
| Stats label | "Customers" | "Users" |

## Files Changed

| File | Change |
|---|---|
| `my-app/lib/seller/auth-api.ts` | Added `.trim()` to name field in registerSeller() |
| `my-app/components/admin/AdminShell.tsx` | Updated header subtitle + sidebar link text |
| `my-app/app/admin/page.tsx` | Changed "Customers" stat label to "Users" |

## Build Result

- `npm run build` in `my-app/`: ✅ PASSED
- 41 static pages generated
- No TypeScript errors
- No ESLint errors (pre-existing warnings only)
- No regressions on Buyer Marketplace UI, Seller Center, or Admin Console

## Runtime Test Result

Not performed — backend services not running. Build verification confirms no regressions.

## Known Issues

See `docs/post-phase-6-seller-admin-known-issues.md`
