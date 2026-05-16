### Requirement: Differentiate Categories and Collections
The product catalog SHALL support two distinct groupings: Categories (functional product types like Shirts, Pants) and Collections (marketing/seasonal groupings like Summer 2026).

#### Scenario: Product Assigned to Category and Collection
- **WHEN** a new product is created
- **THEN** it can be assigned to a `categoryId` and a `collectionId`
