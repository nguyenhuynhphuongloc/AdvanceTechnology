// Mock data for Seller UI

export interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  banner?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  sellerId: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';
  shopId: string;
  createdAt: string;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price?: number;
  stock: number;
  reserved: number;
  lowStockThreshold: number;
}

export interface SellerOrder {
  id: string;
  orderNumber: string;
  shopId: string;
  buyerName: string;
  buyerEmail: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
}

// Mock current shop
export const mockShop: Shop = {
  id: 'shop-1',
  name: 'Tech Gadgets Store',
  slug: 'tech-gadgets-store',
  description: 'Your one-stop shop for the latest tech gadgets and accessories',
  logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&h=200&fit=crop',
  banner: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=300&fit=crop',
  status: 'approved',
  email: 'contact@techgadgets.com',
  phone: '+84 123 456 789',
  address: '123 Tech Street, District 1, Ho Chi Minh City',
  createdAt: '2024-01-15T00:00:00Z',
  sellerId: 'seller-1'
};

// Mock products
export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Wireless Earbuds Pro',
    slug: 'wireless-earbuds-pro',
    description: 'Premium wireless earbuds with active noise cancellation and 24-hour battery life',
    category: 'Audio',
    price: 1299000,
    compareAtPrice: 1599000,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=800&h=800&fit=crop'
    ],
    status: 'approved',
    shopId: 'shop-1',
    createdAt: '2024-02-01T00:00:00Z',
    variants: [
      { id: 'var-1', productId: 'prod-1', sku: 'WEP-BLK', name: 'Black', stock: 45, reserved: 5, lowStockThreshold: 10 },
      { id: 'var-2', productId: 'prod-1', sku: 'WEP-WHT', name: 'White', stock: 32, reserved: 3, lowStockThreshold: 10 }
    ]
  },
  {
    id: 'prod-2',
    name: 'Smart Watch Series 5',
    slug: 'smart-watch-series-5',
    description: 'Advanced fitness tracking, heart rate monitoring, and smartphone notifications',
    category: 'Wearables',
    price: 2499000,
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&h=800&fit=crop'
    ],
    status: 'approved',
    shopId: 'shop-1',
    createdAt: '2024-02-05T00:00:00Z',
    variants: [
      { id: 'var-3', productId: 'prod-2', sku: 'SW5-42', name: '42mm', stock: 28, reserved: 2, lowStockThreshold: 10 },
      { id: 'var-4', productId: 'prod-2', sku: 'SW5-46', name: '46mm', stock: 35, reserved: 5, lowStockThreshold: 10 }
    ]
  },
  {
    id: 'prod-3',
    name: 'Portable Power Bank 20000mAh',
    slug: 'portable-power-bank-20000mah',
    description: 'Fast charging power bank with dual USB ports and LED display',
    category: 'Accessories',
    price: 499000,
    images: [
      'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&h=800&fit=crop'
    ],
    status: 'approved',
    shopId: 'shop-1',
    createdAt: '2024-02-10T00:00:00Z',
    variants: [
      { id: 'var-5', productId: 'prod-3', sku: 'PB-20K', name: 'Standard', stock: 8, reserved: 2, lowStockThreshold: 10 }
    ]
  },
  {
    id: 'prod-4',
    name: 'Mechanical Keyboard RGB',
    slug: 'mechanical-keyboard-rgb',
    description: 'Gaming mechanical keyboard with customizable RGB lighting',
    category: 'Peripherals',
    price: 1899000,
    images: [
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&h=800&fit=crop'
    ],
    status: 'pending',
    shopId: 'shop-1',
    createdAt: '2024-02-15T00:00:00Z',
    variants: [
      { id: 'var-6', productId: 'prod-4', sku: 'KB-RGB-BR', name: 'Brown Switch', stock: 20, reserved: 0, lowStockThreshold: 5 },
      { id: 'var-7', productId: 'prod-4', sku: 'KB-RGB-BL', name: 'Blue Switch', stock: 15, reserved: 0, lowStockThreshold: 5 }
    ]
  },
  {
    id: 'prod-5',
    name: 'USB-C Hub Adapter',
    slug: 'usb-c-hub-adapter',
    description: '7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader',
    category: 'Accessories',
    price: 599000,
    images: [
      'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800&h=800&fit=crop'
    ],
    status: 'draft',
    shopId: 'shop-1',
    createdAt: '2024-02-20T00:00:00Z',
    variants: [
      { id: 'var-8', productId: 'prod-5', sku: 'HUB-7IN1', name: 'Standard', stock: 50, reserved: 0, lowStockThreshold: 15 }
    ]
  }
];

