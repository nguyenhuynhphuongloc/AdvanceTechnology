# Project Technology Stack

## Repository Overview

This repository is a microservice-based e-commerce workspace with:

- A Next.js storefront in `my-app`
- A NestJS API gateway in `microservices/api-gateway`
- Eight NestJS backend microservices under `microservices/`
- Docker Compose orchestration for running the full stack locally
- Postman assets for manual API testing
- OpenSpec artifacts for proposal, design, task, and spec tracking

## Top-Level Structure

- `my-app`
  - Frontend storefront built with Next.js App Router
- `microservices`
  - `api-gateway`
  - `authentication-service`
  - `cart-service`
  - `inventory-service`
  - `notification-service`
  - `order-service`
  - `payment-service`
  - `product-service`
  - `user-service`
- `postman`
  - Shared Postman collections and environments
- `openspec`
  - Change proposals, design documents, tasks, and specs
- `docker-compose.yml`
  - Local multi-container development orchestration
- `README.md`
  - Main local setup and architecture notes

## Frontend Stack

The frontend application lives in `my-app`.

### Core Technologies

- `Next.js 16.1.6`
- `React 19.2.3`
- `React DOM 19.2.3`
- `TypeScript 5`

### UI And Styling

- `Ant Design 6.3.0`
- `@ant-design/icons 6.1.0`
- `Tailwind CSS 4.2.1`
- `PostCSS 8.5.6`
- `Autoprefixer 10.4.24`
- `next/font` for Google font loading

### Frontend Architecture Notes

- Uses the App Router under `my-app/app`
- Global layout is defined in `my-app/app/layout.tsx`
- Current landing page is `my-app/app/page.tsx`
- Admin routes live under `my-app/app/admin`
- Admin session and gateway helpers live under `my-app/lib/admin`
- Live product catalog pages are:
  - `my-app/app/products/page.tsx`
  - `my-app/app/products/[slug]/page.tsx`
- Search page exists at `my-app/app/search/page.tsx`
- The `/products` route is live API-backed through the gateway
- The `/search` route is still mock-data driven using:
  - `my-app/lib/search/mockProducts.ts`
  - `my-app/lib/search/utils.ts`

### Frontend Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Backend Stack

All backend services use a NestJS + TypeScript stack on Node.js.

### Shared Backend Technologies

- `Node.js`
- `NestJS 11`
- `TypeScript 5`
- `Express` via `@nestjs/platform-express`
- `@nestjs/config`
- `dotenv`
- `rxjs`
- `reflect-metadata`

### API Gateway

The API gateway lives in `microservices/api-gateway`.

Additional gateway technologies:

- `@nestjs/jwt`
- `@nestjs/passport`
- `passport-jwt`
- `http-proxy-middleware`
- `zod`

Responsibilities:

- Entry point for frontend API access
- JWT-protected routing
- Proxying requests to downstream services
- Environment-based service URL configuration
- Admin-only protection for `/api/v1/admin/products` and `/api/v1/admin/inventory`

### Product Service

The product catalog service lives in `microservices/product-service`.

Additional product-service technologies:

- `TypeORM 0.3.28`
- `@nestjs/typeorm`
- `pg`
- `sql.js`
- `class-validator`
- `class-transformer`
- `cloudinary`
- `streamifier`

Responsibilities:

- Product CRUD and catalog endpoints
- Slug-based product detail retrieval
- Related products data
- Cloudinary-backed image upload flow

### Other Backend Services

The following services exist as separate NestJS apps:

- `authentication-service`
- `user-service`
- `cart-service`
- `inventory-service`
- `notification-service`
- `order-service`
- `payment-service`

Each service has its own `package.json`, `Dockerfile`, `.dockerignore`, and local `.env` usage pattern.

### Authentication Service

The authentication service now includes:

- Persisted admin users via TypeORM
- Password hashing with `bcryptjs`
- JWT issuance with `@nestjs/jwt`
- Admin session endpoints:
  - `POST /api/v1/auth/admin/login`
  - `POST /api/v1/auth/admin/logout`
  - `GET /api/v1/auth/admin/me`

Required admin-related configuration:

- `JWT_SECRET`
- `JWT_EXPIRES_IN` (optional)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Database And Persistence

The current repository indicates a relational persistence approach centered on the product stack.

### Technologies Present

- `PostgreSQL` driver via `pg`
- `TypeORM`
- `sql.js`

### Current State

- `product-service` clearly includes database and ORM dependencies
- The broader architecture is organized for service-specific ownership
- The existing docs and code suggest per-service environment-based configuration

## Testing And Code Quality

### Frontend

- `ESLint 9`
- `eslint-config-next`

### Backend

- `Jest 30`
- `ts-jest`
- `Supertest`
- `@nestjs/testing`
- `Prettier`
- `typescript-eslint`
- `eslint-config-prettier`
- `eslint-plugin-prettier`

### Typical Backend Scripts

