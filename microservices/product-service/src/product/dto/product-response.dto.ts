export class UploadProductImageResponseDto {
  imageUrl: string;
  publicId: string;
}

export class ProductCardDto {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  basePrice: number;
  imageUrl: string;
}

export class ProductImageDto {
  id: string;
  imageUrl: string;
  publicId: string;
  altText?: string | null;
  sortOrder: number;
  isMain: boolean;
}

export class ProductVariantDto {
  id: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  imageUrl?: string;
}

export class ProductDetailDto {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  category: string;
  basePrice: number;
  mainImage: ProductImageDto;
  galleryImages: ProductImageDto[];
  variants: ProductVariantDto[];
  availableSizes: string[];
  availableColors: string[];
  relatedProducts: ProductCardDto[];
}

export class PaginatedProductsDto {
  items: ProductCardDto[];
  page: number;
  limit: number;
  total: number;
}

export class RelatedProductsDto {
  items: ProductCardDto[];
}
