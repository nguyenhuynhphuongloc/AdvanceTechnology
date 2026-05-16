## ADDED Requirements

### Requirement: SEO tests cover public indexable pages
The QA process SHALL execute SEO checks for public storefront, catalog, search, and product detail routes.

#### Scenario: Tester checks a public product page
- **WHEN** a product detail page is tested
- **THEN** title, description, heading, image alt text, canonical behavior, and structured data presence are recorded

### Requirement: Missing SEO artifacts are reported as findings
The QA process SHALL record missing robots, sitemap, canonical, Open Graph, and structured data artifacts as Not found when source/runtime evidence is absent.

#### Scenario: robots.txt is unavailable
- **WHEN** `/robots.txt` does not exist
- **THEN** the SEO report records Not found and recommends a follow-up implementation change

### Requirement: Duplicate route risks are evaluated
The QA process SHALL evaluate duplicate content risk for `/product` and `/products` route families.

#### Scenario: Duplicate routes render the same product
- **WHEN** old and new product routes expose equivalent content
- **THEN** the report records whether canonical, redirect, or noindex behavior exists
