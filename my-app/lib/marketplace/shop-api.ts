function getApiBase() {
  if (typeof window !== 'undefined' && window.location.hostname === 'host.docker.internal') {
    return 'http://host.docker.internal:3000';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
}

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
  const res = await fetch(`${getApiBase()}${url}`, {
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

export interface Shop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  sellerId: string;
  rating?: number;
  totalProducts?: number;
  createdAt?: string;
}

export interface ShopProductsResult {
  shop: { id: string; name: string; slug: string };
  items: ShopProductItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ShopProductItem {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  imageUrl: string;
  isActive: boolean;
}

// ─── API Functions ──────────────────────────────────────────────────────────

export async function fetchShops(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<Shop[]> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.search) qs.set('search', params.search);
  const query = qs.toString();
  const res = await apiFetch<Shop[] | { items: Shop[] }>(`/api/v1/shops${query ? `?${query}` : ''}`);
  return Array.isArray(res) ? res : res.items;
}

export async function fetchShopDetail(slug: string): Promise<Shop> {
  return apiFetch<Shop>(`/api/v1/shops/${slug}`);
}

export async function fetchShopProducts(
  slug: string,
  params?: { page?: number; limit?: number; category?: string },
): Promise<ShopProductsResult> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.category) qs.set('category', params.category);
  const query = qs.toString();
  return apiFetch<ShopProductsResult>(
    `/api/v1/shops/${slug}/products${query ? `?${query}` : ''}`,
  );
}
