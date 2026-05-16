# SEO Testing

## Mục tiêu kiểm thử
- Kiểm tra khả năng index, metadata, heading, Open Graph, canonical, robots/sitemap, URL structure, alt text, mobile friendly và page speed.

## Phạm vi kiểm thử
- Public pages: `/`, `/HomePage`, `/products`, `/products/[slug]`, `/product`, `/product/[slug]`, `/search`.
- Không ưu tiên SEO cho `/admin`, `/seller`, `/login`, `/register`, cart/checkout/account trừ khi có yêu cầu business.

## Phát hiện hiện tại từ source
| Hạng mục | Trạng thái | Bằng chứng/Ghi chú |
|---|---|---|
| Global title | Found | `my-app/app/layout.tsx` có `Advance Technology Storefront` |
| Global meta description | Found | Có description global |
| Per-page metadata | Not found | Chưa thấy `generateMetadata` cho product/category/search |
| Open Graph tags | Not found | Không thấy `openGraph` trong metadata |
| Canonical URL | Not found | Không thấy canonical config |
| robots.txt | Not found | Không thấy `my-app/public/robots.txt` |
| sitemap.xml | Not found | Không thấy sitemap route/file |
| Structured data | Not found | Không thấy JSON-LD/schema.org |
| Custom 404 | Not found | Không thấy `not-found.tsx` |
| Alt text image | Partial found | Product image alt dùng product name/fallback |
| Mobile friendly | Needs test | Cần Lighthouse/mobile viewport |

## Test scenarios và test cases
| ID | Scenario | Test case chi tiết | Expected result | Priority | Status | Rủi ro/Ghi chú |
|---|---|---|---|---|---|---|
| SEO-001 | Title tag home | Inspect `<title>` ở `/` | Title có brand/category rõ ràng, không rỗng | High | Not Started | Hiện global title |
| SEO-002 | Meta description home | Inspect meta description | 120-160 ký tự, mô tả đúng website | High | Not Started | Global description có thể chưa tối ưu |
| SEO-003 | Product title | Mở `/products/{slug}` và inspect title | Title nên chứa product name | High | Not Started | Per-page metadata Not found |
| SEO-004 | Product description | Inspect product detail meta description | Nên lấy product description | High | Not Started | Not found |
| SEO-005 | Heading H1 | Kiểm mỗi public page có đúng 1 H1 chính | H1 mô tả page/product/search | High | Not Started | Cần kiểm route cũ/mới |
| SEO-006 | Heading hierarchy | Kiểm H2/H3 sau H1 | Không nhảy cấp bất hợp lý | Medium | Not Started | Nhiều card dùng H2/H3 |
| SEO-007 | Canonical | Inspect canonical trên `/product` vs `/products`, query pages | Canonical tránh duplicate content | High | Not Started | Route duplicate là rủi ro |
| SEO-008 | Open Graph | Inspect `og:title`, `og:description`, `og:image` | Có tag preview social | Medium | Not Started | Not found |
| SEO-009 | robots.txt | Truy cập `/robots.txt` | Có rules index public, disallow admin/seller/cart/checkout nếu cần | Medium | Not Started | Not found |
| SEO-010 | sitemap.xml | Truy cập `/sitemap.xml` | Có URL public products/category | Medium | Not Started | Not found |
| SEO-011 | Alt text | Crawl product cards/gallery | Image có alt meaningful | High | Not Started | Partial found |
| SEO-012 | URL structure | Kiểm slug `/products/[slug]` | URL readable, lowercase, không duplicate | High | Not Started | Có `/product/[slug]` duplicate |
| SEO-013 | Query indexability | `/search`, filter/sort/page query | Search/filter có noindex/canonical nếu cần | Medium | Not Started | Chưa thấy robots metadata |
| SEO-014 | Mobile friendly | Lighthouse mobile public pages | Không horizontal scroll, tap target đủ lớn | High | Not Started | Cần browser test |
| SEO-015 | Page speed | Lighthouse performance | LCP/CLS/INP đạt target | High | Not Started | Xem Performance_Testing |
| SEO-016 | Structured product data | Inspect product detail JSON-LD | Product schema có name/image/price/availability nếu SEO ecommerce | Medium | Not Started | Not found |
| SEO-017 | Internal links | Crawl header/footer/product links | Link không broken, anchor text rõ | Medium | Not Started | Route cũ/mới cần kiểm |
| SEO-018 | 404 SEO | Mở slug không tồn tại | 404 status/page, không index trang lỗi | High | Not Started | Cần kiểm Next response |
| SEO-019 | Indexability private pages | `/admin`, `/seller`, `/cart`, `/checkout` | Nên noindex hoặc không public index | Medium | Not Started | Not found |
| SEO-020 | Image optimization | Kiểm kích thước ảnh product | Ảnh có kích thước phù hợp, lazy loading dưới fold | High | Not Started | `next.config.ts` trống |

## Dữ liệu test đề xuất
- Product có tên SEO-friendly, mô tả 150 ký tự, ảnh chính, price, stock.
- Product slug không tồn tại.
- Search có và không có kết quả.
- Dataset có nhiều product để kiểm sitemap/crawl nếu được bổ sung.

## Rủi ro SEO chính
- Duplicate route `/product` và `/products` có thể tạo duplicate content nếu không canonical/redirect.
- Không thấy robots.txt/sitemap.xml/Open Graph/structured data.
- Product detail chưa thấy metadata động theo product.
- Trang private/admin/seller có thể index nếu không cấu hình noindex ở production.
