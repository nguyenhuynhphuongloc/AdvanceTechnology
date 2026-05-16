const API_BASE_URL =
    process.env.API_GATEWAY_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:3000";

function getAuthHeaders(): HeadersInit {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem('acme_user');
    if (!stored) return {};
    const user = JSON.parse(stored);
    return {
        'x-user-id': user.email, // Using email as ID for mock auth
        'x-user-role': user.role || 'user',
        'Content-Type': 'application/json',
    };
}

export interface CreateOrderRequest {
    paymentMethod: string;
    totalAmount: number;
    recipientEmail?: string;
    simulatePaymentFailure?: boolean;
    items: Array<{
        variantId: string;
        quantity: number;
        unitPrice: number;
    }>;
    authUserId?: string;
}

export interface OrderResponse {
    id: string;
    status: 'pending' | 'confirmed' | 'failed' | 'cancelled' | 'awaiting_approval' | 'shipping' | 'delivered' | 'awaiting_payment';
    paymentMethod: string;
    totalAmount: number;
    recipientEmail?: string;
    failureReason?: string;
    createdAt: string;
    updatedAt: string;
}

export async function createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
    console.log("Mocking createOrder for demo mode", data);
    return {
        id: 'demo-order-' + Math.random().toString(36).substr(2, 9),
        status: 'awaiting_payment',
        paymentMethod: data.paymentMethod || 'stripe',
        totalAmount: data.totalAmount,
        recipientEmail: data.recipientEmail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

export async function fetchOrderById(id: string): Promise<OrderResponse> {
    console.log("Mocking fetchOrderById for demo mode", id);
    return {
        id: id,
        status: 'awaiting_payment',
        paymentMethod: 'stripe',
        totalAmount: 60.99, // default cart demo total, will use actual cart total in real app
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

export async function fetchMyOrders(): Promise<OrderResponse[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/user/my-orders`, {
        cache: 'no-store',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch orders');
    }

    return response.json();
}

export async function approveOrder(id: string): Promise<OrderResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/${id}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to approve order');
    }

    return response.json();
}

export async function createPaymentIntent(orderId: string, amount: number): Promise<{ clientSecret: string }> {
    console.log("Mocking createPaymentIntent for demo mode", orderId, amount);
    
    // Direct Stripe API call to bypass broken backend for the demo
    // Use environment variable for secret key
    const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || '';
    
    try {
        const response = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET.trim()}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                amount: Math.round(amount * 100).toString(),
                currency: 'usd',
                'automatic_payment_methods[enabled]': 'true',
            }).toString(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to create mock payment intent');
        }

        const data = await response.json();
        return { clientSecret: data.client_secret };
    } catch (err: unknown) {
        console.error("Mock Stripe Error:", err);
        const message = err instanceof Error ? err.message : 'Failed to create payment intent';
        throw new Error(message);
    }
}

export async function fetchAdminOrders(): Promise<{ items: OrderResponse[]; total: number }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/orders`, {
        cache: 'no-store',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch admin orders');
    }

    return response.json();
}

export async function deliverOrder(id: string): Promise<OrderResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/orders/${id}/deliver`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });

    if (!response.ok) {
        throw new Error('Failed to deliver order');
    }

    return response.json();
}

