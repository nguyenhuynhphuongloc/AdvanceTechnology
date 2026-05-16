## Context

Recent changes connected storefront catalog flows, admin products/media, and admin orders/users to real backend data. Those changes intentionally avoided broad UX redesign. The result is a functional but uneven interface:

- Product cards use image crop behavior that can cut off product imagery.
- Product detail variant selection is difficult to reason about and currently uses side effects in memo/state helpers.
- Cart and checkout are service-connected, but checkout feels like a payment status page rather than a complete checkout flow.
- Admin routes have a sidebar, but no mature topbar, breadcrumb model, route-aware module structure, or complete feature list.
- Admin product/media UI uses separate visual systems and some admin sections are simple tables without filtering, pagination, detail drawers, or action patterns.
- Product/category/settings fetching currently favors `no-store`, which hurts perceived navigation speed for stable data.

Referenced open-source projects are used only for patterns and information architecture:

- `react-admin`: resource-oriented admin IA, data grids, filters, auth, permissions, notifications, saved queries, and optimistic UX.
- `TailAdmin React`: dashboard shell, sidebar, topbar, charts, tables, modals, alerts, and Tailwind-based admin components.
- `next-prisma-tailwind-ecommerce`: split storefront/admin structure, products/orders/payments admin modules, Cloudinary upload, shadcn/Radix direction.
- `ecommerce-admin`: ecommerce admin IA around products, orders, customers, notifications, React Table, React Query, and shadcn UI.

## Design Direction

### Storefront

The storefront should become ecommerce-first: clear navigation, fast product discovery, trustworthy product imagery, variant-aware detail pages, and a straightforward cart-to-checkout path.

Recommended public IA:

```text
Store
|-- Home
|   |-- Hero / banner
|   |-- Category shortcuts
|   |-- Featured products
|   |-- New arrivals
|   `-- Best sellers, if data exists
|-- Catalog
|   |-- Product grid
|   |-- Filters: category, price, color, size, branch, availability
|   `-- Sort: newest, price low-high, price high-low, popular if data exists
|-- Product Detail
|   |-- Gallery
|   |-- Variant selector
|   |-- Stock / branch availability
|   |-- Add to cart / buy now
|   `-- Related products
|-- Cart
|-- Checkout
|-- Account
`-- Orders
```

### Admin

The admin should become operations-first: dense, scannable, structured, and consistent across modules. The admin UI should not reuse decorative storefront composition.

Recommended admin IA:

```text
Admin
|-- Dashboard
|-- Catalog
|   |-- Products
|   |-- Categories
|   |-- Inventory
|   `-- Media Library
|-- Commerce
|   |-- Orders
|   |-- Payments
|   `-- Carts
|-- Customers
|   `-- Users
|-- Operations
|   |-- Logs
|   `-- Notifications
`-- Settings
    |-- Store Settings
    `-- Branches
```

## Layout Plans

### Home

- Header with store logo/name from Store Settings, search, category navigation, account, and cart.
- Hero/banner focused on actual store/category/product merchandising, not generic technology copy.
- Category shortcuts.
- Featured products, new arrivals, and best sellers if the backend exposes enough data.
- Footer with store contact information from Store Settings.
- Empty catalog state must be honest and useful for local/admin setup.

### Product Listing

- Desktop: left filter rail, grid center, compact sort/result summary near top.
- Mobile: search first, filter drawer, sort select, two-column product grid where possible.
- Product cards include stable image frame, name, price, category, color/variant preview, availability badge, and optional add-to-cart action.
- Filters should be URL-driven where practical so refresh/share/back navigation works.

### Product Detail

- Desktop: gallery left and product/variant/purchase panel right.
- Mobile: gallery first, core product info, variant selectors, sticky add-to-cart action.
- Selecting color should select an available variant and update active image if the variant has an image.
- If selected variant has no image, keep the current/default product image and show a clear selected state.
- Include description/specification and related products below the purchase area.

### Cart

- Desktop: constrained two-column layout with cart items and a sticky order summary close enough to scan together.
- Mobile: cart items first and order summary below.
- Cart items show fitted product image, product name, variant/color/size, price, quantity stepper, remove action, and unavailable item messaging.
- Proceed to Checkout is disabled for empty carts, redirects guests to login with a return URL, and shows toast/inline error if order creation fails.

