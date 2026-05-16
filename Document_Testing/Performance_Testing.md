# Performance Testing

## Mục tiêu kiểm thử
- Đo tốc độ tải trang, API response time, khả năng render danh sách lớn, tối ưu ảnh/bundle/cache và Core Web Vitals.
- Phát hiện điểm nghẽn ở gateway proxy, product catalog, cart/checkout và admin dashboard.

## Phạm vi kiểm thử
- Frontend Next.js `my-app`.
- API Gateway và các service product/cart/order/inventory/payment/auth.
- DB/cache/message broker: MongoDB cho product, PostgreSQL cho nhiều service, Redis, RabbitMQ.

## Tool đề xuất
| Tool | Mục đích |
|---|---|
| Lighthouse | Core Web Vitals, SEO, accessibility, performance frontend |
| Chrome DevTools Performance/Network | Flame chart, JS bundle, image/network waterfall |
| WebPageTest | So sánh page speed theo network/device |
| k6 | Load/stress API gateway và service endpoint |
| JMeter | Kịch bản load phức tạp/cart-checkout |
| Postman Runner | Smoke/performance nhẹ theo collection hiện có |
| Docker stats | Quan sát CPU/RAM container khi load |

## Test scenarios và test cases
| ID | Scenario | Test case chi tiết | Dữ liệu/Tải đề xuất | Expected result | Priority | Status | Rủi ro/Ghi chú |
|---|---|---|---|---|---|---|---|
| PERF-001 | Home page load | Lighthouse `/` desktop/mobile | Product service có dữ liệu | LCP < 2.5s local, CLS < 0.1, INP tốt | High | Not Started | Ảnh Cloudinary/catalog ảnh hưởng lớn |
| PERF-002 | Catalog load | Mở `/products?page=1&limit=12` | 12 products | Initial load < 3s local, no long blocking task lớn | High | Not Started | Server fetch gateway |
| PERF-003 | Search response | Search keyword phổ biến | `search=shirt`, sort/category | UI phản hồi nhanh, API < 500ms local mục tiêu | High | Not Started | Query MongoDB/index |
| PERF-004 | Product detail | Mở detail có gallery/related | 5 gallery, 4 related | LCP ảnh chính tối ưu, no layout shift | High | Not Started | Cần kiểm image sizing/lazy |
| PERF-005 | Large catalog rendering | Seed 100/500/1000 products, limit 50 | `limit=50` max | Render mượt, pagination không freeze | High | Not Started | Limit API max 50 |
| PERF-006 | Admin dashboard | Load `/admin` sau login | Products/orders/inventory/users có dữ liệu | Widget không block toàn trang, error per widget | Medium | Not Started | Nhiều API song song |
| PERF-007 | Admin products manager | Load `/admin/products` với 50 products | Query limit 50 | Form/table không lag, image previews tối ưu | Medium | Not Started | Component lớn |
| PERF-008 | Cart operations | Add/update/remove 20 item liên tiếp | Guest/user cart | UI optimistic/sync ổn, mỗi API < 300-500ms local | High | Not Started | Redis/DB fallback |
| PERF-009 | Checkout | Create order + payment intent | 1, 10, 50 items | Không timeout; response có feedback rõ | High | Not Started | Stripe/network external |
| PERF-010 | API gateway proxy latency | So sánh gateway vs direct service | Products list/detail | Gateway overhead hợp lý, không nhân đôi timeout | High | Not Started | Proxy dùng native fetch |
| PERF-011 | Downstream timeout | Service treo/chậm | Delay > timeout | Gateway trả 504 rõ ràng | Medium | Not Started | Timeout hiện 600000ms quá dài cho UX |
| PERF-012 | Image optimization | Kiểm image size/format/cache | Product images, gallery | Ảnh không tải quá lớn; lazy dưới fold | High | Not Started | Upload Cloudinary nhưng Next image config trống |
| PERF-013 | Bundle size | `next build` và inspect bundle | Frontend build | Bundle không bất thường, Ant Design tree-shaking ổn | Medium | Not Started | my-app test/build env cần cài deps đúng |
| PERF-014 | Caching product list | Gọi `/api/v1/products` nhiều lần | Redis enabled | Lần sau nhanh hơn, cache invalidation khi update | Medium | Not Started | Product Redis TTL list/detail |
| PERF-015 | DB query performance | Query search/sort/filter lớn | 1k/10k products | Index slug hiệu quả; search không scan quá chậm | Medium | Not Started | MongoDB TypeORM, cần explain nếu có |
| PERF-016 | Stress product API | k6 50/100/200 VUs GET products | 5 phút | Error rate thấp, p95 dưới SLA nội bộ | High | Not Started | Cần SLA chính thức |
| PERF-017 | Stress checkout flow | k6/JMeter browse -> cart -> order | 20/50 VUs | Không duplicate order, không âm inventory | High | Not Started | Cần dữ liệu isolated |
| PERF-018 | Redis/RabbitMQ behavior | Load order/inventory/payment event | 100 orders | Queue không backlog bất thường | Medium | Not Started | Cần dashboard RabbitMQ |

## Core Web Vitals checklist
| Metric | Target đề xuất local/dev | Page ưu tiên | Priority | Status |
|---|---|---|---|---|
| LCP | < 2.5s | Home, product detail, catalog | High | Not Started |
| CLS | < 0.1 | Home, product detail, cart | High | Not Started |
| INP | < 200ms | Search, cart, admin forms | High | Not Started |
| TTFB | < 800ms local | Server-rendered pages | Medium | Not Started |

## API performance checklist
| API | Target đề xuất local | Priority | Status |
|---|---|---|---|
| GET `/api/v1/products` | p95 < 500ms với 50 records | High | Not Started |
| GET `/api/v1/products/:slug` | p95 < 300ms cached, < 700ms uncached | High | Not Started |
| POST `/api/v1/carts/me/items` | p95 < 300ms | High | Not Started |
| POST `/api/v1/orders` | p95 < 1000ms nếu không gọi external chậm | High | Not Started |
| POST `/api/v1/payments/create-intent` | p95 phụ thuộc Stripe, cần timeout hợp lý | High | Not Started |

## Ghi chú rủi ro
- `next.config.ts` hiện trống, chưa thấy cấu hình remote image optimization.
- Gateway timeout 10 phút không phù hợp UX thông thường; nên có test timeout/failure riêng.
- Chưa có SLA chính thức; các target trên là đề xuất ban đầu cho local/dev.
- Không chạy được test frontend vì `jest` không nhận diện trong `my-app` dù có `node_modules`; cần kiểm dependency install.
