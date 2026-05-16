## ADDED Requirements

### Requirement: Functional test execution is traceable
The QA process SHALL execute functional scenarios from the functional testing document and record status for each case.

#### Scenario: Tester executes a functional case
- **WHEN** a tester runs a documented functional test case
- **THEN** the tester records Passed, Failed, Blocked, or Not Started status with actual result notes

### Requirement: Critical user flows are tested first
The QA process SHALL prioritize storefront discovery, cart, checkout, and admin authentication before lower-risk UI flows.

#### Scenario: Functional testing begins
- **WHEN** the stable local runtime is available
- **THEN** smoke, product, cart, checkout, and admin login scenarios are executed before seller/profile/chat scenarios

### Requirement: Missing functionality is documented honestly
The QA process SHALL mark source-code-unsupported functions as Not found instead of assuming behavior.

#### Scenario: Forgot password is evaluated
- **WHEN** no route or API exists for forgot password
- **THEN** the test report records Not found in current project