Each NestJS service follows the standard script set:

- `npm run build`
- `npm run start`
- `npm run start:dev`
- `npm run start:debug`
- `npm run start:prod`
- `npm run lint`
- `npm run test`
- `npm run test:watch`
- `npm run test:cov`
- `npm run test:debug`
- `npm run test:e2e`

### API Testing

- Shared Postman workspace under `postman/`
- Gateway-first API collection for manual validation

## Local Development And DevOps

### Containerization

The full stack is already Dockerized and orchestrated with `docker-compose.yml`.

### Docker Compose Services

- `api-gateway` on port `3000`
- `product-service` on port `3001`
- `user-service` on port `3002`
- `payment-service` on port `3003`
- `order-service` on port `3004`
- `notification-service` on port `3005`
- `inventory-service` on port `3006`
- `cart-service` on port `3007`
- `authentication-service` on port `3008`
- `my-app` on port `3009`

### Compose Characteristics

- Per-service `Dockerfile` and `.dockerignore`
- Bind-mounted source code for live reload
- Named Docker volumes for `node_modules`
- Dedicated volume for Next.js `.next` output
- Internal service-to-service communication by Compose service name
- Frontend configured to call the gateway through:
  - `API_GATEWAY_URL`
  - `NEXT_PUBLIC_API_BASE_URL`

### Frontend Container Runtime Flags

- `CHOKIDAR_USEPOLLING`
- `WATCHPACK_POLLING`
- `NEXT_TELEMETRY_DISABLED`

## Routing And Application Flow

### Storefront Routes

- `/`
  - Main landing page
- `/products`
  - Live gateway-backed product listing
- `/products/[slug]`
  - Live product detail page
- `/search`
  - Older mock-based search experience

### Admin Routes

- `/admin/login`
  - Admin login page backed by the gateway and authentication-service
- `/admin/products`
  - Admin product list/detail/create/edit/delete screen
- `/admin/inventory`
  - Admin inventory lookup and stock update screen

### Product Catalog Flow

The implemented live product flow is:

1. Frontend storefront requests product data from the API gateway
2. Gateway exposes `GET/POST /api/v1/products`
3. Gateway forwards catalog traffic to `product-service`
4. Product detail pages fetch by slug
5. Related products are also loaded from the live API

The admin management flow is:

1. Admin logs in through the gateway auth route
2. `authentication-service` issues a JWT with `id`, `email`, and `role`
3. `my-app` stores the token in the `admin_session` cookie
4. Next.js route protection redirects unauthenticated `/admin/*` requests
5. The admin UI sends the JWT to gateway-backed admin product and inventory APIs
6. The gateway enforces both authentication and admin role claims before proxying downstream

## Documentation And Process Tooling

### OpenSpec

The repository contains OpenSpec artifacts under `openspec/` for:

- Change proposals
- Design documents
- Task tracking
- Specs

### Postman

The repository contains Postman assets under `postman/` for:

- Shared collection(s)
- Local and shared environment files
- Gateway-first testing workflow

## Important Implementation Notes

These points are important if someone is using this file as a project status reference.

- The product catalog is partially modernized and live-backed
- The search experience is not fully integrated with the live catalog API yet
- Some UI components are shared between the older search flow and the newer product catalog flow
- Docker Compose is already in place, so containerization is not a future recommendation anymore
- Cloudinary integration is already present in `product-service`

## Current Technology Summary

In practical terms, this repo currently uses:

- `Next.js` + `React` + `TypeScript` for the storefront
- `NestJS` + `TypeScript` for the gateway and microservices
- `TypeORM` + `pg` + `sql.js` in the product domain
- `JWT` and `Passport` in the gateway
- `Cloudinary` for product media handling
- `Redis` for product caching, cart state, and inventory reservation holds
- `RabbitMQ` for asynchronous order, inventory, payment, and notification workflows
- `Docker Compose` for full local stack orchestration
- `Jest`, `Supertest`, `ESLint`, and `Prettier` for testing and code quality
- `Postman` for manual API verification
- `OpenSpec` for design and change-management artifacts

## RabbitMQ And Redis Decision Matrix

- `api-gateway`: neither
- `authentication-service`: neither
- `user-service`: neither
- `product-service`: Redis only
- `cart-service`: Redis only
- `inventory-service`: Redis and RabbitMQ
- `order-service`: RabbitMQ only
- `payment-service`: RabbitMQ only
- `notification-service`: RabbitMQ only

## Async Workflow And Cache Keys

RabbitMQ routing keys:

- `order.created`
- `inventory.reserved`
- `inventory.reservation_failed`
- `payment.succeeded`
- `payment.failed`
- `order.cancelled`

Redis keys:

- `catalog:v{version}:list:{hash(query)}`
- `catalog:detail:{slug}`
- `cart:user:{userId}`
- `cart:guest:{guestToken}`
- `inventory:hold:{orderId}:{variantId}`
