## Approach

Security testing must be safe, local/dev-only, and evidence-driven.

## Priority Order

1. Authentication and admin authorization.
2. Product mutation exposure.
3. Seller/admin header spoofing.
4. CORS and cookie/session handling.
5. Direct service bypass.
6. Input validation, XSS, SQL/NoSQL injection.
7. Upload security.
8. IDOR and payment tampering.
9. Security headers/rate limiting.

## Evidence

Record request, auth context, status code, response body summary, and risk assessment. Do not include secrets in reports.

## Safety Constraints

- Use local/dev only.
- Use bounded request volume.
- Do not exploit beyond proof of vulnerability.
- Do not modify production data.
