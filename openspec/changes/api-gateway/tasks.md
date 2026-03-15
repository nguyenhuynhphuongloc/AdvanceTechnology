## 1. Project Initialization

- [x] 1.1 Scaffold API Gateway skeleton using NestJS inside `d:\School_Proj\AdvanceTechnology\microservices\api-gateway`
- [x] 1.2 Add necessary proxy and auth dependencies (`http-proxy-middleware`, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`)
- [x] 1.3 Configure environment variables (ConfigModule) for downstream service URLs and JWT Secret; ensure app fails to start if critical configs are missing

## 2. API Gateway Routing & Proxying (`ProxyModule` & `RoutesModule`)

- [x] 2.1 Implement `ProxyService` using `http-proxy-middleware` for request forwarding
- [x] 2.2 Create `RoutesModule` and implement routing controllers for Auth and User services
- [x] 2.3 Implement routing controllers for Product and Inventory services
- [x] 2.4 Implement routing controllers for Cart, Order, Payment, and Notification services
- [x] 2.5 Add generic global error handling (Filters) for unavailable downstream services (502 Bad Gateway / 504 Gateway Timeout)

## 3. Gateway Authentication (`AuthModule`)

- [x] 3.1 Implement JWT Validation (`JwtStrategy`) and Guard (`JwtAuthGuard`) in the API Gateway
- [x] 3.2 Configure protected routes (using Guard) vs public routes (e.g., public products vs user cart)
- [x] 3.3 Configure `ProxyService` to extract user ID from valid tokens (`req.user`) and inject it into the `X-User-Id` header before proxying to downstream services

## 4. Testing & Verification

- [x] 4.1 **TC 1.x**: Verify Gateway boots successfully only when all configs (URIs, Secret) are present
- [x] 4.2 **TC 2.x**: Verify successful proxying of public endpoints (e.g., `GET /api/v1/products`) and handling of unknown routes (404)
- [x] 4.3 **TC 2.y**: Verify gateway error responses (502/504) when a downstream service is intentionally stopped
- [x] 4.4 **TC 3.x**: Verify protected endpoints reject requests missing tokens or containing invalid/expired tokens (401 Unauthorized)
- [x] 4.5 **TC 3.y**: Verify that the `X-User-Id` header is correctly injected into downstream requests for valid tokens
- [x] 4.6 **TC 4.x**: Verify complex path, query parameter, and JSON body/file stream forwarding work flawlessly through the proxy
