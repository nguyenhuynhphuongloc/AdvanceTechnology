# Marketplace Architecture Audit

> **Ngày**: 16 May 2026
> **Tác giả**: Software Architect / Backend Architect Agent
> **Mục đích**: Phân tích hệ thống hiện tại và lập kế hoạch chuyển đổi từ Single-Store Ecommerce sang Marketplace Ecommerce

---

## 1. Current System Overview

### 1.1 Tổng quan hệ thống

Hệ thống hiện tại là một **microservices-based e-commerce platform** được xây dựng với kiến trúc multi-service, gồm:

- **Frontend**: Next.js 14 (App Router) tại `my-app/` — chạy trên port 3009
- **API Gateway**: NestJS tại `microservices/api-gateway/` — chạy trên port 3000, là entry point duy nhất cho frontend
- **11 Backend Microservices**: NestJS, mỗi service chạy trên một port riêng
- **Infrastructure**: Docker Compose với MongoDB (port 27017), Redis (port 6379), RabbitMQ (ports 5672/15672)
- **CI/Testing**: Jest + Supertest, Postman collections

### 1.2 Các Service hiện có

| # | Service | Port | Database | Công nghệ DB |
|---|---------|------|----------|-------------|
| 1 | api-gateway | 3000 | — | — |
| 2 | product-service | 3001 | MongoDB (neondb) | MongoDB |
| 3 | authentication-service | 3008 | PostgreSQL (neondb) | TypeORM/PostgreSQL |
| 4 | order-service | 3004 | PostgreSQL (neondb) | TypeORM/PostgreSQL |
| 5 | cart-service | 3007 | PostgreSQL (neondb) | TypeORM/PostgreSQL |
| 6 | inventory-service | 3006 | PostgreSQL (neondb) | TypeORM/PostgreSQL |
| 7 | payment-service | 3003 | PostgreSQL (neondb) | TypeORM/PostgreSQL |
| 8 | notification-service | 3005 | PostgreSQL (neondb) | TypeORM/PostgreSQL |
| 9 | user-service | 3002 | PostgreSQL (neondb) | TypeORM/PostgreSQL |
| 10 | logging-service | 3011 | — | Không có DB cố định |
| 11 | store-service | 3012 | — | Không có DB cố định |

### 1.3 Đặc điểm quan trọng của hệ thống hiện tại

- Hệ thống **sử dụng mixed database**: MongoDB cho product-service, PostgreSQL cho 7 service còn lại. Đây là thiết kế có chủ đích nhưng gây phức tạp khi vận hành.
- Tất cả database đều sử dụng **Neon PostgreSQL** (cloud-hosted), ngoại trừ product-service dùng **MongoDB**.
- Hệ thống có 3 portal: **Storefront** (buyer), **Admin Console**, và **Seller Portal** — tuy nhiên Seller Portal chỉ là mock với localStorage.
- API Gateway sử dụng pattern **proxy-based routing** — chuyển tiếp request thuần túy tới downstream services.
- **JWT Auth**: authentication-service phát hành JWT, API Gateway xác thực qua Passport JWT strategy.
- **Redis** được dùng cho cart-session (cart-service) và product-caching (product-service).
- **RabbitMQ** được dùng cho async messaging giữa order-service, inventory-service, payment-service, notification-service.
- Các service có **3 trạng thái synchronize TypeORM**: `false` (production-safe), `true` (dev-mode).
- Hệ thống **thiếu Shop/Store entity** — sản phẩm không thuộc về một cửa hàng cụ thể, tất cả sản phẩm nằm trong global catalog.

---

## 2. Target Marketplace Model

### 2.1 Single-Store Ecommerce vs. Marketplace Ecommerce

| Khía cạnh | Single-Store Ecommerce | Marketplace Ecommerce |
|-----------|----------------------|---------------------|
| **Người bán** | 1 cửa hàng duy nhất | Nhiều người bán (Seller) độc lập |
| **Sản phẩm** | Thuộc về 1 catalog chung | Thuộc về Shop của từng Seller |
| **Đơn hàng** | 1 đơn = 1 buyer → 1 store | 1 đơn có thể chứa sản phẩm từ nhiều Shop → tách thành nhiều ShopOrder |
| **Thanh toán** | Đơn giản: 1 order → 1 payment | Phức tạp: 1 order → nhiều payment (mỗi shop), hoặc khấu trừ tự động |
| **Tồn kho** | Tồn kho toàn cửa hàng | Tồn kho theo từng Shop |
| **Phí** | Không cần mô hình phí | Phí hoa hồng (commission) theo shop |
| **Moderation** | Không cần duyệt shop | Admin duyệt/khóa Shop, duyệt sản phẩm |
| **Dashboard** | Admin quản lý toàn bộ | Admin + Seller Dashboard riêng biệt |

### 2.2 Các Actor trong Marketplace

#### 2.2.1 Admin Sàn (Platform Admin)

- Quản lý toàn bộ hệ thống
- Duyệt / khóa Shop đăng ký mới
- Duyệt / gỡ sản phẩm vi phạm
- Xem toàn bộ đơn hàng, tồn kho, thanh toán
- Quản lý danh mục (Category), thương hiệu (Brand)
- Cấu hình phí hoa hồng, chính sách platform
- Xem báo cáo doanh thu tổng quan

#### 2.2.2 Người bán (Seller)

- Đăng ký tạo Shop trên sàn
- Quản lý thông tin Shop (tên, banner, mô tả, địa chỉ liên hệ)
- Thêm / sửa / xóa sản phẩm của Shop mình
- Quản lý tồn kho của Shop mình
- Xem đơn hàng của Shop mình
- Xác nhận đơn / giao hàng
- Xem doanh thu và báo cáo của Shop
- Thiết lập phương thức vận chuyển, thời gian xử lý

#### 2.2.3 Người mua (Buyer)

- Duyệt / tìm kiếm sản phẩm từ nhiều Shop
- Xem thông tin Shop trước khi mua
- Thêm sản phẩm từ nhiều Shop vào giỏ hàng
- Đặt hàng (đơn hàng gộp từ nhiều Shop)
- Theo dõi trạng thái đơn hàng theo từng Shop
- Thanh toán (COD, Stripe, v.v.)
- Đánh giá / phản hồi sản phẩm

### 2.3 Core Domain Entities trong Marketplace

Dưới đây là danh sách các entity cốt lõi cần có trong mô hình Marketplace, với sự khác biệt chính so với Single-Store:

