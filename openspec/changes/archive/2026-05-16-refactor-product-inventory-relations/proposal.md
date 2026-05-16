## Why

The current architecture has overlapping responsibilities between `product-service` and `inventory-service`. `product-service` (MongoDB) currently stores `stock` inside the `products` table, which conflicts with the true source of truth for stock managed by `inventory-service` (Postgres) at the variant level (`inventory_items`). Additionally, the current `categories` entity in `product-service` actually represents "Collections" (bộ sưu tập), lacking a true categorization system for product types. Furthermore, `inventory-service`'s database is missing the `branches` table and `branch_id` columns, breaking multi-warehouse tracking. This refactor cleanly separates responsibilities: `product-service` owns product metadata/catalog, while `inventory-service` manages physical stock quantities accurately across branches.

## What Changes

- **BREAKING**: Remove the `stock` field from the `Product` entity in `product-service`.
- Rename the existing `category.entity.ts` to `collection.entity.ts` (table: `collections`) to accurately reflect its use case (grouping products by season/event).
- Create a new `category.entity.ts` (table: `categories`) in `product-service` for true product classification (e.g., Shirts, Pants).
- Update the `Product` entity to replace `categorySlug` with `categoryId` and add `collectionId`.
- Fix `inventory-service` database synchronization: Ensure the `branches` table and `branch_id` column in `inventory_items` are properly created in PostgreSQL.
- Refine the linkage: `product-service` provides the `variantId` (UUID) as the sole identifier for a product's variant. `inventory-service` uses this `variantId` alongside `branchId` to track `stock` and `reservedStock`.
- Ensure RabbitMQ event payload for `ProductCreated`/`VariantsCreated` from `product-service` correctly includes variant UUIDs so `inventory-service` can initialize stock records (`inventory_items`) automatically across active branches.

## Capabilities

### New Capabilities
- `product-categorization`: Introduce true product categories (Shirts, Pants, etc.) distinct from marketing collections.
- `inventory-sync`: Establish correct variant-level stock management in `inventory-service` decoupled from `product-service`.
- `inventory-branch-management`: Enable multi-branch inventory tracking in `inventory-service` by synchronizing the missing `branches` table and `branch_id` references in the database.

### Modified Capabilities
- `product-catalog`: Product creation and retrieval will no longer include direct mutable stock counts within the product document.

## Impact

- **Affected Code**: `product-service` entities (`product`, `category`, new `collection`), `product-service` controllers/services handling creation and retrieval. `inventory-service` event consumers and database config.
- **Affected APIs**: Any frontend or gateway calls fetching product lists will need to fetch real-time stock from `inventory-service` or rely on an API Gateway aggregation. Product creation API payload will change to expect `categoryId` and `collectionId`.
- **Database**: MongoDB schema changes in `product-service`. PostgreSQL schema sync in `inventory-service` to add branches.
