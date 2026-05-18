# UI Feature Map for Redesign

Tài liệu này liệt kê các chức năng cần có cho 3 nhóm giao diện: Admin, Seller và Marketplace. Mục tiêu là dùng làm đầu vào khi thiết kế UI mới, nên mỗi chức năng đều kèm route đề xuất/đang có trong Next.js app.

Base frontend local: `http://localhost:3009`

## 1. Admin UI

Admin UI dùng cho đội vận hành nền tảng: quản lý người dùng, seller, duyệt shop/sản phẩm, catalog, đơn hàng, thanh toán và cấu hình hệ thống.

### Điều hướng tổng quan

| Nhóm | Chức năng | Route | Nội dung cần có |
| --- | --- | --- | --- |
| Auth | Đăng nhập admin | `/admin/login` | Form đăng nhập, lỗi xác thực, trạng thái loading, chuyển hướng sau login. |
| Overview | Dashboard | `/admin` | KPI doanh thu, đơn đang xử lý, tổng sản phẩm, tổng user, payment, notification, đơn mới, cảnh báo tồn kho thấp. |
| Overview | Analytics | `/admin/analytics` | Biểu đồ doanh thu, đơn hàng, sản phẩm bán chạy, seller/shop hiệu quả, bộ lọc thời gian. |
| Users & Sellers | Quản lý users | `/admin/users` | Danh sách user, tìm kiếm/lọc, trạng thái active, link tới giỏ hàng và đơn hàng của user. |
| Users & Sellers | Chi tiết user | `/admin/users/[id]` | Hồ sơ user, trạng thái tài khoản, hành động activate/deactivate, lịch sử liên quan. |
| Users & Sellers | Quản lý sellers | `/admin/sellers` | Danh sách seller tổng hợp. Hiện backend chưa hoàn chỉnh, vẫn nên thiết kế trạng thái "coming soon/API unavailable". |
| Users & Sellers | Hồ sơ seller | `/admin/seller-profiles` | Danh sách hồ sơ seller, trạng thái, tìm kiếm/lọc, hành động quản trị. |
| Moderation | Duyệt shop | `/admin/shop-approvals` | Danh sách shop chờ duyệt, xem thông tin shop, approve/reject, nhập lý do từ chối. |
| Moderation | Duyệt sản phẩm | `/admin/product-approvals` | Danh sách sản phẩm chờ duyệt, xem nội dung, approve/reject, nhập lý do từ chối. |
| Catalog | Quản lý sản phẩm | `/admin/products` | Bảng sản phẩm, tìm kiếm/lọc trạng thái, tạo/sửa/xóa, duyệt trạng thái, quản lý ảnh và biến thể. |
| Catalog | Quản lý danh mục | `/admin/categories` | Danh sách category, tạo/sửa/xóa, slug, trạng thái hiển thị, cây danh mục nếu có phân cấp. |
| Catalog | Quản lý tồn kho | `/admin/inventory` | Danh sách SKU/variant, tồn khả dụng, tồn giữ chỗ, cảnh báo low stock, cập nhật tồn kho. |
| Catalog | Thư viện media | `/admin/media-library` | Upload/chọn/xem ảnh, gắn ảnh vào sản phẩm, trạng thái upload, lỗi Cloudinary/API. |
| Commerce | Quản lý đơn hàng | `/admin/orders` | Danh sách order tổng, tìm kiếm/lọc trạng thái, tổng tiền, buyer, ngày tạo, link chi tiết. |
| Commerce | Chi tiết đơn hàng | `/admin/orders/[id]` | Thông tin buyer, shop orders con, items, thanh toán, trạng thái, timeline. |
| Commerce | Quản lý shop orders | `/admin/shop-orders` | Danh sách đơn theo shop/seller, lọc theo status/shop/seller/order, pagination. |
| Commerce | Chi tiết shop order | `/admin/shop-orders/[id]` | Items của shop order, seller/shop, trạng thái fulfillment, link về parent order. |
| Commerce | Thanh toán | `/admin/payments` | Danh sách giao dịch, trạng thái payment, amount, provider, link order, xem chi tiết giao dịch. |
| Commerce | Giỏ hàng | `/admin/carts` | Danh sách cart/user, items trong cart, trạng thái cart, lọc theo user/cart selected. |
| Finance | Hoàn tiền | `/admin/refunds` | Danh sách yêu cầu refund, trạng thái xử lý, chi tiết payment/order. Hiện là coming soon. |
| Finance | Hoa hồng | `/admin/commissions` | Theo dõi commission theo seller/order/payment. Hiện là coming soon. |
| System | Notifications | `/admin/notifications` | Log notification, trạng thái gửi, channel, template, filter, xem chi tiết event. |
| System | Cài đặt nền tảng | `/admin/store-settings` | Tên marketplace, email/phone liên hệ, chính sách, cấu hình hiển thị toàn nền tảng. |
| System | Settings | `/admin/settings` | Cài đặt hệ thống mở rộng nếu tách riêng khỏi platform settings. |

