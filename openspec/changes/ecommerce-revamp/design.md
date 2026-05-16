## Context

The current Ecommerce storefront experiences multiple UI/UX and functional bugs, such as product image distortion, disconnected variant color states, and poor responsive layout in the Cart page. Furthermore, there is no centralized Admin Dashboard, and the system does not yet support multi-branch operations, which are essential for the business. This design details the technical approach to resolve these front-end bugs and establish the architecture for the Admin Dashboard and branch management.

## Goals / Non-Goals

**Goals:**
- Fix the frontend display issues for product search, product images, color variants, and cart layout without introducing breaking changes to backend core schemas unless required.
- Establish the baseline layout and routing for an Admin Dashboard within the `my-app` Next.js frontend.
- Design the data schema for Branch and Inventory-by-Branch to prepare for multi-branch rollouts.

**Non-Goals:**
- Handling the order and payment checkout flow (Stripe API integration will be handled independently).
- Complete implementation of all Admin Dashboard features (focusing on layout and core CRUD).
- Migrating `product-service` from MongoDB to PostgreSQL.

## Decisions

1. **State Management for Product Variants**:
   - *Decision*: Introduce a unified Client Component wrapper (`ProductDetailView`) in the product detail page to lift the `selectedVariant` state up from `AddToCartPanel` so that the `ProductGallery` can react to color changes.
   - *Rationale*: React state lifting is the simplest and most performant way to sync the gallery with the selection panel without requiring global context or URL query parameters.

2. **Image Aspect Ratios**:
   - *Decision*: Standardize on `object-contain` combined with a neutral `bg-surface-muted` background for product images across the storefront to prevent cropping.
   - *Rationale*: Preserves the entire image without distortion, which is critical for product evaluation, regardless of the original uploaded aspect ratio.

3. **Admin Dashboard Architecture**:
   - *Decision*: Build the Admin Dashboard inside the existing Next.js `my-app` using Next.js App Router layout (`app/admin/layout.tsx`). It will route API calls through the existing API Gateway.
   - *Rationale*: Consolidates frontend deployment. The API Gateway already centralizes authentication and routing to the microservices.

4. **Branch Schema Design**:
   - *Decision*: Create a `Branch` entity and update `Inventory` to link `productId` with `branchId` (e.g., `InventoryByBranch`).
   - *Rationale*: Enables location-based stock holding and fulfillment. This will be managed by `inventory-service`.

## Risks / Trade-offs

- [Risk] Moving state up in `ProductDetail` could cause unnecessary re-renders of the entire page layout.
  - *Mitigation*: Carefully isolate the client component to wrap only the interactive elements (gallery and panel), keeping the rest of the page layout as Server Components.
- [Risk] Admin dashboard features might require complex permission models not yet supported by `authentication-service`.
  - *Mitigation*: Start with a basic `isAdmin` flag check or role-based access control (RBAC) simple implementation in the `user-service`/`authentication-service`.