| Entity | Single-Store | Marketplace | Ghi chú |
|--------|-------------|-------------|---------|
| **User** | Có (buyer/admin) | Có (thêm role SELLER) | User có thể đồng thời là buyer và seller |
| **Shop** | Không có | **Cần tạo mới** | Liên kết 1-1 với Seller |
| **Product** | Global catalog | Thuộc Shop | Thêm shopId/sellerId |
| **ProductVariant** | Có | Có | Không đổi |
| **Cart** | 1 cart/user | 1 cart/user (giỏ gộp) | Cart item cần có shopId |
| **Order** | 1 order = 1 đơn | 1 order = nhiều ShopOrder | **Cần tách cấu trúc** |
| **ShopOrder** | Không có | **Cần tạo mới** | Mỗi shop có đơn riêng trong 1 order |
| **ShopOrderItem** | Không có | **Cần tạo mới** | Item trong ShopOrder |
| **Payment** | 1 payment/order | 1 payment/ShopOrder hoặc 1 payment/order | Cần thiết kế lại |
| **Inventory** | Global stock | Stock theo Shop | Cần thêm shopId |
| **Notification** | Có | Có (mở rộng) | Thêm cho seller |
| **ShopReview** | Không có | **Cần tạo mới** | Đánh giá Shop |
| **ProductReview** | Không có | **Cần tạo mới** | Đánh giá sản phẩm |
| **Commission** | Không có | **Cần tạo mới** | Phí hoa hồng platform |

---

## 3. Current Service Map

### 3.1 Chi tiết từng Service

| Service | Current Responsibility | Database Type | Main Models/Tables | Marketplace Readiness |
|---------|----------------------|---------------|-------------------|---------------------|
| **api-gateway** | Proxy-based routing, JWT auth, role guards | — | — | Partially Ready |
| **product-service** | Product catalog, categories, Cloudinary upload | MongoDB | Product, Category, ProductImage, ProductVariant, Collection | **Not Ready** |
| **authentication-service** | User auth, JWT issuance, admin login | PostgreSQL | AuthUser (id:int, email, passwordHash, role) | Partially Ready |
| **order-service** | Order CRUD, order items | PostgreSQL | Order (id:int, userId:int, status, totalAmount), OrderItem (productId:int) | **Not Ready** |
| **cart-service** | Cart management with Redis | PostgreSQL | Cart (userId:int), CartItem (productId:int) | **Not Ready** |
| **inventory-service** | Inventory tracking, branches | PostgreSQL | InventoryItemEntity (variantId, productId, branchId) | Partially Ready |
| **payment-service** | Payment transactions, Stripe | PostgreSQL | PaymentTransactionEntity (orderId, amount, status) | Partially Ready |
| **notification-service** | Notifications via RabbitMQ | PostgreSQL | NotificationLog, NotificationTemplate | Partially Ready |
| **user-service** | User profile (minimal scaffolding) | PostgreSQL | — | **Unknown** |
| **store-service** | Store settings (new, minimal) | — | — | **Unknown** |
| **logging-service** | Centralized logging | — | LogEntry (in-memory/file) | **Unknown** |

### 3.2 Phân tích chi tiết từng Service

#### 3.2.1 product-service ⚠️ NOT READY

**Vấn đề cốt lõi**: Sản phẩm **không có shopId/sellerId**. Tất cả sản phẩm nằm trong global catalog. Đây là thiết kế single-store.

- Product entity trong MongoDB có các trường: `name`, `slug`, `description`, `basePrice`, `images[]`, `variants[]`, `category`, `tags`, `collection`, `isActive`
- ProductVariant có: `sku`, `size`, `color`, `priceOverride`, `isActive`
- Không có liên kết tới Shop hoặc Seller
- API hiện có: list products, get by slug, related products, admin CRUD, upload image
- Cần thêm: `shopId` vào Product, API filter theo shop

#### 3.2.2 order-service ⚠️ NOT READY

**Vấn đề cốt lõi**: Thiết kế single-order. Mỗi Order có nhiều OrderItem nhưng không có khái niệm ShopOrder.

- Order entity: `userId:int`, `status`, `totalAmount`, `idempotencyKey`
- OrderItem: `productId:int`, `name`, `price`, `quantity`, `lineTotal` — **không có variantId, không có shopId**
- Controller endpoint yêu cầu `x-user-id` header phải là **positive integer** (thiên về mock/single-store)
- Không có API cho seller xem đơn hàng của mình
- Order status chỉ có: `PENDING`, `CONFIRMED`, `CANCELLED` — **thiếu nhiều trạng thái marketplace**

#### 3.2.3 cart-service ⚠️ NOT READY

**Vấn đề cốt lõi**: Cart thiết kế cho single-store. CartItem chỉ có `productId:int`.

- Cart entity: `userId:int` (unique) — **không hỗ trợ guest token đầy đủ ở DB level** (PostgreSQL unique constraint trên userId:int, không có guest_token column)
- CartItem: `productId:int`, `name`, `price`, `quantity` — **không có variantId, không có shopId**
- Frontend cart-context.tsx có variant support ở client-side nhưng backend không lưu variantId đúng cách
- Redis được dùng cho cart session nhưng DB là PostgreSQL — cần làm rõ tại sao dùng cả hai

#### 3.2.4 inventory-service ⚠️ PARTIALLY READY

- InventoryItemEntity có: `variantId`, `productId`, `branchId`, `sku`, `stock`, `reservedStock`
- **Không có shopId** — tồn kho toàn hệ thống
- BranchModule tồn tại nhưng Branch entity **không tìm thấy** trong `src/inventory/entities/` (có thể nằm ở `src/branch/`)
- API có: upsert item, get by variant, admin search, admin update stock

#### 3.2.5 authentication-service ⚠️ PARTIALLY READY

- AuthUser entity: `id:int`, `email`, `passwordHash`, `role` (enum: `customer`, `admin`)
- **Role hiện chỉ có `customer` và `admin`** — **thiếu `seller` role**
- Không có entity Shop hoặc SellerProfile
- Admin login hoạt động, phát hành JWT với payload `{ id, email, role }`
- Frontend seller registration lưu vào localStorage, không gọi backend

#### 3.2.6 payment-service ⚠️ PARTIALLY READY

- PaymentTransactionEntity: `orderId`, `method`, `amount`, `status`, `gatewayRef`, `clientSecret`
- Chỉ có 1 transaction cho 1 order — không phù hợp với multi-shop order
- Payment status: `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED` — đủ cho basic flow nhưng thiếu per-shop payment tracking
- Stripe integration đã có: `createPaymentIntent`, `confirmPayment`, webhook endpoint

#### 3.2.7 notification-service ⚠️ PARTIALLY READY

- NotificationLog: `orderId`, `type`, `recipient`, `status`, `message`
- NotificationTemplate: `key`, `subject`, `bodyHtml`
- WebSocket gateway tồn tại cho real-time notification
- **Không có notification type cho seller** (ví dụ: "Bạn có đơn hàng mới", "Đơn hàng đã được giao")

#### 3.2.8 user-service ⚠️ UNKNOWN

- Đây là service **scaffolding tối thiểu** — chỉ có AppController trả về message cứng
- Không có custom business logic, không có entities
- Không có user-profile, address, v.v.
- Có thể đã được thiết kế để mở rộng sau nhưng hiện chưa implement

#### 3.2.9 store-service ⚠️ UNKNOWN

- Service mới được tạo, chỉ có StoreSettings entity với 6 trường
- Chỉ có CRUD cho store settings (storeName, logo, description, contactEmail, contactPhone, address)
- **Không phải Shop entity** — đây chỉ là settings cho storefront branding
- Không có Shop status (active/inactive/pending approval)

