## 1. Public storefront cleanup

- [x] 1.1 Remove Cloudinary media listing fetch/rendering from `StorefrontHomePage`
- [x] 1.2 Keep homepage product fetching through `fetchProducts({ limit: 4, sort: "latest" })`
- [x] 1.3 Verify public homepage empty/product states do not mention Cloudinary media management

## 2. Admin media library route

- [x] 2.1 Add `/admin/media-library` route under the existing Admin layout/session gate
- [x] 2.2 Add Admin navigation entry for Media Library without exposing it in public navigation
- [x] 2.3 Implement media asset list UI with loading, empty, error, and linked-product states
- [x] 2.4 Add upload control for Admin media assets with file type and size validation feedback
- [x] 2.5 Add delete action that blocks linked media and allows unlinked media removal

## 3. Admin media API and gateway protection

- [x] 3.1 Define Admin media API client helpers in `my-app/lib/admin/api.ts`
- [x] 3.2 Add or route Admin-authenticated media endpoints through API Gateway
- [x] 3.3 Require Admin authorization for media upload/list/delete operations
- [x] 3.4 Preserve or intentionally migrate Admin product image upload to the protected media endpoint

## 4. Product creation and MongoDB persistence flow

- [x] 4.1 Verify Admin product create flow still uploads main image and gallery images to Cloudinary
- [x] 4.2 Verify Admin product create payload persists product, images, variants, and category data to MongoDB
- [x] 4.3 Verify Admin-created active product appears in `GET /api/v1/products`
- [x] 4.4 Verify product detail `GET /api/v1/products/:slug` returns main image, gallery, variants, sizes, and colors

## 5. QA documentation and verification

- [x] 5.1 Update `Document_Testing/Product_Display_Debug.md` with final expected Admin-to-MongoDB flow
- [x] 5.2 Update `Document_Testing/Cloudinary_Admin_Media_Debug.md` with implemented Admin media routes and API behavior
- [x] 5.3 Update `Document_Testing/Admin_Routing_And_Permission.md` with final route/permission matrix
- [x] 5.4 Smoke test public `/`, `/product`, and product detail after Admin creates a product
- [x] 5.5 Smoke test unauthenticated and non-Admin access to Admin media/product media operations
