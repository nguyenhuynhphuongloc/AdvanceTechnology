## ADDED Requirements

### Requirement: Admin media library route is available
The frontend SHALL provide an Admin-only `/admin/media-library` route for media library management.

#### Scenario: Admin opens media library
- **WHEN** an authenticated Admin navigates to `/admin/media-library`
- **THEN** the system displays the Admin media library interface

#### Scenario: Unauthenticated user opens media library
- **WHEN** a user without a valid Admin session navigates to `/admin/media-library`
- **THEN** the system redirects the user to `/admin/login`

### Requirement: Media library lists managed media assets
The Admin media library SHALL list managed image assets with enough metadata for Admin review and reuse.

#### Scenario: Media assets are listed
- **WHEN** an authenticated Admin opens the media library
- **THEN** the system displays image thumbnails with public ID, URL, creation metadata where available, and linked-product status where available

### Requirement: Media library supports Admin uploads
The Admin media library SHALL allow an authenticated Admin to upload supported image files to Cloudinary.

#### Scenario: Admin uploads image
- **WHEN** an authenticated Admin uploads a valid JPG, PNG, or WEBP image within the accepted size limit
- **THEN** the system uploads the image to Cloudinary and records or returns its `imageUrl` and `publicId`

#### Scenario: Invalid media upload is rejected
- **WHEN** an authenticated Admin uploads an unsupported file type or oversized image
- **THEN** the system rejects the upload with a validation error and does not create a media asset

### Requirement: Media deletion respects product links
The Admin media library SHALL prevent accidental removal of media assets that are still linked to products.

#### Scenario: Linked media delete is blocked
- **WHEN** an authenticated Admin attempts to delete a media asset that is linked to a product image or variant image
- **THEN** the system blocks deletion and explains that the asset is still in use

#### Scenario: Unlinked media delete succeeds
- **WHEN** an authenticated Admin deletes a media asset that is not linked to any product
- **THEN** the system removes the media asset from Cloudinary and from any system media record if one exists

