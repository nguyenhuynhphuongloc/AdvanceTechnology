## 1. Storefront Fixes: Images and Layout

- [x] 1.1 Update `ProductCard` component to use `object-contain` and `bg-surface-muted` instead of `object-cover`.
- [x] 1.2 Update the main product image in `ProductDetailPage` to use `object-contain`.
- [x] 1.3 Refactor the Cart page (`app/product/cart/page.tsx`) to fix the grid layout for responsiveness (prevent the order summary from being pushed too far to the right).

## 2. Storefront Fixes: State and Flow

- [x] 2.1 Refactor `ProductDetailPage` and `AddToCartPanel` into a unified client component wrapper to lift up the `selectedVariant` state.
- [x] 2.2 Sync the `ProductGallery` with the lifted `selectedVariant` state to update the main product image on color change.
- [x] 2.3 Investigate and fix the empty state display bug in `fetchCatalogPage` if products are failing to load due to `isActive` status or API issues.

## 3. Admin Dashboard Base

- [x] 3.1 Create the Admin Dashboard layout wrapper (`app/admin/layout.tsx`) with a sidebar navigation.
- [x] 3.2 Create the Admin Product list page (`app/admin/products/page.tsx`).
- [x] 3.3 Create the Admin Users list page (`app/admin/users/page.tsx`).
- [x] 3.4 Create the Admin Orders list page (`app/admin/orders/page.tsx`).

## 4. Branch Management

- [x] 4.1 Define the `Branch` schema in `inventory-service` (or create `store-service`).
- [x] 4.2 Create API endpoints for CRUD operations on Branches.
- [x] 4.3 Update the `Inventory` schema to associate inventory quantities with `branchId`.
