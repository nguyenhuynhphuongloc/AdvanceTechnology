## 1. Contract and Ownership Alignment

- [x] 1.1 Audit every current admin page, API helper, gateway route, and downstream controller against the new admin route matrix
- [x] 1.2 Confirm service ownership boundaries for products, variants, inventory, branches, carts, payments, notifications, logs, users, and store settings
- [x] 1.3 Document any repo-specific migration constraints for introducing a dedicated store settings backend contract

## 2. Backend Admin API Foundations

- [ ] 2.1 Add or formalize protected admin payment endpoints in `payment-service`
- [ ] 2.2 Add or formalize protected admin cart oversight endpoints in `cart-service`
- [ ] 2.3 Add or formalize protected admin store settings endpoints in a new `store-service` or equivalent backend module
- [ ] 2.4 Add or formalize protected admin notification endpoints in `notification-service`
- [ ] 2.5 Add or formalize protected admin log endpoints in `logging-service`
- [ ] 2.6 Extend branch APIs so branch CRUD is available through protected admin-facing contracts

## 3. API Gateway and Authorization

- [ ] 3.1 Add gateway route mappings for `/api/v1/admin/payments`, `/api/v1/admin/carts`, `/api/v1/admin/branches`, `/api/v1/admin/store-settings`, `/api/v1/admin/notifications`, and `/api/v1/admin/logs`
- [ ] 3.2 Standardize admin guard coverage so every `/api/v1/admin/...` route requires admin authorization
- [ ] 3.3 Add gateway tests or equivalent verification for the expanded admin route matrix

## 4. Product, Variant, and Inventory Completion

- [ ] 4.1 Consolidate the admin product editing surface so one primary workflow owns product create, update, delete, and detail behavior
- [ ] 4.2 Complete admin product CRUD wiring through the real product-service admin endpoints
- [ ] 4.3 Complete variant management inside the product workflow for create, update, delete, and variant image linkage
- [ ] 4.4 Expose inventory and branch context in admin product and inventory screens without reintroducing product-level stock ownership
- [ ] 4.5 Complete branch management UI and inventory-by-branch administration in the admin dashboard

## 5. Admin Module Integration

- [ ] 5.1 Expand `my-app/lib/admin/api.ts` to wrap every supported admin domain through one authenticated API layer
- [ ] 5.2 Replace the Payments placeholder page with a real list/detail admin surface
- [ ] 5.3 Replace the Carts placeholder page with a real cart oversight surface linked to users or guest ownership
- [ ] 5.4 Upgrade Users, Orders, and Inventory pages from thin tables to fully connected admin management flows where supported
- [ ] 5.5 Replace Notifications and Logs placeholders with real operational monitoring views
- [ ] 5.6 Upgrade the Admin Dashboard overview cards, quick actions, and summary panels to use only backend-backed data

## 6. Store Identity and Storefront Synchronization

- [ ] 6.1 Implement persisted Store Settings UI for store name, logo, description, contact information, and address
- [ ] 6.2 Integrate logo upload or Cloudinary asset selection into the Store Settings workflow
- [ ] 6.3 Refactor storefront branding consumers to load backend store settings first and use frontend config only as fallback
- [ ] 6.4 Verify store header, footer, home branding, and related identity surfaces update from saved store settings

## 7. Mock and Hardcoded Data Removal

- [ ] 7.1 Remove remaining hardcoded admin placeholders where a real backend contract exists after this change
- [ ] 7.2 Remove remaining storefront hardcoded brand/logo/contact data from primary rendering paths
- [ ] 7.3 Replace any lingering mock or local-only management flows with backend-backed behavior or explicit unavailable states

## 8. Verification

- [ ] 8.1 Verify protected admin auth for products, categories, inventory, branches, orders, payments, carts, users, store settings, notifications, and logs
- [ ] 8.2 Verify product create/edit/delete, variant management, media management, and category linkage end-to-end
- [ ] 8.3 Verify inventory and branch workflows remain consistent with `variantId` and `branchId` ownership
- [ ] 8.4 Verify store name and logo changes propagate to storefront header, footer, and home without code edits
- [ ] 8.5 Run relevant backend tests, gateway tests, and `my-app` build verification for the completed admin integration
