# Phase 1: API Contract

> **Ngày**: 16 May 2026
> **Phase**: 1 — Core Identity & Shop Foundation
> **Services**: authentication-service, user-service, store-service, api-gateway

---

## Conventions

- **Base URL**: `http://localhost:3000` (API Gateway)
- **Authentication**: JWT Bearer token (trừ public routes)
- **Content-Type**: `application/json`
- **User ID from header**: Gateway forward `x-user-id`, `x-user-role`, `x-user-email`
- **Error format**: NestJS default exception format

---

## 1. Authentication APIs

### 1.1 Customer/Seller Registration

```
POST /api/v1/auth/register
```

**Auth**: None (public)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "customer"   // optional, default: "customer"
}
```

**Responses**:

| Status | Body | Notes |
|--------|------|-------|
| 201 | `{ "accessToken": "...", "user": { "id": "uuid", "email": "...", "role": "customer" } }` | |
| 409 | `{ "statusCode": 409, "message": "Email already registered." }` | |
| 400 | NestJS validation errors | |

**Note**: `role` có thể là `"customer"` hoặc `"seller"`. Admin phải dùng endpoint riêng.

---

### 1.2 Customer/Seller Login

```
POST /api/v1/auth/login
```

**Auth**: None (public)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Responses**:

| Status | Body | Notes |
|--------|------|-------|
| 200 | `{ "accessToken": "...", "user": { "id": "uuid", "email": "...", "role": "customer" } }` | |
| 401 | `{ "statusCode": 401, "message": "Invalid credentials." }` | |

---

### 1.3 Admin Login

```
POST /api/v1/auth/admin/login
```

**Auth**: None (public)

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "AdminPassword123"
}
```

**Responses**:

| Status | Body | Notes |
|--------|------|-------|
| 200 | `{ "accessToken": "...", "user": { "id": "uuid", "email": "...", "role": "admin" } }` | |
| 401 | `{ "statusCode": 401, "message": "Invalid admin credentials." }` | |

---

### 1.4 Get Current Session

```
GET /api/v1/auth/admin/me
```

**Auth**: JWT Bearer (admin)

**Response 200**:
```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "role": "admin"
}
```

---

### 1.5 Admin Logout

```
POST /api/v1/auth/admin/logout
```

**Auth**: JWT Bearer (admin)

**Response 200**:
```json
{ "success": true }
```

---

## 2. User Profile APIs

### 2.1 Get My Buyer Profile

```
GET /api/v1/users/me/profile
```

**Auth**: JWT Bearer

**Response 200**:
```json
{
  "id": "uuid",
  "userId": "uuid",
  "fullName": "John Doe",
  "phone": "+84 123 456 789",
  "avatarUrl": null,
  "defaultAddressId": null,
  "createdAt": "2026-05-16T00:00:00.000Z",
  "updatedAt": "2026-05-16T00:00:00.000Z"
}
```

**Note**: Tạo buyer profile tự động nếu chưa có.

---

### 2.2 Update My Buyer Profile

```
PATCH /api/v1/users/me/profile
```

**Auth**: JWT Bearer

**Request Body**:
```json
{
  "fullName": "John Doe Updated",
  "phone": "+84 987 654 321",
  "avatarUrl": "https://..."
}
```

**Response 200**: Updated buyer profile object.

---

### 2.3 Get My Addresses

```
GET /api/v1/users/me/addresses
```

**Auth**: JWT Bearer

