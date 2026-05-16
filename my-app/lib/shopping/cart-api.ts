
const API_BASE_URL =
    typeof window === "undefined"
        ? process.env.API_GATEWAY_URL ||
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "http://localhost:3000"
        : process.env.NEXT_PUBLIC_API_BASE_URL ||
          process.env.API_GATEWAY_URL ||
          "http://localhost:3000";

export type CartItemInput = {
    variantId: string;
    quantity: number;
    unitPrice: number;
};

export type CartBackendItem = {
    variantId: string;
    quantity: number;
    unitPrice: number;
};

export type CartBackendState = {
    userId: string | null;
    guestToken: string | null;
    ownerKey: string;
    items: CartBackendItem[];
};

async function cartFetch<T>(
    path: string, 
    method: string = 'GET', 
    body?: unknown, 
    headers?: Record<string, string>
): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cart API error (${response.status}): ${errorText || response.statusText}`);
    }

    return response.json() as Promise<T>;
}

export const cartApi = {
    getCart: (userId?: string, guestToken?: string) => {
        const headers: Record<string, string> = {};
        if (userId) headers['x-user-id'] = userId;
        if (guestToken) headers['x-guest-token'] = guestToken;
        return cartFetch<CartBackendState>('/api/v1/carts/me', 'GET', undefined, headers);
    },

    addItem: (item: CartItemInput, userId?: string, guestToken?: string) => {
        const headers: Record<string, string> = {};
        if (userId) headers['x-user-id'] = userId;
        if (guestToken) headers['x-guest-token'] = guestToken;
        return cartFetch<CartBackendState>('/api/v1/carts/me/items', 'POST', item, headers);
    },

    removeItem: (variantId: string, userId?: string, guestToken?: string) => {
        const headers: Record<string, string> = {};
        if (userId) headers['x-user-id'] = userId;
        if (guestToken) headers['x-guest-token'] = guestToken;
        return cartFetch<CartBackendState>(`/api/v1/carts/me/items/${variantId}`, 'DELETE', undefined, headers);
    },

    clearCart: (userId?: string, guestToken?: string) => {
        const headers: Record<string, string> = {};
        if (userId) headers['x-user-id'] = userId;
        if (guestToken) headers['x-guest-token'] = guestToken;
        return cartFetch<CartBackendState>('/api/v1/carts/me', 'DELETE', undefined, headers);
    },

    mergeCart: (userId: string, guestToken: string) => {
        const headers: Record<string, string> = { 'x-user-id': userId };
        return cartFetch<CartBackendState>('/api/v1/carts/merge', 'POST', { guestToken }, headers);
    }
};
