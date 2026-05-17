# Phase 6 Known Issues

Generated: 2026-05-17T14:58:00Z

## Critical

| # | Issue | Impact | Resolution |
|---|-------|--------|------------|
| 1 | **store-service returns 502 Bad Gateway** | `/marketplace/shops` and `/marketplace/shops/[slug]` show error state | Bring store-service online or fix store-service connectivity |
| 2 | **No buyer profile API** | `/marketplace/profile` is a shell with no real functionality | Create backend API endpoint for buyer profile |

## Medium

| # | Issue | Impact | Workaround |
|---|-------|--------|-----------|
| 3 | **No buyer address API** | `/marketplace/addresses` is a shell | Create backend API endpoints |
| 4 | **MongoDB SRV DNS blocked from Docker** | product-service uses direct shard hosts instead of SRV | Documented as resolved in Phase 5E.1, not a Phase 6 issue |

## Low

| # | Issue | Impact | Workaround |
|---|-------|--------|-----------|
| 5 | **`<img>` warnings in build** | Pre-existing across entire codebase | Consider migrating to `next/image` |
| 6 | **Runtime not fully verified** | Build passed, runtime test pending | Start all services and visit all 11 routes |
| 7 | **Unused `router` variable in shops pages** | ESLint warning (not error) | Fix by removing unused import |
| 8 | **Unused `OrderStatus` type alias** | ESLint warning (not error) | Fix by removing unused export |

## Out of Scope for Phase 6

These were intentionally not implemented per requirements:
- Seller Center redesign
- Admin Console redesign
- Review/rating system
- Push notifications
- Commission/refund/settlement pages
- Backend schema changes
- Fake data to simulate missing APIs
- Mobile app

## Services Required for Full Runtime Test

| Service | Port | For |
|---------|------|-----|
| product-service | 3001 | Products, categories |
| store-service | 3012 | Shops (currently DOWN) |
| cart-service | 3007 | Cart |
| order-service | 3004 | Orders, checkout |
| inventory-service | 3006 | Inventory validation |
| payment-service | 3003 | Payment processing |
| notification-service | 3005 | Notifications |
| authentication-service | 3008 | JWT auth |

## API Gateway Routes for Buyer Marketplace

All requests route through `http://localhost:3000` (api-gateway) which proxies to appropriate service.

The frontend does NOT call services directly — all requests go through the gateway.