### Checkout

- Replace single status-card flow with a complete checkout sequence:
  1. Shipping information.
  2. Delivery/payment method.
  3. Order review.
  4. Place order and payment confirmation.
- Validation errors must be field-level and visible before order creation.
- Existing payment status behavior can remain as the final payment/confirmation stage.

### Admin Shell

- Desktop: fixed/collapsible left sidebar, topbar, breadcrumb, main content.
- Tablet: compact icon rail with tooltips or grouped menu.
- Mobile: sticky topbar and slide-over navigation.
- Topbar includes global/admin search, notifications, admin profile, and logout.
- Breadcrumb belongs inside main content above page title.

### Admin Dashboard

- Stats cards for sales, active orders, products, customers, and low stock.
- Revenue/orders chart if real data exists.
- Recent orders table.
- Low stock products.
- Quick actions for add product, upload media, view orders, and edit store settings.

### Admin Products

- Header with primary Add Product action.
- Toolbar with search, category, status, branch, and sort.
- Data table columns: image, product, SKU, category, variants, stock, status, base price, actions.
- Create/edit should use drawer or route-level editor with sections: basics, media, variants, related products, branch assignment.
- Delete requires confirm dialog.

### Admin Media Library

- Must be accessible through Admin sidebar.
- Grid of assets with upload, preview, copy URL, linked/unlinked badge, and delete action.
- Delete is blocked when an asset is linked to a product.
- Product editor should be able to reuse/select media where supported.

### Admin Orders

- Toolbar with status, date, user, and payment filters.
- Table columns: order id, customer/user, item count, status, payment, total, created date, actions.
- Detail drawer shows order items, shipping, payment, timeline/status history if available, and links to user/payment.
- Status update controls should only be included when backend supports mutation.

### Admin Users

- Toolbar with search, role, status, and created date filters.
- Table columns: account, email, role badge, active state, orders/cart links, created date, actions.
- Detail drawer links user to cart and orders instead of treating carts as detached records.

### Admin Store Settings

- Store name and public logo upload/change.
- Contact information.
- Branch management.
- Public header preview showing logo/name.

## UI Standards

- Use Tailwind v4 already present in the project.
- Prefer reusable primitives over route-specific inline styles.
- Consider shadcn-style composition for buttons, inputs, dialogs, tables, and drawers, but avoid adding a heavy dependency without a separate implementation decision.
- Product image frames use fixed aspect ratios, `object-contain`, neutral backgrounds, fallback image, and loading placeholder.
- Admin cards, panels, buttons, tables, and form controls should use restrained radius and dense spacing.
- Store pages may be more expressive, but product images and purchase controls remain primary.

## Performance UX Plan

- Cache stable category and store settings data.
- Use targeted revalidation for product lists/details instead of blanket `no-store` where safe.
- Add pagination to admin and catalog lists.
- Debounce search fields.
- Lazy-load product/media images below the fold.
- Prefetch high-frequency routes such as catalog, cart, checkout, and admin module links.
- Split admin/public layout concerns so admin-only client state does not affect public pages.
- Use skeletons for slow routes and honest error states for failed service calls.

## Risks / Trade-offs

- Backend APIs may not expose all required filter fields such as branch, popularity, payment status, or linked carts. Implementation should degrade gracefully and avoid fake UI data.
- Store Settings may not yet have a complete backend contract. UI should define the desired behavior but implementation may require a follow-up API change.
- Adding shadcn or a new table library could improve consistency but increases dependency and migration scope.
- Checkout redesign may cross order, cart, user, shipping, and payment boundaries; implementation should avoid breaking the existing create-order and payment flow.

## Open Questions

- Should the storefront visual direction move to a lighter retail theme, or keep a refined dark ecommerce theme?
- Should Admin adopt Ant Design table/form primitives already installed, or introduce shadcn-style primitives for long-term consistency?
- Which Store Settings fields are already persisted and which need backend/API work?
- Does the product API expose enough data for best sellers, popularity sort, branch availability, and variant stock?
- Should carts become a standalone admin page immediately, or only appear through user detail until a cart list API exists?
