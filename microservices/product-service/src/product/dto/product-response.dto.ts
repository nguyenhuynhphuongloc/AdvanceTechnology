export class UploadProductImageResponseDto {
  imageUrl: string;
  publicId: string;
}

export class ProductCardDto {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId?: string;
  collectionId?: string;
  basePrice: number;
  imageUrl: string;
  sellerName?: string;
  isActive?: boolean;
  // ─── Marketplace ────────────────────────────────────────────────────────────
  shopId?: string | null;
  sellerId?: string | null;
  approvalStatus?: string;
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
  categoryId?: string;
  collectionId?: string;
  basePrice: number;
  sellerName?: string;
  productionDate?: string;
  isActive: boolean;
  mainImage: ProductImageDto;
  galleryImages: ProductImageDto[];
  variants: ProductVariantDto[];
  availableSizes: string[];
  availableColors: string[];
  relatedProducts: ProductCardDto[];
  // ─── Marketplace ────────────────────────────────────────────────────────────
  shopId?: string | null;
  sellerId?: string | null;
  approvalStatus?: string;
  rejectionReason?: string | null;
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
