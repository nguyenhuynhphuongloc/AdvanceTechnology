// Mock data for marketplace

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  category: string;
  shopId: string;
  shopName: string;
  stock: number;
  description: string;
  variants?: { name: string; options: string[] }[];
  rating?: number;
  sold?: number;
}

export interface Shop {
  id: string;
  slug: string;
  name: string;
  description: string;
  logo: string;
  banner: string;
  rating: number;
  productCount: number;
  status: 'approved' | 'pending' | 'suspended';
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  shopId: string;
  shopName: string;
  variantInfo?: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: CartItem[];
  shippingAddress: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
}

export const categories = [
  { id: '1', name: 'Electronics', slug: 'electronics' },
  { id: '2', name: 'Fashion', slug: 'fashion' },
  { id: '3', name: 'Home & Living', slug: 'home-living' },
  { id: '4', name: 'Beauty', slug: 'beauty' },
  { id: '5', name: 'Sports', slug: 'sports' },
  { id: '6', name: 'Books', slug: 'books' },
];

export const mockShops: Shop[] = [
  {
    id: '1',
    slug: 'tech-zone',
    name: 'Tech Zone',
    description: 'Your one-stop shop for the latest electronics and gadgets',
    logo: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200',
    banner: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200',
    rating: 4.8,
    productCount: 156,
    status: 'approved',
  },
  {
    id: '2',
    slug: 'fashion-hub',
    name: 'Fashion Hub',
    description: 'Trendy fashion for everyone',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
    banner: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200',
    rating: 4.6,
    productCount: 203,
    status: 'approved',
  },
  {
    id: '3',
    slug: 'home-essentials',
    name: 'Home Essentials',
    description: 'Everything you need for a beautiful home',
    logo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200',
    banner: 'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=1200',
    rating: 4.7,
    productCount: 89,
    status: 'approved',
  },
];

export const mockProducts: Product[] = [
  {
    id: '1',
    slug: 'wireless-headphones',
    name: 'Premium Wireless Headphones',
    price: 299000,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    category: 'electronics',
    shopId: '1',
    shopName: 'Tech Zone',
    stock: 45,
    description: 'High-quality wireless headphones with active noise cancellation and 30-hour battery life.',
    variants: [
      { name: 'Color', options: ['Black', 'Silver', 'Blue'] },
    ],
    rating: 4.8,
    sold: 234,
  },
  {
    id: '2',
    slug: 'smart-watch',
    name: 'Smart Watch Pro',
    price: 499000,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    category: 'electronics',
    shopId: '1',
    shopName: 'Tech Zone',
    stock: 23,
    description: 'Advanced fitness tracking, heart rate monitoring, and smartphone notifications.',
    variants: [
      { name: 'Size', options: ['40mm', '44mm'] },
      { name: 'Color', options: ['Space Gray', 'Silver', 'Gold'] },
    ],
    rating: 4.6,
    sold: 156,
  },
  {
    id: '3',
    slug: 'cotton-t-shirt',
    name: 'Premium Cotton T-Shirt',
    price: 159000,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
    category: 'fashion',
    shopId: '2',
    shopName: 'Fashion Hub',
    stock: 120,
    description: '100% organic cotton, comfortable and breathable.',
    variants: [
      { name: 'Size', options: ['S', 'M', 'L', 'XL'] },
      { name: 'Color', options: ['White', 'Black', 'Navy', 'Gray'] },
    ],
    rating: 4.5,
    sold: 789,
  },
  {
    id: '4',
    slug: 'denim-jeans',
    name: 'Classic Denim Jeans',
    price: 399000,
    image: 'https://images.unsplash.com/photo-1542272454315-7f6ab6973c83?w=600',
    category: 'fashion',
    shopId: '2',
    shopName: 'Fashion Hub',
    stock: 67,
    description: 'Timeless design with premium denim fabric.',
    variants: [
      { name: 'Size', options: ['28', '30', '32', '34', '36'] },
      { name: 'Color', options: ['Dark Blue', 'Light Blue', 'Black'] },
    ],
    rating: 4.7,
    sold: 432,
  },
  {
    id: '5',
    slug: 'table-lamp',
    name: 'Modern Table Lamp',
    price: 249000,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',
    category: 'home-living',
    shopId: '3',
    shopName: 'Home Essentials',
    stock: 34,
    description: 'Elegant minimalist design with adjustable brightness.',
    rating: 4.4,
    sold: 123,
  },
  {
    id: '6',
    slug: 'throw-pillow',
    name: 'Decorative Throw Pillow',
    price: 89000,
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600',
    category: 'home-living',
    shopId: '3',
    shopName: 'Home Essentials',
    stock: 200,
    description: 'Soft and comfortable with beautiful patterns.',
    variants: [
      { name: 'Pattern', options: ['Geometric', 'Floral', 'Solid'] },
      { name: 'Color', options: ['Beige', 'Gray', 'Navy', 'Mustard'] },
    ],
    rating: 4.6,
    sold: 567,
  },
  {
    id: '7',
    slug: 'running-shoes',
    name: 'Professional Running Shoes',
    price: 599000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    category: 'sports',
    shopId: '1',
    shopName: 'Tech Zone',
    stock: 0,
    description: 'Lightweight and cushioned for maximum performance.',
    variants: [
      { name: 'Size', options: ['39', '40', '41', '42', '43', '44'] },
      { name: 'Color', options: ['Black/White', 'Red/Black', 'Blue/White'] },
    ],
    rating: 4.9,
    sold: 891,
  },
  {
    id: '8',
    slug: 'yoga-mat',
    name: 'Premium Yoga Mat',
    price: 199000,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600',
    category: 'sports',
    shopId: '3',
    shopName: 'Home Essentials',
    stock: 78,
    description: 'Non-slip surface with extra cushioning for comfort.',
    variants: [
      { name: 'Color', options: ['Purple', 'Blue', 'Pink', 'Black'] },
      { name: 'Thickness', options: ['5mm', '8mm'] },
    ],
    rating: 4.7,
    sold: 345,
  },
];

