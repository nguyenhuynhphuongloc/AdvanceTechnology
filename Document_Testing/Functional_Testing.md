# Functional Testing

## Mục tiêu kiểm thử
- Xác minh các chức năng người dùng, admin, seller và guest hoạt động đúng theo source code hiện tại.
- Bao phủ trạng thái thành công, validation lỗi, empty state, loading state, error state và phân quyền.

## Phạm vi kiểm thử
- Frontend: Next.js `my-app` trên port `3009`.
- Backend qua API Gateway: `http://localhost:3000/api/v1/*`.
- Các service liên quan: authentication, product, cart, order, inventory, payment, notification.
- Không kiểm thử destructive ngoài môi trường local/dev.

## Chức năng/page liên quan
| Nhóm | Page/Module | Bằng chứng source | Ghi chú |
|---|---|---|---|
| Trang chủ | `/`, `/HomePage` | `my-app/app/page.tsx`, `my-app/app/HomePage/page.tsx` | Storefront/catalog entry |
| Tìm kiếm | `/search` | `my-app/app/search/page.tsx` | Query `search`, `category`, `sort`, `page` |
| Catalog | `/products`, `/product` | `my-app/app/products/page.tsx`, `my-app/app/product/page.tsx` | Có route cũ và route mới |
| Chi tiết sản phẩm | `/products/[slug]`, `/product/[slug]` | App Router dynamic route | Có related products |
| Cart | `/product/cart` | `my-app/app/product/cart/page.tsx` | Guest token/localStorage + backend cart |
| Checkout | `/product/checkout` | `my-app/app/product/checkout/page.tsx` | Có Stripe publishable key và create order |
| Account | `/login`, `/register`, `/product/account` | `AccountPageClient`, `auth-context.tsx` | Auth client-side localStorage, không thấy API register/login user |
| Admin login | `/admin/login` | `AdminLoginPage`, middleware | JWT lưu cookie `admin_session` |
| Admin dashboard | `/admin`, `/admin/products` | `AdminDashboard`, `AdminProductsManager` | Product, order, inventory, user widgets |
| Seller | `/seller/*` | `my-app/app/seller/...` | Login/register/profile/products/orders dùng localStorage + product API |
| Chat | `/product/chat` | `my-app/app/product/chat/page.tsx` | Gọi webhook n8n |
| Quên mật khẩu | Not found in current project | Không thấy route/API forgot password | Ghi nhận ngoài phạm vi hiện tại |

## Role/User Permission
| Role | Bằng chứng | Quyền dự kiến cần kiểm thử |
|---|---|---|
| Guest | cart dùng `x-guest-token`, localStorage | Browse, search, cart, checkout guest |
| User/customer | `auth_users.role` default `customer`, localStorage `acme_user` | Account/cart/order history, nhưng user auth API thật chưa thấy |
| Seller | `SellerOrAdminRoleGuard`, `/seller/*` | Quản lý sản phẩm/order seller, nhiều phần client-side/localStorage |
| Admin | `AdminRoleGuard`, `auth/admin/login` | Admin products, inventory, orders, users |

## Luồng nghiệp vụ chính
```text
Guest/User
  -> Home/Catalog/Search
  -> Product detail
  -> Select variant
  -> Add to cart
  -> Checkout
  -> Order created
  -> Payment intent / order status

Admin
  -> /admin/login
  -> JWT cookie admin_session
  -> /admin/products, /admin/inventory, /admin/orders, /admin/users
  -> CRUD product / update inventory / view orders-users

Seller
  -> /seller/login or /seller/register
  -> Dashboard
  -> Create/edit/delete own products
  -> Manage orders/profile
```

