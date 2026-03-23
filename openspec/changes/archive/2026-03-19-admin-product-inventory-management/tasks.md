## 1. Authentication And Gateway Foundation

- [x] 1.1 Implement an auth domain in `microservices/authentication-service` with persisted users/admins, password validation, and JWT configuration/env validation
- [x] 1.2 Add admin login, logout, and current-session endpoints that issue JWTs containing `id`, `email`, and `role`
- [x] 1.3 Update `microservices/api-gateway` so admin product and inventory routes require a valid admin JWT and continue forwarding authorized requests correctly
- [x] 1.4 Add automated tests for successful login, invalid login, logout/session clearing behavior, and protected gateway access with missing, invalid, and non-admin tokens

## 2. Product-Service Admin APIs

- [x] 2.1 Add admin-oriented product read endpoints or query modes needed for management list/detail views without breaking existing storefront APIs
- [x] 2.2 Implement product update support in `microservices/product-service`, including DTO validation and variant/media handling consistent with the current catalog model
- [x] 2.3 Implement product delete support in `microservices/product-service` and define the expected not-found and success responses
- [x] 2.4 Add service and e2e tests for product create, list/filter, detail, update, and delete flows through the existing product-service contracts

## 3. Inventory-Service Admin APIs

- [x] 3.1 Implement an inventory domain in `microservices/inventory-service` with entities, DTOs, and persistence for stock keyed by product, variant, and SKU
- [x] 3.2 Add inventory lookup endpoints for product-level and SKU or variant-level search plus derived inventory status fields
- [x] 3.3 Add an authenticated inventory quantity update endpoint for admin stock adjustments with not-found validation
- [x] 3.4 Add service and e2e tests for inventory lookup, status calculation, valid stock updates, and invalid variant/product update attempts

## 4. Admin UI Module

- [x] 4.1 Create the admin route/module in `my-app` with a login page, protected layout or middleware, and logout behavior tied to stored admin session state
- [x] 4.2 Implement shared admin API client utilities that attach the JWT to authenticated gateway requests and read API base URLs from environment variables
- [x] 4.3 Build product management screens for list, detail, create, edit, delete, and basic search or filter interactions
- [x] 4.4 Build inventory management screens for inventory lookup by product, SKU, and variant plus stock quantity updates and status display

## 5. Configuration, Ignore Rules, And End-To-End Verification

- [x] 5.1 Update `.gitignore` to exclude only the chosen admin module path and verify admin files are not staged accidentally
- [x] 5.2 Document any new auth, gateway, frontend, and inventory environment variables required for local execution
- [x] 5.3 Run the full project flows needed for this change and verify there are no obvious runtime errors in the admin login, product CRUD, and inventory update paths
- [x] 5.4 Run all relevant automated tests and manual integration checks for login/logout, JWT-protected requests, product CRUD, inventory updates, and gateway-backed admin UI communication before commit
