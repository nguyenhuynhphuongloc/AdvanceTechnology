## Implementation Notes

### Completed Scope

- Added shared UI tokens and admin-specific surface tokens.
- Added reusable primitives for status badges, empty/error/skeleton states, admin data tables, admin pagination, unavailable admin modules, and product image frames.
- Replaced the conflicted legacy admin dashboard component with a parseable compatibility component.
- Added a route-aware admin shell with grouped sidebar, mobile navigation, topbar, breadcrumb, admin search, notification affordance, profile display, and logout.
- Redesigned the storefront home, catalog listing, product card, product detail variant/image behavior, cart image/layout treatment, and checkout shipping/payment/order-review flow.
- Redesigned admin dashboard, products, inventory, orders, users, media library, and store settings surfaces.
- Added honest unavailable states for categories, payments, carts, logs, and notifications.
- Added public/admin loading skeletons and public catalog revalidation.
- Restored declared npm dependencies with `npm install` so Stripe modules are present in `node_modules`.
- Added missing `lib/mock-mode.ts` used by middleware.

### Verification

- `openspec validate redesign-store-and-admin-ux --strict`: passed.
- `npm run build`: passed.
- `npm test -- --runInBand`: passed, 3 suites and 7 tests.
- Public route search found no public usage of admin media helpers; Cloudinary/media access remains under admin API helpers and Admin Media Library.
- Product image frame usage now covers storefront cards, product detail main image, cart item images, and admin product table images.

### Remaining Risks

- Store Settings UI is a preview/edit surface only; persistence still requires a real store settings API.
- Some admin planned modules intentionally show unavailable states because backend/admin helpers are not wired yet.
- Product filters for price, color, size, branch, and availability are shown as API-pending controls until backend query support is available.
- The build still logs warnings for existing `<img>` usage and unused variables in seller/product areas, but no warning currently blocks build or tests.