## Test scenarios và test cases
| ID | Scenario | Test case chi tiết | Dữ liệu test đề xuất | Expected result | Priority | Status | Rủi ro/Ghi chú |
|---|---|---|---|---|---|---|---|
| FUNC-001 | Trang chủ | Mở `/`, kiểm tra hero, featured assets, latest catalog arrivals | Browser desktop/mobile | Page render không crash, dữ liệu catalog hiển thị hoặc error state rõ ràng | High | Not Started | Phụ thuộc API gateway/product-service |
| FUNC-002 | Catalog listing | Mở `/products`, đổi category/sort/page | `search=shirt`, `sort=price-asc`, `page=2` | URL/query cập nhật, danh sách đúng, pagination ổn định | High | Not Started | Cần dữ liệu seed |
| FUNC-003 | Search | Mở `/search?search=abc`, lọc category, sort | Từ khóa có/không có kết quả | Có kết quả hoặc empty state đúng | High | Not Started | Legacy `q`, `collection` cần regression |
| FUNC-004 | Product detail | Mở `/products/{slug}` hợp lệ | slug sản phẩm có gallery/variants | Hiển thị ảnh, giá, size/color, related products | High | Not Started | Kiểm tra slug 404/error |
| FUNC-005 | Variant selection | Chọn size/color trước khi add cart | size M, color Black | State variant được chọn, giá/ảnh nếu có override được cập nhật | High | Not Started | Cần kiểm stock theo variant |
| FUNC-006 | Add to cart guest | Guest thêm sản phẩm vào cart | `variantId`, quantity 1 | Cart tăng số lượng, localStorage/backend sync | High | Not Started | Guest token trong localStorage |
| FUNC-007 | Cart update/remove | Vào `/product/cart`, tăng/giảm/xóa item, clear cart | 1-3 item | Tổng tiền, quantity, empty state đúng | High | Not Started | Boundary quantity 0/âm |
| FUNC-008 | Checkout success | Checkout với cart hợp lệ | paymentMethod, totalAmount, items, email | Tạo order, chuyển trạng thái thanh toán/thành công | High | Not Started | Stripe key/env có thể thiếu |
| FUNC-009 | Checkout failure | Mô phỏng `simulatePaymentFailure=true` nếu API hỗ trợ | Cart hợp lệ | Hiển thị order failed, không mất dữ liệu bất ngờ | Medium | Not Started | Cần xác nhận UI có expose flag không |
| FUNC-010 | Login user | Mở `/login`, nhập email/password | User mẫu | Login localStorage thành công nếu đúng local client auth | Medium | Not Started | Không thấy backend user login API |
| FUNC-011 | Register user | Mở `/register`, tạo user mới | email mới, password | User lưu localStorage, chuyển trạng thái logged-in | Medium | Not Started | Không có server-side validation |
| FUNC-012 | Logout user | Logged-in user bấm logout | User localStorage | localStorage `acme_user` bị xóa, UI về guest | Medium | Not Started | Cần kiểm cart merge |
| FUNC-013 | Forgot password | Kiểm tra route/chức năng quên mật khẩu | N/A | Not found in current project | Low | Not Started | Không có bằng chứng source |
| FUNC-014 | Admin protected route | Truy cập `/admin` khi chưa login | Không cookie | Redirect `/admin/login?redirect=/admin` | High | Not Started | Middleware chỉ kiểm tra tồn tại cookie, chưa verify token ở edge |
| FUNC-015 | Admin login success | Login admin hợp lệ | `ADMIN_EMAIL`, `ADMIN_PASSWORD` từ env local | Cookie `admin_session` được set, redirect `/admin` | High | Not Started | Cần env admin |
| FUNC-016 | Admin login invalid | Sai email/password | invalid@example.com/wrong | Error message, không set cookie | High | Not Started | Không lộ thông tin user tồn tại |
| FUNC-017 | Admin product create | Tạo product đầy đủ: image, variants, related | name, slug, sku, categorySlug, basePrice, mainImage, variants | Product tạo thành công và xuất hiện trong list | High | Not Started | Cloudinary env cho upload |
| FUNC-018 | Admin product validation | Submit thiếu name/slug/sku/description | Trống các field bắt buộc | UI báo lỗi, API trả 400 khi gọi trực tiếp | High | Not Started | `UpdateProductDto` kế thừa create nên PATCH có thể yêu cầu full body |
| FUNC-019 | Admin product update/delete | Sửa product, xóa product | Product ID hợp lệ | Dữ liệu cập nhật, xóa xong detail 404 | High | Not Started | Cần kiểm dữ liệu related/inventory còn dangling không |
| FUNC-020 | Admin inventory | Search inventory, update stock | sku, variantId, stock 0/10 | List/filter đúng, stock cập nhật | High | Not Started | DTO inventory thiếu validator |
| FUNC-021 | Admin orders | Mở dashboard/orders | Có order | List/detail hiển thị, approve/deliver nếu UI expose | Medium | Not Started | README cũ nói thiếu, code hiện có endpoint |
| FUNC-022 | Admin users | Mở users widget/detail | Auth users | List/detail không lộ passwordHash/refreshToken | High | Not Started | Endpoint admin users có trong auth service |
| FUNC-023 | Seller register/login | Mở `/seller/register`, `/seller/login` | Seller test | Flow đăng nhập seller thành công hoặc ghi rõ mock/local | Medium | Not Started | Cần phân biệt auth thật vs localStorage |
| FUNC-024 | Seller products CRUD | Seller tạo/sửa/xóa product | sellerName, product body | Product gắn sellerName, list seller đúng | Medium | Not Started | API public product create/update/delete có vẻ không guard ở service trực tiếp |
| FUNC-025 | Empty states | Không có product/cart/order | Dataset rỗng | Empty state rõ ràng, không blank page | Medium | Not Started | Cần DB test rỗng |
| FUNC-026 | Error states | Tắt API gateway/product-service | Service down | UI hiển thị unavailable/error, không crash | High | Not Started | Gateway 502/504 cần kiểm |
| FUNC-027 | Loading states | Network throttling slow 3G | DevTools throttling | Loading page/skeleton hiển thị hợp lý | Medium | Not Started | Có `loading.tsx` cho products/search/detail |
| FUNC-028 | Upload file | Upload JPG/PNG/WEBP và file sai loại | 4MB image, 6MB image, `.txt` | Valid file success; invalid type/size trả lỗi | High | Not Started | Endpoint `/products/upload-image` |

## Dữ liệu test đề xuất
- Admin: email/password lấy từ `ADMIN_EMAIL`, `ADMIN_PASSWORD` trong env local.
- Product hợp lệ: slug unique, sku unique, categorySlug tồn tại, basePrice `0`, `199000`, `99999999`.
- Variant: size `S/M/L`, color `Black/White`, stock `0/1/1000`, priceOverride `0` và giá lớn.
- Cart/order: guestToken random UUID, items có `variantId`, `quantity` `1`, `2`, boundary `0`, `-1`.
- File upload: JPG/PNG/WEBP dưới 5MB, file trên 5MB, file `.txt`, image mime giả.

## Rủi ro/lỗi tiềm năng
- User/customer login/register thật không thấy API backend; frontend đang dùng localStorage.
- Seller flow có dấu hiệu dùng localStorage và gọi product API public, cần xác minh phân quyền.
- Middleware admin chỉ kiểm tra cookie tồn tại, quyền thật dựa vào API Gateway.
- Một số DTO như cart/inventory thiếu class-validator đầy đủ, dễ lọt invalid data nếu gọi trực tiếp service.
- Có route trùng `/product` và `/products`, cần regression để tránh lệch dữ liệu/UI.
