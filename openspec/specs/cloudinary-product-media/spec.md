## ADDED Requirements

### Requirement: Product-service supports Cloudinary configuration
The product-service SHALL load `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` from environment variables.

#### Scenario: Cloudinary credentials are required
- **WHEN** product-service starts without the required Cloudinary environment variables
- **THEN** the media integration cannot initialize successfully

### Requirement: Product image upload API returns Cloudinary metadata
The product-service SHALL provide `POST /api/v1/products/upload-image` that uploads an image to Cloudinary and returns `image_url` and `public_id`.

#### Scenario: Upload image successfully
- **WHEN** a client uploads a valid product image
- **THEN** product-service stores the asset in Cloudinary and returns the Cloudinary `secure_url` as `image_url` together with `public_id`

### Requirement: Product-service persists Cloudinary media references
The product-service SHALL store both `image_url` and `public_id` for product images so images can be displayed and later replaced or deleted.

#### Scenario: Created product retains Cloudinary references
- **WHEN** a product is saved with a main image or gallery images
- **THEN** the product-service persists both the image URL and public ID for each stored asset

### Requirement: Product media can be replaced or deleted by public ID
The product-service SHALL retain enough Cloudinary metadata to support future delete or replace operations using `public_id`.

#### Scenario: Existing product image can be targeted for replacement
- **WHEN** a service operation needs to replace or remove an existing product image
- **THEN** the product-service can identify the corresponding Cloudinary asset by its stored `public_id`
