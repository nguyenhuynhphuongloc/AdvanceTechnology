## ADDED Requirements

### Requirement: Accurate Product Image Aspect Ratios
The storefront MUST display product images without cropping or distortion, using `object-contain` and a neutral background.

#### Scenario: Viewing a product card
- **WHEN** a user views a product card in the product grid
- **THEN** the product image is displayed fully without being cropped, regardless of its original aspect ratio

### Requirement: Variant Color Selection Synchronization
The product detail page MUST synchronize the selected variant color with the main product image.

#### Scenario: Selecting a color variant
- **WHEN** a user selects a different color variant in the configuration panel
- **THEN** the main product image updates to display the image associated with the selected variant
