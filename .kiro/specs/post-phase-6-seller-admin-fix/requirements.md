# Requirements Document

## Introduction

Sau Phase 6 (Buyer Marketplace UI), cần audit và sửa hai nhóm vấn đề còn tồn đọng:

1. **Seller Register bị lỗi `name should not be empty`** — Backend `RegisterDto` yêu cầu field `name` không được rỗng, nhưng `auth-api.ts` hiện tại gửi `name: payload.fullName || ''`, cho phép empty string hoặc chuỗi chỉ có khoảng trắng lọt qua.

2. **Admin Console còn dùng ngôn ngữ single-store** — Ba vị trí trong `AdminShell.tsx` và `admin/page.tsx` vẫn dùng wording của single-store thay vì marketplace/platform context.

Spec này chỉ bao gồm các thay đổi nhỏ, có phạm vi rõ ràng, không ảnh hưởng đến Buyer Marketplace UI (Phase 6), Seller Center (Phase 4B), hay Admin pages (Phase 5).

## Glossary

- **Seller_Register_Form**: Form đăng ký tài khoản seller tại `/seller/register`
- **Auth_API**: Module `my-app/lib/seller/auth-api.ts` — xử lý gọi API auth cho seller
- **Auth_Context**: Module `my-app/lib/seller/auth-context.tsx` — React context quản lý trạng thái đăng nhập seller
- **RegisterDto**: Data Transfer Object phía backend yêu cầu field `name: string` với `@IsNotEmpty()`
- **Admin_Shell**: Component `my-app/components/admin/AdminShell.tsx` — layout wrapper cho toàn bộ Admin Console
- **Admin_Dashboard**: Trang `my-app/app/admin/page.tsx` — trang tổng quan của Admin Console
- **fullName**: Tên đầy đủ do người dùng nhập vào Seller_Register_Form
- **trimmed_name**: Giá trị `fullName` sau khi đã loại bỏ khoảng trắng đầu/cuối bằng `.trim()`

## Requirements

### Requirement 1: Seller Register — Trim và validate `fullName` trước khi gửi

**User Story:** Là một seller muốn đăng ký tài khoản, tôi muốn hệ thống xử lý đúng tên tôi nhập (kể cả khi có khoảng trắng thừa), để tôi không bị lỗi `name should not be empty` khi đăng ký.

#### Acceptance Criteria

1. WHEN `registerSeller()` được gọi với `payload.fullName` là chuỗi có khoảng trắng đầu/cuối, THE `Auth_API` SHALL gửi `name` đã được trim (loại bỏ khoảng trắng đầu/cuối) tới backend.
2. WHEN `registerSeller()` được gọi với `payload.fullName` là `undefined` hoặc `null`, THE `Auth_API` SHALL gửi `name` là chuỗi rỗng `''` tới backend.
3. WHEN `registerSeller()` được gọi với `payload.fullName` chỉ chứa khoảng trắng (ví dụ: `"   "`), THE `Auth_API` SHALL gửi `name` là chuỗi rỗng `''` sau khi trim.
4. WHEN `Seller_Register_Form` submit với `fullName` hợp lệ (không rỗng sau trim), THE `Auth_API` SHALL gửi request tới backend với `name` là trimmed_name.
5. IF backend trả về lỗi `"name should not be empty"`, THEN THE `Auth_Context` SHALL propagate lỗi đó lên UI để hiển thị cho người dùng.

### Requirement 2: Admin Console — Cập nhật wording header subtitle

**User Story:** Là một admin quản lý marketplace, tôi muốn Admin Console hiển thị ngôn ngữ phù hợp với platform/marketplace context, để giao diện nhất quán với vai trò thực tế của hệ thống.

#### Acceptance Criteria

1. THE `Admin_Shell` SHALL hiển thị subtitle trong header là `"Manage sellers, products, orders, and platform operations."` thay vì `"Manage catalog, orders, customers, and store operations."`.
2. THE `Admin_Shell` SHALL hiển thị link ở sidebar footer là `"Back to Marketplace"` thay vì `"Back to Store"`.

### Requirement 3: Admin Dashboard — Cập nhật label stat "Customers" thành "Users"

**User Story:** Là một admin quản lý marketplace, tôi muốn stat card trên dashboard hiển thị đúng nhãn "Users" thay vì "Customers", để phản ánh đúng rằng đây là platform với nhiều loại người dùng.

#### Acceptance Criteria

1. THE `Admin_Dashboard` SHALL hiển thị stat card với label `"Users"` thay vì `"Customers"` cho số lượng người dùng trong hệ thống.
2. THE `Admin_Dashboard` SHALL giữ nguyên `href: "/admin/users"` cho stat card đó.

### Requirement 4: Build không bị lỗi sau khi sửa

**User Story:** Là một developer, tôi muốn đảm bảo các thay đổi không làm vỡ build, để không ảnh hưởng đến các tính năng đã hoàn thành.

#### Acceptance Criteria

1. WHEN các thay đổi được áp dụng, THE `my-app` SHALL build thành công với lệnh `npm run build` (không có TypeScript error, không có ESLint error gây fail build).
2. WHEN các thay đổi được áp dụng, THE `my-app` SHALL không có regression trên các route của Buyer Marketplace UI (`/`, `/products`, `/cart`, `/checkout`).
3. WHEN các thay đổi được áp dụng, THE `my-app` SHALL không có regression trên các route của Seller Center (`/seller/dashboard`, `/seller/products`, `/seller/orders`).
4. WHEN các thay đổi được áp dụng, THE `my-app` SHALL không có regression trên các route của Admin Console (`/admin`, `/admin/products`, `/admin/orders`, `/admin/users`).
