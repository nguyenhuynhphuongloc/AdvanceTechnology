# Route Map

Base URLs for local Docker runtime:

- Frontend: `http://localhost:3009`
- API Gateway: `http://localhost:3000`
- Product Service: `http://localhost:3001`
- User Service: `http://localhost:3002`
- Payment Service: `http://localhost:3003`
- Order Service: `http://localhost:3004`
- Notification Service: `http://localhost:3005`
- Inventory Service: `http://localhost:3006`
- Cart Service: `http://localhost:3007`
- Auth Service: `http://localhost:3008`
- Logging Service: `http://localhost:3011`

## Frontend Pages

- `/`
  Home page
- `/HomePage`
  Alternate home page route in the app tree
- `/search`
  Search experience backed by `GET /api/v1/products`
- `/products`
  Catalog listing page backed by the gateway
- `/products/[slug]`
  Product detail page backed by the gateway and product-service
- `/admin`
  Admin entry route, redirects into admin products when authenticated
- `/admin/login`
  Admin login page
- `/admin/products`
  Admin product management page
- `/admin/inventory`
  Admin inventory management page

## Gateway API Routes

- `/api/v1/auth/*`
  Authentication routes proxied to `authentication-service`
- `/api/v1/users/*`
  User routes proxied to `user-service`
- `/api/v1/products/*`
  Product routes proxied to `product-service`
- `/api/v1/admin/products/*`
  Admin product routes proxied to `product-service`
- `/api/v1/orders/*`
  Order routes proxied to `order-service`
- `/api/v1/carts/*`
  Cart routes proxied to `cart-service`
- `/api/v1/inventory/*`
  Inventory routes proxied to `inventory-service`
- `/api/v1/admin/inventory/*`
  Admin inventory routes proxied to `inventory-service`
- `/api/v1/admin/orders/*`
  Admin/seller order routes proxied to `order-service`
- `/api/v1/admin/users/*`
  Admin user routes proxied to `authentication-service`
- `/api/v1/payments/*`
  Payment routes proxied to `payment-service`
- `/api/v1/notifications/*`
  Notification routes proxied to `notification-service`
- `/api/v1/ai/*`
  AI routes proxied to the configured AI agent service URL when that service is available

## Product Media Routes

- `/api/v1/products/upload-image`
  Product image upload endpoint in `product-service`
- `/api/v1/products`
  Product list and product creation
- `/api/v1/products/:slug`
  Product detail
- `/api/v1/products/:slug/related`
  Related products
- `/api/v1/admin/products/:id`
  Admin product detail, update, and delete

## Storefront Query Params

- `/products?search=<term>&category=<slug>&sort=<option>&page=<n>`
  Canonical catalog discovery query shape
- `/search?search=<term>&category=<slug>&sort=<option>&page=<n>`
  Canonical live search query shape
- Legacy `q` and `collection` params are still read for backward compatibility, but new links now emit `search` and `category`

## Notes

- The canonical local QA runtime is one stable Docker stack started with `docker compose up -d --build` from the repository root.
- `my-app` is running in Docker dev mode with `webpack` to avoid Turbopack `ENOMEM` issues seen in this repo.
- `product-service` is running with `TYPEORM_SYNCHRONIZE=false` in Docker because the existing dev database had an older schema and required manual compatibility backfill.
- External flows may require test credentials for admin auth, Cloudinary upload, Stripe payment, and n8n chat webhook testing.
- Next.js still logs a warning that `middleware.ts` should be renamed to `proxy.ts` in the future.
