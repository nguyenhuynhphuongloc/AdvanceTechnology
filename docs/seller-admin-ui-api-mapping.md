# Seller & Admin UI → API Mapping

> Generated from codebase audit on 2025-05-18.  
> Source APIs: `/lib/seller/*.ts`, `/lib/admin/api.ts`  
> Route base: `http://localhost:3000` (via `NEXT_PUBLIC_API_BASE_URL`)

---

## Legend
- ✅ **available** — API field exists and is mapped
- ⚠️ **partial** — API exists but field/format needs transform
- ❌ **missing** — API or field does not exist yet
- 🔧 **bug** — field exists but currently mapped incorrectly

---

## SELLER UI

### Screen: Login (`/seller/login`)
| UI Field | API Endpoint | Method | Response Field | Status |
|---|---|---|---|---|
| Email input | `/api/v1/auth/login` | POST | — | ✅ |
| Password input | `/api/v1/auth/login` | POST | — | ✅ |
| Access token | `/api/v1/auth/login` | POST | `accessToken` | ✅ |
| User info | `/api/v1/auth/login` | POST | `user.id`, `user.email`, `user.role` | ✅ |
| Session validate | `/api/v1/auth/admin/me` | GET | `id`, `email`, `role` | ⚠️ Uses admin/me endpoint for seller session |

---

### Screen: Register (`/seller/register`)
| UI Field | API Endpoint | Method | Response Field | Status |
|---|---|---|---|---|
| Email, Password, Name | `/api/v1/auth/register` | POST | `accessToken`, `user` | ✅ |
| Role preset `seller` | `/api/v1/auth/register` | POST | `role: "seller"` | ✅ |

---

### Screen: Dashboard (`/seller/dashboard`)
| UI Field | API Endpoint | Method | Response Field | Status |
|---|---|---|---|---|
| Shop name & status | `/api/v1/seller/shop` | GET | `name`, `status`, `slug` | ✅ |
| Total products count | `/api/v1/seller/products?limit=1` | GET | `total` | ✅ |
| Total orders count | `/api/v1/seller/orders?limit=100` | GET | `total` | ✅ |
| Pending orders | `/api/v1/seller/orders?limit=100` | GET | filter `status = pending\|confirmed` | ✅ |
| Shipped/delivered | `/api/v1/seller/orders?limit=100` | GET | filter `status = shipped\|delivered` | ✅ |
| Total revenue (VND) | `/api/v1/seller/orders?limit=100` | GET | sum `items[].shopTotal` (non-cancelled) | ✅ |
| Low stock items | `/api/v1/seller/inventory?limit=20` | GET | filter `status = low-stock\|out-of-stock` | ✅ |
| Revenue trend chart | — | — | — | ❌ No analytics API |
| Monthly revenue breakdown | — | — | — | ❌ No analytics API |

---

### Screen: Shop Settings (`/seller/shop`)
| UI Field | API Endpoint | Method | Response Field | Status |
|---|---|---|---|---|
| Shop name | `/api/v1/seller/shop` | GET/PATCH | `name` | ✅ |
| Slug (URL) | `/api/v1/seller/shop` | GET/PATCH | `slug` | ✅ |
| Logo URL | `/api/v1/seller/shop` | GET/PATCH | `logoUrl` | ✅ |
| Banner URL | `/api/v1/seller/shop` | GET/PATCH | `bannerUrl` | ✅ |
| Description | `/api/v1/seller/shop` | GET/PATCH | `description` | ✅ |
| Contact email | `/api/v1/seller/shop` | GET/PATCH | `contactEmail` | ✅ |
| Contact phone | `/api/v1/seller/shop` | GET/PATCH | `contactPhone` | ✅ |
| Address | `/api/v1/seller/shop` | GET/PATCH | `address` | ✅ |
| Shop status | `/api/v1/seller/shop` | GET | `status` (pending/approved/rejected/suspended) | ✅ |
| Rejection reason | `/api/v1/seller/shop` | GET | `rejectionReason` | ✅ |
| Shop policy / terms | — | — | — | ❌ `policy` field not in API |
| Commission rate (display) | `/api/v1/seller/shop` | GET | `commissionRate` | ✅ |

---

