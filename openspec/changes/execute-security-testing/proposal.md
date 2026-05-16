## Why

`Document_Testing/Security_Testing.md` highlights high-risk areas including public product mutation, CORS, header spoofing, direct service bypass, JWT/cookie handling, upload security, injection, XSS, IDOR, and missing rate limiting.

## What Changes

- Execute safe local/dev security tests from the document.
- Confirm actual risk level with evidence.
- Record vulnerabilities and propose follow-up fixes.

## Capabilities

### New Capabilities
- `security-qa-validation`: Defines safe security test execution and reporting expectations.

## Impact

- `Document_Testing/Security_Testing.md`
- `Document_Testing/Testing_Summary.md`
- Follow-up OpenSpec proposals for confirmed vulnerabilities

## Out of Scope

- Destructive testing.
- Production penetration testing.
- Fixing vulnerabilities in this change.
