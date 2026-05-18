# Phase 6 API Usage

Generated: 2026-05-17T14:58:00Z

## API Clients Created

All clients are in `my-app/lib/marketplace/`.

Base URL: `process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000'`

Auth: JWT token read from `document.cookie` (cookie name: `token`). Format: `Authorization: Bearer <token>`.

---

## Product API (`product-api.ts`)

### `fetchProducts(params?)`
```
GET /api/v1/products?page=1&limit=24&category=&search=&sort=latest
```
Response: `{ items: ProductCard[], page: number, limit: number, total: number }`

### `fetchProductDetail(slug: string)`
```
GET /api/v1/products/:slug
```
Response: `ProductDetail` object

### `fetchRelatedProducts(slug: string)`
```
GET /api/v1/products/:slug/related
```
Response: `{ items: ProductCard[] }`

### `fetchCategories()`
```
GET /api/v1/categories
```
Response: `{ items: Category[], total: number }`

---

## Shop API (`shop-api.ts`)

### `fetchShops(params?)`
```
GET /api/v1/shops?page=1&limit=50&search=
```
Response: `Shop[]`

### `fetchShopDetail(slug: string)`
```
GET /api/v1/shops/:slug
```
Response: `Shop` object

### `fetchShopProducts(slug, params?)`
```
GET /api/v1/shops/:slug/products?page=1&limit=24&category=
```
Response: `{ shop: {id,name,slug}, items: ShopProductItem[], total, page, limit }`

---

## Cart API (`cart-api.ts`)

### `fetchMyCart()`
```
GET /api/v1/carts/me
Authorization: Bearer <token>
```
Response: `Cart`

### `addCartItem(payload)`
```
POST /api/v1/carts/me/items
Authorization: Bearer <token>
Body: { variantId, productId, quantity, shopId }
```
Response: `Cart`

### `updateCartItem(itemId, payload)`
```
PATCH /api/v1/carts/me/items/:itemId
Authorization: Bearer <token>
Body: { quantity }
```
Response: `Cart`

### `removeCartItem(itemId)`
```
DELETE /api/v1/carts/me/items/:itemId
Authorization: Bearer <token>
```
Response: `Cart`

---

## Order API (`order-api.ts`)

### `fetchMyOrders(params?)`
```
GET /api/v1/orders/me?page=1&limit=50
Authorization: Bearer <token>
```
Response: `{ items: OrderSummary[], total, page, limit }`

### `fetchOrderDetail(id)`
```
GET /api/v1/orders/:id
Authorization: Bearer <token>
```
Response: `Order` (full detail with shopOrders)

### `checkout(payload)`
```
POST /api/v1/orders/checkout
Authorization: Bearer <token>
Body: { shippingAddress: { fullName, phone, street, city, district }, paymentMethod: 'cod' }
```
Response: `{ orderId: string }`

### `cancelOrder(id, reason?)`
```
PATCH /api/v1/orders/:id/cancel
Authorization: Bearer <token>
Body: { reason: string }
```
Response: `Order`

---

## Type Definitions

All types exported from `my-app/lib/marketplace/index.ts`:

- `ProductCard` — minimal product for listing
- `ProductDetail` — full product with variants, images, related products
- `ProductVariant` — variant with sku, size, color, price
- `PaginatedProducts` — paginated product list response
- `Category` — category with id, name, slug, parentId
- `Shop` — shop with id, name, slug, description, logo, status, sellerId
- `ShopProductsResult` — shop with its products paginated
- `ShopProductItem` — minimal product for shop pages
- `Cart` — full cart with items
- `CartItem` — individual cart item
- `Order` — full order with shopOrders
- `OrderSummary` — minimal order for list view
- `ShopOrder` — shop order group within an order
- `OrderItem` — item within a shop order
- `ShippingAddress` — address fields
- `CheckoutPayload` — checkout request body
- `PaginatedOrders` — paginated order list response

---

## Error Handling

All API clients throw typed errors. UI pages handle errors with `MarketplaceErrorState` showing the error message.

No fake data is returned — if API fails, error state renders.

---

## Auth Notes

JWT token is stored in a cookie named `token`. The API gateway reads `Authorization: Bearer <token>` header.

For testing: use the buyer JWT from Phase 5E.1 seed (buyerId: `cccccccc-cccc-cccc-cccc-cccccccccccc`).

**Auth endpoints:**
- `POST /api/v1/auth/login` — returns `{ token, user }`
- Cookie name: `token` (set by auth service)
