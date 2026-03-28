# AdvanceTechnology

## Docker Compose

The local stack now supports explicit startup groups through Compose profiles.

Use the Windows-friendly wrapper from the repository root:

```bash
scripts\dev-stack.cmd <group>
```

If you need raw Compose commands, the wrapper runs:

```bash
docker compose --profile <group> up --build
```

Supported groups:

| Group | Starts |
| --- | --- |
| `core` | `api-gateway`, `authentication-service`, `my-app` |
| `product-flow` | `api-gateway`, `authentication-service`, `product-service`, `inventory-service`, `redis`, `my-app` |
| `cart-flow` | `api-gateway`, `authentication-service`, `product-service`, `inventory-service`, `cart-service`, `redis`, `my-app` |
| `checkout-flow` | `api-gateway`, `authentication-service`, `product-service`, `inventory-service`, `cart-service`, `user-service`, `order-service`, `payment-service`, `notification-service`, `redis`, `rabbitmq`, `my-app` |
| `full-stack` | all services plus `redis`, `rabbitmq`, and `my-app` |

Exact commands:

```bash
scripts\dev-stack.cmd core
scripts\dev-stack.cmd product-flow
scripts\dev-stack.cmd cart-flow
scripts\dev-stack.cmd checkout-flow
scripts\dev-stack.cmd full-stack
```

To pass custom Compose arguments, append them after the group. Example:

```bash
scripts\dev-stack.cmd product-flow logs -f
scripts\dev-stack.cmd checkout-flow up --build -d
```

`api-gateway` no longer has hard `depends_on` entries for every backend service, so smaller groups can start without automatically booting unrelated services.

Frontend runtime note:

- `my-app` is the only frontend runtime in local development and Docker Compose.
- Admin is served from the same Next.js app as the storefront at `http://localhost:3009/admin`.
- There is no separate admin frontend container or port `3010` runtime.

Container communication stays inside the Compose bridge network using service names such as `http://product-service:3001`, while host access keeps the existing backend ports:

- `api-gateway`: `http://localhost:3000`
- `product-service`: `http://localhost:3001`
- `user-service`: `http://localhost:3002`
- `payment-service`: `http://localhost:3003`
- `order-service`: `http://localhost:3004`
- `notification-service`: `http://localhost:3005`
- `inventory-service`: `http://localhost:3006`
- `cart-service`: `http://localhost:3007`
- `authentication-service`: `http://localhost:3008`
- `my-app`: `http://localhost:3009`

Implementation details:

- Each service has its own `Dockerfile` and `.dockerignore`.
- Compose loads each service's `.env` file and overrides the gateway downstream URLs to Docker service names.
- Source directories are bind-mounted and `node_modules` stay inside Docker volumes so `start:dev` and `next dev` can hot reload.

## Shared Storefront And Admin Runtime

Root cause summary:

- Admin already lives under `my-app/app/admin`, so it is part of the main Next.js app.
- The old `dev:admin` script incorrectly implied a second admin runtime on port `3010`.
- That script used Unix-style `PORT=3010 next dev`, which is not a reliable Windows workflow.

Current shared-runtime behavior:

- Storefront and admin run in the same Next.js process.
- Local frontend development uses `my-app` on port `3009`.
- Admin is reached at `http://localhost:3009/admin`.
- Docker Compose continues to use one shared `my-app` container on port `3009`.

Windows run commands:

```bash
cd my-app
npm run dev
```

For Docker Compose from the repository root:

```bash
scripts\dev-stack.cmd core
scripts\dev-stack.cmd product-flow
scripts\dev-stack.cmd cart-flow
scripts\dev-stack.cmd checkout-flow
scripts\dev-stack.cmd full-stack
```

Final local URLs:

- Storefront home: `http://localhost:3009/`
- Storefront product section: `http://localhost:3009/product`
- Storefront catalog: `http://localhost:3009/products`
- Admin: `http://localhost:3009/admin`

## Schema Safety

Runtime schema mutation is now disabled for every backend service in non-test startup.

Guaranteed settings:

- `synchronize: false`
- `dropSchema: false`
- `migrationsRun: false`

Services covered by the audit:

- `authentication-service`
- `user-service`
- `product-service`
- `inventory-service`
- `cart-service`
- `order-service`
- `payment-service`
- `notification-service`

Audit result:

- Non-test TypeORM synchronization was the only live schema mutation path found.
- No raw startup `CREATE TABLE`, `ALTER TABLE`, `queryRunner` DDL bootstrap, or migrations-on-boot path was found in the audited backend services.
- Test-only in-memory SQL.js setup still uses `synchronize: true` where those tests already relied on isolated ephemeral schema creation.

## Postman Workspace

Shared Postman artifacts now live under `postman/`. Use the collection in `postman/collections/api-gateway.postman_collection.json` with one of the environments in `postman/environments/local.postman_environment.json` or `postman/environments/shared.postman_environment.json`.

The intended workflow is gateway first:

1. Run the login request to populate `accessToken`.
2. Test public and protected requests through the API Gateway.
3. Use the `Service Debugging` folder only when you need to isolate a downstream service.

The usage guide and sync checklist are documented in `postman/README.md`.

## Product Catalog Flow

The product catalog now runs end-to-end through the gateway:

- Frontend listing: `my-app` `/products`
- Frontend detail: `my-app` `/products/[slug]`
- Gateway entrypoint: `GET/POST http://localhost:3000/api/v1/products`
- Product service origin: `http://localhost:3001/api/v1/products`

Cloudinary-backed uploads are handled by `product-service`, which requires:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

The storefront can target the gateway with `API_GATEWAY_URL` or `NEXT_PUBLIC_API_BASE_URL`.

