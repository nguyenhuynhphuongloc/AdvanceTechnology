## 1. Prepare security test environment

- [ ] 1.1 Start the stable Docker runtime in local/dev
- [ ] 1.2 Prepare admin, non-admin, guest, and invalid token contexts
- [ ] 1.3 Confirm no production systems or real payment credentials are targeted

## 2. Execute high-risk security tests

- [ ] 2.1 Test admin JWT, expired/tampered token, fake cookie, and forbidden role cases
- [ ] 2.2 Test public product mutation and upload auth exposure
- [ ] 2.3 Test seller/admin `x-user-role` spoofing behavior
- [ ] 2.4 Test CORS and direct service bypass risks

## 3. Execute input and data exposure tests

- [ ] 3.1 Test XSS, SQL/NoSQL injection payload handling
- [ ] 3.2 Test cart/order/payment tampering and IDOR cases
- [ ] 3.3 Test upload file type/size validation
- [ ] 3.4 Check sensitive data exposure and error leakage

## 4. Report results

- [ ] 4.1 Update security test statuses and sanitized evidence
- [ ] 4.2 Rank confirmed vulnerabilities by severity
- [ ] 4.3 Create follow-up fix proposals for confirmed high-risk issues
