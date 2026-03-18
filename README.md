# AdvanceTechnology

## Docker Compose

The full local stack can now be started with Docker:

```bash
docker compose up --build
```

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

Admin flow summary:

- Sign in through `POST /api/v1/auth/admin/login`
- The admin UI stores the JWT in the `admin_session` cookie
- Next.js route protection redirects unauthenticated `/admin/*` requests to `/admin/login`
- Product management uses `/api/v1/admin/products`
- Inventory management uses `/api/v1/admin/inventory`

## RabbitMQ And Redis

The local stack now includes:

- `RabbitMQ` on `amqp://localhost:5672` with the management UI at `http://localhost:15672`
- `Redis` on `redis://localhost:6379`

Service usage is intentionally selective:

- `product-service`: Redis read-through cache for product list/detail responses
- `cart-service`: Redis TTL-backed active cart snapshots
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

Verification:

- Product cache unit tests: `microservices/product-service`
- Cart and inventory e2e tests: `microservices/cart-service`, `microservices/inventory-service`
- Disabled-feature startup checks: run services with `NODE_ENV=test`, `REDIS_ENABLED=false`, `RABBITMQ_ENABLED=false`
- Live RabbitMQ flow script: `node scripts/verify-rabbitmq-workflow.mjs`
- Admin auth/product/inventory verification:
  - `microservices/authentication-service`: `npm run build` and `npm run test:e2e -- --runInBand`
  - `microservices/api-gateway`: `npm run test:e2e -- --runInBand`
  - `microservices/product-service`: `npm run build` and `npm run test:e2e -- --runInBand`
  - `microservices/inventory-service`: `npm run build` and `npm run test:e2e -- --runInBand`
  - `my-app`: `npm run build`
