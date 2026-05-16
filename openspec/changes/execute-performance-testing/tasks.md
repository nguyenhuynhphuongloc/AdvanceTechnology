## 1. Prepare performance environment

- [ ] 1.1 Start the stable Docker runtime
- [ ] 1.2 Confirm dataset size and external dependency availability
- [ ] 1.3 Define provisional local targets if no SLA is provided

## 2. Measure frontend performance

- [ ] 2.1 Run Lighthouse for home, catalog, product detail, cart, and checkout
- [ ] 2.2 Inspect image loading and network waterfall
- [ ] 2.3 Check large catalog rendering and layout shift

## 3. Measure API performance

- [ ] 3.1 Measure products list/detail response times
- [ ] 3.2 Measure cart/order/payment response times
- [ ] 3.3 Test cache behavior for product list/detail
- [ ] 3.4 Run bounded k6/JMeter load scenarios

## 4. Report results

- [ ] 4.1 Update performance test statuses and measurements
- [ ] 4.2 Summarize bottlenecks and missing SLA inputs
- [ ] 4.3 Create follow-up optimization proposals where needed