## Admin Product And Inventory Management

The repository now includes an admin route tree under `my-app/app/admin`, and the repo root `.gitignore` excludes that path so the admin UI stays local-only.

Admin runtime requirements:

- `authentication-service`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN` (optional, defaults to `60m`)
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
- `api-gateway`
  - `JWT_SECRET` must match the auth service
  - `AUTH_SERVICE_URL`
  - `PRODUCT_SERVICE_URL`
  - `INVENTORY_SERVICE_URL`
- `my-app`
  - `NEXT_PUBLIC_API_BASE_URL` or `API_GATEWAY_URL`, for example `http://localhost:3000`

Admin runtime entrypoint:

- Run the shared frontend runtime once and access admin under `/admin`.
- Do not start a second frontend dev server for admin.

Admin flow summary:

- Sign in through `POST /api/v1/auth/admin/login`
- The admin UI stores the JWT in the `admin_session` cookie
- Next.js route protection redirects unauthenticated `/admin/*` requests to `/admin/login`
- The dashboard reads real product data from `/api/v1/admin/products`
- The dashboard reads real inventory data from `/api/v1/admin/inventory`
- Orders and users remain explicitly unavailable in the admin dashboard until backend support exists

Current backend gaps for unsupported admin sections:

- Missing admin orders endpoint: `GET /api/v1/admin/orders`
- Missing admin users endpoint: `GET /api/v1/admin/users`

## RabbitMQ And Redis

The local stack now includes:

- `RabbitMQ` on `amqp://localhost:5672` with the management UI at `http://localhost:15672`
- `Redis` on `redis://localhost:6379`

Service usage is intentionally selective:

- `product-service`: Redis read-through cache for product list/detail responses
- `cart-service`: Redis TTL-backed active cart snapshots with a non-Redis fallback when Redis is disabled
- `inventory-service`: Redis reservation holds plus RabbitMQ order-workflow consumers/publishers
- `order-service`: RabbitMQ publisher/consumer for order lifecycle state
- `payment-service`: RabbitMQ consumer/publisher for payment outcomes
- `notification-service`: RabbitMQ consumer for background notifications
- `api-gateway`, `authentication-service`, `user-service`: no RabbitMQ or Redis integration

Workflow routing keys:

- `order.created`
- `inventory.reserved`
- `inventory.reservation_failed`
- `payment.succeeded`
- `payment.failed`
- `order.cancelled`

Redis keys:

- `catalog:v{version}:list:{hash}`
- `catalog:detail:{slug}`
- `cart:user:{userId}`
- `cart:guest:{guestToken}`
- `inventory:hold:{orderId}:{variantId}`

## Feature-To-Service Map

| Feature | Data owner | Services that must be running | Redis | RabbitMQ |
| --- | --- | --- | --- | --- |
| Browse products | `product-service` | `api-gateway`, `authentication-service`, `product-service`, `my-app` | Recommended in current `product-flow` because `product-service` is configured to use it in Compose | No |
| View product detail | `product-service` | `api-gateway`, `authentication-service`, `product-service`, `my-app` | Recommended in current `product-flow` because `product-service` is configured to use it in Compose | No |
| Admin product CRUD | `product-service` | `api-gateway`, `authentication-service`, `product-service`, `inventory-service`, `my-app` | Recommended in current `product-flow` | No |
| Add to cart | `cart-service` | `api-gateway`, `authentication-service`, `product-service`, `inventory-service`, `cart-service`, `my-app` | Optional cache/state layer for `cart-service`; included in `cart-flow` | No |
| Checkout COD | `order-service` | `api-gateway`, `authentication-service`, `product-service`, `inventory-service`, `cart-service`, `user-service`, `order-service`, `notification-service`, `rabbitmq`, `redis`, `my-app` | Yes, for inventory holds and product/cart state | Yes, for order and notification workflow events |
| Checkout online payment | `order-service` and `payment-service` | `api-gateway`, `authentication-service`, `product-service`, `inventory-service`, `cart-service`, `user-service`, `order-service`, `payment-service`, `notification-service`, `rabbitmq`, `redis`, `my-app` | Yes | Yes |
| Notification sending | `notification-service` | `notification-service`, `rabbitmq` | No | Yes |

Feature group guidance:

- `product-flow` is the default group for storefront browsing and admin product/inventory work.
- `cart-flow` adds `cart-service` without starting checkout-only services.
- `checkout-flow` adds the order, payment, notification, and messaging dependencies needed for checkout workflows.
- `full-stack` keeps the all-services mode for broad end-to-end debugging.

Verification:

- Product cache unit tests: `microservices/product-service`
- Cart and inventory e2e tests: `microservices/cart-service`, `microservices/inventory-service`
- Disabled-feature startup checks: run services with `NODE_ENV=test`, `REDIS_ENABLED=false`, `RABBITMQ_ENABLED=false`
- Live RabbitMQ flow script: `node scripts/verify-rabbitmq-workflow.mjs`
- Startup group checks:
  - `docker compose --profile product-flow config --services`
  - `docker compose --profile cart-flow config --services`
  - `docker compose --profile checkout-flow config --services`
  - `docker compose --profile full-stack config --services`
- Admin auth/product/inventory verification:
  - `microservices/authentication-service`: `npm run build` and `npm run test:e2e -- --runInBand`
  - `microservices/api-gateway`: `npm run test:e2e -- --runInBand`
  - `microservices/product-service`: `npm run build` and `npm run test:e2e -- --runInBand`
  - `microservices/inventory-service`: `npm run build` and `npm run test:e2e -- --runInBand`
  - `my-app`: `npm run build`