// Local storage helpers
export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  const cart = localStorage.getItem('marketplace_cart');
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart: CartItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('marketplace_cart', JSON.stringify(cart));
};

export const addToCart = (item: Omit<CartItem, 'id'>) => {
  const cart = getCart();
  const existingItem = cart.find(
    (i) => i.productId === item.productId && i.variantInfo === item.variantInfo
  );

  if (existingItem) {
    existingItem.quantity += item.quantity;
  } else {
    cart.push({ ...item, id: Date.now().toString() });
  }

  saveCart(cart);
  return cart;
};

export const updateCartItem = (itemId: string, quantity: number) => {
  const cart = getCart();
  const item = cart.find((i) => i.id === itemId);
  if (item) {
    item.quantity = quantity;
    saveCart(cart);
  }
  return cart;
};

export const removeFromCart = (itemId: string) => {
  const cart = getCart().filter((i) => i.id !== itemId);
  saveCart(cart);
  return cart;
};

export const clearCart = () => {
  saveCart([]);
};

export const getCartTotal = () => {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
};

export const getCartItemCount = () => {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
};

// Mock orders
export const mockOrders: Order[] = [
  {
    id: 'ORD001',
    date: '2026-05-15',
    status: 'delivered',
    total: 598000,
    paymentStatus: 'paid',
    shippingAddress: '123 Nguyen Hue, District 1, Ho Chi Minh City',
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'Premium Wireless Headphones',
        productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
        price: 299000,
        quantity: 2,
        shopId: '1',
        shopName: 'Tech Zone',
        variantInfo: 'Black',
      },
    ],
  },
  {
    id: 'ORD002',
    date: '2026-05-10',
    status: 'shipped',
    total: 558000,
    paymentStatus: 'paid',
    shippingAddress: '456 Le Loi, District 3, Ho Chi Minh City',
    items: [
      {
        id: '2',
        productId: '3',
        productName: 'Premium Cotton T-Shirt',
        productImage: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
        price: 159000,
        quantity: 2,
        shopId: '2',
        shopName: 'Fashion Hub',
        variantInfo: 'White, L',
      },
      {
        id: '3',
        productId: '5',
        productName: 'Modern Table Lamp',
        productImage: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',
        price: 249000,
        quantity: 1,
        shopId: '3',
        shopName: 'Home Essentials',
      },
    ],
  },
  {
    id: 'ORD003',
    date: '2026-05-08',
    status: 'processing',
    total: 399000,
    paymentStatus: 'paid',
    shippingAddress: '789 Tran Hung Dao, District 5, Ho Chi Minh City',
    items: [
      {
        id: '4',
        productId: '4',
        productName: 'Classic Denim Jeans',
        productImage: 'https://images.unsplash.com/photo-1542272454315-7f6ab6973c83?w=600',
        price: 399000,
        quantity: 1,
        shopId: '2',
        shopName: 'Fashion Hub',
        variantInfo: 'Dark Blue, 32',
      },
    ],
  },
];