#### 3.2.10 logging-service ⚠️ UNKNOWN

- In-memory log storage, không có persistent database
- LogEntry: `level`, `source`, `message`, `metadata`
- API: create log entry, list/search log entries
- Không có authentication/authorization
- Không có log categories hoặc retention policy

#### 3.2.11 api-gateway ⚠️ PARTIALLY READY

- Proxy-based routing — chuyển tiếp request thuần túy
- 4 Guards: `JwtAuthGuard`, `AdminRoleGuard`, `SellerOrAdminRoleGuard`, `OptionalJwtAuthGuard`
- **SellerOrAdminRoleGuard** đã tồn tại — dấu hiệu tích cực cho marketplace
- Tuy nhiên, gateway **thiếu shop-scoped authorization** — không có guard kiểm tra "seller chỉ truy cập được shop của mình"
- Không có API rate-limiting, không có request validation ở gateway level

---

## 4. Current Database Map

| Service | Database | Engine | Tables / Collections | Notes |
|---------|----------|--------|----------------------|-------|
| **product-service** | neondb | MongoDB | `products`, `categories`, `product_images`, `product_variants`, `collections` | Schema thiết kế theo single-store, không có shopId |
| **authentication-service** | neondb | PostgreSQL (Neon) | `auth_users` | Role enum: `customer`, `admin`. **Thiếu seller role và shop association** |
| **order-service** | neondb | PostgreSQL (Neon) | `orders`, `order_items` | User ID là `int`. Không có variantId trong order_items. Không có shopId |
| **cart-service** | neondb | PostgreSQL (Neon) | `carts`, `cart_items` | User ID là `int`. Không có variantId. Không có shopId |
| **inventory-service** | neondb | PostgreSQL (Neon) | `inventory_items` | Không có shopId. BranchModule tồn tại nhưng Branch entity chưa xác định được |
| **payment-service** | neondb | PostgreSQL (Neon) | `transactions`, `refunds` | 1 transaction/order. Không có per-shop payment |
| **notification-service** | neondb | PostgreSQL (Neon) | `notification_logs`, `notification_templates` | Không có notification type cho seller |
| **user-service** | neondb | PostgreSQL (Neon) | **Không xác định được** | Chỉ có scaffolding, không có entities được định nghĩa |
| **store-service** | — | — | — | Không có database, chỉ in-memory hoặc config |
| **logging-service** | — | — | — | In-memory/file-based, không có persistent database |
| **api-gateway** | — | — | — | Không có database |

### 4.1 Kiến trúc Database hiện tại

```
MongoDB (product-service)
└── products (no shopId)
└── categories
└── product_variants (no shopId)
└── product_images
└── collections

PostgreSQL (authentication-service)
└── auth_users (role: customer | admin) ❌ Missing seller

PostgreSQL (order-service)
└── orders (userId: int) ❌ No shopId
└── order_items (productId: int) ❌ No variantId, no shopId

PostgreSQL (cart-service)
└── carts (userId: int) ❌ No guest_token at DB level
└── cart_items (productId: int) ❌ No variantId, no shopId

PostgreSQL (inventory-service)
└── inventory_items (no shopId) ❌ Branch entity unknown

PostgreSQL (payment-service)
└── transactions (1:1 with order)
└── refunds

PostgreSQL (notification-service)
└── notification_logs
└── notification_templates
```

---

## 5. Current API Map

### 5.1 Gateway API Endpoints

| Service | Method | Endpoint | Purpose | Auth Required | Current Status | Notes |
|---------|--------|----------|---------|---------------|----------------|-------|
| **Auth** | POST | `/api/v1/auth/login` | User login | No | Working | JWT response |
| **Auth** | POST | `/api/v1/auth/register` | User register | No | Working | |
| **Auth** | POST | `/api/v1/auth/admin/login` | Admin login | No | Working | Cookie-based |
| **Auth** | POST | `/api/v1/auth/admin/logout` | Admin logout | Yes (admin) | Working | |
| **Auth** | GET | `/api/v1/auth/admin/me` | Get admin session | Yes (admin) | Working | |
| **Products** | GET | `/api/v1/products` | List products | No | Working | Redis-cached |
| **Products** | GET | `/api/v1/products/:slug` | Get product detail | No | Working | |
| **Products** | GET | `/api/v1/products/:slug/related` | Related products | No | Working | |
| **Products** | POST | `/api/v1/admin/products` | Create product | Yes (admin) | Working | |
| **Products** | GET | `/api/v1/admin/products` | List admin products | Yes (admin) | Working | |
| **Products** | GET | `/api/v1/admin/products/:id` | Get product detail | Yes (admin) | Working | |
| **Products** | PATCH | `/api/v1/admin/products/:id` | Update product | Yes (admin) | Working | |
| **Products** | DELETE | `/api/v1/admin/products/:id` | Delete product | Yes (admin) | Working | |
| **Products** | POST | `/api/v1/admin/products/upload-image` | Upload image | Yes (admin) | Working | Cloudinary |
| **Products** | GET | `/api/v1/admin/products/media` | List media assets | Yes (admin) | Working | |
| **Products** | POST | `/api/v1/admin/products/media/upload` | Upload media | Yes (admin) | Working | |
| **Products** | DELETE | `/api/v1/admin/products/media` | Delete media | Yes (admin) | Working | |
| **Categories** | GET | `/api/v1/categories` | List categories | No | Working | |
| **Categories** | POST | `/api/v1/admin/categories` | Create category | Yes (admin) | Working | |
| **Categories** | GET | `/api/v1/admin/categories` | List admin categories | Yes (admin) | Working | |
| **Categories** | PATCH | `/api/v1/admin/categories/:id` | Update category | Yes (admin) | Working | |
| **Categories** | DELETE | `/api/v1/admin/categories/:id` | Delete category | Yes (admin) | Working | |
| **Orders** | POST | `/api/v1/orders` | Create order | Yes (optional) | **Broken** | Requires x-user-id as integer |
| **Orders** | GET | `/api/v1/orders` | List my orders | Yes | **Broken** | Requires x-user-id as integer |
| **Orders** | GET | `/api/v1/orders/:orderId` | Get order detail | Yes | **Broken** | Requires integer orderId |
| **Orders** | PATCH | `/api/v1/orders/:orderId/cancel` | Cancel order | Yes | **Broken** | |
| **Orders** | GET | `/api/v1/admin/orders` | Admin list orders | Yes (admin/seller) | **Missing** | SellerOrAdminRoleGuard exists but backend doesn't filter |
| **Carts** | GET | `/api/v1/carts/me` | Get cart | No | Working | |
| **Carts** | POST | `/api/v1/carts/me/items` | Add item | No | Working | |
| **Carts** | DELETE | `/api/v1/carts/me/items/:variantId` | Remove item | No | Working | |
| **Carts** | DELETE | `/api/v1/carts/me` | Clear cart | No | Working | |
| **Carts** | POST | `/api/v1/carts/merge` | Merge guest cart | Yes | Working | |
| **Carts** | GET | `/api/v1/admin/carts` | Admin list carts | Yes (admin) | Working | |
| **Carts** | GET | `/api/v1/admin/carts/:id` | Admin get cart | Yes (admin) | Working | |
| **Inventory** | POST | `/api/v1/inventory/items` | Upsert inventory | Yes | Working | |
| **Inventory** | GET | `/api/v1/inventory/items/:variantId` | Get inventory | Yes | Working | |
| **Inventory** | GET | `/api/v1/admin/inventory` | Admin search inventory | Yes (admin) | Working | |
| **Inventory** | PATCH | `/api/v1/admin/inventory/:id` | Update stock | Yes (admin) | Working | |
| **Inventory** | GET/POST/PATCH/DELETE | `/api/v1/admin/branches` | CRUD branches | Yes (admin) | **Unknown** | Branch entity chưa rõ |
| **Payments** | GET | `/api/v1/payments/transactions` | List transactions | Yes (optional) | Working | |
| **Payments** | GET | `/api/v1/payments/order/:orderId` | Get payment by order | Yes (optional) | Working | |
| **Payments** | POST | `/api/v1/payments/create-intent` | Create Stripe intent | Yes (optional) | Working | |
| **Payments** | GET | `/api/v1/admin/payments` | Admin list payments | Yes (admin) | Working | |
| **Payments** | GET | `/api/v1/admin/payments/:id` | Admin get payment | Yes (admin) | Working | |
| **Notifications** | GET | `/api/v1/notifications` | List notifications | Yes | Working | |
| **Notifications** | POST | `/api/v1/notifications` | Create notification | Yes | Working | |
| **Notifications** | GET | `/api/v1/admin/notifications` | Admin list notifications | Yes (admin) | Working | |
| **Notifications** | GET | `/api/v1/admin/notifications/:id` | Admin get notification | Yes (admin) | Working | |
| **Users** | GET | `/api/v1/users/profile` | Get user profile | Yes | **Unknown** | user-service scaffolding |
| **Store Settings** | GET | `/api/v1/store-settings` | Get store settings | No | Working | Public storefront branding |
| **Store Settings** | GET | `/api/v1/admin/store-settings` | Admin get settings | Yes (admin) | Working | |
| **Store Settings** | PATCH | `/api/v1/admin/store-settings` | Admin update settings | Yes (admin) | Working | |
| **Logs** | GET/POST | `/api/v1/admin/logs` | CRUD logs | Yes (admin) | Working | |
| **AI** | ALL | `/api/v1/ai/*` | Proxy to AI agent | No | **Missing** | AI agent service chưa có |

