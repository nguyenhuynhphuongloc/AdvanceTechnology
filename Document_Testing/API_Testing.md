# API Testing

## Mục tiêu kiểm thử
- Kiểm thử toàn bộ endpoint tìm thấy trong source code qua API Gateway và direct service khi cần debug.
- Bao phủ method, URL, query/body/header, success/error, validation, unauthorized/forbidden, boundary và timeout.

## Phạm vi kiểm thử
- Gateway base URL: `http://localhost:3000`.
- Direct service URLs: product `3001`, user `3002`, payment `3003`, order `3004`, notification `3005`, inventory `3006`, cart `3007`, auth `3008`.
- Postman artifacts có sẵn tại `postman/collections/api-gateway.postman_collection.json`.

## API endpoint tìm thấy
| Service | Method | Gateway URL | Direct URL | Auth/Header | Request body/query | Success expected | Error/validation expected | Priority | Status |
|---|---|---|---|---|---|---|---|---|---|
| Auth | POST | `/api/v1/auth/admin/login` | same on auth service | None | Body `{email,password}` | 200, `{accessToken,user}` | 400 invalid email/missing; 401 invalid credential | High | Not Started |
| Auth | POST | `/api/v1/auth/admin/logout` | same | `Authorization: Bearer <admin>` | None | 200 `{success:true}` | 401 missing/expired token | High | Not Started |
| Auth | GET | `/api/v1/auth/admin/me` | same | Bearer admin | None | 200 user id/email/role | 401 missing/invalid token | High | Not Started |
| Admin users | GET | `/api/v1/admin/users` | auth `/api/v1/admin/users` | Bearer admin | None | 200 `{items,total}` | 401 no token; 403 non-admin | High | Not Started |
| Admin users | GET | `/api/v1/admin/users/:id` | auth same | Bearer admin | Path `id` | 200 user detail | 404 unknown; 401/403 | High | Not Started |
| Products | GET | `/api/v1/products` | product same | None | Query `page,limit,category,search,sort,sellerName` | 200 paginated list | 400 `page<=0`, `limit>50`, invalid sort | High | Not Started |
| Products | GET | `/api/v1/products/:slug` | product same | None | Path slug | 200 product detail | 404 unknown slug | High | Not Started |
| Products | GET | `/api/v1/products/:slug/related` | product same | None | Path slug | 200 related items | 404/empty items depending service | Medium | Not Started |
| Products | POST | `/api/v1/products` | product same | Gateway none; direct none | `CreateProductDto` | 201 product detail | 400 missing required/invalid URL/duplicate slug/sku | High | Not Started |
| Products | PATCH | `/api/v1/products/:id` | product same | Gateway none; direct none | `UpdateProductDto` | 200 updated product | 400 partial body if required fields missing; 404 | Medium | Not Started |
| Products | DELETE | `/api/v1/products/:id` | product same | Gateway none; direct none | None | 200 success | 404 unknown id | Medium | Not Started |
| Upload | POST | `/api/v1/products/upload-image` | product same | None/Admin UI uses admin request | multipart `file` | 201 `{imageUrl,publicId}` | 400 missing, non image, >5MB | High | Not Started |
| Admin products | GET | `/api/v1/admin/products` | product same | Bearer admin via gateway | Query `page,limit,search,category,status` | 200 paginated admin list | 401 no token; 403 non-admin; 400 invalid limit/status | High | Not Started |
| Admin products | POST | `/api/v1/admin/products` | product same | Bearer admin via gateway | `CreateProductDto` | 201 product | 401/403; 400 invalid body | High | Not Started |
| Admin products | GET | `/api/v1/admin/products/:id` | product same | Bearer admin | Path id | 200 product detail | 401/403/404 | High | Not Started |
| Admin products | PATCH | `/api/v1/admin/products/:id` | product same | Bearer admin | `UpdateProductDto` | 200 updated | 401/403/400/404 | High | Not Started |
| Admin products | DELETE | `/api/v1/admin/products/:id` | product same | Bearer admin | None | 200 success | 401/403/404 | High | Not Started |
| Cart | GET | `/api/v1/carts/me` | cart same | Optional JWT or `x-guest-token` | Headers owner | 200 cart state | 400/500 if no owner depending service | High | Not Started |
| Cart | POST | `/api/v1/carts/me/items` | cart same | Optional JWT or guest | Body `{variantId,quantity,unitPrice}` | 201/200 cart updated | Invalid quantity/type should fail; currently DTO lacks validators | High | Not Started |
| Cart | DELETE | `/api/v1/carts/me/items/:variantId` | cart same | Optional JWT or guest | Path variantId | 200 cart updated | Unknown variant safe no-op or 404 cần xác minh | Medium | Not Started |
| Cart | DELETE | `/api/v1/carts/me` | cart same | Optional JWT or guest | None | 200 empty cart | Missing owner | Medium | Not Started |
| Cart | POST | `/api/v1/carts/merge` | cart same | `x-user-id` or JWT | Body `{guestToken}` | 200 merged cart | Missing guestToken/user | High | Not Started |
| Orders | POST | `/api/v1/orders` | order same | Optional JWT | Body `{paymentMethod,totalAmount,recipientEmail,isGuest,items}` | 201 order | 400 missing fields, negative amount, empty items | High | Not Started |
| Orders | GET | `/api/v1/orders/user/my-orders` | order same | JWT or `x-user-id` | Header user | 200 list | Missing user should reject or empty; verify | High | Not Started |
| Orders | GET | `/api/v1/orders/:id` | order same | Optional JWT | Path order id | 200 detail | 404 unknown | Medium | Not Started |
| Orders | POST | `/api/v1/orders/:id/approve` | order same | Gateway optional; UI seller/admin | None | 200 approved | Unauthorized role gap needs test | High | Not Started |
| Orders | POST | `/api/v1/orders/:id/deliver` | order same | Gateway optional; UI seller/admin | None | 200 delivered | Invalid transition/unknown id | Medium | Not Started |
| Admin orders | GET | `/api/v1/admin/orders` | order same | Bearer admin or seller | None | 200 list | 403 customer/guest | High | Not Started |
| Admin orders | GET | `/api/v1/admin/orders/:id` | order same | Bearer admin or seller | Path id | 200 detail | 403/404 | High | Not Started |
| Legacy orders | POST | direct `/orders` | order direct only | `x-user-id`, optional `idempotency-key` | Body `{note?}` | 201 order | 400 invalid user id/note >500 | Low | Not Started |
| Legacy orders | GET | direct `/orders` | order direct only | `x-user-id` | None | 200 own orders | 400 invalid user id | Low | Not Started |
| Legacy orders | GET | direct `/orders/:orderId` | order direct only | `x-user-id` | Path positive int | 200 detail | 400 invalid id; 404 unknown | Low | Not Started |
| Legacy orders | PATCH | direct `/orders/:orderId/cancel` | order direct only | `x-user-id` | Path positive int | 200 cancelled | 400 invalid id; invalid state | Low | Not Started |
| Inventory | POST | `/api/v1/inventory/items` | inventory same | Bearer via gateway | Body `{productId?,variantId,sku?,stock}` | 201/200 upserted item | 401 no token; invalid stock/type should be tested | High | Not Started |
| Inventory | GET | `/api/v1/inventory/items/:variantId` | inventory same | Bearer via gateway | Path variantId | 200 item | 401; 404 unknown | High | Not Started |
| Admin inventory | GET | `/api/v1/admin/inventory` | inventory same | Bearer admin | Query `productId,variantId,sku` | 200 search result | 401/403 | High | Not Started |
| Admin inventory | PATCH | `/api/v1/admin/inventory/:id` | inventory same | Bearer admin | Body `{stock}` | 200 updated | 400 negative/non-number; 401/403/404 | High | Not Started |
| Payments | GET | `/api/v1/payments/transactions` | payment same | Optional JWT | None | 200 transactions | Unauthorized behavior cần xác minh | Medium | Not Started |
| Payments | GET | `/api/v1/payments/order/:orderId` | payment same | Optional JWT | Path orderId | 200 payment detail | 404 unknown | Medium | Not Started |
| Payments | POST | `/api/v1/payments/create-intent` | payment same | Optional JWT | `{orderId,amount,currency?}` | 201 clientSecret/transaction | 400 missing/amount<=0; Stripe env missing | High | Not Started |
| Notifications | GET | `/api/v1/notifications/logs` | notification same | Bearer token | None | 200 logs | 401 no token | Medium | Not Started |
| AI proxy | ALL | `/api/v1/ai/*` | AI service `3010` | None in gateway | Any | Proxy response | 502 if service absent | Low | Not Started |
| User proxy | ALL | `/api/v1/users/*` | user service | Bearer token | Any | Proxy response | 401 no token; downstream Not found possible | Medium | Not Started |

