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

export interface OrderItem {
  productId: string;
  variantId: string;
  productNameSnapshot: string;
  variantNameSnapshot: string;
  skuSnapshot: string;
  imageUrlSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  subtotal: number;
}

export interface ShopOrder {
  shopId: string;
  shopName: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
}

export interface Order {
  id: string;
  authUserId: string;
  status: string;
  totalAmount: number;
  shopOrders: ShopOrder[];
  shippingAddress?: ShippingAddress;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  district: string;
  postalCode?: string;
  country?: string;
}

export interface PaginatedOrders {
  items: OrderSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface OrderSummary {
  id: string;
  status: string;
  totalAmount: number;
  shopOrderCount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
}

export interface CheckoutPayload {
  shippingAddress: ShippingAddress;
  paymentMethod?: string;
}

// ─── API Functions ──────────────────────────────────────────────────────────

export async function fetchMyOrders(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedOrders> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const query = qs.toString();
  return apiFetch<PaginatedOrders>(`/api/v1/orders/me${query ? `?${query}` : ''}`);
}

export async function fetchOrderDetail(id: string): Promise<Order> {
  return apiFetch<Order>(`/api/v1/orders/${id}`);
}

export async function checkout(payload: CheckoutPayload): Promise<{ orderId: string }> {
  return apiFetch<{ orderId: string }>('/api/v1/orders/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function cancelOrder(
  id: string,
  reason?: string,
): Promise<Order> {
  return apiFetch<Order>(`/api/v1/orders/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}
