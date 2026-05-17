const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { ...getHeaders(), ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `HTTP ${res.status}`);
  }
  return res.json() as T;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId?: string;
  collectionId?: string;
  basePrice: number;
  sellerName?: string;
  imageUrl: string;
  isActive: boolean;
  shopId: string | null;
  sellerId: string | null;
  approvalStatus: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  imageUrl?: string;
}

export interface ProductDetail {
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
  mainImage: { id: string; imageUrl: string; publicId: string };
  galleryImages: ProductVariant[];
  variants: ProductVariant[];
  availableSizes: string[];
  availableColors: string[];
  relatedProducts: ProductCard[];
  shopId: string | null;
  sellerId: string | null;
  approvalStatus: string;
  rejectionReason?: string | null;
}

export interface PaginatedProducts {
  items: ProductCard[];
  page: number;
  limit: number;
  total: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

// ─── API Functions ──────────────────────────────────────────────────────────

export async function fetchProducts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: string;
}): Promise<PaginatedProducts> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.category) qs.set('category', params.category);
  if (params?.search) qs.set('search', params.search);
  if (params?.sort) qs.set('sort', params.sort);
  const query = qs.toString();
  return apiFetch<PaginatedProducts>(
    `/api/v1/products${query ? `?${query}` : ''}`,
  );
}

export async function fetchProductDetail(
  slug: string,
): Promise<ProductDetail> {
  return apiFetch<ProductDetail>(`/api/v1/products/${slug}`);
}

export async function fetchRelatedProducts(slug: string): Promise<ProductCard[]> {
  const res = await apiFetch<{ items: ProductCard[] }>(
    `/api/v1/products/${slug}/related`,
  );
  return res.items;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await apiFetch<{ items: Category[]; total: number }>(
    '/api/v1/categories',
  );
  return res.items;
}