### Thành phần UI nên có

- Sidebar nhóm theo `Overview`, `Users & Sellers`, `Moderation`, `Catalog`, `Commerce`, `Finance`, `System`.
- Header có breadcrumb, search admin, trạng thái session, notification shortcut, logout.
- Bảng dữ liệu có sort/filter/search/pagination, empty state, loading state, error/API unavailable state.
- Modal xác nhận cho approve/reject/delete/activate/deactivate.
- Badge trạng thái thống nhất cho order, payment, product, shop, inventory.

## 2. Seller UI

Seller UI dùng cho người bán quản lý shop, sản phẩm, tồn kho và đơn hàng của shop mình.

### Điều hướng tổng quan

| Nhóm | Chức năng | Route | Nội dung cần có |
| --- | --- | --- | --- |
| Auth | Đăng nhập seller | `/seller/login` | Form đăng nhập, lỗi xác thực, loading, link đăng ký shop. |
| Auth | Đăng ký seller/shop | `/seller/register` | Form tạo tài khoản hoặc đăng ký seller, thông tin shop, submit hồ sơ duyệt. |
| Entry | Seller landing/redirect | `/seller` | Điều hướng vào dashboard nếu đã đăng nhập, hoặc login/register nếu chưa có session. |
| Overview | Dashboard | `/seller/dashboard` | KPI doanh thu/đơn/sản phẩm/tồn kho, quick actions, trạng thái shop, đơn mới. |
| Shop | Hồ sơ shop | `/seller/shop` | Tên shop, mô tả, logo/banner, trạng thái duyệt, thông tin liên hệ, cài đặt shop. |
| Catalog | Danh sách sản phẩm | `/seller/products` | Bảng/grid sản phẩm của shop, trạng thái duyệt, giá, tồn kho, tạo/sửa/xóa. |
| Catalog | Tạo sản phẩm | `/seller/products/new` | Form thông tin sản phẩm, category, giá, ảnh, variant/SKU, submit duyệt. |
| Catalog | Sửa sản phẩm | `/seller/products/edit/[id]` | Form chỉnh sửa sản phẩm hiện có, cập nhật ảnh/giá/variant, trạng thái lưu. |
| Inventory | Quản lý tồn kho | `/seller/inventory` | Danh sách variant/SKU, available/reserved stock, cảnh báo low stock, modal cập nhật số lượng. |
| Orders | Danh sách đơn shop | `/seller/orders` | Đơn của seller, lọc trạng thái, buyer, tổng tiền, ngày tạo, link chi tiết. |
| Orders | Chi tiết đơn shop | `/seller/orders/[id]` | Items, thông tin buyer, địa chỉ, payment, timeline, cập nhật trạng thái xử lý/giao hàng. |

### Thành phần UI nên có

- Sidebar cố định gồm `Dashboard`, `My Shop`, `Products`, `Inventory`, `Orders`.
- Badge trạng thái shop: `approved`, `pending`, `rejected`, `suspended`.
- Header trang có title/subtitle, back link và primary action.
- Quick actions trên dashboard: thêm sản phẩm, quản lý đơn, cập nhật tồn kho, chỉnh shop.
- Form sản phẩm cần chia rõ: basic info, pricing, media, variants, inventory, submit.
- Empty state cho seller chưa có shop, chưa có sản phẩm, chưa có inventory hoặc chưa có đơn hàng.

## 3. Marketplace UI

