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

export interface ShopOrderResponse {
  id: string;
  orderId: string;
  shopId: string;
  shopName: string;
  status: string;
  subtotal: number;
  shippingFee: number;
  shopTotal: number;
  trackingNumber?: string | null;
  shippingProvider?: string | null;
  estimatedDelivery?: string | null;
  confirmedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  items: ShopOrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface ShopOrderItemResponse {
  id: string;
  shopOrderId: string;
  productId: string;
  variantId: string;
  productNameSnapshot: string;
  variantNameSnapshot: string;
  skuSnapshot: string;
  imageUrlSnapshot: string;
  shopNameSnapshot: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  createdAt: string;
}

export interface PaginatedShopOrders {
  items: ShopOrderResponse[];
  total: number;
  page: number;
  limit: number;
}

// ─── API Functions ──────────────────────────────────────────────────────────

export async function fetchSellerOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<PaginatedShopOrders> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.status) qs.set('status', params.status);
  const query = qs.toString();
  return apiFetch<PaginatedShopOrders>(
    `/api/v1/seller/orders${query ? `?${query}` : ''}`,
  );
}

export async function fetchSellerOrderDetail(id: string): Promise<ShopOrderResponse> {
  return apiFetch<ShopOrderResponse>(`/api/v1/seller/orders/${id}`);
}

export async function confirmShopOrder(id: string): Promise<ShopOrderResponse> {
  return apiFetch<ShopOrderResponse>(`/api/v1/seller/orders/${id}/confirm`, {
    method: 'PATCH',
  });
}

export async function shipShopOrder(
  id: string,
  payload?: { trackingNumber?: string; shippingProvider?: string },
): Promise<ShopOrderResponse> {
  return apiFetch<ShopOrderResponse>(`/api/v1/seller/orders/${id}/ship`, {
    method: 'PATCH',
    body: JSON.stringify(payload ?? {}),
  });
}

export async function deliverShopOrder(id: string): Promise<ShopOrderResponse> {
  return apiFetch<ShopOrderResponse>(`/api/v1/seller/orders/${id}/deliver`, {
    method: 'PATCH',
  });
}

export async function cancelSellerOrder(
  id: string,
  reason?: string,
): Promise<ShopOrderResponse> {
  return apiFetch<ShopOrderResponse>(`/api/v1/seller/orders/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}
