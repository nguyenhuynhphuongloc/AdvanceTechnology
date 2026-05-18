'use client';

const API_BASE_URL =
  typeof window === 'undefined'
    ? process.env.API_GATEWAY_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      'http://localhost:3000'
    : process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.API_GATEWAY_URL ||
      'http://localhost:3000';

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('seller_token') || localStorage.getItem('acme_token');
  const userStr = localStorage.getItem('seller_user') || localStorage.getItem('acme_user');
  const role = userStr ? (JSON.parse(userStr).role || 'user') : 'user';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userStr) {
    const user = JSON.parse(userStr);
    headers['x-user-id'] = user.id || user.userId || user.email || '';
  }
  headers['x-user-role'] = role;
  return headers;
}

export interface ShopCategory {
  id: string;
  shopId: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchShopCategories(): Promise<ShopCategory[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/seller/categories`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Failed to load categories' }));
    throw new Error(err.message || `Failed to load categories: ${response.status}`);
  }
  return response.json();
}

export interface CreateCategoryPayload {
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
}

export async function createShopCategory(payload: CreateCategoryPayload): Promise<ShopCategory> {
  const response = await fetch(`${API_BASE_URL}/api/v1/seller/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Failed to create category' }));
    throw new Error(err.message || `Failed to create category: ${response.status}`);
  }
  return response.json();
}

export async function updateShopCategory(
  id: string,
  payload: Partial<CreateCategoryPayload>,
): Promise<ShopCategory> {
  const response = await fetch(`${API_BASE_URL}/api/v1/seller/categories/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Failed to update category' }));
    throw new Error(err.message || `Failed to update category: ${response.status}`);
  }
  return response.json();
}

export async function deleteShopCategory(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/seller/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Failed to delete category' }));
    throw new Error(err.message || `Failed to delete category: ${response.status}`);
  }
}