### 5.2 Frontend API Calls

| Module | File | API Endpoints Called | Notes |
|--------|------|---------------------|-------|
| Admin API | `lib/admin/api.ts` | Tất cả `/api/v1/admin/*` endpoints | Server-side cookie auth |
| Shopping Cart | `lib/shopping/cart-api.ts` | `/api/v1/carts/*` | Header-based auth (x-user-id/x-guest-token) |
| Shopping Orders | `lib/shopping/order-api.ts` | Order/payment endpoints | **Mock-only (localStorage)** — không gọi real backend |
| Product Catalog | `lib/products/api.ts` | `/api/v1/products`, `/api/v1/categories` | Next.js fetch with caching |
| Storefront | `lib/storefront/api.ts` | `/api/v1/store-settings` | Public |
| Payment Intent | `app/api/payments/intent/route.ts` | Internal Next.js API route | Calls Stripe directly |

### 5.3 Các vấn đề API nghiêm trọng

1. **Order API BROKEN**: order-service yêu cầu `x-user-id` phải là positive integer và orderId cũng phải là integer. Frontend gửi email làm userId → sẽ fail.
2. **Order API sử dụng MOCK**: `lib/shopping/order-api.ts` không gọi real backend order-service. Tất cả orders được lưu trong `localStorage['acme_mock_orders']`. Đây là **critical gap** — đơn hàng thực tế không được tạo ở backend.
3. **Không có Seller API**: Không có endpoint nào để seller quản lý sản phẩm, đơn hàng, hay shop của mình.
4. **Không có Shop API**: Không có endpoint để tạo, sửa, xem thông tin Shop.
5. **User ID Type Mismatch**: authentication-service dùng `UUID` (trong SQL schema design) nhưng order/cart service dùng `int`. Đây là **inconsistency nghiêm trọng** cần giải quyết.

---

## 6. Marketplace Gap Analysis

### 6.1 User & Role Gap

| Check | Status | Chi tiết |
|-------|--------|---------|
| Có role ADMIN / SELLER / BUYER? | ⚠️ **Partial** | ADMIN và BUYER (`customer`) có trong AuthUser.role enum. SELLER **không có** trong backend. Frontend có mock seller role trong localStorage. |
| Seller và Buyer tách rõ chưa? | ❌ **Chưa** | authentication-service chỉ có `customer` và `admin`. Không có tách biệt buyer/seller. User có thể đăng ký làm seller nhưng không có backend support. |
| Admin sàn có quyền quản lý toàn hệ thống? | ⚠️ **Partial** | Admin có CRUD products, categories, orders, users, inventory. Nhưng **thiếu** quản lý Shops, duyệt shop, duyệt sản phẩm, commission management. |

### 6.2 Shop / Store Gap

| Check | Status | Chi tiết |
|-------|--------|---------|
| Có entity Shop? | ❌ **Không có** | Không có Shop entity. store-service chỉ có StoreSettings (branding config). |
| Shop có liên kết với Seller? | ❌ **Không** | Không có liên kết. |
| Product có thuộc Shop? | ❌ **Không** | Product trong MongoDB không có shopId/sellerId. |
| Có API tạo/sửa/xem shop? | ❌ **Không có** | Không có Shop CRUD API. |
| Admin có thể duyệt/khóa shop? | ❌ **Không** | Không có Shop moderation API. |
| Có Seller Dashboard UI? | ⚠️ **Mock only** | `/seller/*` pages tồn tại nhưng gọi mock API, không có backend thực. |

### 6.3 Product Gap

| Check | Status | Chi tiết |
|-------|--------|---------|
| Product có đang thuộc một cửa hàng duy nhất? | ✅ **Có (theo thiết kế)** | Product thuộc global catalog (1 store duy nhất). |
| Product có shopId / sellerId? | ❌ **Không có** | Product entity không có trường này. |
| Product variant đúng chưa? | ⚠️ **Partial** | Variant có sku, size, color, priceOverride. Nhưng **không có variantId** trong OrderItem và CartItem → không track được đúng variant khi đặt hàng. |
| Product image có hỗ trợ ảnh theo variant? | ⚠️ **Partial** | Variant có `imagePublicId` nhưng không rõ cách dùng trong frontend. |
| Seller quản lý sản phẩm của shop mình? | ❌ **Không** | Không có API. Admin toàn quyền CRUD sản phẩm. |

### 6.4 Cart Gap

