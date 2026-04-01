'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type CartVariantSelection = {
  id: string;
  sku: string;
  color?: string;
  size?: string;
  price?: number;
};

export type CartProductSnapshot = {
  id: string;
  slug?: string;
  name: string;
  sku?: string;
  price: number;
  imageUrl?: string;
  category?: string;
};

export type CartItem = {
  id: string;
  product: CartProductSnapshot;
  quantity: number;
  variant?: CartVariantSelection;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: CartProductSnapshot, variant?: CartVariantSelection) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  replaceItems: (nextItems: CartItem[]) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextType | null>(null);

function normalizeStoredItem(rawItem: unknown): CartItem | null {
  if (!rawItem || typeof rawItem !== 'object') {
    return null;
  }

  const candidate = rawItem as {
    id?: unknown;
    quantity?: unknown;
    variant?: unknown;
    product?: {
      id?: unknown;
      slug?: unknown;
      sku?: unknown;
      name?: unknown;
      price?: unknown;
      image?: unknown;
      imageUrl?: unknown;
      category?: unknown;
    };
  };

  const productId = candidate.product?.id;
  const normalizedProductId = productId == null ? null : String(productId);
  const productName = candidate.product?.name;

  if (!normalizedProductId || typeof productName !== 'string') {
    return null;
  }

  const quantity =
    typeof candidate.quantity === 'number' && Number.isFinite(candidate.quantity) && candidate.quantity > 0
      ? candidate.quantity
      : 1;

  const variant =
    candidate.variant && typeof candidate.variant === 'object'
      ? (candidate.variant as CartVariantSelection)
      : undefined;

  const price = Number(candidate.product?.price);
  const itemId =
    typeof candidate.id === 'string'
      ? candidate.id
      : `${normalizedProductId}::${variant?.id ?? 'base'}`;

  return {
    id: itemId,
    quantity,
    product: {
      id: normalizedProductId,
      slug: typeof candidate.product?.slug === 'string' ? candidate.product.slug : undefined,
      sku: typeof candidate.product?.sku === 'string' ? candidate.product.sku : undefined,
      name: productName,
      price: Number.isFinite(price) ? price : 0,
      imageUrl:
        typeof candidate.product?.imageUrl === 'string'
          ? candidate.product.imageUrl
          : typeof candidate.product?.image === 'string'
            ? candidate.product.image
            : undefined,
      category: typeof candidate.product?.category === 'string' ? candidate.product.category : undefined,
    },
    variant,
  };
}

function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem('acme_cart');
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(normalizeStoredItem)
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStoredCart());

  useEffect(() => {
    localStorage.setItem('acme_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: CartProductSnapshot, variant?: CartVariantSelection) => {
    const itemId = `${product.id}::${variant?.id ?? 'base'}`;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === itemId);
      if (existing) {
        return prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...prev, { id: itemId, product, quantity: 1, variant }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    const nextQuantity = Number.isFinite(quantity) ? Math.floor(quantity) : 1;

    if (nextQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: nextQuantity } : item)),
    );
  };

  const replaceItems = (nextItems: CartItem[]) => {
    setItems(nextItems);
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        replaceItems,
        clearCart,
        totalCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
