# Implementation Plan: Post Phase 6 — Seller Auth Fix + Admin Console Wording

## Overview

Triển khai 4 thay đổi nhỏ trên 3 file để sửa lỗi Seller Register payload và cập nhật wording Admin Console từ single-store sang marketplace context. Tổng cộng chỉ có 4 dòng code thay đổi, rủi ro thấp.

## Tasks

- [x] 1. Sửa `auth-api.ts` — Thêm `.trim()` vào `name` field trong `registerSeller()`
  - Mở file `my-app/lib/seller/auth-api.ts`
  - Trong hàm `registerSeller()`, tìm dòng `name: payload.fullName || '',`
  - Đổi thành `name: (payload.fullName || '').trim(),`
  - Đây là thay đổi 1 dòng duy nhất, không ảnh hưởng đến bất kỳ logic nào khác
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 1.1 Viết property test cho trim logic (Property 1)
    - **Property 1: Trim whitespace trong name field**
    - **Validates: Requirements 1.1, 1.2, 1.3**
    - Dùng `fast-check`, generate strings bao gồm: chuỗi bất kỳ, whitespace-only, undefined, null
    - Verify `(fullName || '').trim()` trả về đúng giá trị trong mọi trường hợp
    - Đặt test tại `my-app/lib/seller/__tests__/auth-api.test.ts`

  - [ ]* 1.2 Viết property test cho registerSeller request body (Property 2)
    - **Property 2: registerSeller gửi trimmed name trong request body**
    - **Validates: Requirements 1.4**
    - Mock `global.fetch`, generate valid non-empty fullName strings
    - Verify `body.name === fullName.trim()` trong mọi trường hợp
    - Đặt test tại `my-app/lib/seller/__tests__/auth-api.test.ts`

  - [ ]* 1.3 Viết unit tests cho edge cases
    - Test `registerSeller({ fullName: undefined })` → `name = ''`
    - Test `registerSeller({ fullName: '   ' })` → `name = ''` (whitespace-only)
    - Test error propagation: mock fetch trả về 400 → verify throws đúng message
    - _Requirements: 1.2, 1.3, 1.5_

- [x] 2. Sửa `AdminShell.tsx` — Cập nhật 2 chuỗi wording
  - Mở file `my-app/components/admin/AdminShell.tsx`
  - **Thay đổi 1 — Header subtitle:** Tìm dòng `Manage catalog, orders, customers, and store operations.` và đổi thành `Manage sellers, products, orders, and platform operations.`
  - **Thay đổi 2 — Sidebar footer link:** Tìm dòng `Back to Store` và đổi thành `Back to Marketplace`
  - Không thay đổi className, href, hay bất kỳ logic nào khác
  - _Requirements: 2.1, 2.2_

  - [ ]* 2.1 Viết unit tests cho AdminShell wording
    - Render `AdminChrome` component (hoặc kiểm tra string literals trực tiếp)
    - Verify subtitle text = `"Manage sellers, products, orders, and platform operations."`
    - Verify sidebar link text = `"Back to Marketplace"`
    - _Requirements: 2.1, 2.2_

- [x] 3. Sửa `admin/page.tsx` — Đổi label stat "Customers" thành "Users"
  - Mở file `my-app/app/admin/page.tsx`
  - Trong mảng `stats`, tìm phần tử `{ label: "Customers", value: ..., href: "/admin/users" }`
  - Đổi `label: "Customers"` thành `label: "Users"`
  - Giữ nguyên `value` và `href: "/admin/users"`
  - _Requirements: 3.1, 3.2_

  - [ ]* 3.1 Viết unit test cho stats label
    - Verify mảng `stats` chứa `{ label: "Users", href: "/admin/users" }`
    - Verify mảng `stats` không còn chứa `{ label: "Customers" }`
    - _Requirements: 3.1, 3.2_

- [ ] 4. Checkpoint — Kiểm tra TypeScript types
  - Chạy TypeScript type check: `npx tsc --noEmit` trong `my-app/`
  - Đảm bảo không có type error mới được tạo ra
  - Nếu có lỗi, sửa trước khi tiếp tục
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có vấn đề phát sinh.

- [x] 5. Chạy build verification
  - Chạy `npm run build` trong thư mục `my-app/`
  - Verify build thành công (exit code 0)
  - Kiểm tra output không có TypeScript errors
  - Kiểm tra output không có ESLint errors gây fail build
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 6. Final checkpoint — Đảm bảo tất cả tests pass
  - Đảm bảo tất cả tests pass, hỏi người dùng nếu có vấn đề phát sinh.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1", "2", "3"] },
    { "wave": 2, "tasks": ["4"] },
    { "wave": 3, "tasks": ["5"] },
    { "wave": 4, "tasks": ["6"] }
  ]
}
```

## Notes

- Tasks đánh dấu `*` là optional và có thể bỏ qua để triển khai nhanh hơn
- Tổng cộng chỉ có **4 dòng code** thay đổi trên **3 file** — đây là fix nhỏ, rủi ro thấp
- Không có dependency mới, không có thay đổi kiến trúc
- Thứ tự tasks quan trọng: sửa code trước (1→2→3), type check (4), build (5)
- Property tests dùng thư viện `fast-check` — cần cài nếu chưa có: `npm install --save-dev fast-check`