### Screen: Products List (`/seller/products`)
| UI Field | API Endpoint | Method | Response Field | Status |
|---|---|---|---|---|
| Product list | `/api/v1/seller/products` | GET | `items[]` | ✅ |
| Pagination | `/api/v1/seller/products?page=&limit=` | GET | `page`, `limit`, `total` | ✅ |
| Search | `/api/v1/seller/products?search=` | GET | `search` query param | ✅ |
| Status filter | `/api/v1/seller/products?status=` | GET | `status` query param | ✅ |
| Product image | `items[].imageUrl` | — | `imageUrl` | ✅ |
| Product name | `items[].name` | — | `name` | ✅ |
| SKU | `items[].sku` | — | `sku` | ✅ |
| Base price (VND) | `items[].basePrice` | — | `basePrice` (number) | ✅ |
| Approval status badge | `items[].approvalStatus` | — | `approvalStatus` | ✅ |
| Active toggle | `items[].isActive` | — | `isActive` | ✅ |
| Category name | `items[].categoryId` | — | `categoryId` only — no name | ⚠️ Only ID, no name in list response |
| Stock count | — | — | — | ❌ Not in product list, requires inventory API |
| Edit action | `/api/v1/seller/products/:id` | PATCH | — | ✅ |
| Delete action | `/api/v1/seller/products/:id` | DELETE | — | ✅ |
| Submit for approval | `/api/v1/seller/products/:id/submit` | PATCH | — | ✅ |

---

### Screen: Product Create/Edit (`/seller/products/new`, `/seller/products/edit/[id]`)
| UI Field | API Endpoint | Method | Response Field | Status |
|---|---|---|---|---|
| Name, slug, sku, description | `/api/v1/seller/products` | POST/PATCH | `name`, `slug`, `sku`, `description` | ✅ |
| Category (select) | `/api/v1/seller/products` | POST/PATCH | `categoryId` | ⚠️ No category list endpoint in seller API |
| Base price | `/api/v1/seller/products` | POST/PATCH | `basePrice` | ✅ |
| Is active | `/api/v1/seller/products` | POST/PATCH | `isActive` | ✅ |
| Images | `/api/v1/seller/products` | POST/PATCH | `images[]` (imageUrl, publicId) | ✅ |
| Variants (size, color) | `/api/v1/seller/products` | POST/PATCH | `variants[]` (sku, size, color, priceOverride) | ✅ |
| Variant stock | — | — | — | ❌ Variant stock is in inventory API, not product API |
| Image upload | — | — | — | ❌ No seller image upload endpoint (admin only has `/api/v1/admin/products/upload-image`) |
| Category list for select | — | — | — | ❌ No `GET /api/v1/seller/categories` endpoint |

---

### Screen: Orders List (`/seller/orders`)
| UI Field | API Endpoint | Method | Response Field | Status |
|---|---|---|---|---|
| Orders list | `/api/v1/seller/orders` | GET | `items[]` | ✅ |
| Status tabs/filter | `/api/v1/seller/orders?status=` | GET | `status` param | ✅ |
| Order ID | `items[].id` | — | `id` | ✅ |
| Parent order ID | `items[].orderId` | — | `orderId` | ✅ |
| Order items (count) | `items[].items.length` | — | `items[]` | ✅ |
| Shop total (VND) | `items[].shopTotal` | — | `shopTotal` | ✅ |
| Order status badge | `items[].status` | — | `status` | ✅ |
| Tracking number | `items[].trackingNumber` | — | `trackingNumber` | ✅ |
| Created date | `items[].createdAt` | — | `createdAt` | ✅ |
| **Buyer name** | — | — | — | ❌ `ShopOrderResponse` has no `buyerName` |
| **Buyer email** | — | — | — | ❌ `ShopOrderResponse` has no `buyerEmail` |
| **Buyer address** | — | — | — | ❌ Not in shop order response |
| Confirm action | `/api/v1/seller/orders/:id/confirm` | PATCH | — | ✅ |
| Ship action | `/api/v1/seller/orders/:id/ship` | PATCH | `trackingNumber`, `shippingProvider` | ✅ |
| Deliver action | `/api/v1/seller/orders/:id/deliver` | PATCH | — | ✅ |
| Cancel action | `/api/v1/seller/orders/:id/cancel` | PATCH | `reason` | ✅ |

---

