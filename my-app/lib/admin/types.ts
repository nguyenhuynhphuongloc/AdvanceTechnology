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
  authUserId?: string | null;
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
  categoryId?: string;
  collectionId?: string;
  categoryName?: string;
  categorySlug?: string;
  basePrice: number;
  imageUrl: string;
  isActive?: boolean;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminCategoryListResponse {
  items: AdminCategory[];
  total: number;
}

export interface AdminCategoryPayload {
  name: string;
  slug: string;
  parentId?: string | null;
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

export interface AdminMediaAsset {
  publicId: string;
  imageUrl: string;
  format?: string | null;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
  createdAt?: string | null;
  linked: boolean;
  linkedProductId?: string | null;
  linkedProductName?: string | null;
}

export interface AdminMediaListResponse {
  items: AdminMediaAsset[];
  total: number;
}

export interface AdminMediaUploadResponse extends AdminUploadedProductImage {
  linked: false;
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
  categoryId?: string;
  collectionId?: string;
  categoryName?: string;
  categorySlug?: string;
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
  categoryId: string;
  collectionId?: string | null;
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
  branchId?: string | null;
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
  branchId?: string;
}

export interface AdminBranch {
  id: string;
  name: string;
  location?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBranchPayload {
  name: string;
  location?: string;
  isActive?: boolean;
}

export interface AdminBranchListResponse {
  items: AdminBranch[];
  total: number;
}

export interface AdminPaymentRecord {
  id: string;
  orderId: string;
  method: string;
  amount: number;
  status: string;
  gatewayRef?: string | null;
  clientSecret?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaymentListResponse {
  items: AdminPaymentRecord[];
  total: number;
}

export interface AdminCartItem {
  variantId: string;
  quantity: number;
  unitPrice: number;
}

export interface AdminCartRecord {
  id: string;
  userId?: string | null;
  guestToken?: string | null;
  ownerKey: string;
  items: AdminCartItem[];
  itemCount: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCartListResponse {
  items: AdminCartRecord[];
  total: number;
}

export interface AdminNotificationRecord {
  id: string;
  orderId: string;
  type: string;
  recipient?: string | null;
  status: string;
  message?: string | null;
  createdAt: string;
}

export interface AdminNotificationListResponse {
  items: AdminNotificationRecord[];
  total: number;
}

export interface AdminLogRecord {
  id: string;
  level: string;
  source: string;
  message: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdminLogListResponse {
  items: AdminLogRecord[];
  total: number;
}

export interface AdminStoreSettings {
  id: string;
  storeName: string;
  logoImageUrl?: string | null;
  logoPublicId?: string | null;
  description?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStoreSettingsPayload {
  storeName?: string;
  logoImageUrl?: string | null;
  logoPublicId?: string | null;
  description?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
}
