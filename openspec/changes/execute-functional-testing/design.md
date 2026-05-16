## Approach

Functional testing should run after the single stable Docker runtime is available. The execution order should follow business criticality.

```text
Smoke
  -> Product discovery
  -> Product detail + variants
  -> Cart
  -> Checkout/order/payment
  -> Admin auth + admin modules
  -> Seller/account/localStorage flows
  -> Error/empty/loading states
```

## Evidence

Each failed or blocked case should capture:
- Test case ID.
- Environment/runtime command.
- Input data.
- Actual result.
- Expected result.
- Screenshot or API response when useful.
- Defect/risk note.

## Data Strategy

Use stable seeded products, an admin account from env, guest cart tokens, and controlled order/payment test data. Mark cases blocked when external credentials are missing.

## Risks

- Some flows use localStorage rather than backend auth.
- Checkout depends on Stripe/test keys.
- Upload depends on Cloudinary env.
- Route duplication between `/product` and `/products` may create inconsistent behavior.