### Screen: Inventory (`/seller/inventory`)
| UI Field | API Endpoint | Method | Response Field | Status |
|---|---|---|---|---|
| Inventory list | `/api/v1/seller/inventory` | GET | `items[]` | ✅ |
| Search by SKU | `/api/v1/seller/inventory?search=` | GET | `search` param | ✅ |
| Low stock filter | `/api/v1/seller/inventory?lowStockOnly=true` | GET | `lowStockOnly` param | ✅ |
| SKU | `items[].sku` | — | `sku` | ✅ |
| Stock (total) | `items[].stock` | — | `stock` | ✅ |
| Reserved stock | `items[].reservedStock` | — | `reservedStock` | ✅ |
| Available stock | `items[].availableStock` | — | `availableStock` | ✅ |
| Low stock threshold | `items[].lowStockThreshold` | — | `lowStockThreshold` | ✅ |
| Status badge | `items[].status` | — | `status` (in-stock/low-stock/out-of-stock) | ✅ |
| Edit stock | `/api/v1/seller/inventory/:variantId` | PATCH | `stock`, `lowStockThreshold` | ✅ |
| **Product name** | — | — | — | ❌ Only `productId`, no name in inventory response |
| **Variant name** | — | — | — | ❌ Only `variantId`, no variant name |

---

## ADMIN UI

### Screen: Dashboard (`/admin`)
| UI Field | API Endpoint | Method | Response Field | Status |
|---|---|---|---|---|
| Total revenue | `/api/v1/admin/orders` | GET | sum `totalAmount` | 🔧 Currently formatted as USD — must be VND |
| Active orders | `/api/v1/admin/orders` | GET | filter non-terminal statuses | ✅ |
| Total products | `/api/v1/admin/products?limit=5` | GET | `total` | ✅ |
| Total users | `/api/v1/admin/users` | GET | `total` | ✅ |
| Payments count | `/api/v1/admin/payments` | GET | `total` | ✅ |
| Notifications count | `/api/v1/admin/notifications` | GET | `total` | ✅ |
| Recent orders table | `/api/v1/admin/orders` | GET | `items[]` | ✅ |
| Low stock items | `/api/v1/admin/inventory` | GET | filter `status = low-stock\|availableStock <= 5` | ✅ |
| Store settings | `/api/v1/admin/store-settings` | GET | `storeName`, `contactEmail`, `contactPhone` | ✅ |

---

### Screen: Users (`/admin/users`)
| UI Field | API Endpoint | Method | Response Field | Status |
|---|---|---|---|---|
| Users list | `/api/v1/admin/users` | GET | `items[]` | ✅ |
| Name, email, role | `items[].name`, `.email`, `.role` | — | — | ✅ |
| Is active | `items[].isActive` | — | — | ✅ |
| Created at | `items[].createdAt` | — | — | ✅ |
| User detail | `/api/v1/admin/users/:id` | GET | full user object | ✅ |
| Update status | `/api/v1/admin/users/:id/status` | PATCH | `isActive` | ✅ |
| Update role | `/api/v1/admin/users/:id/role` | PATCH | `role` | ✅ |
| **Order count per user** | — | — | — | ❌ Not in user response |
| **Total spend per user** | — | — | — | ❌ Not in user response |

---

### Screen: Shop Approvals (`/admin/shop-approvals`)
| UI Field | API Endpoint | Method | Response Field | Status |
|---|---|---|---|---|
| Shops list | `/api/v1/admin/shops` | GET | `items[]` | ✅ |
| Shop name, slug, status | `items[].shopName`, `.slug`, `.status` | — | — | ✅ |
| Seller ID | `items[].sellerId` | — | `sellerId` | ✅ |
| Logo | `items[].logoUrl` | — | `logoUrl` | ✅ |
| Approve | `/api/v1/admin/shops/:id/approve` | PATCH | — | ✅ |
| Reject + reason | `/api/v1/admin/shops/:id/reject` | PATCH | `rejectionReason` | ✅ |
| Suspend | `/api/v1/admin/shops/:id/suspend` | PATCH | — | ✅ |
| Restore | `/api/v1/admin/shops/:id/restore` | PATCH | — | ✅ |
| **Owner name/email** | — | — | — | ❌ Not in `AdminShopRecord`, only `sellerId` |
| **Submission date** | `items[].createdAt` | — | `createdAt` | ✅ |

---

### Screen: Product Approvals (`/admin/product-approvals`)
| UI Field | API Endpoint | Method | Response Field | Status |
|---|---|---|---|---|
| Products pending approval | `/api/v1/admin/products?approvalStatus=pending` | GET | `items[]` | ✅ |
| Product name, sku, price | `items[].name`, `.sku`, `.basePrice` | — | — | ✅ |
| Shop name | `items[].shopName` | — | `shopName` | ✅ |
| Approval status | `items[].approvalStatus` | — | `approvalStatus` | ✅ |
| Approve | `/api/v1/admin/products/moderation/:id/approve` | PATCH | — | ✅ |
| Reject + reason | `/api/v1/admin/products/moderation/:id/reject` | PATCH | `rejectionReason` | ✅ |
| Hide | `/api/v1/admin/products/moderation/:id/hide` | PATCH | — | ✅ |

