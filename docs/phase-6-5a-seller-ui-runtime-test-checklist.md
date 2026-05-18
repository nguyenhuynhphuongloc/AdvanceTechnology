# Phase 6.5A — Seller UI Runtime Test Checklist

## 1. Service Health
- [ ] API Gateway responds at `http://localhost:3000`
- [ ] auth-service running on `:3008`
- [ ] store-service running on `:3012`
- [ ] product-service running on `:3001`
- [ ] inventory-service running
- [ ] order-service running

## 2. Seller Registration (`/seller/register`)
- [ ] Step 1 form validation blocks empty full name
- [ ] Step 1 form validation blocks invalid email
- [ ] Step 1 form validation blocks short password (< 6 chars)
- [ ] Successful registration with valid full name, email, password
- [ ] Auto-redirect to `/seller/dashboard` after registration
- [ ] Shop creation step (Step 2) creates shop with correct `sellerId`
- [ ] No `name should not be empty` backend error (**Bug 1 fix verified**)

## 3. Seller Login (`/seller/login`)
- [ ] Login with correct credentials → redirect to `/seller/dashboard`
- [ ] Login with wrong password → show error message
- [ ] Login with non-seller account → redirect to `/` (role check)
- [ ] Refresh page while logged in → stay on dashboard (session rehydration)
- [ ] `seller_token` and `seller_user` stored in localStorage

## 4. Shop Management (`/seller/shop`)
- [ ] Shop form loads existing shop data
- [ ] Shop status badge displayed correctly
- [ ] "No shop" state shows create prompt
- [ ] Creating shop: name, slug, contact info → POST `/api/v1/seller/shop`
- [ ] Updating shop: change name → slug auto-updates (**Bug 2 fix verified**)
- [ ] Updating shop: manual slug override persists (**Bug 2 fix verified**)
- [ ] Duplicate slug conflict → error message shown
- [ ] Shop approval status shows rejection reason when rejected

## 5. Product Management (`/seller/products`)
- [ ] Product list loads with pagination
- [ ] Search by product name works
- [ ] Filter by status (draft/pending/approved/rejected/hidden) works
- [ ] Delete product works
- [ ] Submit for approval (draft → pending) works
- [ ] "Add Product" button → `/seller/products/new`

## 6. Create Product (`/seller/products/new`)
- [ ] Form loads with empty fields
- [ ] Name auto-generates slug
- [ ] SKU auto-generated if empty
- [ ] **Image upload: file picker opens** (**Bug 3 fix verified**)
- [ ] **Image uploads to Cloudinary, URL displayed** (**Bug 3 fix verified**)
- [ ] Price input accepts numbers (VND)
- [ ] Category dropdown works
- [ ] Variants: add/remove/update
- [ ] Submit creates product → redirect to `/seller/products`

## 7. Edit Product (`/seller/products/edit/[id]`)
- [ ] Form loads existing product data
- [ ] Current image displayed
- [ ] **Image can be replaced via file upload** (**Bug 3 fix verified**)
- [ ] All fields editable
- [ ] Submit updates product, success message shown

## 8. Inventory (`/seller/inventory`)
- [ ] Inventory list loads products with stock levels
- [ ] Stock update works (PUT/PATCH inventory endpoint)

## 9. Marketplace Visibility
- [ ] Approved product with `isActive=true` appears on marketplace `/products`
- [ ] Draft/pending/rejected product NOT visible on marketplace
- [ ] Product links to correct shop by `shopId`

## 10. Orders (`/seller/orders`)
- [ ] Order list loads for seller's shop
- [ ] Order status filter works
- [ ] Order detail (`/seller/orders/[id]`) shows items, buyer info, status

## 11. Route Guards
- [ ] `/seller/dashboard` without token → redirect to `/seller/login`
- [ ] Customer token on seller route → redirect to `/`
- [ ] Admin token on seller route → allowed (isSeller includes admin)

## 12. Build
- [ ] `npm run build` passes with no TypeScript errors
- [ ] No `eslint` blocking errors
