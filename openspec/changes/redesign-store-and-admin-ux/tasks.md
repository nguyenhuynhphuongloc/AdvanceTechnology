## 1. Discovery and Stabilization

- [x] 1.1 Resolve existing admin UI blockers before redesign, including conflict markers, mojibake text, and any broken admin build paths
- [x] 1.2 Audit all public store routes and admin routes for current layout, data dependencies, loading states, empty states, and error states
- [x] 1.3 Confirm which required UI data is available from existing APIs and document gaps for filters, store settings, branch stock, payments, carts, logs, and notifications

## 2. UI Foundation

- [x] 2.1 Define shared design tokens for spacing, radius, typography, color, border, shadow, focus, and status colors
- [x] 2.2 Create reusable UI primitives for buttons, inputs, selects, cards, badges, dialogs, drawers, toasts, skeletons, empty states, and error states
- [x] 2.3 Create a shared product image frame pattern with fixed aspect ratio, non-distorting fit, fallback image, and loading placeholder
- [x] 2.4 Separate public storefront shell concerns from admin shell concerns

## 3. Storefront Redesign

- [x] 3.1 Redesign the home page with settings-driven logo/name, search, category navigation, banner/hero, featured products, new arrivals, optional best sellers, and footer shop info
- [x] 3.2 Redesign product listing with responsive grid, product cards, filters, sorting, pagination, mobile filter drawer, and URL-driven query state
- [x] 3.3 Redesign product detail with gallery, variant-aware image switching, color/size selection, stock display, quantity selector, add-to-cart, description/specs, and related products
- [x] 3.4 Redesign cart with close two-column desktop layout, mobile summary stacking, cart item controls, unavailable item handling, and reliable checkout CTA states
- [x] 3.5 Redesign checkout into shipping information, order review, payment method, place order, validation, and payment/confirmation states

## 4. Admin Redesign

- [x] 4.1 Redesign admin shell with sidebar/feature groups, topbar, breadcrumb, admin search, notifications, profile, logout, and responsive mobile navigation
- [x] 4.2 Redesign dashboard with stat cards, revenue/order chart if data exists, recent orders, low stock products, and quick actions
- [x] 4.3 Redesign products module with table toolbar, filters, pagination, row actions, create/edit drawer or editor, media upload/select, variant management, and branch assignment
- [x] 4.4 Redesign Media Library with admin-only navigation, asset grid, upload, preview, copy URL, linked/unlinked states, blocked delete for linked assets, and empty/error/loading states
- [x] 4.5 Redesign orders module with filters, table, order detail drawer, user/payment links, and status update controls only where backend support exists
- [x] 4.6 Redesign users module with filters, role/status badges, user detail drawer, and links to user cart and orders
- [x] 4.7 Add planning/UI surfaces for carts, payments, categories, store settings, logs, and notifications with honest unavailable/empty states when APIs are not ready
- [x] 4.8 Redesign store settings with logo upload/change, store name, contact info, branches, and public header preview

## 5. Performance UX

- [x] 5.1 Review bundle and client component usage for public/admin routes and move initial data loading server-side where appropriate
- [x] 5.2 Add caching or revalidation strategy for stable product/category/store settings data without breaking live admin updates
- [x] 5.3 Add pagination to heavy product, order, user, inventory, and media lists
- [x] 5.4 Add debounced search and avoid duplicate API calls during filtering
- [x] 5.5 Lazy-load below-the-fold images and use predictable skeletons during navigation
- [x] 5.6 Prefetch important user/admin routes where the framework supports it safely

## 6. Verification

- [x] 6.1 Verify store home, catalog, product detail, cart, checkout, account, and orders across desktop, tablet, and mobile
- [x] 6.2 Verify admin dashboard, products, media library, orders, users, inventory, and store settings across desktop, tablet, and mobile
- [x] 6.3 Verify Cloudinary/media library is not exposed on public routes and is reachable only from Admin
- [x] 6.4 Verify product image frames do not stretch or crop critical content
- [x] 6.5 Verify route transitions, loading states, empty states, error states, and checkout failure states
- [x] 6.6 Run relevant build/lint/tests available in the project and document any remaining risks