// Mock orders
export const mockSellerOrders: SellerOrder[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-2024-001',
    shopId: 'shop-1',
    buyerName: 'Nguyen Van A',
    buyerEmail: 'nguyenvana@example.com',
    status: 'processing',
    total: 2598000,
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Wireless Earbuds Pro',
        variantId: 'var-1',
        variantName: 'Black',
        quantity: 2,
        price: 1299000,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&h=200&fit=crop'
      }
    ],
    shippingAddress: {
      name: 'Nguyen Van A',
      phone: '+84 987 654 321',
      address: '456 Main St, Apartment 12B',
      city: 'Ho Chi Minh City',
      district: 'District 1',
      ward: 'Ward 3'
    },
    paymentStatus: 'paid',
    createdAt: '2024-05-15T10:30:00Z',
    updatedAt: '2024-05-15T11:00:00Z'
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-2024-002',
    shopId: 'shop-1',
    buyerName: 'Tran Thi B',
    buyerEmail: 'tranthib@example.com',
    status: 'shipped',
    total: 2998000,
    items: [
      {
        id: 'item-2',
        productId: 'prod-2',
        productName: 'Smart Watch Series 5',
        variantId: 'var-3',
        variantName: '42mm',
        quantity: 1,
        price: 2499000,
        image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=200&h=200&fit=crop'
      },
      {
        id: 'item-3',
        productId: 'prod-3',
        productName: 'Portable Power Bank 20000mAh',
        variantId: 'var-5',
        variantName: 'Standard',
        quantity: 1,
        price: 499000,
        image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=200&h=200&fit=crop'
      }
    ],
    shippingAddress: {
      name: 'Tran Thi B',
      phone: '+84 912 345 678',
      address: '789 Shopping Plaza, Floor 2',
      city: 'Hanoi',
      district: 'Hoan Kiem',
      ward: 'Ward 1'
    },
    paymentStatus: 'paid',
    createdAt: '2024-05-14T14:20:00Z',
    updatedAt: '2024-05-16T09:15:00Z'
  },
  {
    id: 'order-3',
    orderNumber: 'ORD-2024-003',
    shopId: 'shop-1',
    buyerName: 'Le Van C',
    buyerEmail: 'levanc@example.com',
    status: 'delivered',
    total: 1299000,
    items: [
      {
        id: 'item-4',
        productId: 'prod-1',
        productName: 'Wireless Earbuds Pro',
        variantId: 'var-2',
        variantName: 'White',
        quantity: 1,
        price: 1299000,
        image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=200&h=200&fit=crop'
      }
    ],
    shippingAddress: {
      name: 'Le Van C',
      phone: '+84 901 234 567',
      address: '321 Tech Park, Building A',
      city: 'Da Nang',
      district: 'Hai Chau',
      ward: 'Ward 5'
    },
    paymentStatus: 'paid',
    createdAt: '2024-05-10T08:45:00Z',
    updatedAt: '2024-05-13T16:30:00Z'
  },
  {
    id: 'order-4',
    orderNumber: 'ORD-2024-004',
    shopId: 'shop-1',
    buyerName: 'Pham Thi D',
    buyerEmail: 'phamthid@example.com',
    status: 'pending',
    total: 499000,
    items: [
      {
        id: 'item-5',
        productId: 'prod-3',
        productName: 'Portable Power Bank 20000mAh',
        variantId: 'var-5',
        variantName: 'Standard',
        quantity: 1,
        price: 499000,
        image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=200&h=200&fit=crop'
      }
    ],
    shippingAddress: {
      name: 'Pham Thi D',
      phone: '+84 934 567 890',
      address: '111 Green Avenue',
      city: 'Ho Chi Minh City',
      district: 'District 3',
      ward: 'Ward 10'
    },
    paymentStatus: 'pending',
    createdAt: '2024-05-17T12:00:00Z',
    updatedAt: '2024-05-17T12:00:00Z'
  }
];

// Dashboard stats
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  lowStockItems: number;
  pendingOrders: number;
  revenueChange: number;
  ordersChange: number;
}

export const mockDashboardStats: DashboardStats = {
  totalRevenue: 45680000,
  totalOrders: 128,
  totalProducts: 5,
  lowStockItems: 1,
  pendingOrders: 1,
  revenueChange: 12.5,
  ordersChange: 8.3
};
