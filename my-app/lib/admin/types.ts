export interface AdminSessionUser {
  id: string;
  email: string;
  role: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  user: AdminSessionUser;
}

export interface AdminOrderItem {
  variantId: string;
  quantity: number;
  unitPrice: number;
}

export interface AdminOrderRecord {
  id: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  recipientEmail?: string | null;
  failureReason?: string | null;
  correlationId?: string | null;
  items: AdminOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderListResponse {
  items: AdminOrderRecord[];
  total: number;
}

export interface AdminUserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListResponse {
  items: AdminUserAccount[];
  total: number;
}

export interface AdminProductCard {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  basePrice: number;
  imageUrl: string;
  isActive?: boolean;
}

export interface AdminProductImage {
  id?: string;
  imageUrl: string;
  publicId: string;
  altText?: string | null;
  sortOrder?: number;
  isMain?: boolean;
}

export interface AdminUploadedProductImage {
  imageUrl: string;
  publicId: string;
}

export interface AdminProductVariant {
  id?: string;
  sku: string;
  size: string;
  color: string;
  priceOverride?: number;
  imagePublicId?: string;
}

export interface AdminProductDetail {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  category: string;
  basePrice: number;
  isActive: boolean;
  mainImage: AdminProductImage;
  galleryImages: AdminProductImage[];
  variants: Array<{
    id: string;
    sku: string;
    size: string;
    color: string;
    price: number;
    imageUrl?: string;
  }>;
  availableSizes: string[];
  availableColors: string[];
  relatedProducts: AdminProductCard[];
}

export interface AdminProductListResponse {
  items: AdminProductCard[];
  page: number;
  limit: number;
  total: number;
}

export interface AdminProductPayload {
  name: string;
  slug: string;
  sku: string;
  description: string;
  categorySlug: string;
  basePrice: number;
  isActive?: boolean;
  mainImage: AdminProductImage;
  galleryImages?: AdminProductImage[];
  variants: AdminProductVariant[];
  relatedProductSlugs?: string[];
}

export interface InventoryRecord {
  id: string;
  productId?: string | null;
  variantId: string;
  sku?: string | null;
  stock: number;
  reservedStock: number;
  availableStock: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  updatedAt: string;
}

export interface InventorySearchResponse {
  items: InventoryRecord[];
  total: number;
}

export interface InventorySearchQuery {
  productId?: string;
  variantId?: string;
  sku?: string;
}
