## Approach

Run visual and interaction testing across fixed viewport groups.

| Viewport | Purpose |
|---|---|
| 1440x900 | Primary desktop layout |
| 1366x768 | Common laptop layout |
| 768x1024 | Tablet layout |
| 390x844 | Modern mobile |
| 360x800 | Narrow mobile |

## Coverage Order

1. Public storefront and product discovery.
2. Product detail, cart, and checkout.
3. Admin login/dashboard/product manager.
4. Seller and account flows.
5. Accessibility and keyboard navigation.

## Evidence

Capture screenshots for failures, overlap, mobile overflow, inaccessible controls, missing loading/error states, and confusing navigation.

## Risks

- Admin product manager is large and likely to have responsive issues.
- Search/sidebar layouts may behave poorly on mobile.
- Route duplication may confuse navigation.
- Some states require API errors or slow network throttling.
