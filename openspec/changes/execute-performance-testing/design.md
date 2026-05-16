## Approach

Performance testing should combine browser metrics and API load metrics.

```text
Browser metrics
  -> Lighthouse
  -> DevTools Network/Performance

API metrics
  -> Postman smoke timings
  -> k6/JMeter load scenarios
  -> Docker stats for resource observation
```

## Priority

1. Core Web Vitals for `/`, `/products`, product detail, cart, checkout.
2. API p95 for products, cart, orders, payment intent.
3. Large catalog rendering.
4. Cache behavior for product list/detail.
5. Stress/load smoke for critical endpoints.

## Risks

- No official SLA exists yet.
- External Stripe/Cloudinary calls may skew local results.
- Full Docker stack may be resource-heavy on the test machine.
- Frontend build/test dependency issue may block bundle inspection until dependencies are repaired.