| Check | Status | Chi tiết |
|-------|--------|---------|
| Cart hỗ trợ sản phẩm từ nhiều shop? | ⚠️ **Partial** | Frontend client-side có thể thêm nhiều sản phẩm vào giỏ, nhưng backend CartItem **không có shopId** → không tách được theo shop khi tạo đơn. |
| Cart item có lưu shopId? | ❌ **Không** | CartItem chỉ có `productId:int`. |

### 6.5 Order Gap

| Check | Status | Chi tiết |
|-------|--------|---------|
| Order hỗ trợ tách đơn theo từng shop? | ❌ **Không** | Thiết kế hiện tại: 1 Order = nhiều OrderItem gộp chung. Không có ShopOrder / ShopOrderItem. |
| Seller xem được đơn hàng của shop mình? | ❌ **Không** | Order API yêu cầu userId:int. Seller không có cơ chế xem đơn hàng riêng. |
| Buyer xem được lịch sử đơn hàng? | ⚠️ **Mock only** | Frontend có trang orders nhưng dùng localStorage mock, không gọi real backend. |
| Admin xem được toàn bộ đơn hàng? | ⚠️ **Partial** | `/api/v1/admin/orders` route có guard nhưng order-service không có admin list endpoint. |
| Order status đầy đủ? | ❌ **Thiếu** | Hiện chỉ có `PENDING`, `CONFIRMED`, `CANCELLED`. Thiếu: `AWAITING_PAYMENT`, `PAID`, `SHIPPING`, `DELIVERED`, `REFUNDED`, `AWAITING_APPROVAL`. |

### 6.6 Inventory Gap

| Check | Status | Chi tiết |
|-------|--------|---------|
| Tồn kho theo product hay variant? | ✅ **Theo variant** | InventoryItemEntity có `variantId`. |
| Hỗ trợ tồn kho theo shop? | ❌ **Không** | Không có shopId. Tất cả tồn kho gộp chung. |

### 6.7 Payment Gap

| Check | Status | Chi tiết |
|-------|--------|---------|
| Payment liên kết order? | ✅ **Có** | PaymentTransactionEntity có `orderId`. |
| Payment status rõ? | ⚠️ **Partial** | Có `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`. Đủ cho basic flow nhưng không track per-shop payment. |
| Hỗ trợ COD / pending / paid / failed? | ⚠️ **Partial** | Stripe payment hoạt động. COD cần thêm method type. |

### 6.8 Admin Gap

| Check | Status | Chi tiết |
|-------|--------|---------|
| Admin quản lý được gì? | Products, Categories, Inventory, Orders, Payments, Carts, Users, Logs, Notifications, Store Settings | Đã có UI và API cho tất cả |
| Thiếu API admin nào? | Shop management, Shop approval/rejection, Seller management, Commission management, Product moderation, Reporting/Analytics, Review management | **Nhiều** |
| Thiếu UI admin nào? | Shop approval queue, Seller management, Commission management, Report/Analytics dashboard | **Nhiều** |

### 6.9 Seller Dashboard Gap

| Module | Status | Chi tiết |
|--------|--------|---------|
| Seller Dashboard có chưa? | ⚠️ **Mock only** | Pages tồn tại tại `/seller/*` nhưng hoàn toàn mock |
| Seller Products Management | ❌ **Không có** | Không có API để seller thêm/sửa/xóa sản phẩm của mình |
| Seller Order Management | ❌ **Không có** | Không có API để seller xác nhận/giao đơn hàng |
| Seller Shop Profile | ❌ **Không có** | Không có API quản lý thông tin Shop |
| Seller Inventory Management | ❌ **Không có** | Không có API quản lý tồn kho riêng |
| Seller Revenue/Analytics | ❌ **Không có** | Không có API báo cáo |
| Seller Notification | ❌ **Không có** | Không có notification type cho seller |

### 6.10 Tổng hợp Gap

```
❌ CRITICAL GAPS (cần giải quyết ngay):
  1. Không có Shop entity → không có multi-vendor
  2. Order không tách được theo shop → không có split-order
  3. Order API broken (integer userId requirement)
  4. Order flow dùng mock localStorage → không có real order ở backend
  5. Không có seller role ở backend
  6. CartItem không có variantId → không track variant đúng khi order

⚠️ IMPORTANT GAPS (cần trong phase tiếp theo):
  7. Không có seller dashboard API
  8. Không có shop moderation (approve/reject shop)
  9. Không có commission tracking
  10. Không có review/rating system
  11. User ID inconsistency (UUID vs int)
  12. Inventory không có shopId
  13. Payment không support per-shop payment
  14. Notification không có seller-specific types

ℹ️ MINOR / OPTIONAL:
  15. AI agent service chưa có (route đã có sẵn)
  16. User service chỉ là scaffolding
  17. Logging service không có persistent storage
```

---

## 7. Proposed Marketplace Core Domain

### 7.1 User & Identity

#### User
- **Mục đích**: Tài khoản authentication cơ bản
- **Service**: authentication-service
- **Các field chính**: `id (UUID)`, `email`, `passwordHash`, `role (enum: ADMIN | SELLER | BUYER)`, `isActive`, `createdAt`, `updatedAt`
- **Quan hệ**: 1 User → 1 BuyerProfile (optional), 1 SellerProfile (optional)

#### BuyerProfile
- **Mục đích**: Thông tin mở rộng của người mua
- **Service**: user-service (mới)
- **Các field chính**: `id (UUID)`, `userId (FK→User)`, `fullName`, `phone`, `avatarUrl`, `defaultAddressId (FK→Address)`
- **Quan hệ**: 1 BuyerProfile → N Address, 1 User

#### SellerProfile
- **Mục đích**: Thông tin mở rộng của người bán
- **Service**: user-service (mới)
- **Các field chính**: `id (UUID)`, `userId (FK→User)`, `shopId (FK→Shop)`, `stripeAccountId`, `bankAccount`, `taxId`
- **Quan hệ**: 1 SellerProfile → 1 Shop, 1 User

### 7.2 Shop Domain

#### Shop
- **Mục đích**: Cửa hàng của người bán trên marketplace
- **Service**: shop-service (mới — tách từ store-service)
- **Các field chính**:
  - `id (UUID)`, `sellerId (FK→User)`, `name`, `slug (unique)`
  - `bannerUrl`, `logoUrl`, `description`, `contactEmail`, `contactPhone`, `address`
  - `status (enum: PENDING | APPROVED | REJECTED | SUSPENDED)`
  - `rating (decimal)`, `totalRatings (int)`
  - `shippingMethods (JSON)`, `processingTimeDays (int)`
  - `commissionRate (decimal)` — phần trăm phí hoa hồng platform
  - `createdAt`, `updatedAt`
- **Quan hệ**: 1 Shop → N Product, N ShopOrder, 1 SellerProfile, 1 User

### 7.3 Catalog Domain

#### Category
- **Mục đích**: Danh mục sản phẩm (hierarchical)
- **Service**: product-service
- **Các field chính**: `id (UUID)`, `parentId (FK→Category, nullable)`, `name`, `slug`, `iconUrl`, `sortOrder`
- **Quan hệ**: 1 Category → N Category (children), N Product

