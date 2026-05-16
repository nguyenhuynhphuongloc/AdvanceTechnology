# UX/UI Testing

## Mục tiêu kiểm thử
- Đánh giá tính nhất quán giao diện, khả năng dùng, responsive, accessibility cơ bản và trạng thái UI.
- Bao phủ storefront, product flow, cart/checkout, admin dashboard và seller area.

## Phạm vi kiểm thử
- Browser desktop: 1440x900, 1366x768.
- Tablet: 768x1024.
- Mobile: 390x844, 360x800.
- Trình duyệt: Chrome trước, sau đó Edge/Firefox nếu có thời gian.

## Page/screen liên quan
| Khu vực | Page | Component chính | Priority | Status |
|---|---|---|---|---|
| Storefront | `/`, `/HomePage` | `StorefrontHomePage`, Header/Footer | High | Not Started |
| Search | `/search` | `ProductGrid`, `CollectionsSidebar`, `SortSidebar` | High | Not Started |
| Catalog | `/products`, `/product` | Product list/card/pagination/sort | High | Not Started |
| Product detail | `/products/[slug]`, `/product/[slug]` | Gallery, variant selector, add cart | High | Not Started |
| Cart | `/product/cart` | Cart item list, summary | High | Not Started |
| Checkout | `/product/checkout` | Payment/order state | High | Not Started |
| Account | `/login`, `/register`, `/product/account` | `AccountPageClient` | Medium | Not Started |
| Admin | `/admin/login`, `/admin`, `/admin/products` | Admin form/table/dashboard | High | Not Started |
| Seller | `/seller/*` | dashboard/products/profile/orders | Medium | Not Started |
| Chat | `/product/chat` | Chat form/message area | Low | Not Started |

## Test scenarios và test cases
| ID | Scenario | Test case chi tiết | Expected result | Priority | Status | Rủi ro/Ghi chú |
|---|---|---|---|---|---|---|
| UI-001 | Layout desktop | Mở từng page chính ở 1440x900 | Không vỡ layout, spacing hợp lý, không overlap text/button | High | Not Started | Admin dùng inline style + Tailwind mixed |
| UI-002 | Responsive mobile | Mở `/`, `/products`, detail, cart, checkout, admin login ở 390x844 | Nội dung fit viewport, không horizontal scroll bất thường | High | Not Started | Sidebar search/filter cần kiểm tra |
| UI-003 | Tablet layout | Kiểm tra catalog/admin trên 768x1024 | Grid/table chuyển layout hợp lý | Medium | Not Started | Admin table/card có thể tràn |
| UI-004 | Font hierarchy | Kiểm tra H1/H2/card title/button text | Cỡ chữ đọc được, không dùng hero-size trong panel nhỏ | Medium | Not Started | Có nhiều class font-black lớn |
| UI-005 | Color consistency | So sánh storefront dark theme, admin light theme, seller theme | Màu nhất quán theo khu vực, contrast đủ | Medium | Not Started | Palette nhiều màu accent |
| UI-006 | Button default/hover | Hover các CTA, add cart, checkout, admin submit | Có visual feedback, cursor đúng | Medium | Not Started | Cần desktop browser |
| UI-007 | Button disabled/loading | Submit admin login, checkout, upload khi loading | Disabled không double submit, text loading rõ | High | Not Started | Admin login có `Signing in...` |
| UI-008 | Form labels | Login/register/admin/product forms | Input có label hoặc accessible name | High | Not Started | Một số custom controls cần keyboard test |
| UI-009 | Form validation message | Submit thiếu field bắt buộc | Error message gần field hoặc global rõ ràng | High | Not Started | Admin product có formError |
| UI-010 | Navigation | Header nav, footer, product links, admin redirect | Link đúng route, active/current state hợp lý | High | Not Started | Route cũ `/product` và mới `/products` dễ gây lẫn |
| UI-011 | User flow continuity | Browse -> detail -> add cart -> cart -> checkout | Không mất state khi chuyển page/refresh | High | Not Started | localStorage/backend sync |
| UI-012 | Empty catalog/search | Search không có kết quả | Empty title/description/action rõ | Medium | Not Started | `ProductGrid` có empty state |
| UI-013 | Loading state | Throttle network, reload products/search/detail | Loading page hiển thị, không layout jump lớn | Medium | Not Started | Có `loading.tsx` |
| UI-014 | Error state | Tắt gateway/product service | Error card rõ ràng, không blank/crash | High | Not Started | Có `StorefrontStatusCard` |
| UI-015 | Image alt text | Kiểm tra product images/gallery/upload preview | `alt` mô tả product/image, không rỗng | Medium | Not Started | Một số alt dùng fallback |
| UI-016 | Keyboard navigation | Tab qua header, forms, buttons, modal/toast nếu có | Focus visible, thứ tự tab logic, Enter submit đúng | High | Not Started | Cần kiểm Ant Design/toast nếu xuất hiện |
| UI-017 | Contrast | Lighthouse/DevTools accessibility | Text/button đạt contrast WCAG cơ bản | High | Not Started | Dark storefront + accent gradient cần kiểm |
| UI-018 | Modal/popup/toast | Add cart panel, checkout toast/state | Không che nội dung chính, close/escape hoạt động nếu có | Medium | Not Started | `AddToCartPanel` có overlay/panel |
| UI-019 | Product card | Card image/title/price/category/seller/stock | Text truncate hợp lý, image ratio ổn định | High | Not Started | Không để title dài phá layout |
| UI-020 | Admin product manager | Form dài, upload, variants, related products, payload summary | Field group rõ ràng, feedback save/delete rõ | High | Not Started | Component lớn, nhiều trạng thái |
| UI-021 | Admin dashboard widgets | Products/orders/inventory/users cards | Loading/error/unavailable states phân biệt rõ | High | Not Started | Backend từng có gap theo README cũ |
| UI-022 | Seller dashboard | Dashboard quick actions, product list empty | Copy rõ, CTA hoạt động | Medium | Not Started | Nhiều dữ liệu localStorage |
| UI-023 | Mobile checkout | Kiểm tra summary/payment trên mobile | Không che button thanh toán, tổng tiền rõ | High | Not Started | Critical business flow |
| UI-024 | 404 page | Mở route không tồn tại | 404 rõ ràng | Medium | Not Started | Not found custom: Not found in current project |

## Dữ liệu test đề xuất
- Product tên rất dài, mô tả dài, sellerName dài, SKU dài.
- Product không có gallery, không có related, stock `0`.
- Cart rỗng, cart 1 item, cart 10 item.
- Admin product có nhiều variants và nhiều gallery images.
- API slow/down để xem loading/error.

## Accessibility checklist cơ bản
| Hạng mục | Expected result | Priority | Status |
|---|---|---|---|
| Semantic heading | Mỗi page có H1 hợp lý, thứ tự heading không nhảy quá mức | Medium | Not Started |
| Label/input | Input có label, placeholder không thay thế label | High | Not Started |
| Alt image | Product image có alt meaningful | Medium | Not Started |
| Keyboard | Không mắc kẹt focus, focus visible | High | Not Started |
| Contrast | Text/icon/button đạt contrast tối thiểu | High | Not Started |
| Reduced motion | Animation không gây khó chịu hoặc có thể chấp nhận | Low | Not Started |

## Rủi ro/lỗi tiềm năng
- Giao diện có nhiều route lịch sử, người dùng có thể vào flow khác nhau nhưng dữ liệu không đồng nhất.
- Admin product manager là component lớn, nguy cơ lỗi responsive và form state cao.
- Một số flow dùng localStorage nên refresh/private mode có thể tạo UX khác nhau.
