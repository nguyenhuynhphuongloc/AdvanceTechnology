function getApiBase() {
  if (typeof window !== 'undefined' && window.location.hostname === 'host.docker.internal') {
    return 'http://host.docker.internal:3000';
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBase()}${url}`, {
    ...options,
    headers: { ...getHeaders(), ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `HTTP ${res.status}`);
  }
  return res.json() as T;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  shopId: string;
  variantId: string;
  productId: string;
  sku: string;
  stock: number;
  reservedStock: number;
}

export interface VariantStockMap {
  [variantId: string]: number;
}

// ─── API Functions ──────────────────────────────────────────────────────────

export async function fetchVariantStock(variantId: string): Promise<number> {
  try {
    const res = await apiFetch<InventoryItem>(`/api/v1/inventory/items/${variantId}`);
    return res.stock - res.reservedStock;
  } catch {
    return -1; // Unknown stock
  }
}

export async function fetchStockForVariants(variantIds: string[]): Promise<VariantStockMap> {
  const token = (getHeaders() as Record<string, string>)['Authorization'];
  if (!token) {
    // Not logged in - can't check stock
    return {};
  }

  const results: VariantStockMap = {};
  try {
    await Promise.all(
      variantIds.map(async (variantId) => {
        try {
          const res = await apiFetch<InventoryItem>(`/api/v1/inventory/items/${variantId}`);
          results[variantId] = res.stock - res.reservedStock;
        } catch {
          results[variantId] = -1;
        }
      }),
    );
  } catch {
    // All failed
  }
  return results;
}
