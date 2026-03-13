## 1. Project Initialization

- [ ] 1.1 Scaffold API Gateway skeleton using NestJS inside `d:\School_Proj\AdvanceTechnology\microservices\api-gateway`
- [ ] 1.2 Add necessary proxy and auth dependencies (`http-proxy-middleware`, `@nestjs/jwt`, etc.)
- [ ] 1.3 Configure environment variables for downstream service URLs

## 2. API Gateway Routing

- [ ] 2.1 Implement routing for Auth and User services
- [ ] 2.2 Implement routing for Product and Inventory services
- [ ] 2.3 Implement routing for Cart, Order, Payment, and Notification services
- [ ] 2.4 Add generic error handling for unavailable downstream services (502 / 504)

## 3. Gateway Authentication

- [ ] 3.1 Implement JWT Validation Middleware/Guard in the API Gateway
- [ ] 3.2 Configure protected routes vs public routes (e.g., public products vs user cart)
- [ ] 3.3 Extract user ID from valid tokens and inject into `X-User-Id` header before proxying

## 4. Testing & Verification

- [ ] 4.1 Write integration tests or manual test scripts for routing public endpoints
- [ ] 4.2 Write integration tests or manual test scripts for routing protected endpoints (valid/invalid tokens)
- [ ] 4.3 Verify gateway error responses when a downstream service is intentionally stopped
