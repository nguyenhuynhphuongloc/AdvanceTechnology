## ADDED Requirements

### Requirement: Public storefront does not list Cloudinary media assets
The public storefront SHALL NOT list generic Cloudinary media library assets or call Cloudinary Admin media listing behavior for public page rendering.

#### Scenario: Public homepage renders without media library
- **WHEN** a public user opens `/`
- **THEN** the page does not render Cloudinary media library sections such as `Cloudinary Media` or `Featured Assets`

#### Scenario: Public product card image comes from product data
- **WHEN** a public product card is rendered
- **THEN** the image source comes from product catalog response data or a product-card fallback, not from a generic Cloudinary asset list

### Requirement: Admin product image upload persists Cloudinary metadata
Admin product creation and update SHALL upload product images to Cloudinary and persist the returned `imageUrl` and `publicId` to MongoDB-backed product media records.

#### Scenario: Admin creates product with images
- **WHEN** an authenticated Admin creates a product with a main image and gallery images
- **THEN** product-service stores the product, image URLs, public IDs, and image-product relationships in MongoDB

#### Scenario: Public catalog renders Admin-created image
- **WHEN** a product created by Admin is active and returned by `GET /api/v1/products`
- **THEN** the response includes the product card `imageUrl` derived from the persisted Cloudinary image metadata

## MODIFIED Requirements

### Requirement: Product image upload API returns Cloudinary metadata
The product-service SHALL provide an Admin-authorized image upload operation that uploads an image to Cloudinary and returns `imageUrl` and `publicId` metadata for product/media workflows.

#### Scenario: Upload image successfully
- **WHEN** an authenticated Admin uploads a valid product image
- **THEN** product-service stores the asset in Cloudinary and returns the Cloudinary secure URL as `imageUrl` together with `publicId`

#### Scenario: Public upload is rejected
- **WHEN** a user without Admin authorization attempts to upload a product/media image through the gateway
- **THEN** the gateway or downstream service rejects the request before creating a Cloudinary asset

