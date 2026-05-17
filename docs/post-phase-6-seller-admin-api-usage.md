# Post Phase 6 Seller/Admin Fix — API Usage

## Seller Auth APIs Used

| API | Method | Endpoint | Used By |
|---|---|---|---|
| Register | POST | `/api/v1/auth/register` | `registerSeller()` in `auth-api.ts` |
| Login | POST | `/api/v1/auth/login` | `loginSeller()` in `auth-api.ts` |
| Session | GET | `/api/v1/auth/admin/me` | `getSellerSession()` in `auth-api.ts` |

### Register Payload (after fix)

```json
{
  "email": "seller@example.com",
  "password": "password123",
  "name": "Nguyen Van A",
  "role": "seller"
}
```

Note: `name` field is now trimmed before sending. `fullName` from form is mapped to `name` in API payload.

## Seller Shop APIs Used

| API | Method | Endpoint | Used By |
|---|---|---|---|
| Get my shop | GET | `/api/v1/seller/shop` | `fetchMyShop()` in `shop-api.ts` |
| Create shop | POST | `/api/v1/seller/shop` | `createMyShop()` in `shop-api.ts` |
| Update shop | PATCH | `/api/v1/seller/shop` | `updateMyShop()` in `shop-api.ts` |

## Admin APIs Used

| API | Method | Endpoint | Used By |
|---|---|---|---|
| Users | GET | `/api/v1/admin/users` | Admin Users page |
| Seller Profiles | GET | `/api/v1/admin/seller-profiles` | Admin Seller Profiles page |
| Shop Approvals | GET/PATCH | `/api/v1/admin/shops` | Admin Shop Approvals page |
| Product Approvals | GET/PATCH | `/api/v1/admin/products` | Admin Product Approvals page |
| Orders | GET | `/api/v1/admin/orders` | Admin Orders page |
| Shop Orders | GET | `/api/v1/admin/shop-orders` | Admin Shop Orders page |
| Payments | GET | `/api/v1/admin/payments` | Admin Payments page |
| Inventory | GET | `/api/v1/admin/inventory` | Admin Inventory page |
| Notifications | GET | `/api/v1/admin/notifications` | Admin Notifications page |
| Store Settings | GET/PATCH | `/api/v1/admin/store-settings` | Admin Platform Settings page |
| Categories | GET | `/api/v1/admin/categories` | Admin Categories page |

## Missing APIs (Placeholder pages)

| API | Status | Page |
|---|---|---|
| `GET /api/v1/admin/sellers` | ❌ No backend controller | `/admin/sellers` |
| `GET /api/v1/admin/refunds` | ❌ No backend controller | `/admin/refunds` |
| `GET /api/v1/admin/commissions` | ❌ No backend controller | `/admin/commissions` |
| Buyer Profile API | ❌ No endpoint | `/marketplace/profile` |
| Buyer Address API | ❌ No endpoint | `/marketplace/addresses` |