#### Product
- **Mục đích**: Sản phẩm của một Shop
- **Service**: product-service
- **Các field chính**:
  - `id (UUID)`, `shopId (FK→Shop)`, `sellerId (FK→User)`
  - `categoryId (FK→Category)`, `name`, `slug`, `description`
  - `basePrice (decimal)`, `images (JSON[])`, `tags (JSON[])`
  - `isActive (bool)`, `isApproved (bool)` — admin approval
  - `averageRating (decimal)`, `totalReviews (int)`
  - `createdAt`, `updatedAt`
- **Quan hệ**: 1 Product → 1 Shop, 1 Category, N ProductVariant, N ProductImage, N ProductReview

#### ProductVariant
- **Mục đích**: Phiên bản sản phẩm (size, color)
- **Service**: product-service
- **Các field chính**: `id (UUID)`, `productId (FK→Product)`, `sku`, `size`, `color`, `priceOverride (decimal, nullable)`, `imageUrl`, `isActive`
- **Quan hệ**: 1 ProductVariant → 1 Product, N InventoryItem, N CartItem, N OrderItem

#### ProductImage
- **Mục đích**: Hình ảnh sản phẩm
- **Service**: product-service
- **Các field chính**: `id (UUID)`, `productId (FK→Product)`, `variantId (FK→ProductVariant, nullable)`, `imageUrl`, `publicId (Cloudinary)`, `altText`, `sortOrder`, `isMain`
- **Quan hệ**: 1 ProductImage → 1 Product, 1 ProductVariant (optional)

#### ProductReview
- **Mục đích**: Đánh giá sản phẩm từ buyer
- **Service**: review-service (mới)
- **Các field chính**: `id (UUID)`, `productId (FK→Product)`, `orderId (FK→Order)`, `buyerId (FK→User)`, `rating (int 1-5)`, `comment`, `createdAt`

#### ShopReview
- **Mục đích**: Đánh giá Shop từ buyer
- **Service**: review-service (mới)
- **Các field chính**: `id (UUID)`, `shopId (FK→Shop)`, `orderId (FK→Order)`, `buyerId (FK→User)`, `rating (int 1-5)`, `comment`, `createdAt`

### 7.4 Cart Domain

#### Cart
- **Mục đích**: Giỏ hàng của người mua (hỗ trợ multi-shop)
- **Service**: cart-service
- **Các field chính**: `id (UUID)`, `userId (FK→User, nullable)`, `guestToken (string, nullable)`, `createdAt`, `updatedAt`
- **Quan hệ**: 1 Cart → N CartItem
- **Lưu ý**: Cần hỗ trợ cả userId và guestToken (đã có ở API layer nhưng DB cần update)

#### CartItem
- **Mục đích**: Item trong giỏ hàng
- **Service**: cart-service
- **Các field chính**: `id (UUID)`, `cartId (FK→Cart)`, `shopId (FK→Shop)`, `productId (FK→Product)`, `variantId (FK→ProductVariant)`, `quantity (int)`, `unitPriceSnapshot (decimal)`
- **Quan hệ**: 1 CartItem → 1 Cart, 1 Product, 1 ProductVariant, 1 Shop

### 7.5 Order Domain

#### Order
- **Mục đích**: Đơn hàng gộp của buyer (chứa nhiều ShopOrder)
- **Service**: order-service
- **Các field chính**:
  - `id (UUID)`, `buyerId (FK→User)`
  - `shippingAddressSnapshot (JSON)` — snapshot địa chỉ giao hàng
  - `subtotal (decimal)`, `shippingFee (decimal)`, `totalAmount (decimal)`
  - `status (enum: PENDING | AWAITING_PAYMENT | PAID | PARTIALLY_PAID | SHIPPING | DELIVERED | CANCELLED | REFUNDED)`
  - `createdAt`, `updatedAt`
- **Quan hệ**: 1 Order → N ShopOrder, 1 User

#### ShopOrder
- **Mục đích**: Đơn hàng con thuộc một Shop trong Order lớn
- **Service**: order-service
- **Các field chính**:
  - `id (UUID)`, `orderId (FK→Order)`, `shopId (FK→Shop)`
  - `sellerId (FK→User)`
  - `subtotal (decimal)`, `shippingFee (decimal)`, `shopTotal (decimal)`
  - `status (enum: PENDING | CONFIRMED | SHIPPING | DELIVERED | CANCELLED | REFUND_REQUESTED | REFUNDED)`
  - `trackingNumber`, `estimatedDelivery`
  - `createdAt`, `updatedAt`
- **Quan hệ**: 1 ShopOrder → 1 Order, 1 Shop, N ShopOrderItem

#### ShopOrderItem
- **Mục đích**: Item trong ShopOrder
- **Service**: order-service
- **Các field chính**:
  - `id (UUID)`, `shopOrderId (FK→ShopOrder)`
  - `productId (FK→Product)`, `variantId (FK→ProductVariant)`
  - `productNameSnapshot (string)`, `variantNameSnapshot (string)`
  - `skuSnapshot (string)`, `imageUrlSnapshot (string)`
  - `unitPrice (decimal)`, `quantity (int)`, `lineTotal (decimal)`
- **Quan hệ**: 1 ShopOrderItem → 1 ShopOrder, 1 Product, 1 ProductVariant

### 7.6 Payment Domain

#### Payment
- **Mục đích**: Thanh toán cho Order hoặc ShopOrder
- **Service**: payment-service
- **Các field chính**:
  - `id (UUID)`, `orderId (FK→Order)`, `shopOrderId (FK→ShopOrder, nullable)`
  - `method (enum: COD | STRIPE | VNPAY | MOMO)`
  - `amount (decimal)`, `currency (string)`
  - `status (enum: PENDING | SUCCESS | FAILED | REFUNDED | PARTIALLY_REFUNDED)`
  - `gatewayRef`, `gatewayPayload (JSON)`, `clientSecret`
  - `createdAt`, `updatedAt`
- **Quan hệ**: 1 Payment → 1 Order (bắt buộc), 1 ShopOrder (optional)

#### Refund
- **Mục đích**: Yêu cầu hoàn tiền
- **Service**: payment-service
- **Các field chính**: `id (UUID)`, `paymentId (FK→Payment)`, `shopOrderId (FK→ShopOrder)`, `amount (decimal)`, `reason`, `status (enum: PENDING | APPROVED | REJECTED | PROCESSING | COMPLETED)`, `requestedAt`, `processedAt`

#### Commission
- **Mục đích**: Phí hoa hồng platform thu từ mỗi ShopOrder
- **Service**: commission-service (mới)
- **Các field chính**: `id (UUID)`, `shopOrderId (FK→ShopOrder)`, `shopId (FK→Shop)`, `grossAmount (decimal)`, `commissionRate (decimal)`, `commissionAmount (decimal)`, `netAmount (decimal)`, `status (enum: PENDING | SETTLED | WITHDRAWN)`, `settledAt`

### 7.7 Inventory Domain

