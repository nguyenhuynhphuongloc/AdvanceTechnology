## ADDED Requirements

### Requirement: Performance results include browser and API metrics
The QA process SHALL record both frontend page metrics and backend API response metrics for critical flows.

#### Scenario: Tester measures product catalog performance
- **WHEN** `/products` is tested
- **THEN** the report includes browser load metrics and related product API response timing

### Requirement: Core Web Vitals are measured for public critical pages
The QA process SHALL measure LCP, CLS, and INP or a documented approximation for key public pages.

#### Scenario: Lighthouse test is run
- **WHEN** Lighthouse is executed on a critical page
- **THEN** LCP, CLS, INP/performance notes, and major opportunities are recorded

### Requirement: Load tests are scoped safely
The QA process SHALL run load/stress tests only against local/dev environments with bounded request rates.

#### Scenario: k6 or JMeter test is executed
- **WHEN** a load test runs
- **THEN** target environment, virtual users, duration, error rate, and p95 are recorded
