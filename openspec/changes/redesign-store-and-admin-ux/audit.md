## Route and UI Audit

### Public storefront

- `/` renders `StorefrontHomePage` with live product fetch and shared header/footer. It has a hero and featured products, but merchandising is still generic and not settings-driven.
- `/search` renders the live catalog via `fetchCatalogPage`, `ProductCatalogHeader`, `CollectionsSidebar`, `SortSidebar`, `ProductGrid`, and `CatalogPagination`. Filters are limited to category and sort; price, color, size, branch, and availability are not wired.
- `/products` and `/products/[slug]` redirect to the current product routes, so redesign work should focus on `/search` and `/product/[slug]`.
- `/product/[slug]` renders server-fetched product detail and `ProductDetailGrid`. Variant image switching exists but the variant panel uses side effects in memo/state helpers and does not expose quantity or stock clearly.
- `/product/cart` is client-side, syncs cart items with the catalog, creates orders, and redirects to checkout. Layout already has a summary column but needs tighter desktop sizing and clearer CTA/error behavior.
- `/product/checkout` is currently a payment/status flow after order creation. It does not collect shipping data before order creation.
- `/product/account` and `/product/orders` exist as customer account surfaces and should remain public-store routes.

### Admin

- `/admin` is a server dashboard page using real product, order, and user calls. It lacks topbar, breadcrumb, chart/low-stock areas, and quick action structure.
- `/admin/layout` provides a sidebar, but it only exposes Dashboard, Products, Inventory, Orders, and Users. Media Library, Categories, Payments, Carts, Store Settings, Logs, and Notifications are missing.
- `/admin/products` is a simple server table with no toolbar filters, pagination controls, row actions, or editor surface.
- `/admin/media-library` exists and is admin-only through middleware, but it is not integrated into the sidebar and uses a separate visual shell.
- `/admin/orders` and `/admin/users` are simple server tables with no filters, detail drawer, pagination controls, or related-resource links.
- `/admin/inventory` is a simple server table and exposes an Add Branch button without a complete branch workflow.

## API/Data Availability

### Available through existing frontend helpers

- Products: admin list/detail/create/update/delete, media list/upload/delete, public list/detail/related.
- Inventory: admin list and quantity update.
- Orders: admin list, public order create/detail, user orders.
- Users: admin list/detail profile update through auth account records.
- Carts: public current cart operations and merge.
- Payments: create intent and transaction/order lookups exist in the payment service/gateway surface.
- Notifications: notification logs exist in service/gateway surface.
- Branches: inventory service exposes branch CRUD, but the current frontend admin API layer does not wrap it.

### Gaps to handle gracefully

- Store Settings: no confirmed frontend API helper or persistence contract for store logo, name, contact info, or public header preview.
- Categories: product categories appear as product fields, but no dedicated category management API is exposed in the current frontend admin API layer.
- Branch stock in public product detail/listing: inventory records have branch IDs, but public catalog DTOs do not expose branch availability.
- Popular/best-seller sorting: catalog supports latest, price, and name sorts, but no popularity metric is confirmed.
- Admin carts: cart service exposes current-user cart operations, but no admin list/detail-by-user endpoint is confirmed.
- Admin logs: logging service exists, but no gateway/admin frontend helper is confirmed.
- Payment admin module: payment endpoints exist, but no admin-specific payment table helper or protected admin module is wired.
- Notification admin module: notification logs exist, but no admin shell page/helper is wired.

## Implementation Implications

- Initial redesign should keep API data flow intact and show disabled/unavailable states for missing modules rather than fake tables.
- New UI helpers can wrap existing API helpers without changing backend service ownership.
- Storefront filters should only activate controls that map to current API query support; missing filter dimensions can be displayed as disabled until backed by API support.
- Admin shell can expose planned modules immediately if unavailable states make missing backend contracts explicit.
