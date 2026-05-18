# Design Document

## Overview

Spec này bao gồm hai nhóm thay đổi nhỏ, có phạm vi rõ ràng:

1. **Seller Register payload fix** — Thêm `.trim()` vào `name` field trong `registerSeller()` để ngăn empty/whitespace string lọt qua validation của backend.
2. **Admin Console wording fix** — Đổi 3 chuỗi hardcoded từ single-store sang marketplace/platform context.

Tổng cộng có **4 dòng code** cần thay đổi trên **3 file**. Không có thay đổi kiến trúc, không có dependency mới.

## Architecture

```
my-app/
├── lib/seller/
│   └── auth-api.ts          ← FIX: thêm .trim() vào name field
├── components/admin/
│   └── AdminShell.tsx       ← FIX: 2 string changes (subtitle + sidebar link)
└── app/admin/
    └── page.tsx             ← FIX: 1 label change ("Customers" → "Users")
```

Không có thay đổi nào ảnh hưởng đến:
- `my-app/lib/seller/auth-context.tsx` — context đã đúng, chỉ truyền `fullName` xuống `auth-api.ts`
- `my-app/app/seller/register/page.tsx` — form đã có validation `fullName` required ở step 1
- Toàn bộ Buyer Marketplace UI (Phase 6)
- Toàn bộ Seller Center pages (Phase 4B)
- Toàn bộ Admin pages khác (Phase 5)

## Components and Interfaces

### 1. `auth-api.ts` — Hàm `registerSeller()`

**Vấn đề hiện tại:**

```typescript
// TRƯỚC (lỗi)
body: JSON.stringify({
  email: payload.email,
  password: payload.password,
  name: payload.fullName || '',   // ← nếu fullName = "  " thì name = "  " → backend reject
  role: payload.role || 'seller',
}),
```

**Sau khi sửa:**

```typescript
// SAU (đúng)
body: JSON.stringify({
  email: payload.email,
  password: payload.password,
  name: (payload.fullName || '').trim(),   // ← trim() loại bỏ whitespace đầu/cuối
  role: payload.role || 'seller',
}),
```

**Giải thích logic:**
- `payload.fullName || ''` — nếu `fullName` là `undefined`, `null`, hoặc empty string, fallback về `''`
- `.trim()` — loại bỏ khoảng trắng đầu/cuối; nếu chuỗi chỉ có whitespace thì kết quả là `''`
- Kết quả: backend nhận `name = ''` thay vì `name = "   "` → backend reject đúng với `"name should not be empty"`, nhưng đây là behavior đúng (form đã validate required ở step 1)

**Lưu ý:** Không cần thêm validation trong `auth-api.ts` vì `Seller_Register_Form` đã validate `fullName` required trước khi gọi `register()`. Fix này chỉ đảm bảo payload luôn clean.

---

### 2. `AdminShell.tsx` — Header subtitle

**Vị trí:** Trong component `AdminChrome`, phần `<header>`, thẻ `<p>` dưới breadcrumb.

**Trước:**
```tsx
<p className="mt-1 truncate text-sm text-admin-muted">
  Manage catalog, orders, customers, and store operations.
</p>
```

**Sau:**
```tsx
<p className="mt-1 truncate text-sm text-admin-muted">
  Manage sellers, products, orders, and platform operations.
</p>
```

---

### 3. `AdminShell.tsx` — Sidebar footer link

**Vị trí:** Trong component `AdminChrome`, phần `<aside>`, sidebar footer `<div>`.

**Trước:**
```tsx
<Link
  href="/"
  className="flex rounded-lg px-3 py-2 text-sm font-semibold text-admin-muted transition hover:bg-admin-surface-muted hover:text-admin-text"
>
  Back to Store
</Link>
```

**Sau:**
```tsx
<Link
  href="/"
  className="flex rounded-lg px-3 py-2 text-sm font-semibold text-admin-muted transition hover:bg-admin-surface-muted hover:text-admin-text"
>
  Back to Marketplace
</Link>
```

---

### 4. `admin/page.tsx` — Stats array label

**Vị trí:** Trong `AdminDashboardPage`, mảng `stats`, phần tử thứ 4.

**Trước:**
```tsx
{ label: "Customers", value: String(usersRes.total || usersRes.items.length), href: "/admin/users" },
```

**Sau:**
```tsx
{ label: "Users", value: String(usersRes.total || usersRes.items.length), href: "/admin/users" },
```

## Data Models

Không có thay đổi về data model. Các thay đổi chỉ là:
- String transformation trong API call (`auth-api.ts`)
- String literals trong JSX/TSX (`AdminShell.tsx`, `admin/page.tsx`)

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Sau khi phân tích prework, các acceptance criteria của spec này chủ yếu là string literal changes (EXAMPLE/SMOKE) và một số logic xử lý chuỗi (PROPERTY). Chỉ có các criteria liên quan đến `registerSeller()` đủ điều kiện cho property-based testing.

