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
    // Use seller auth tokens (set by seller login/register flow)
    const token = localStorage.getItem('seller_token') || localStorage.getItem('acme_token');
    const userStr = localStorage.getItem('seller_user') || localStorage.getItem('acme_user');
    const role = userStr ? (JSON.parse(userStr).role || 'seller') : 'seller';
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

export interface Shop {
    id: string;
    sellerId: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    description: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    address: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    commissionRate: string;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateShopPayload {
    name?: string;
    slug?: string;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    description?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    address?: string | null;
}

// ─── API Functions ─────────────────────────────────────────────────────────

export async function fetchMyShop(): Promise<Shop> {
    const response = await fetch(`${API_BASE_URL}/api/v1/seller/shop`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('NO_SHOP');
        }
        const err = await response.json().catch(() => ({ message: 'Failed to load shop' }));
        throw new Error(err.message || `Failed to load shop: ${response.status}`);
    }
    return response.json();
}

export async function updateMyShop(payload: UpdateShopPayload): Promise<Shop> {
    const response = await fetch(`${API_BASE_URL}/api/v1/seller/shop`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Failed to update shop' }));
        throw new Error(err.message || `Failed to update shop: ${response.status}`);
    }
    return response.json();
}

export async function createMyShop(payload: {
    name: string;
    slug: string;
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
}): Promise<Shop> {
    const response = await fetch(`${API_BASE_URL}/api/v1/seller/shop`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Failed to create shop' }));
        throw new Error(err.message || `Failed to create shop: ${response.status}`);
    }
    return response.json();
}