#### InventoryItem
- **Mục đích**: Tồn kho theo variant và shop
- **Service**: inventory-service
- **Các field chính**:
  - `id (UUID)`, `shopId (FK→Shop)`, `variantId (FK→ProductVariant)`
  - `stock (int)`, `reservedStock (int)`
  - `lowStockThreshold (int)`
  - `updatedAt`
- **Quan hệ**: 1 InventoryItem → 1 Shop, 1 ProductVariant
- **Lưu ý**: Thêm `shopId` vào entity hiện tại

### 7.8 Notification Domain

#### Notification
- **Mục đích**: Thông báo cho user (buyer/seller/admin)
- **Service**: notification-service
- **Các field chính**:
  - `id (UUID)`, `userId (FK→User)`, `type (enum: ORDER_CREATED | ORDER_PAID | ORDER_SHIPPED | ORDER_DELIVERED | ORDER_CANCELLED | NEW_ORDER (seller) | LOW_STOCK (seller) | PAYMENT_RECEIVED (seller) | REFUND_APPROVED | REVIEW_REMINDER | SYSTEM)`
  - `channel (enum: IN_APP | EMAIL | SMS)`
  - `title`, `body`, `metadata (JSON)`, `isRead`, `sentAt`
  - `createdAt`

---

## 8. Proposed ERD

```mermaid
erDiagram
    %% =====================================================================
    %% IDENTITY & USER DOMAIN
    %% =====================================================================

    USER {
        uuid id PK
        string email UK
        string passwordHash
        enum_role role "ADMIN | SELLER | BUYER"
        boolean isActive
        timestamp createdAt
        timestamp updatedAt
    }

    BUYER_PROFILE {
        uuid id PK
        uuid userId FK UK "→ USER"
        string fullName
        string phone
        string avatarUrl
        uuid defaultAddressId FK "→ ADDRESS"
        timestamp updatedAt
    }

    SELLER_PROFILE {
        uuid id PK
        uuid userId FK UK "→ USER"
        uuid shopId FK UK "→ SHOP"
        string stripeAccountId
        string bankAccount
        string taxId
        timestamp createdAt
    }

    ADDRESS {
        uuid id PK
        uuid buyerProfileId FK "→ BUYER_PROFILE"
        string label
        string fullName
        string phone
        string province
        string district
        string ward
        string street
        boolean isDefault
        timestamp createdAt
    }

    %% =====================================================================
    %% SHOP DOMAIN
    %% =====================================================================

    SHOP {
        uuid id PK
        uuid sellerId FK "→ USER"
        string name
        string slug UK
        string bannerUrl
        string logoUrl
        string description
        string contactEmail
        string contactPhone
        string address
        enum_shop_status status "PENDING | APPROVED | REJECTED | SUSPENDED"
        decimal rating "0-5"
        int totalRatings
        json shippingMethods
        int processingTimeDays
        decimal commissionRate
        timestamp createdAt
        timestamp updatedAt
    }

    %% =====================================================================
    %% CATALOG DOMAIN
    %% =====================================================================

    CATEGORY {
        uuid id PK
        uuid parentId FK "→ CATEGORY (self)"
        string name
        string slug UK
        string iconUrl
        int sortOrder
        timestamp createdAt
        timestamp updatedAt
    }

    PRODUCT {
        uuid id PK
        uuid shopId FK "→ SHOP"
        uuid sellerId FK "→ USER"
        uuid categoryId FK "→ CATEGORY"
        string name
        string slug UK
        text description
        decimal basePrice
        json images
        json tags
        boolean isActive
        boolean isApproved "admin moderation"
        decimal averageRating
        int totalReviews
        timestamp createdAt
        timestamp updatedAt
    }

    PRODUCT_VARIANT {
        uuid id PK
        uuid productId FK "→ PRODUCT"
        string sku UK
        string size
        string color
        decimal priceOverride "nullable"
        string imageUrl
        boolean isActive
        timestamp createdAt
    }

    PRODUCT_IMAGE {
        uuid id PK
        uuid productId FK "→ PRODUCT"
        uuid variantId FK "→ PRODUCT_VARIANT nullable"
        string imageUrl
        string publicId "Cloudinary"
        string altText
        int sortOrder
        boolean isMain
        timestamp createdAt
    }

    PRODUCT_REVIEW {
        uuid id PK
        uuid productId FK "→ PRODUCT"
        uuid orderId FK "→ ORDER"
        uuid buyerId FK "→ USER"
        int rating "1-5"
        text comment
        timestamp createdAt
    }

    SHOP_REVIEW {
        uuid id PK
        uuid shopId FK "→ SHOP"
        uuid orderId FK "→ ORDER"
        uuid buyerId FK "→ USER"
        int rating "1-5"
        text comment
        timestamp createdAt
    }

    %% =====================================================================
    %% CART DOMAIN
    %% =====================================================================

    CART {
        uuid id PK
        uuid userId FK nullable "→ USER"
        string guestToken nullable
        timestamp createdAt
        timestamp updatedAt
    }

    CART_ITEM {
        uuid id PK
        uuid cartId FK "→ CART"
        uuid shopId FK "→ SHOP"
        uuid productId FK "→ PRODUCT"
        uuid variantId FK "→ PRODUCT_VARIANT"
        int quantity
        decimal unitPriceSnapshot
        timestamp addedAt
    }

    %% =====================================================================
    %% ORDER DOMAIN
    %% =====================================================================

    ORDER {
        uuid id PK
        uuid buyerId FK "→ USER"
        json shippingAddressSnapshot
        decimal subtotal
        decimal shippingFee
        decimal totalAmount
        enum_order_status status "PENDING | AWAITING_PAYMENT | PAID | PARTIALLY_PAID | SHIPPING | DELIVERED | CANCELLED | REFUNDED"
        enum_payment_method paymentMethod "COD | STRIPE | VNPAY | MOMO"
        timestamp createdAt
        timestamp updatedAt
    }

    SHOP_ORDER {
        uuid id PK
        uuid orderId FK "→ ORDER"
        uuid shopId FK "→ SHOP"
        uuid sellerId FK "→ USER"
        decimal subtotal
        decimal shippingFee
        decimal shopTotal
        enum_shop_order_status status "PENDING | CONFIRMED | SHIPPING | DELIVERED | CANCELLED | REFUND_REQUESTED | REFUNDED"
        string trackingNumber
        date estimatedDelivery
        timestamp createdAt
        timestamp updatedAt
    }

    SHOP_ORDER_ITEM {
        uuid id PK
        uuid shopOrderId FK "→ SHOP_ORDER"
        uuid productId FK "→ PRODUCT"
        uuid variantId FK "→ PRODUCT_VARIANT"
        string productNameSnapshot
        string variantNameSnapshot
        string skuSnapshot
        string imageUrlSnapshot
        decimal unitPrice
        int quantity
        decimal lineTotal
    }

    %% =====================================================================
    %% PAYMENT DOMAIN
    %% =====================================================================

    PAYMENT {
        uuid id PK
        uuid orderId FK "→ ORDER"
        uuid shopOrderId FK nullable "→ SHOP_ORDER"
        enum_payment_method method "COD | STRIPE | VNPAY | MOMO"
        decimal amount
        string currency
        enum_payment_status status "PENDING | SUCCESS | FAILED | REFUNDED | PARTIALLY_REFUNDED"
        string gatewayRef
        json gatewayPayload
        string clientSecret
        timestamp createdAt
        timestamp updatedAt
    }

    REFUND {
        uuid id PK
        uuid paymentId FK "→ PAYMENT"
        uuid shopOrderId FK "→ SHOP_ORDER"
        decimal amount
        text reason
        enum_refund_status status "PENDING | APPROVED | REJECTED | PROCESSING | COMPLETED"
        timestamp requestedAt
        timestamp processedAt
    }

    COMMISSION {
        uuid id PK
        uuid shopOrderId FK "→ SHOP_ORDER"
        uuid shopId FK "→ SHOP"
        decimal grossAmount
        decimal commissionRate
        decimal commissionAmount
        decimal netAmount
        enum_commission_status status "PENDING | SETTLED | WITHDRAWN"
        timestamp settledAt
        timestamp createdAt
    }

    %% =====================================================================
    %% INVENTORY DOMAIN
    %% =====================================================================

    INVENTORY_ITEM {
        uuid id PK
        uuid shopId FK "→ SHOP"
        uuid variantId FK UK "→ PRODUCT_VARIANT"
        int stock
        int reservedStock
        int lowStockThreshold
        timestamp updatedAt
    }

    %% =====================================================================
    %% NOTIFICATION DOMAIN
    %% =====================================================================

    NOTIFICATION {
        uuid id PK
        uuid userId FK "→ USER"
        enum_notification_type type
        enum_notification_channel channel "IN_APP | EMAIL | SMS"
        string title
        string body
        json metadata
        boolean isRead
        timestamp sentAt
        timestamp createdAt
    }

    %% =====================================================================
    %% RELATIONSHIPS
    %% =====================================================================

    USER ||--o| BUYER_PROFILE : "has optional"
    USER ||--o| SELLER_PROFILE : "has optional"
    SELLER_PROFILE ||--|| SHOP : "owns exactly one"
    BUYER_PROFILE ||--o{ ADDRESS : "has many"

    SHOP ||--o{ PRODUCT : "sells"
    SHOP ||--o{ SHOP_ORDER : "receives"
    SHOP ||--o{ INVENTORY_ITEM : "stocks"
    SHOP ||--o{ SHOP_REVIEW : "receives"
    SHOP ||--o{ COMMISSION : "earns"

    PRODUCT }o--|| CATEGORY : "belongs to"
    PRODUCT ||--o{ PRODUCT_VARIANT : "has"
    PRODUCT ||--o{ PRODUCT_IMAGE : "has"
    PRODUCT ||--o{ PRODUCT_REVIEW : "receives"

    PRODUCT_VARIANT ||--o{ PRODUCT_IMAGE : "may have variant-specific"
    PRODUCT_VARIANT ||--|| INVENTORY_ITEM : "tracked by"
    PRODUCT_VARIANT ||--o{ CART_ITEM : "added to"
    PRODUCT_VARIANT ||--o{ SHOP_ORDER_ITEM : "ordered as"

    CART ||--o{ CART_ITEM : "contains"
    CART_ITEM }o--|| SHOP : "belongs to"
    CART_ITEM }o--|| PRODUCT : "references"
    CART_ITEM }o--|| PRODUCT_VARIANT : "selects"

    ORDER ||--o{ SHOP_ORDER : "contains"
    ORDER ||--o{ PAYMENT : "has"

    SHOP_ORDER ||--o{ SHOP_ORDER_ITEM : "contains"
    SHOP_ORDER ||--o{ PAYMENT : "may have"
    SHOP_ORDER ||--o{ REFUND : "may have"
    SHOP_ORDER ||--|| COMMISSION : "generates"

    PRODUCT_REVIEW }o--|| ORDER : "written after"
    PRODUCT_REVIEW }o--|| USER : "written by"
    SHOP_REVIEW }o--|| ORDER : "written after"
    SHOP_REVIEW }o--|| USER : "written by"

    NOTIFICATION }o--|| USER : "sent to"
```

