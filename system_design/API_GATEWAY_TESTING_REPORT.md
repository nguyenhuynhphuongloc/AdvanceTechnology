# API Gateway Connectivity Testing Report

## What I Did

I validated the API Gateway connection behavior for the microservice architecture in `microservices/api-gateway`.

The previous e2e test was only a default NestJS placeholder and did not test gateway routing or microservice connectivity. I replaced it with real gateway-focused e2e tests.

The updated test file is:

- `microservices/api-gateway/test/app.e2e-spec.ts`

## What I Tested

I tested the gateway behavior that matters for microservice communication:

1. Public route proxying
   - Verified that `GET /api/v1/products/list?limit=2` is forwarded through the gateway to the downstream product service.

2. Protected route rejection without token
   - Verified that `GET /api/v1/users/profile` returns `401 Unauthorized` when no JWT is provided.

3. JWT-based header injection
   - Verified that when a valid JWT is sent to a protected route, the gateway injects:
     - `X-User-Id`
     - `X-User-Role`
   - Confirmed that the downstream mock user service receives those headers.

4. Downstream service failure handling
   - Verified that when the downstream target is unavailable, the gateway returns `502 Bad Gateway`.

## What I Used For Testing

The testing setup used the following tools and techniques:

- `Jest` for test execution
- `Supertest` for HTTP requests against the NestJS app
- `@nestjs/testing` to bootstrap the gateway application in test mode
- `JwtService` to generate a valid test JWT
- Native Node.js `http` mock servers to simulate downstream microservices
- `npm.cmd run test:e2e` to run tests in this Windows environment

## Can Postman Be Used For API Testing

Yes. Postman can be used for this project and is a practical choice for manual API testing.

Recommended usage:

1. Use Postman mainly against the API Gateway.
2. Use Postman directly against a single microservice only when debugging that service.
3. Store the JWT token in a Postman environment variable after login.
4. Test public routes, protected routes, invalid token cases, and downstream failure cases.

Examples of useful Postman requests:

- `GET /api/v1/products`
- `GET /api/v1/users/profile`
- `POST /api/v1/orders`
- `POST /api/v1/auth/login`

Postman is best for:

- manual verification
- debugging request and response payloads
- checking headers, query parameters, and authentication behavior
- demonstrating the API during review or presentation

Postman should be used together with automated tests, not instead of them:

- Postman for manual testing
- Jest and Supertest for repeatable automated testing

## Why `npm.cmd` Was Used

In this workspace environment:

- `pnpm` was not installed in the terminal
- PowerShell blocked `npm.ps1` because of execution policy

Using `npm.cmd` avoided the PowerShell script restriction and allowed the e2e tests to run successfully.

## Test Result

Executed command:

```powershell
npm.cmd run test:e2e
```

Result:

- `1` test suite passed
- `4` tests passed
- `0` tests failed

## Recommended Next Step

The current tests prove that the API Gateway routing logic works correctly against mock downstream services.

The next step should be to add an integration test stage for real running services:

1. Start `api-gateway`, `product-service`, `user-service`, and at least one more protected service.
2. Run HTTP checks through the gateway against the real services.
3. Verify real response payloads, real authentication behavior, and service availability across the full stack.

You can also prepare a shared Postman collection for the same routes so manual verification and demo testing follow the same request structure.

This will give you both layers of confidence:

- e2e confidence for gateway logic with mocks
- integration confidence for real service-to-service connectivity