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

export interface ProductVariant {
    id: string;
    sku: string;
    size?: string | null;
    color?: string | null;
    priceOverride?: number | null;
    isActive: boolean;
    stock?: number;
}

export interface ProductImage {
    id?: string;
    imageUrl: string;
    publicId?: string | null;
    altText?: string | null;
    sortOrder?: number;
    isMain?: boolean;
}

export interface SellerProduct {
    id: string;
    name: string;
    slug: string;
    sku: string;
    categoryId: string | null;
    collectionId: string | null;
    basePrice: number;
    imageUrl: string | null;
    sellerName: string;
    isActive: boolean;
    shopId: string;
    sellerId: string;
    approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected' | 'hidden';
    rejectionReason?: string | null;
    description?: string | null;
    variants?: ProductVariant[];
    images?: ProductImage[];
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductListResponse {
    items: SellerProduct[];
    page: number;
    limit: number;
    total: number;
}

// ─── API Functions ─────────────────────────────────────────────────────────

export async function fetchSellerProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    categoryId?: string;
}): Promise<ProductListResponse> {
    const url = new URL(`${API_BASE_URL}/api/v1/seller/products`);
    if (params?.page) url.searchParams.set('page', String(params.page));
    if (params?.limit) url.searchParams.set('limit', String(params.limit ?? 20));
    if (params?.search) url.searchParams.set('search', params.search);
    if (params?.status) url.searchParams.set('status', params.status);
    if (params?.categoryId) url.searchParams.set('categoryId', params.categoryId);

    const response = await fetch(url.toString(), { headers: getAuthHeaders() });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Failed to load products' }));
        throw new Error(err.message || `Failed to load products: ${response.status}`);
    }
    return response.json();
}

export async function fetchSellerProductDetail(id: string): Promise<SellerProduct> {
    const response = await fetch(`${API_BASE_URL}/api/v1/seller/products/${id}`, {
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        if (response.status === 404) throw new Error('Product not found');
        const err = await response.json().catch(() => ({ message: 'Failed to load product' }));
        throw new Error(err.message || `Failed to load product: ${response.status}`);
    }
    return response.json();
}

export interface CreateProductPayload {
    name: string;
    slug: string;
    sku?: string;
    description?: string;
    categoryId?: string;
    collectionId?: string;
    basePrice: number;
    isActive?: boolean;
    images?: ProductImage[];
    variants?: Omit<ProductVariant, 'id'>[];
}

export async function createSellerProduct(payload: CreateProductPayload): Promise<SellerProduct> {
    const response = await fetch(`${API_BASE_URL}/api/v1/seller/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Failed to create product' }));
        throw new Error(err.message || `Failed to create product: ${response.status}`);
    }
    return response.json();
}

export async function updateSellerProduct(
    id: string,
    payload: Partial<CreateProductPayload>
): Promise<SellerProduct> {
    const response = await fetch(`${API_BASE_URL}/api/v1/seller/products/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Failed to update product' }));
        throw new Error(err.message || `Failed to update product: ${response.status}`);
    }
    return response.json();
}

export async function deleteSellerProduct(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/seller/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Failed to delete product' }));
        throw new Error(err.message || `Failed to delete product: ${response.status}`);
    }
}

export async function submitSellerProduct(id: string): Promise<SellerProduct> {
    const response = await fetch(`${API_BASE_URL}/api/v1/seller/products/${id}/submit`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
    });
    if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'Failed to submit product' }));
        throw new Error(err.message || `Failed to submit product: ${response.status}`);
    }
    return response.json();
}