---

## 9. Recommended Implementation Phases

### Phase 1: Core Identity & Shop Foundation
1. Mở rộng `authentication-service`: thêm `seller` role
2. Tạo `user-service`: BuyerProfile, SellerProfile, Address entities
3. Tạo `shop-service` (tách từ store-service): Shop entity, Shop CRUD, Shop approval flow
4. Thêm `shopId` vào Product trong MongoDB
5. Cập nhật `product-service` API: filter/list products by shop

### Phase 2: Order & Cart Rebuild
1. Thiết kế lại Order schema: Order → ShopOrder → ShopOrderItem
2. Thiết kế lại Cart schema: Cart → CartItem với shopId và variantId
3. Sửa order-service: UUID userId, admin list endpoint, seller list endpoint
4. Sửa cart-service: thêm variantId, shopId
5. Cập nhật payment-service: hỗ trợ per-shop-order payments

### Phase 3: Seller Dashboard
1. Tạo seller API endpoints: product management, order management, shop profile
2. Xây dựng seller dashboard UI: products CRUD, orders, shop settings, analytics
3. Thêm seller-specific notifications
4. Thêm inventory management per-shop

### Phase 4: Moderation & Trust
1. Product approval flow (admin duyệt sản phẩm)
2. Shop approval flow (admin duyệt shop mới)
3. Review/Rating system
4. Shop suspension/ban mechanism

### Phase 5: Advanced Commerce
1. Commission tracking (commission-service)
2. Advanced reporting (admin analytics)
3. Withdrawals cho seller
4. Advanced payment methods (VNPay, MoMo integration)
5. AI agent service integration

---

## 10. Open Questions & Decisions Needed

1. **Database Strategy**: Tiếp tục dùng MongoDB cho product-service hay chuyển sang PostgreSQL? MongoDB có lợi thế cho flexible product attributes, nhưng tăng độ phức tạp vận hành.
2. **Shop Order vs. Single Order**: Quyết định có tách đơn hàng theo shop (ShopOrder) hay giữ đơn gộp và chỉ thêm metadata shop vào item. Tách đơn phức tạp hơn nhưng realistic cho marketplace.
3. **Payment Splitting**: Ai giữ tiền trước (escrow)? Platform thu tiền rồi chuyển cho seller hay seller nhận trực tiếp? Stripe Connect có thể giải quyết vấn đề này.
4. **Commission Model**: Phần trăm cố định hay theo danh mục? Thanh toán ngay khi giao hàng hay định kỳ?
5. **User ID Standardization**: Chuyển tất cả sang UUID hay giữ int ở một số nơi? Cần consistency nghiêm ngặt.
6. **Redis Usage**: Cart service dùng cả Redis và PostgreSQL. Cần làm rõ strategy — Redis là cache hay primary storage?

---

*Document generated by Software Architect / Backend Architect Agent*
*Last updated: 16 May 2026*