**Property Reflection:**
- Criteria 1.1 (trim whitespace) và 1.3 (whitespace-only → '') đều test cùng một hành vi: `(s || '').trim()` phải trả về đúng giá trị. Hai property này có thể gộp thành một property tổng quát hơn.
- Criteria 1.4 (valid fullName → trimmed name trong request body) là property riêng biệt, test integration với fetch.
- Sau reflection: giữ lại 2 properties, loại bỏ redundancy.

### Property 1: Trim whitespace trong name field

*For any* chuỗi `fullName` (bao gồm chuỗi có khoảng trắng đầu/cuối, chuỗi chỉ có whitespace, hoặc undefined/null), giá trị `name` được tính bởi `(fullName || '').trim()` phải bằng `fullName.trim()` nếu fullName là non-null string, hoặc `''` nếu fullName là falsy.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: registerSeller gửi trimmed name trong request body

*For any* `RegisterPayload` với `fullName` là chuỗi hợp lệ (non-empty sau trim), khi `registerSeller()` được gọi, field `name` trong JSON body của HTTP request phải bằng `fullName.trim()`.

**Validates: Requirements 1.4**

## Error Handling

### Seller Register
- Nếu `fullName` sau trim là `''` → backend trả về `400 Bad Request` với `"name should not be empty"` → `registerSeller()` throw `Error("name should not be empty")` → `Auth_Context.register()` propagate lên UI → form hiển thị error message.
- Đây là behavior đúng và mong muốn — form đã validate required ở step 1, nên trường hợp này chỉ xảy ra nếu validation bị bypass.

### Admin Console
- Không có error handling mới — chỉ là string changes.

## Testing Strategy

### Phân loại test

Dựa trên prework analysis:

| Criteria | Classification | Loại test |
|----------|---------------|-----------|
| 1.1 Trim whitespace | PROPERTY | Property-based test |
| 1.2 undefined/null → '' | EDGE_CASE | Unit test |
| 1.3 Whitespace-only → '' | PROPERTY | Property-based test (gộp với 1.1) |
| 1.4 Valid fullName → trimmed body | PROPERTY | Property-based test |
| 1.5 Error propagation | EXAMPLE | Unit test |
| 2.1 Header subtitle | EXAMPLE | Unit test (render check) |
| 2.2 Sidebar link text | EXAMPLE | Unit test (render check) |
| 3.1 + 3.2 Stats label | EXAMPLE | Unit test |
| 4.x Build/regression | SMOKE | `npm run build` |

### Property-Based Testing

Sử dụng thư viện **fast-check** (phổ biến trong TypeScript/Next.js ecosystem).

**Cấu hình:** Mỗi property test chạy tối thiểu 100 iterations.

**Tag format:** `Feature: post-phase-6-seller-admin-fix, Property {N}: {property_text}`

#### Property 1: Trim whitespace trong name field

```typescript
// Feature: post-phase-6-seller-admin-fix, Property 1: Trim whitespace trong name field
import * as fc from 'fast-check';

test('Property 1: (fullName || "").trim() luôn trả về đúng trimmed value', () => {
  fc.assert(
    fc.property(
      fc.oneof(
        fc.string(),
        fc.stringOf(fc.constantFrom(' ', '\t', '\n')),
        fc.constant(undefined),
        fc.constant(null),
      ),
      (fullName: string | undefined | null) => {
        const result = (fullName || '').trim();
        if (!fullName) {
          expect(result).toBe('');
        } else {
          expect(result).toBe(fullName.trim());
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

#### Property 2: registerSeller gửi trimmed name

```typescript
// Feature: post-phase-6-seller-admin-fix, Property 2: registerSeller gửi trimmed name trong request body
import * as fc from 'fast-check';

test('Property 2: registerSeller gửi name = fullName.trim() trong request body', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
      async (fullName: string) => {
        const mockFetch = jest.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ accessToken: 'tok', user: { id: '1', email: 'a@b.com', role: 'seller' } }),
        });
        global.fetch = mockFetch;

        await registerSeller({ email: 'test@test.com', password: 'pass', fullName });

        const body = JSON.parse(mockFetch.mock.calls[0][1].body);
        expect(body.name).toBe(fullName.trim());
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Tests

- `registerSeller({ fullName: undefined })` → `name = ''`
- `registerSeller({ fullName: '  ' })` → `name = ''`
- Mock fetch trả về 400 → `registerSeller()` throws với đúng message
- Render `AdminChrome` → subtitle text đúng
- Render `AdminChrome` → sidebar link text = "Back to Marketplace"
- Stats array → `{ label: "Users", href: "/admin/users" }` tồn tại

### Smoke Tests

- `npm run build` trong `my-app/` → exit code 0
- Không có TypeScript errors
- Không có ESLint errors gây fail build
