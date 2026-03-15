export type ProductSort = "latest" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

export interface ProductCardDto {
    id: string;
    name: string;
    slug: string;
    sku: string;
    category: string;
    basePrice: number;
    imageUrl: string;
}

export interface ProductImageDto {
    id: string;
    imageUrl: string;
    publicId: string;
    altText?: string | null;
    sortOrder: number;
    isMain: boolean;
}

export interface ProductVariantDto {
    id: string;
    sku: string;
    size: string;
    color: string;
    price: number;
    imageUrl?: string;
}

export interface ProductDetailDto {
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

export interface ProductListResponse {
    items: ProductCardDto[];
    page: number;
    limit: number;
    total: number;
}

export interface RelatedProductsResponse {
    items: ProductCardDto[];
}
