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
