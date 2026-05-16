## Approach

API testing should be gateway-first, then direct-service only for isolation.

```text
Postman/local runner
  -> API Gateway :3000
      -> auth/product/cart/order/inventory/payment/notification/user
  -> Direct service URLs only when debugging downstream behavior
```

## Execution Layers

1. Smoke endpoints and health/root checks.
2. Auth token acquisition and protected route checks.
3. CRUD/read endpoints by module.
4. Validation and boundary cases.
5. Unauthorized/forbidden cases.
6. Downstream unavailable/timeout cases.

## Data Strategy

Use one admin token, optional seller/customer tokens if available, one guest token, stable product IDs/slugs, cart item variants, and order/payment test payloads.

## Risks

- Gateway and downstream ports may drift.
- Some direct services expose routes without gateway guards.
- DTO validation is incomplete for cart/inventory/payment.
- Rate limiting is not found in current source.
