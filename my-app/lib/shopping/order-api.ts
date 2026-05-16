const API_BASE_URL =
    typeof window === "undefined"
        ? process.env.API_GATEWAY_URL ||
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "http://localhost:3000"
        : process.env.NEXT_PUBLIC_API_BASE_URL ||
          process.env.API_GATEWAY_URL ||
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

// --- Persistent Mock Order Store (for Demo Mode) ---
const MOCK_ORDERS_KEY = 'acme_mock_orders';

function getMockOrders(): OrderResponse[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(MOCK_ORDERS_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveMockOrders(orders: OrderResponse[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(orders));
}

export async function createOrder(data: CreateOrderRequest): Promise<OrderResponse> {
    console.log("Creating persistent mock order", data);
    
    const newOrder: OrderResponse = {
        id: 'ord-' + Math.random().toString(36).substr(2, 9),
        status: 'awaiting_payment',
        paymentMethod: data.paymentMethod || 'stripe',
        totalAmount: data.totalAmount,
        recipientEmail: data.recipientEmail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const orders = getMockOrders();
    orders.push(newOrder);
    saveMockOrders(orders);

    return newOrder;
}

export async function fetchOrderById(id: string): Promise<OrderResponse> {
    console.log("Fetching mock order by ID", id);
    const orders = getMockOrders();
    const order = orders.find(o => o.id === id);
    
    if (!order) {
        throw new Error('Order not found');
    }
    
    return order;
}

export async function fetchMyOrders(): Promise<OrderResponse[]> {
    console.log("Fetching my mock orders");
    return getMockOrders().sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function approveOrder(id: string): Promise<OrderResponse> {
    console.log("Approving mock order", id);
    const orders = getMockOrders();
    const index = orders.findIndex(o => o.id === id);
    
    if (index === -1) {
        throw new Error('Order not found');
    }
    
    orders[index] = {
        ...orders[index],
        status: 'awaiting_approval',
        updatedAt: new Date().toISOString()
    };
    
    saveMockOrders(orders);
    return orders[index];
}

export async function createPaymentIntent(orderId: string, amount: number): Promise<{ clientSecret: string }> {
    console.log("Creating payment intent through internal API", orderId, amount);
    
    try {
        const response = await fetch('/api/payments/intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId, amount }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create payment intent');
        }

        return response.json();
    } catch (err: unknown) {
        console.error("Payment Intent Error:", err);
        const message = err instanceof Error ? err.message : 'Failed to create payment intent';
        throw new Error(message);
    }
}

export async function fetchAdminOrders(): Promise<{ items: OrderResponse[]; total: number }> {
    const orders = getMockOrders();
    return {
        items: orders,
        total: orders.length
    };
}

export async function deliverOrder(id: string): Promise<OrderResponse> {
    const orders = getMockOrders();
    const index = orders.findIndex(o => o.id === id);
    
    if (index === -1) {
        throw new Error('Order not found');
    }
    
    orders[index] = {
        ...orders[index],
        status: 'delivered',
        updatedAt: new Date().toISOString()
    };
    
    saveMockOrders(orders);
    return orders[index];
}

