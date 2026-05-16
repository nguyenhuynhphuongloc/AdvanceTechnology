## 1. Replace fake admin authentication flow

- [x] 1.1 Audit the current admin login page, route protection, and existing admin session pattern in the frontend
- [x] 1.2 Implement real admin login in `my-app/app/admin/login/page.tsx` using the existing admin API client and backend auth endpoints
- [x] 1.3 Persist and validate the admin session so protected `/admin` pages no longer bypass authentication

## 2. Replace fake dashboard data with real backend data

- [x] 2.1 Refactor `my-app/components/admin/AdminDashboard.tsx` to remove hardcoded product, inventory, stats, order, and user demo arrays
- [x] 2.2 Load products from `/api/v1/admin/products` and inventory from `/api/v1/admin/inventory` through `my-app/lib/admin/api.ts`
- [x] 2.3 Derive overview stats only from real product and inventory data that is actually available from the backend

## 3. Handle unsupported sections honestly

- [x] 3.1 Replace fake orders and users content with clearly labeled unavailable states if matching backend admin endpoints do not exist
- [x] 3.2 Add loading, error, and empty states for the real admin product and inventory sections
- [x] 3.3 Extend `my-app/lib/admin/api.ts` only as needed to support the real admin UI flow while keeping it as the single frontend API layer

## 4. Validate the real admin workflow

- [x] 4.1 Verify admin login no longer redirects without successful backend authentication
- [x] 4.2 Verify `/admin` requires a valid admin session before rendering protected content
- [x] 4.3 Verify the dashboard no longer displays fake hardcoded product or inventory data and instead loads real backend-backed responses
- [x] 4.4 Document any still-missing backend endpoints that block orders or users sections from becoming real
