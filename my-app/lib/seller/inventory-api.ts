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
    const token = localStorage.getItem('acme_token');
    const userStr = localStorage.getItem('acme_user');
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

// ─── Types ─────────────────────────────────────────────────────────────────

export type InventoryStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export interface InventoryItem {
    id: string;
    shopId: string;
    productId: string;
    variantId: string;
    sku: string;
    stock: number;
    reservedStock: number;
    availableStock: number;
    lowStockThreshold: number;
    status: InventoryStatus;
    updatedAt: string;
}

export interface InventoryListResponse {
    items: InventoryItem[];
    total: number;
    page?: number;
    limit?: number;
}

// ─── API Functions ─────────────────────────────────────────────────────────

export async function fetchSellerInventory(params?: {
    page?: number;
    limit?: number;
    search?: string;
    lowStockOnly?: boolean;
    productId?: string;
}): Promise<InventoryListResponse> {
    const url = new URL(`${API_BASE_URL}/api/v1/seller/inventory`);
    if (params?.page) url.searchParams.set('page', String(params.page));
    if (params?.limit) url.searchParams.set('limit', String(params.limit ?? 20));
    if (params?.search) url.searchParams.set('search', params.search);
    if (params?.lowStockOnly) url.searchParams.set('lowStockOnly', 'true');
    if (params?.productId) url.searchParams.set('productId', params.productId);

    const response = await fetch(url.toString(), { headers: getAuthHeaders() });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Failed to load inventory' }));
        throw new Error(err.message || `Failed to load inventory: ${response.status}`);
    }
    return response.json();
}

export interface UpsertInventoryPayload {
    productId: string;
    variantId: string;
    stock: number;
    lowStockThreshold?: number;
}

export async function upsertInventoryItem(payload: UpsertInventoryPayload): Promise<InventoryItem> {
    const response = await fetch(`${API_BASE_URL}/api/v1/seller/inventory`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Failed to upsert inventory' }));
        throw new Error(err.message || `Failed to upsert inventory: ${response.status}`);
    }
    return response.json();
}

export interface UpdateInventoryPayload {
    stock?: number;
    lowStockThreshold?: number;
}

export async function updateInventoryStock(
    variantId: string,
    payload: UpdateInventoryPayload
): Promise<InventoryItem> {
    const response = await fetch(`${API_BASE_URL}/api/v1/seller/inventory/${variantId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Failed to update stock' }));
        throw new Error(err.message || `Failed to update stock: ${response.status}`);
    }
    return response.json();
}
