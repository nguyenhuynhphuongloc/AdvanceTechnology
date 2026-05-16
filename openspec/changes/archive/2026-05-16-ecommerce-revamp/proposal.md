## Why

The current Ecommerce system has several critical UI/UX and functionality issues in the store frontend, including broken product search displays, distorted product images, disconnected color variant selection, and a cart page with poor layout. Additionally, the system lacks a centralized Admin Dashboard and needs to support a multi-branch architecture. This revamp addresses these issues to ensure proper data flow from microservices to the frontend, improve user experience, and establish a solid foundation for store management and branch inventory.

## What Changes

- Fix the product listing and search API integration to display products correctly and handle empty states gracefully.
- Fix the `ProductCard` image aspect ratio to prevent distorted or cropped product images.
- Connect the variant color selection state in `AddToCartPanel` with the main product image gallery in the product detail page.
- Adjust the Cart page grid layout to be responsive and visually cohesive.
- Build a base Admin Dashboard layout with modules for Product, Inventory, User, and Order management.
- Introduce schema and API support for Branch (chi nhánh) and store settings.

## Capabilities

### New Capabilities
- `admin-dashboard`: Core layout and routing for the Admin Dashboard.
- `branch-management`: Data schema and API for multi-branch support and inventory management by branch.

### Modified Capabilities
- `storefront-catalog`: Updates to product listing, search integration, image display, and variant selection UI.
- `storefront-cart`: Updates to layout, quantity adjustments, and sync status handling.

## Impact

- **Frontend (`my-app`)**: Re-architecture of `ProductDetail` components to share state, CSS updates in Cart and ProductCard, new pages and routing in `app/admin/...`.
- **Backend Services**: 
  - `inventory-service` / new `store-service`: New schema and endpoints for branch management.
- **API Gateway**: New routes mapping for admin modules and branch management.
