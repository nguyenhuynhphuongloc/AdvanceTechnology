# Phase 3 Test Checklist

## Setup
- [ ] Seller có shop approved
- [ ] Seller có product approved
- [ ] Seller có inventory stock > 0
- [ ] Customer có cart grouped by shop

## Checkout Tests
- [ ] Buyer checkout cart 1 shop → tạo 1 Order + 1 ShopOrder
- [ ] Buyer checkout cart nhiều shop → tạo 1 Order + nhiều ShopOrder
- [ ] Checkout validate stock đủ → success
- [ ] Checkout stock không đủ → fail
- [ ] Checkout product inactive/unapproved → fail
- [ ] Checkout cart empty → fail
- [ ] Checkout legacy cart item thiếu shopId → fail
- [ ] Checkout tạo snapshot đúng

## Inventory Reservation Tests
- [ ] Checkout success → reservedStock tăng
- [ ] Checkout fail → reservedStock không đổi
- [ ] Cancel order → reservedStock giảm
- [ ] Seller confirm/ship không làm âm stock
- [ ] Delivered → stock giảm và reservedStock release theo quyết định

## Buyer Order Tests
- [ ] GET /orders/me trả order của buyer
- [ ] GET /orders/:id chỉ buyer sở hữu mới xem được
- [ ] Buyer cancel order khi còn allowed
- [ ] Buyer không xem được order người khác

## Seller Order Tests
- [ ] Seller GET /seller/orders chỉ thấy ShopOrder của shop mình
- [ ] Seller GET /seller/orders/:id chỉ thấy order của mình
- [ ] Seller confirm ShopOrder
- [ ] Seller ship ShopOrder
- [ ] Seller không xem/sửa ShopOrder shop khác

## Admin Order Tests
- [ ] Admin GET /admin/orders thấy toàn bộ
- [ ] Admin GET /admin/shop-orders thấy toàn bộ
- [ ] Admin xem order detail
- [ ] Admin filter by status/shopId/buyerId

## Payment Tests
- [ ] COD checkout tạo payment pending
- [ ] Stripe/payment intent cũ không bị vỡ nếu còn dùng
- [ ] Payment liên kết orderId đúng

## Security Tests
- [ ] Unauthenticated checkout → 401
- [ ] Customer gọi seller order API → 403
- [ ] Seller gọi admin order API → 403
- [ ] User không thể truyền buyerId giả
- [ ] Seller không thể truyền shopId giả

## Backward Compatibility
- [ ] Cart API Phase 2B vẫn chạy
- [ ] Inventory API Phase 2B vẫn chạy
- [ ] Product API Phase 2A vẫn chạy
- [ ] Payment API cũ không bị vỡ nếu còn dùng

## Build
- [ ] order-service build pass
- [ ] cart-service build pass nếu có sửa
- [ ] inventory-service build pass nếu có sửa
- [ ] payment-service build pass nếu có sửa
- [ ] api-gateway build pass
- [ ] frontend build pass nếu có sửa