**Response 200**:
```json
[
  {
    "id": "uuid",
    "buyerProfileId": "uuid",
    "fullName": "John Doe",
    "phone": "+84 123 456 789",
    "province": "Ho Chi Minh City",
    "district": "District 1",
    "ward": "Ward Ben Nghe",
    "street": "123 Nguyen Hue",
    "isDefault": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

**Error 404**: `Buyer profile not found for user {userId}` (nếu user chưa có profile)

---

### 2.4 Create Address

```
POST /api/v1/users/me/addresses
```

**Auth**: JWT Bearer

**Request Body**:
```json
{
  "fullName": "John Doe",
  "phone": "+84 123 456 789",
  "province": "Ho Chi Minh City",
  "district": "District 1",
  "ward": "Ward Ben Nghe",
  "street": "123 Nguyen Hue",
  "isDefault": false
}
```

**Response 201**: Created address object.

**Note**: Nếu `isDefault: true`, tất cả address khác của user được set `isDefault: false`.

---

### 2.5 Update Address

```
PATCH /api/v1/users/me/addresses/:id
```

**Auth**: JWT Bearer

**Request Body** (partial):
```json
{
  "fullName": "Updated Name",
  "isDefault": true
}
```

**Response 200**: Updated address object.

**Error 404**: Address not found.

---

### 2.6 Delete Address

```
DELETE /api/v1/users/me/addresses/:id
```

**Auth**: JWT Bearer

**Response 200**:
```json
{ "success": true }
```

**Error 404**: Address not found.

---

## 3. Seller Profile APIs

### 3.1 Get My Seller Profile

```
GET /api/v1/seller/me/profile
```

**Auth**: JWT Bearer (role: seller | admin)

**Response 200**:
```json
{
  "id": "uuid",
  "userId": "uuid",
  "businessName": "My Shop",
  "phone": "+84 123 456 789",
  "taxId": null,
  "status": "pending",
  "createdAt": "2026-05-16T00:00:00.000Z",
  "updatedAt": "2026-05-16T00:00:00.000Z"
}
```

**Error 404**: `Seller profile not found for user {userId}`

**Note**: Seller profile được tạo bởi admin hoặc qua quy trình seller registration riêng (Phase 2).

---

### 3.2 Update My Seller Profile

```
PATCH /api/v1/seller/me/profile
```

**Auth**: JWT Bearer (role: seller | admin)

**Request Body** (partial):
```json
{
  "businessName": "Updated Shop Name",
  "phone": "+84 987 654 321"
}
```

**Response 200**: Updated seller profile object.

**Note**: Không cho phép tự sửa `status`, `userId`.

---

## 4. Shop APIs (Public)

### 4.1 List Approved Shops

```
GET /api/v1/shops
```

**Auth**: None (public)

**Query Params**:
- `page` (default: 1)
- `limit` (default: 20)

**Response 200**:
```json
{
  "items": [
    {
      "id": "uuid",
      "sellerId": "uuid",
      "name": "Fashion Store",
      "slug": "fashion-store",
      "logoUrl": "https://...",
      "bannerUrl": null,
      "description": "Best fashion shop",
      "contactEmail": "contact@fashion-store.com",
      "contactPhone": "+84 123 456 789",
      "address": "123 Nguyen Hue, District 1, HCMC",
      "status": "approved",
      "commissionRate": "0.00",
      "rejectionReason": null,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

**Note**: Chỉ trả về shops có `status = 'approved'`.

---

### 4.2 Get Shop by Slug

```
GET /api/v1/shops/:slug
```

**Auth**: None (public)

**Response 200**: Single shop object (status must be `approved`).

**Error 404**: `Shop not found.`

---

## 5. Seller Shop APIs

### 5.1 Create My Shop

```
POST /api/v1/seller/shop
```

**Auth**: JWT Bearer (role: seller | admin)

**Request Body**:
```json
{
  "name": "My Fashion Shop",
  "slug": "my-fashion-shop",
  "description": "Best fashion shop in town",
  "contactEmail": "contact@myfashionshop.com",
  "contactPhone": "+84 123 456 789",
  "address": "123 Main Street, District 1, HCMC"
}
```

**Response 201**: Created shop object.

**Errors**:
| Status | Message | Scenario |
|--------|---------|---------|
| 409 | `Seller already has a shop.` | Seller đã có shop |
| 409 | `Shop slug already exists.` | Slug trùng |
| 403 | `ForbiddenException` | Không có quyền seller |

**Note**: Shop được tạo với `status = 'pending'` mặc định.

---

### 5.2 Get My Shop

```
GET /api/v1/seller/shop
```

**Auth**: JWT Bearer (role: seller | admin)

**Response 200**: Single shop object (seller thấy cả shop đang pending/rejected).

**Error 404**: `Shop not found for this seller.`

---

### 5.3 Update My Shop

```
PATCH /api/v1/seller/shop
```

**Auth**: JWT Bearer (role: seller | admin)

**Request Body** (partial):
```json
{
  "name": "Updated Shop Name",
  "description": "Updated description",
  "logoUrl": "https://..."
}
```

**Response 200**: Updated shop object.

**Note**: Không cho phép seller tự sửa `status`, `sellerId`, `commissionRate`.

---

## 6. Admin User APIs

### 6.1 List All Users

```
GET /api/v1/admin/users
```

**Auth**: JWT Bearer (role: admin)

**Response 200**:
```json
{
  "items": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "customer",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 1
}
```

---

### 6.2 Get User by ID

```
GET /api/v1/admin/users/:id
```

**Auth**: JWT Bearer (role: admin)

**Response 200**: Single user object.

**Error 404**: `User with id "{id}" was not found.`

---

### 6.3 Update User Status

```
PATCH /api/v1/admin/users/:id/status
```

**Auth**: JWT Bearer (role: admin)

**Request Body**:
```json
{ "isActive": false }
```

**Response 200**: Updated user object.

---

### 6.4 Update User Role

```
PATCH /api/v1/admin/users/:id/role
```

**Auth**: JWT Bearer (role: admin)

**Request Body**:
```json
{ "role": "seller" }
```

**Response 200**: Updated user object.

**Error 400**: `Invalid role. Must be one of: customer, seller, admin`

---

## 7. Admin Seller Profile APIs

### 7.1 List All Seller Profiles

```
GET /api/v1/admin/seller-profiles
```

**Auth**: JWT Bearer (role: admin)

**Response 200**: Array of seller profile objects.

---

### 7.2 Get Seller Profile by ID

```
GET /api/v1/admin/seller-profiles/:id
```

**Auth**: JWT Bearer (role: admin)

**Response 200**: Single seller profile object.

**Error 404**: `Seller profile {id} not found`

---

### 7.3 Update Seller Profile Status

```
PATCH /api/v1/admin/seller-profiles/:id/status
```

**Auth**: JWT Bearer (role: admin)

**Request Body**:
```json
{ "status": "approved" }
```

**Valid statuses**: `"pending"`, `"approved"`, `"rejected"`, `"suspended"`

**Response 200**: Updated seller profile object.

---

## 8. Admin Shop APIs

### 8.1 List All Shops

```
GET /api/v1/admin/shops
```

**Auth**: JWT Bearer (role: admin)

**Query Params**:
- `page` (default: 1)
- `limit` (default: 20)
- `status` (optional): `"pending"`, `"approved"`, `"rejected"`, `"suspended"`

**Response 200**:
```json
{
  "items": [...],
  "total": 5,
  "page": 1,
  "limit": 20
}
```

---

### 8.2 Get Shop by ID

```
GET /api/v1/admin/shops/:id
```

**Auth**: JWT Bearer (role: admin)

**Response 200**: Single shop object (bất kể status nào).

---

### 8.3 Update Shop (Admin)

```
PATCH /api/v1/admin/shops/:id
```

**Auth**: JWT Bearer (role: admin)

**Request Body** (partial):
```json
{
  "name": "Updated Name",
  "commissionRate": 10.5
}
```

**Response 200**: Updated shop object.

---

### 8.4 Approve Shop

```
PATCH /api/v1/admin/shops/:id/approve
```

**Auth**: JWT Bearer (role: admin)

**Response 200**: Shop object với `status: "approved"`.

---

### 8.5 Reject Shop

```
PATCH /api/v1/admin/shops/:id/reject
```

**Auth**: JWT Bearer (role: admin)

**Request Body** (optional):
```json
{ "rejectionReason": "Invalid business registration" }
```

**Response 200**: Shop object với `status: "rejected"`.

---

### 8.6 Suspend Shop

```
PATCH /api/v1/admin/shops/:id/suspend
```

**Auth**: JWT Bearer (role: admin)

**Response 200**: Shop object với `status: "suspended"`.

---

### 8.7 Restore Shop

```
PATCH /api/v1/admin/shops/:id/restore
```

**Auth**: JWT Bearer (role: admin)

**Response 200**: Shop object với `status: "approved"`.

---

## 9. Error Codes Reference

| HTTP Status | NestJS Exception | Description |
|-------------|------------------|-------------|
| 400 | BadRequestException | Validation failed, invalid role |
| 401 | UnauthorizedException | Invalid/missing JWT |
| 403 | ForbiddenException | Role not allowed |
| 404 | NotFoundException | Resource not found |
| 409 | ConflictException | Duplicate resource (email, slug, shop) |
| 500 | InternalServerErrorException | Unexpected error |

---

*Document generated by Software Architect / Backend Architect Agent*
*Last updated: 16 May 2026*