## Chi tiết request body mẫu
### CreateProductDto
```json
{
  "name": "QA Test Shirt",
  "slug": "qa-test-shirt",
  "sku": "QA-SHIRT-001",
  "description": "QA product description",
  "categorySlug": "shirts",
  "basePrice": 199000,
  "isActive": true,
  "mainImage": {
    "imageUrl": "https://example.com/image.jpg",
    "publicId": "qa/image",
    "altText": "QA image",
    "sortOrder": 0,
    "isMain": true
  },
  "galleryImages": [],
  "variants": [
    {"sku": "QA-SHIRT-001-M-BLK", "size": "M", "color": "Black", "stock": 10}
  ],
  "relatedProductSlugs": [],
  "sellerName": "QA Seller",
  "stock": 10
}
```

### CreateOrderDto
```json
{
  "paymentMethod": "card",
  "totalAmount": 199000,
  "recipientEmail": "qa@example.com",
  "isGuest": true,
  "items": [
    {"variantId": "variant-qa-001", "quantity": 1, "unitPrice": 199000}
  ]
}
```

## Validation, boundary và security cases bắt buộc
| ID | API group | Case | Expected result | Priority | Status |
|---|---|---|---|---|---|
| API-VAL-001 | Query pagination | `page=0`, `page=-1`, `limit=51`, `limit=abc` | 400 với message validation | High | Not Started |
| API-VAL-002 | Sort/status enum | `sort=bad`, `status=deleted` | 400 | Medium | Not Started |
| API-VAL-003 | Product required | Thiếu `name`, `slug`, `sku`, `description`, `categorySlug`, `mainImage`, `variants` | 400 | High | Not Started |
| API-VAL-004 | Duplicate unique | Tạo trùng slug/SKU/variant SKU/publicId | 409 hoặc 400 rõ ràng | High | Not Started |
| API-VAL-005 | Cart boundary | quantity `0`, `-1`, `999999`, unitPrice âm | Không cho dữ liệu sai hoặc trả 400 | High | Not Started |
| API-VAL-006 | Inventory boundary | stock `-1`, `0`, rất lớn, string | 400 với invalid type/range | High | Not Started |
| API-VAL-007 | Payment boundary | amount `0`, `-1`, missing orderId | 400 | High | Not Started |
| API-AUTH-001 | Admin protected | Gọi `/api/v1/admin/products` không token | 401 | High | Not Started |
| API-AUTH-002 | Forbidden role | Customer token gọi admin endpoint | 403 | High | Not Started |
| API-AUTH-003 | Expired token | Token hết hạn gọi protected endpoint | 401 | High | Not Started |
| API-AUTH-004 | Mock header bypass | Thử `x-user-role: admin` không JWT trên admin endpoint | Không được bypass admin guard | High | Not Started |
| API-ERR-001 | Downstream down | Tắt product-service gọi gateway products | 502 hoặc 504 JSON rõ ràng | High | Not Started |
| API-RATE-001 | Rate limit | Gửi nhiều request login/search liên tục | Not found: chưa thấy rate limit config | Medium | Not Started |

## Ghi chú rủi ro
- Gateway proxy có timeout 10 phút, cần performance/security xem xét vì request treo lâu.
- Gateway CORS `origin: true` cho credentials cần kiểm soát môi trường production.
- Một số endpoint direct service không có guard; kiểm thử ưu tiên qua gateway nhưng vẫn cần kiểm direct exposure nếu port public.
- `postman/VALIDATION.md` ghi nhận từng có config drift giữa gateway env và service port; cần xác minh lại khi chạy local.
