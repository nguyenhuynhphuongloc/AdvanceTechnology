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

export interface CartItem {
  itemId: string;
  variantId: string;
  productId: string;
  shopId: string;
  productNameSnapshot: string;
  variantNameSnapshot: string;
  skuSnapshot: string;
  imageUrlSnapshot: string;
  shopNameSnapshot?: string;
  unitPriceSnapshot: number;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  cartId: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

// ─── API Functions ──────────────────────────────────────────────────────────

export async function fetchMyCart(): Promise<Cart> {
  return apiFetch<Cart>('/api/v1/carts/me');
}

export async function addCartItem(payload: {
  variantId: string;
  productId: string;
  quantity: number;
  shopId: string;
}): Promise<Cart> {
  return apiFetch<Cart>('/api/v1/carts/me/items', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCartItem(
  itemId: string,
  payload: { quantity: number },
): Promise<Cart> {
  return apiFetch<Cart>(`/api/v1/carts/me/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  return apiFetch<Cart>(`/api/v1/carts/me/items/${itemId}`, {
    method: 'DELETE',
  });
}
