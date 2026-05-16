# Security Testing

## Mục tiêu kiểm thử
- Đánh giá authentication, authorization, token/session handling, input validation, injection, XSS, CSRF/CORS, sensitive data exposure, upload security và security headers.
- Chỉ kiểm thử an toàn trên local/dev, không thực hiện hành vi phá hoại.

## Phạm vi kiểm thử
- Admin auth JWT: `POST /api/v1/auth/admin/login`, cookie frontend `admin_session`, gateway guards.
- Gateway route guards: admin, seller/admin, optional JWT, protected user/inventory/notification.
- Direct service exposure qua ports `3001-3008`.
- Frontend localStorage flows: user/seller/cart.

## Security test cases
| ID | Hạng mục | Test case chi tiết | Expected result | Priority | Status | Rủi ro/Ghi chú |
|---|---|---|---|---|---|---|
| SEC-001 | Admin login brute force | Gửi nhiều login sai liên tiếp | Not found: chưa thấy rate limit; ghi nhận rủi ro | High | Not Started | Cần rate limit/lockout nếu production |
| SEC-002 | Password handling | Kiểm tra DB `auth_users.password_hash` | Password được hash bcrypt, không lưu plain text | High | Not Started | Source dùng `bcrypt.hash(password,10)` |
| SEC-003 | Invalid credential message | Login sai email và sai password | Message chung, không user enumeration | High | Not Started | Source trả `Invalid admin credentials.` |
| SEC-004 | JWT required | Gọi protected admin/user/inventory/notification không token | 401 | High | Not Started | Gateway guard |
| SEC-005 | JWT expired | Dùng token hết hạn | 401 | High | Not Started | Passport JWT `ignoreExpiration:false` |
| SEC-006 | JWT tampered | Sửa payload token role admin | 401 | High | Not Started | Signature verify bằng `JWT_SECRET` |
| SEC-007 | Forbidden role | Customer token gọi `/api/v1/admin/products` | 403 `Admin role is required.` | High | Not Started | AdminRoleGuard |
| SEC-008 | Seller/admin role | Guest/customer gọi `/api/v1/admin/orders` | 403 | High | Not Started | SellerOrAdminRoleGuard |
| SEC-009 | Header spoofing | Gửi `x-user-role: admin` không JWT tới admin products | Không bypass, 401/403 | High | Not Started | AdminRoleGuard chỉ đọc request.user |
| SEC-010 | Header spoofing seller | Gửi `x-user-role:seller` tới admin orders không JWT | Kiểm tra có bypass không | High | Not Started | SellerOrAdminRoleGuard đọc header; rủi ro nếu public |
| SEC-011 | Cookie handling | Kiểm cookie `admin_session` sau login UI | HttpOnly/Secure/SameSite cần xác minh | High | Not Started | Cần đọc `session.ts`; middleware chỉ check tồn tại |
| SEC-012 | Admin route fake cookie | Tự set cookie random vào `/admin` | UI vào được route nhưng API phải fail 401 | High | Not Started | Middleware không verify token |
| SEC-013 | CSRF admin | Thử request cross-site state-changing với cookie | Request không được thực thi trái phép | High | Not Started | API auth dùng Bearer trong fetch, cần xác minh cookie không tự gửi API |
| SEC-014 | CORS | Kiểm origin lạ với credentials | Production không nên allow tùy ý | High | Not Started | Gateway `origin:true`, credentials true |
| SEC-015 | Sensitive data exposure | Admin users response | Không trả `passwordHash`, `refreshToken` | High | Not Started | AuthService map response an toàn |
| SEC-016 | Env leakage | Tìm `.env` trong repo/deploy output | Không public secret; `.env` hiện tồn tại trong repo local | High | Not Started | Cần bảo vệ git/deploy |
| SEC-017 | Error leakage | Downstream error/validation error | Không lộ stack trace/secret | High | Not Started | Proxy trả `error.message` |
| SEC-018 | SQL injection | Query/body chứa `' OR 1=1 --` | Không thay đổi kết quả, validation/ORM safe | High | Not Started | TypeORM/DTO nhưng một số string query cần test |
| SEC-019 | NoSQL injection | Product search/category chứa object/operator payload | Không bypass query | High | Not Started | Product dùng MongoDB |
| SEC-020 | XSS product fields | Tạo product name/description `<script>alert(1)</script>` | UI encode, không execute script | High | Not Started | React escape mặc định, cần kiểm dangerouslySetInnerHTML not found |
| SEC-021 | XSS search | Search query chứa HTML/JS | Không execute, URL render an toàn | High | Not Started | Query reflected trong UI cần kiểm |
| SEC-022 | File upload type | Upload `.txt`, SVG, fake MIME, polyglot | Chỉ JPG/PNG/WEBP, reject invalid | High | Not Started | Source kiểm mimetype và size |
| SEC-023 | File upload size | Upload >5MB | 400 `Image file size must be 5MB or smaller.` | High | Not Started | Có check 5MB |
| SEC-024 | File upload auth | Gọi upload qua gateway không token | Xác minh có cần admin không | High | Not Started | Upload nằm dưới public products route ở gateway |
| SEC-025 | Product public mutation | POST/PATCH/DELETE `/api/v1/products` không token | Nếu production, phải reject; hiện gateway public | High | Not Started | Rủi ro lớn |
| SEC-026 | Direct service bypass | Gọi direct product/admin endpoints không qua gateway | Không nên public trong production | High | Not Started | Docker expose nhiều ports |
| SEC-027 | IDOR orders | User A gọi order User B | 403/404 hoặc không lộ dữ liệu | High | Not Started | Need auth ownership |
| SEC-028 | IDOR cart | User A/guest token đọc cart khác | Không truy cập được | High | Not Started | Owner key headers |
| SEC-029 | Payment amount tampering | Gửi amount thấp hơn cart/order | Server phải xác minh amount, không tin client | High | Not Started | Payment body nhận amount trực tiếp |
| SEC-030 | Inventory tampering | Customer gọi inventory update | 401/403 qua gateway | High | Not Started | Direct service cần không public |
| SEC-031 | Security headers | Kiểm HTTPS/HSTS/CSP/X-Frame-Options | Có header production phù hợp | Medium | Not Started | Chưa thấy config security headers |
| SEC-032 | HTTPS | Kiểm deploy dùng HTTPS | HTTPS bắt buộc production | High | Not Started | Local HTTP acceptable |

## Input validation focus
| API | Payload nguy cơ | Expected result | Priority | Status |
|---|---|---|---|---|
| Product create/update | HTML/script, SQL/NoSQL strings, very long strings, negative price | 400 hoặc lưu an toàn/escape khi render | High | Not Started |
| Cart item | Negative quantity/unitPrice, huge quantity | 400, không làm âm tổng tiền | High | Not Started |
| Order create | Empty items, negative totalAmount, mismatched item total | 400, server recompute nếu có inventory/catalog | High | Not Started |
| Payment intent | Negative amount, currency invalid, arbitrary orderId | 400, order ownership check | High | Not Started |
| Inventory update | Negative stock, string stock | 400 | High | Not Started |

## Rủi ro bảo mật lớn
- Public product mutation endpoints qua `/api/v1/products` nếu không có guard là rủi ro cao.
- Gateway CORS `origin: true` + `credentials: true` cần review trước production.
- Seller/admin order guard chấp nhận `x-user-role` header, cần kiểm tra khả năng bypass khi không có JWT.
- Middleware admin route chỉ kiểm tra cookie tồn tại; token giả vẫn vào UI, dù API có thể chặn.
- Direct service ports expose trên host; production cần network isolation.
- Rate limiting chưa thấy trong source.
