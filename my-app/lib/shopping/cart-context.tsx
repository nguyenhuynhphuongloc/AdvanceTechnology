'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { useRef } from 'react';
import { useAuth } from './auth-context';
import { cartApi, type CartBackendItem } from './cart-api';

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
  isSyncing: boolean;
};

const CartContext = createContext<CartContextType | null>(null);

function getOrCreateGuestToken(): string {
  if (typeof window === 'undefined') return '';
  let token = localStorage.getItem('acme_guest_token');
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem('acme_guest_token', token);
  }
  return token;
}

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
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [guestToken] = useState(() => getOrCreateGuestToken());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const initialSyncDone = useRef(false);

  // 1. Initial Load from localStorage (On Mount)
  useEffect(() => {
    const stored = readStoredCart();
    console.log('[CartContext] Initial mount load:', stored.length, 'items found.');
    if (stored.length > 0) {
      setItems(stored);
    }
    setIsInitialized(true);
  }, []);

  // 2. Persist items to localStorage (Only after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    console.log('[CartContext] Persisting to localStorage:', items.length, 'items.');
    localStorage.setItem('acme_cart', JSON.stringify(items));
  }, [items, isInitialized]);

  // 3. Sync with Backend on User Change (Only after initialization)
  useEffect(() => {
    if (!isInitialized) return;

    let cancelled = false;

    async function syncWithBackend() {
      if (!user && !guestToken) return;

      setIsSyncing(true);
      try {
        const userId = user?.email;
        const guestTok = guestToken;
        
        console.log('[CartContext] Syncing with backend... User:', userId);

        // A. Handle Merge on Login
        if (user) {
          const localItems = readStoredCart();
          if (localItems.length > 0) {
            console.log('[CartContext] Found local items for merge:', localItems.length);
            try {
              await cartApi.mergeCart(userId!, guestTok);
              console.log('[CartContext] Backend merge requested successfully.');
            } catch (mergeErr) {
              console.warn('[CartContext] Merge failed (continuing anyway):', mergeErr);
            }
          }
        }

        // B. Fetch Latest State
        const backendState = await cartApi.getCart(userId, guestTok);
        if (cancelled) return;

        console.log('[CartContext] Backend items received:', backendState.items.length);

        // C. Functional Update (Safest way to merge)
        setItems((prev) => {
          // If this is EXACTLY the same state we already have, do nothing to avoid loop
          // (Wait - usually backend is superior for quantity but local has metadata)
          
          const beItemsMap = new Map(backendState.items.map(i => [i.variantId, i]));
          
          // Reconcile EXISTING items
          const reconciled = prev.map(localItem => {
            const beMatch = beItemsMap.get(localItem.variant?.id || localItem.product.id);
            if (beMatch) {
              beItemsMap.delete(beMatch.variantId); // Mark as handled
              return { ...localItem, quantity: beMatch.quantity };
            }
            return localItem; // Keep local item even if not in backend yet
          });

          // Add NEW items from backend that we don't have locally
          const additional: CartItem[] = [];
          beItemsMap.forEach(beItem => {
            additional.push({
              id: beItem.variantId,
              product: { id: beItem.variantId, name: 'Product', price: beItem.unitPrice },
              quantity: beItem.quantity
            });
          });

          const final = [...reconciled, ...additional];
          console.log('[CartContext] State reconciliation:', prev.length, '->', final.length, 'items.');
          return final;
        });

        initialSyncDone.current = true;
      } catch (err) {
        console.warn('[CartContext] Sync effect failed:', err);
        initialSyncDone.current = true;
      } finally {
        setIsSyncing(false);
      }
    }

    void syncWithBackend();
    return () => { cancelled = true; };
  }, [user, guestToken, isInitialized]);

  const addToCart = (product: CartProductSnapshot, variant?: CartVariantSelection) => {
    const itemId = `${product.id}::${variant?.id ?? 'base'}`;
    const variantId = variant?.id || product.id;

    console.log('[CartContext] -> -> addToCart Triggered for:', itemId);

    setItems((prev) => {
      let nextItems: CartItem[];
      const existing = prev.find((item) => item.id === itemId);
      
      if (existing) {
        nextItems = prev.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      } else {
        nextItems = [...prev, { id: itemId, product, quantity: 1, variant }];
      }
      
      // FORCE SYNCHRONOUS PERSISTENCE
      // Prevents data loss if the user navigates away before the useEffect fires
      console.log('[CartContext] -> -> Synchronously saving to localStorage. Total items:', nextItems.length);
      localStorage.setItem('acme_cart', JSON.stringify(nextItems));
      
      return nextItems;
    });

    initialSyncDone.current = true;

    cartApi.addItem({ 
      variantId, 
      quantity: 1, 
      unitPrice: variant?.price || product.price 
    }, user?.email, guestToken).catch(err => console.warn('[CartContext] Backend sync failed:', err));
  };



  const removeFromCart = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    const variantId = item?.variant?.id || item?.product.id;

    setItems((prev) => prev.filter((item) => item.id !== itemId));

    if (variantId) {
      try {
        await cartApi.removeItem(variantId, user?.email, guestToken);
      } catch (err) {
        console.warn('Backend sync failed for removeFromCart:', err);
      }
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const nextQuantity = Number.isFinite(quantity) ? Math.floor(quantity) : 1;
    if (nextQuantity <= 0) {
      void removeFromCart(itemId);
      return;
    }

    const item = items.find(i => i.id === itemId);
    const delta = nextQuantity - (item?.quantity || 0);

    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: nextQuantity } : item)),
    );

    if (item && delta !== 0) {
      try {
        await cartApi.addItem({
          variantId: item.variant?.id || item.product.id,
          quantity: delta,
          unitPrice: item.variant?.price || item.product.price
        }, user?.email, guestToken);
      } catch (err) {
        console.warn('Backend sync failed for updateQuantity:', err);
      }
    }
  };

  const replaceItems = (nextItems: CartItem[]) => {
    setItems(nextItems);
    // Note: Massive replace would need a specialized backend sync or sequential updates
  };

  const clearCart = async () => {
    setItems([]);
    try {
      await cartApi.clearCart(user?.email, guestToken);
    } catch (err) {
      console.warn('Backend sync failed for clearCart:', err);
    }
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
        isSyncing
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
