## Context

The architecture splits eCommerce functionalities across microservices. `product-service` (MongoDB) was recently migrated from PostgreSQL, causing misalignment with `inventory-service` (PostgreSQL - NeonDB). Currently, `product-service` maintains a duplicate `stock` field in its `products` collection. Furthermore, a database inspection of `inventory-service` revealed that the physical PostgreSQL database is missing the `branches` table and `branch_id` column inside `inventory_items`, despite the code defining these entities. This breaks the multi-branch inventory tracking and the connection between products and stock locations.

## Goals / Non-Goals

**Goals:**
- Decouple stock management entirely from `product-service`. Let `inventory-service` be the absolute source of truth.
- Properly model marketing groupings (`collections`) vs product types (`categories`).
- Ensure `variantId` (UUID) is the strict linkage between `product_variants` (MongoDB) and `inventory_items` (Postgres).
- Fix `inventory-service` database schema to include `branches` and `branch_id`.

**Non-Goals:**
- Consolidating the two databases back into one.
- Altering the event bus technology (RabbitMQ remains).
- Complex stock reservation algorithms beyond standard implementation.

## Decisions

**1. Remove `stock` from `products`**
*Rationale*: Caching stock in `product-service` creates dual sources of truth. The API Gateway should orchestrate fetching product details and then enriching them with `inventory-service` stock data based on `variantId`.

**2. Sync Branch Schema in Inventory Service**
*Rationale*: The `inventory-service` code contains `BranchEntity` and `branchId` references in `InventoryItemEntity`, but these are missing from PostgreSQL. We must enable `synchronize: true` in TypeORM temporarily (or write a migration) to generate the `branches` table and add `branch_id` to `inventory_items`. This correctly maps physical variants (`variantId`) to a location (`branchId`).

**3. Introduce `Collection` Entity and New `Category` Entity**
*Rationale*: To resolve the semantic misuse of the `Category` entity. We rename the existing `Category` class to `Collection`. We introduce a new `Category` entity for true categories. The `Product` entity will reference both via `categoryId` and `collectionId`.

**4. Event-Driven Inventory Initialization with Branches**
*Rationale*: When a product is created in `product-service`, it emits a `VariantsCreated` event containing Variant IDs. `inventory-service` consumes this and inserts empty `inventory_items` rows for those `variantId`s *for every active branch* (or a designated default branch).

## Risks / Trade-offs

- **Risk: Increased Latency on Listing Pages** -> *Mitigation*: The API Gateway will handle parallel requests to `inventory-service` to merge stock availability data efficiently.
- **Risk: Syncing Postgres Schema Drops Data** -> *Mitigation*: TypeORM `synchronize` is generally safe for adding columns/tables, but a backup should be taken, or manual SQL migration should be preferred over auto-sync for NeonDB to prevent accidental drops.
