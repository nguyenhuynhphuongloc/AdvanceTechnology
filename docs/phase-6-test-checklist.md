# Phase 6 Test Checklist

## Build
- [ ] `cd my-app && npm run build` passes with no errors
- [ ] Seller UI (`/seller`) not broken
- [ ] Admin UI (`/admin`) not broken
- [ ] Existing pages (home, product) not broken

## Buyer Route Namespace
- [ ] `/marketplace` page exists and renders
- [ ] `/marketplace/products` page exists and renders
- [ ] `/marketplace/products/[slug]` page exists and renders
- [ ] `/marketplace/shops` page exists and renders
- [ ] `/marketplace/shops/[slug]` page exists and renders
- [ ] `/marketplace/cart` page exists and renders
- [ ] `/marketplace/checkout` page exists and renders
- [ ] `/marketplace/orders` page exists and renders
- [ ] `/marketplace/orders/[id]` page exists and renders
- [ ] `/marketplace/profile` page exists and renders
- [ ] `/marketplace/addresses` page exists and renders
- [ ] No route collision with `/seller`
- [ ] No route collision with `/admin`

## Buyer Layout
- [ ] MarketplaceShell wraps all buyer pages
- [ ] MarketplaceHeader is sticky, white, with shadow
- [ ] MarketplaceSearchBar is prominent in center of header
- [ ] Navigation shows: Home, Products, Shops, Cart (with badge), Orders, Profile
- [ ] MarketplaceFooter renders at bottom
- [ ] Theme uses white background + orange accent
- [ ] No reuse of old Seller/Admin CSS classes (clean Tailwind only)
- [ ] Responsive: desktop (1024px+), tablet (768px), mobile (375px)
- [ ] Cart icon shows item count badge when cart has items

## Homepage (`/marketplace`)
- [ ] Hero section with large search bar renders
- [ ] Category pills render (fetched from `/api/v1/categories`)
- [ ] Featured products section renders (fetched from `/api/v1/products`)
- [ ] Latest products section renders
- [ ] Empty state renders when no products (API returns empty)
- [ ] Error state renders when API fails

## Products Listing (`/marketplace/products`)
- [ ] Product grid uses real API: `GET /api/v1/products`
- [ ] ProductCard shows: image, name, price, shop name
- [ ] Category filter pills work (navigate with query param)
- [ ] Search triggers re-fetch
- [ ] Sort selector works (price-asc, price-desc, latest)
- [ ] Pagination works (page/limit params)
- [ ] Loading skeleton shows while fetching
- [ ] Empty state shows when no products found
- [ ] Error state shows when API fails

## Product Detail (`/marketplace/products/[slug]`)
- [ ] Product detail fetches from `GET /api/v1/products/:slug`
- [ ] Product images render in gallery
- [ ] Product name, price, description render
- [ ] Variant selector shows available sizes/colors
- [ ] Quantity stepper allows selecting 1+ quantity
- [ ] Add to Cart button calls `POST /api/v1/carts/me/items`
- [ ] Shop info section shows shop name + link to `/marketplace/shops/[slug]`
- [ ] Related products section renders
- [ ] 404 page renders for non-existent slug
- [ ] Error state renders on API failure

## Shops Listing (`/marketplace/shops`)
- [ ] Shop list fetches from `GET /api/v1/shops`
- [ ] ShopCard shows: logo, name, status, description
- [ ] Search/filter works
- [ ] Empty state when no shops or API returns 502
- [ ] Error state shows when store-service is down

## Shop Detail (`/marketplace/shops/[slug]`)
- [ ] Shop detail fetches from `GET /api/v1/shops/:slug`
- [ ] Shop banner/logo renders
- [ ] Shop info (name, description, status) renders
- [ ] Shop products render from `GET /api/v1/shops/:slug/products`
- [ ] Empty state when shop has no products
- [ ] Error state when store-service is down

## Cart (`/marketplace/cart`)
- [ ] Cart fetches from `GET /api/v1/carts/me` (JWT required)
- [ ] Items grouped by shop (if API provides shopId)
- [ ] Quantity update works: `PATCH /api/v1/carts/me/items/:itemId`
- [ ] Remove item works: `DELETE /api/v1/carts/me/items/:itemId`
- [ ] Cart subtotal per shop renders
- [ ] Cart total renders
- [ ] Checkout button navigates to `/marketplace/checkout`
- [ ] Empty cart state renders when no items
- [ ] Login redirect when no JWT

## Checkout (`/marketplace/checkout`)
- [ ] Cart summary renders from `GET /api/v1/carts/me`
- [ ] Shipping address form renders (no API — local state)
- [ ] Payment method shows COD
- [ ] Order summary shows subtotal + total
- [ ] Place Order calls `POST /api/v1/orders/checkout`
- [ ] On success: redirect to `/marketplace/orders/[newOrderId]`
- [ ] On success: cart is cleared
- [ ] Error state renders with API error message
- [ ] Login redirect when no JWT

## Orders (`/marketplace/orders`)
- [ ] Orders fetch from `GET /api/v1/orders/me` (JWT required)
- [ ] Order list shows: orderId, date, status badge, total, shop count
- [ ] OrderStatusBadge colors match order status
- [ ] Empty state when no orders
- [ ] Error state when API fails
- [ ] Login redirect when no JWT

## Order Detail (`/marketplace/orders/[id]`)
- [ ] Order detail fetches from `GET /api/v1/orders/:id` (JWT required)
- [ ] Order summary (id, date, status) renders
- [ ] Shipping address renders
- [ ] Shop order groups render (items per shop)
- [ ] Payment info renders (method, amount)
- [ ] Cancel button visible (only for cancellable status)
- [ ] Cancel calls `PATCH /api/v1/orders/:id/cancel`
- [ ] 404 when order not found
- [ ] Login redirect when no JWT

## Profile (`/marketplace/profile`)
- [ ] Page renders (shell only — no buyer profile API)
- [ ] Shows static placeholder or "coming soon"
- [ ] Link to `/marketplace/addresses`

## Addresses (`/marketplace/addresses`)
- [ ] Page renders (shell only — no buyer address API)
- [ ] Shows static placeholder or "coming soon"
- [ ] Link back to profile

## API Clients
- [ ] `lib/marketplace/product-api.ts` exports all product functions
- [ ] `lib/marketplace/shop-api.ts` exports all shop functions
- [ ] `lib/marketplace/cart-api.ts` exports all cart functions
- [ ] `lib/marketplace/order-api.ts` exports all order functions
- [ ] All clients handle errors (throw, not silent fail)
- [ ] All clients use real API (no mock data)

## Components
- [ ] All components in `components/marketplace/` are created
- [ ] Components are self-contained (no Seller/Admin component imports)
- [ ] Components use Tailwind (no inline styles or custom CSS)
- [ ] EmptyState/ErrorState/LoadingState used consistently

## Documentation
- [ ] `docs/phase-6-buyer-marketplace-ui-plan.md` created
- [ ] `docs/phase-6-test-checklist.md` created
- [ ] `docs/phase-6-buyer-ui-notes.md` created
- [ ] `docs/phase-6-api-usage.md` created
- [ ] `docs/phase-6-ui-components.md` created
- [ ] `docs/phase-6-known-issues.md` created

## Known Issues
- [ ] store-service down (502) documented for shops pages
- [ ] No buyer profile API documented
- [ ] No buyer address API documented
- [ ] Any runtime errors logged to known-issues.md