---

### Screen: Orders (`/admin/orders`)
| UI Field | API Endpoint | Method | Response Field | Status |
|---|---|---|---|---|
| Orders list | `/api/v1/admin/orders` | GET | `items[]` | ✅ |
| Order number | `items[].id` (slice) | — | `id` | ⚠️ No `orderNumber` in summary list |
| Status, payment status | `items[].status`, `.paymentStatus` | — | — | ✅ |
| Total amount (VND) | `items[].totalAmount` | — | `totalAmount` | 🔧 Formatted as USD — must be VND |
| Buyer address | `items[].shippingAddressSnapshot` | — | `fullName`, `phone`, `province` | ✅ |
| Shop orders (sub-orders) | `items[].shopOrders[]` | — | nested array | ✅ |

---

### Screen: Analytics (`/admin/analytics`)
| UI Field | API Endpoint | Status |
|---|---|---|
| Revenue over time | — | ❌ No analytics endpoint |
| Order volume by day/week | — | ❌ No analytics endpoint |
| Top products | — | ❌ No analytics endpoint |
| Top sellers | — | ❌ No analytics endpoint |
| User acquisition | — | ❌ No analytics endpoint |

---

### Screen: Seller Profiles (`/admin/seller-profiles`)
| UI Field | API Endpoint | Method | Response Field | Status |
|---|---|---|---|---|
| List | `/api/v1/admin/seller-profiles` | GET | `items[]` | ✅ |
| Business name, phone, status | `items[].businessName`, `.phone`, `.status` | — | — | ✅ |
| Update status | `/api/v1/admin/seller-profiles/:id/status` | PATCH | `status` | ✅ |

---

### Screen: Payments (`/admin/payments`)
| UI Field | API Endpoint | Method | Response Field | Status |
|---|---|---|---|---|
| Payments list | `/api/v1/admin/payments` | GET | `items[]` | ✅ |
| Amount (VND) | `items[].amount` | — | `amount` | 🔧 Needs VND format |
| Method, status | `items[].method`, `.status` | — | — | ✅ |
| Order ID link | `items[].orderId` | — | `orderId` | ✅ |

---

### Screen: Inventory (`/admin/inventory`)
| UI Field | API Endpoint | Method | Response Field | Status |
|---|---|---|---|---|
| Inventory list | `/api/v1/admin/inventory` | GET | `items[]` | ✅ |
| SKU, stock, reserved, available | `items[].sku`, `.stock`, `.reservedStock`, `.availableStock` | — | — | ✅ |
| Status | `items[].status` | — | `status` | ✅ |
| Update stock | `/api/v1/admin/inventory/:id` | PATCH | `stock` | ✅ |

---

### Screen: Settings (`/admin/store-settings`)
| UI Field | API Endpoint | Method | Response Field | Status |
|---|---|---|---|---|
| Store name | `/api/v1/admin/store-settings` | GET/PATCH | `storeName` | ✅ |
| Logo URL | `/api/v1/admin/store-settings` | GET/PATCH | `logoImageUrl` | ✅ |
| Description | `/api/v1/admin/store-settings` | GET/PATCH | `description` | ✅ |
| Contact email, phone | `/api/v1/admin/store-settings` | GET/PATCH | `contactEmail`, `contactPhone` | ✅ |
| Address | `/api/v1/admin/store-settings` | GET/PATCH | `address` | ✅ |

---

## Known Auth/Token Bugs (pre-fix)

| File | Bug | Fix |
|---|---|---|
| `lib/seller/product-api.ts` | Uses `acme_token`/`acme_user` — seller auth stores `seller_token`/`seller_user` | Fix to read `seller_token` first |
| `lib/seller/inventory-api.ts` | Same bug as product-api | Fix to read `seller_token` first |
| `lib/seller/order-api.ts` | Reads auth token from cookie (`token=`) — seller stores in localStorage | Fix to read `seller_token` from localStorage |
| `app/admin/page.tsx` | `formatPrice` uses USD (`currency: "USD"`) | Change to VND |
