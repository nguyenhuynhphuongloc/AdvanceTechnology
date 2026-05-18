# Phase 5E Plan

## 1. Objective

Verify full marketplace runtime flow after Phase 5D migrations.

## 2. Required Test Data

Cần có:
- Admin account
- Seller account
- Buyer account
- Seller profile
- Shop (approved)
- Category
- Product (approved, has shopId/sellerId)
- Product variant
- Product image (optional)
- Inventory item with stock > 0
- Buyer cart item
- Checkout payload

## 3. Data Audit Summary (Before Seeding)

### Auth Service DB (Neon: `neondb` — `ep-noisy-glitter...`)
- **auth_users**: 5 rows — `admin@velin.com` (admin), `alice@example.com` (customer), `bob@example.com` (customer), `admin@example.com` (admin), `admin2@example.com` (admin)
- **auth_oauth_providers**: 2 rows (google/facebook for legacy accounts)
- **store_settings**: 1 orphan row — `Advance Technology` (in wrong DB)

### Order Service DB (Neon: `neondb` — `ep-cold-dream...`)
- **orders**: 5 rows — legacy orders from `ffffffff-ffff-ffff-ffff-fffffffffff1/fff2`, 3 recent orders from `admin@example.com` (`2599085c...`)
- **shop_orders**: **0 rows** (empty — needs seeding)
- **shop_order_items**: **0 rows** (empty — needs seeding via checkout)
- **order_items**: 3 rows (legacy, for `ffffffff-ffff-ffff-ffff-fffffffffff1/fff2`)
- **order_events**: 3 rows (legacy)

### Store Service DB (Neon: `neondb` — `ep-spring-union...`)
- **shops**: **0 rows** (empty — needs seeding)
- **store_settings**: 1 row — `Advance Technology`

### Product Service (MongoDB `localhost:27017`)
- All collections empty — products, variants, categories, images = **0 docs**
- **No seed data available — all must be created**

### Inventory Service DB (Neon: `neondb` — `ep-spring-scene...`)
- **inventory_items**: 14 rows — all have `shop_id=null`, `product_id=null`, `variant_id=null` (orphaned test data)
- **inventory_transactions**: 4 rows (restock/sale/reserve)

### Cart Service DB (Neon: `neondb` — `ep-old-base...`)
- **cart_state**: 9 rows — all are guest carts (guestToken set, userId=null)

### Payment Service DB (Neon: `neondb` — `ep-fancy-glade...`)
- **transactions**: 3 rows (legacy + recent test orders)
- **refunds**: 1 row

## 4. Seed Data Strategy

### Accounts (already exist — use these)
| Role | Email | ID | Notes |
|---|---|---|---|
| Admin | `admin@example.com` | `2599085c-9d0a-43cb-be51-7af04053dfa8` | Active, role=admin |
| Buyer | `alice@example.com` | `22222222-2222-2222-2222-222222222222` | Active, role=customer |
| Seller (new) | `seller_phase5e@test.local` | Will register | Need to create |

### Seeding Steps (in order)
1. **Register seller account** → `POST /api/v1/auth/register` with email, password, role=seller
2. **Create shop** → `POST /api/v1/seller/shop` as seller (creates shops table row)
3. **Admin approve shop** → `PATCH /api/v1/admin/shops/:id/approve`
4. **Create category** → `POST /api/v1/admin/categories`
5. **Create product + variant** → `POST /api/v1/seller/products` with categoryId, shopId, sellerId
6. **Admin approve product** → `PATCH /api/v1/admin/products/moderation/:id/approve`
7. **Create inventory item** → `POST /api/v1/seller/inventory` with shopId, productId, variantId, stock > 0
8. **Buyer login** → `POST /api/v1/auth/login` as `alice@example.com`
9. **Buyer add to cart** → `POST /api/v1/carts/me/items` with productId, variantId, quantity
10. **Buyer checkout** → `POST /api/v1/orders/checkout` with JWT + x-user-id header

### Fallback: Direct DB insert
If API endpoints fail (e.g., no JWT introspection available), use direct DB insert:
- Insert seller into `auth_users` (auth DB)
- Insert shop into `shops` (store-service DB) with status='approved'
- Insert product+variant into MongoDB `products`/`product_variants` collections
- Insert inventory item into `inventory_items` (inventory DB)

## 5. Services Involved

| Service | Purpose in Flow | DB Required | API Required |
|---|---|---|---|
| authentication-service | Login, register, JWT | auth_users (Neon) | POST /api/v1/auth/login, /register |
| user-service | User profiles (optional for test) | users (Neon) | - |
| store-service | Shop management | shops, store_settings (Neon) | /api/v1/seller/shop, /api/v1/admin/shops |
| product-service | Products, categories | products (MongoDB) | /api/v1/seller/products, /api/v1/admin/categories |
| inventory-service | Stock management | inventory_items (Neon) | /api/v1/seller/inventory |
| cart-service | Cart | cart_state (Neon) | /api/v1/carts/me/items |
| order-service | Order split | orders, shop_orders, shop_order_items (Neon) | /api/v1/orders/checkout |
| payment-service | Payment | transactions (Neon) | Called by order-service internally |
| api-gateway | Route all requests | - | All proxied |

## 6. Files Planned to Change

| Area | File | Change |
|---|---|---|
| Seed script | `scripts/phase-5e-seed-marketplace.js` | New — seed seller, shop, product, inventory |
| Seed script | `scripts/phase-5e-test-flow.js` | New — test full flow via API |
| Gateway fix | `microservices/api-gateway/src/modules/routes/v1/routes.controller.ts` | Add `/api/v1/seller/inventory` route if missing |
| Order fix | `microservices/order-service/src/orders/orders.service.ts` | If checkout fails to create shop_orders |
| Payment fix | `microservices/payment-service/src/payment/payment.service.ts` | If Stripe integration has config issues |

## 7. Out of Scope

Không làm:
- Buyer UI Phase 6
- Seller/Admin UI redesign
- Commission / Settlement
- Review / rating
- Notification automation
- Payment split
- Order cancellation / refund
- Store-service orphan data cleanup (auth DB store_settings)
- MongoDB categories/products migration from other source

## 8. Known Risks

1. **MongoDB is completely empty** — all products/categories/variants must be seeded from scratch. Product seed must create MongoDB docs with proper schema.
2. **No JWT introspection service** — test script will use JWT token directly with x-user-id header.
3. **Shop is empty** — checkout requires shop orders to be created, but without products there is no cart data.
4. **Inventory items are orphaned** — all inventory_items have null shop_id/product_id. Need to create new items with proper IDs.
5. **Stripe keys** — If Stripe keys are test keys (not real), checkout with stripe payment method may not create real charges. Use COD for test checkout.
