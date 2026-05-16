## 1. Prepare API test assets

- [ ] 1.1 Start the stable Docker runtime
- [ ] 1.2 Import Postman collection and local environment
- [ ] 1.3 Confirm gateway/service base URLs and admin credentials

## 2. Execute gateway-first API tests

- [ ] 2.1 Run auth/admin login/logout/me tests
- [ ] 2.2 Run products/upload/admin-products tests
- [ ] 2.3 Run cart/order/payment/inventory/notification tests
- [ ] 2.4 Run admin users/admin orders tests

## 3. Execute negative and boundary tests

- [ ] 3.1 Run missing auth, wrong role, expired/tampered token cases
- [ ] 3.2 Run missing required fields, invalid data types, invalid enums, and boundary values
- [ ] 3.3 Run downstream unavailable and timeout cases

## 4. Report and sync

- [ ] 4.1 Update API test case statuses and actual results
- [ ] 4.2 Update Postman collection/environment if route drift is found
- [ ] 4.3 Summarize API defects and follow-up changes