Marketplace UI dùng cho buyer duyệt sản phẩm/shop, quản lý giỏ hàng, checkout và theo dõi đơn hàng.

### Điều hướng tổng quan

| Nhóm | Chức năng | Route | Nội dung cần có |
| --- | --- | --- | --- |
| Entry | Trang gốc | `/` | Điều hướng/giới thiệu vào marketplace, seller hoặc admin tùy nhu cầu. |
| Home | Marketplace home | `/marketplace` | Sản phẩm nổi bật, link browse products/shops, category highlights, trạng thái empty. |
| Discovery | Danh sách sản phẩm | `/marketplace/products` | Grid sản phẩm, search, lọc category, sort, pagination/load more, empty/error state. |
| Discovery | Chi tiết sản phẩm | `/marketplace/products/[slug]` | Ảnh sản phẩm, giá, biến thể, tồn kho, mô tả, shop, add to cart, sản phẩm liên quan. |
| Discovery | Danh sách shop | `/marketplace/shops` | Grid shop, tìm kiếm/lọc, trạng thái shop, link vào shop. |
| Discovery | Chi tiết shop | `/marketplace/shops/[slug]` | Header shop, thông tin seller, danh sách sản phẩm của shop, trạng thái empty. |
| Cart | Giỏ hàng | `/marketplace/cart` | Items theo shop, tăng/giảm số lượng, xóa item, tổng tiền, chuyển checkout. |
| Checkout | Thanh toán | `/marketplace/checkout` | Chọn/nhập địa chỉ, review cart, tổng tiền, tạo order, xử lý lỗi payment/order. |
| Orders | Đơn hàng của tôi | `/marketplace/orders` | Danh sách đơn đã đặt, trạng thái, tổng tiền, ngày tạo, link chi tiết. |
| Orders | Chi tiết đơn hàng | `/marketplace/orders/[id]` | Thông tin order, shop orders, items, payment, trạng thái giao hàng, timeline. |
| Account | Hồ sơ cá nhân | `/marketplace/profile` | Thông tin user, link quản lý địa chỉ, link seller center. Hiện một phần là coming soon. |
| Account | Địa chỉ | `/marketplace/addresses` | Danh sách địa chỉ, thêm/sửa/xóa, chọn mặc định. Hiện là coming soon. |

### Thành phần UI nên có

- Header sticky gồm logo, search sản phẩm/shop, nav `Home`, `Products`, `Shops`, `Cart`, `Orders`, `Profile`.
- Cart icon có badge số lượng.
- Footer có quick links marketplace, seller và support/admin.
- Product card gồm ảnh, tên, giá, shop, rating/sold nếu có dữ liệu, trạng thái out-of-stock.
- Product detail cần ưu tiên ảnh, giá, chọn variant, số lượng, add-to-cart rõ ràng.
- Checkout cần chia thành địa chỉ, sản phẩm, thanh toán, tổng tiền và CTA đặt hàng.
- Auth-required state cho cart/checkout/orders/profile khi user chưa đăng nhập.

## 4. Ghi chú chung cho thiết kế UI mới

- Giữ route ổn định để không ảnh hưởng logic hiện tại; chỉ thay đổi layout/component nếu chưa cần đổi flow.
- Mỗi màn hình dữ liệu cần đủ 4 trạng thái: loading, empty, error, success.
- Các hành động nguy hiểm cần confirm dialog: xóa sản phẩm, reject shop/product, deactivate user, cancel/refund order.
- Các danh sách lớn cần search, filter, pagination và trạng thái filter đang áp dụng.
- Trạng thái quan trọng nên dùng badge thống nhất:
  - Product: `draft`, `pending`, `approved`, `rejected`, `active`, `inactive`.
  - Shop: `pending`, `approved`, `rejected`, `suspended`.
  - Order: `pending`, `awaiting_payment`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`.
  - Payment: `pending`, `paid`, `failed`, `refunded`.
  - Inventory: `in-stock`, `low-stock`, `out-of-stock`.
- Responsive cần ưu tiên:
  - Admin: desktop-first, bảng rộng, sidebar cố định, mobile có nav ngang hoặc drawer.
  - Seller: desktop quản trị nhanh, mobile vẫn thao tác được đơn hàng/tồn kho.
  - Marketplace: mobile-first cho browsing, cart và checkout.
