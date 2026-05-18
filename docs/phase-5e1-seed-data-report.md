# Phase 5E.1 Seed Data Report

Generated: 2026-05-17T14:49:50.365Z

## Fixed Seed IDs

| Name | ID |
|------|----|
| adminId | `99999999-9999-9999-9999-999999999999` |
| sellerId | `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` |
| buyerId | `cccccccc-cccc-cccc-cccc-cccccccccccc` |
| shopId | `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb` |
| categoryId | `11111111-2222-3333-4444-555555555555` |
| productId | `eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee` |
| variantId | `dddddddd-dddd-dddd-dddd-dddddddd0001` |
| imageId | `ffffffff-ffff-ffff-ffff-ffffffffffff` |

## Seed Results

| Service | Status | Detail |
|---------|--------|--------|
| Auth Service (auth_users) | ✅ SUCCESS | - |
| Store Service (shops) | ✅ SUCCESS | - |
| Product Service (MongoDB) | ✅ SUCCESS | - |
| Inventory Service (inventory_items) | ✅ SUCCESS | - |
| Cart Service (cart_state) | ✅ SUCCESS | - |
| Order Service (schema check) | ✅ SUCCESS | - |
| Payment Service (schema check) | ✅ SUCCESS | - |

## Known Blockers

_No blockers._

## ID Linkage Contract

```
auth_users.id  (buyer)  = orders.auth_user_id
               = cart_state.userId
               = shop_orders.seller_id  ← NO: shop_orders.seller_id = auth_users.id (SELLER)

auth_users.id  (seller) = shops.seller_id
                           = shop_orders.seller_id

shops.id                 = products.shopId
               = inventory_items.shop_id
               = shop_orders.shop_id
               = cart_items[].shopId

products.id              = product_variants.productId
               = inventory_items.product_id
               = cart_items[].productId
               = shop_order_items.product_id

product_variants.id       = inventory_items.variant_id
               = cart_items[].variantId
               = shop_order_items.variant_id
```

## Notes

- Password hashes are placeholders. Auth service uses JWT from API Gateway for test requests.
- MongoDB Atlas connection may fail with TLS alert — this is a known infrastructure issue.
- All PostgreSQL services use Neon Tech SSL connections.
- Cart is pre-seeded with 1 item for buyer to test checkout flow.