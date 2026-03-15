# Project Technology Stack

## Technologies Used In This Project

This project is a microservice-based e-commerce system with a separate frontend and API gateway.

### Core Backend Stack

- `Node.js` runtime
- `TypeScript` across frontend and backend
- `NestJS 11` for the API Gateway and backend microservices
- `Express` underneath NestJS HTTP services
- `@nestjs/config` for environment-based configuration
- `@nestjs/jwt`, `@nestjs/passport`, and `passport-jwt` for JWT authentication in the gateway
- `http-proxy-middleware` for gateway request forwarding

### Database And Persistence

- `PostgreSQL` as the main relational database
- `TypeORM 0.3` in backend services
- `pg` PostgreSQL driver
- The architecture document indicates separate databases per service, with Neon PostgreSQL used in the design direction

### Frontend Stack

- `Next.js 16`
- `React 19`
- `React DOM 19`
- `Ant Design 6`
- `@ant-design/icons`
- `Tailwind CSS 4`
- `PostCSS`
- TypeScript-based Next.js app structure in `my-app`

### Testing And Code Quality

- `Jest`
- `Supertest`
- `@nestjs/testing`
- `ts-jest`
- `ESLint`
- `Prettier`
- `Postman` for manual API testing and request validation

### Architecture And Process Tools

- Microservice architecture with a dedicated `api-gateway`
- `OpenSpec` files in `openspec/` for proposal, design, tasks, and change tracking
- Per-service NestJS project structure under `microservices/`

## Services Present In The Project

The workspace currently includes these backend services:

- `api-gateway`
- `authentication-service`
- `user-service`
- `product-service`
- `inventory-service`
- `cart-service`
- `order-service`
- `payment-service`
- `notification-service`

Frontend application:

- `my-app`

## Technology Direction For Future

The current stack is good for a modular e-commerce platform. For future growth, these additions would be practical.

### Recommended Next Technologies

1. Message broker
   - Add `RabbitMQ` or `Redis Streams` for asynchronous communication between services.
   - This is especially useful for `order-service`, `payment-service`, and `notification-service`.

2. API documentation
   - Add `Swagger / OpenAPI` using NestJS Swagger support.
   - This will make service contracts and gateway routes easier to validate and share.

3. Containerization
   - Add `Docker` and `docker-compose` for consistent local development.
   - This will simplify running all services together.

4. Centralized observability
   - Add structured logging and tracing with tools such as `Pino`, `Grafana`, `Prometheus`, and `OpenTelemetry`.
   - This becomes important once multiple services are running at the same time.

5. Service-to-service resilience
   - Add retry, timeout, and circuit-breaker patterns for internal communication.
   - This is especially useful when more real dependencies are introduced.

6. Real integration test pipeline
   - Keep the current Jest e2e tests for gateway logic.
   - Add live integration tests that run against actual started microservices.

7. CI/CD
   - Add GitHub Actions for lint, build, test, and deployment workflows.
   - This will help keep all services consistent as the project grows.

8. Shared API testing workspace
   - Maintain a Postman collection and environment for gateway routes.
   - This helps with demos, manual QA, and team collaboration.

## Practical Recommendation

If the next goal is stability, prioritize this order:

1. Dockerize all services
2. Add Swagger for each service and the gateway
3. Introduce a message broker for async workflows
4. Add integration testing against real running services

That sequence will make future development faster and reduce integration problems.