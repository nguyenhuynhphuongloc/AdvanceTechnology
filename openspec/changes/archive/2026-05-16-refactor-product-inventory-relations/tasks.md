## 1. Product Service: Rename Category to Collection

- [x] 1.1 Rename `category.entity.ts` to `collection.entity.ts` and update the class name to `Collection` with `@Entity({ name: 'collections' })`.
- [x] 1.2 Update all internal usages, imports, and variables across `product-service` that previously referred to Category when they meant Collection.

## 2. Product Service: Add New Category Entity

- [x] 2.1 Create a new `category.entity.ts` class with `@Entity({ name: 'categories' })` and appropriate fields (`_id`, `id`, `name`, `slug`, `parentId`).
- [x] 2.2 Register the new `Category` entity in `product.module.ts`.

## 3. Product Service: Refactor Product Entity

- [x] 3.1 Remove the `stock` property and its `@Column` decorator from `product.entity.ts`.
- [x] 3.2 Remove `categorySlug` from `product.entity.ts`.
- [x] 3.3 Add `categoryId` and `collectionId` fields to `product.entity.ts`.
- [x] 3.4 Update any DTOs, controllers, and services handling product creation/updating to remove `stock` input and include `categoryId`/`collectionId`.

## 4. Product Service: Update Event Emission

- [x] 4.1 Locate the code where `product-service` emits events to RabbitMQ after product/variant creation.
- [x] 4.2 Ensure the payload correctly passes an array of generated `variantId`s (UUIDs from `product_variants`).

## 5. Inventory Service: Database Sync (Branches)

- [x] 5.1 Update TypeORM configuration in `inventory-service/src/app.module.ts` to ensure entities are synchronized with the database (temporarily set `synchronize: true` or write a migration script).
- [x] 5.2 Verify that the `branches` table is created in PostgreSQL.
- [x] 5.3 Verify that the `branch_id` column is added to the `inventory_items` table.
- [x] 5.4 Ensure a default branch is seeded or created in the `branches` table to receive new inventory stock.

## 6. Inventory Service: Sync Variants

- [x] 6.1 Ensure `inventory-service` has an active RabbitMQ consumer listening to the product/variant creation event.
- [x] 6.2 Implement the handler to loop over the received `variantId`s.
- [x] 6.3 For each `variantId`, fetch the default `branchId` (or all active branches) and create a new `inventory_items` record with `stock = 0`, `reservedStock = 0`, and the assigned `branchId`.
