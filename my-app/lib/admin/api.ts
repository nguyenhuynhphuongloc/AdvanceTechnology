import type {
  AdminLoginResponse,
  AdminProductDetail,
  AdminProductListResponse,
  AdminProductPayload,
  InventoryRecord,
  InventorySearchQuery,
  InventorySearchResponse,
} from "./types";

type QueryValue = string | number | undefined | null;

export class AdminApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

function getAdminApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_GATEWAY_URL ||
    "http://localhost:3000"
  );
}

function buildAdminUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(path, getAdminApiBaseUrl());

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function parseErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(payload.message)) {
      return payload.message.join(", ");
    }
    if (payload.message) {
      return payload.message;
    }
  }

  const text = await response.text();
  return text || `Request failed with status ${response.status}`;
}

export async function adminRequest<T>(
  path: string,
  options?: {
    method?: string;
    token?: string | null;
    query?: Record<string, QueryValue>;
    body?: unknown;
  },
): Promise<T> {
  const response = await fetch(buildAdminUrl(path, options?.query), {
    method: options?.method ?? "GET",
    cache: "no-store",
    headers: {
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new AdminApiError(await parseErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function uploadAdminProductImage(
  file: File,
  token?: string | null,
) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(buildAdminUrl("/api/v1/products/upload-image"), {
    method: "POST",
    cache: "no-store",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    throw new AdminApiError(await parseErrorMessage(response), response.status);
  }

  return response.json() as Promise<{ imageUrl: string; publicId: string }>;
}

export function loginAdmin(email: string, password: string) {
  return adminRequest<AdminLoginResponse>("/api/v1/auth/admin/login", {
    method: "POST",
    body: { email, password },
  });
}

export function fetchAdminSession(token: string) {
  return adminRequest<{ id: string; email: string; role: string }>(
    "/api/v1/auth/admin/me",
    { token },
  );
}

export function logoutAdmin(token: string) {
  return adminRequest<{ success: true }>("/api/v1/auth/admin/logout", {
    method: "POST",
    token,
  });
}

export function fetchAdminProducts(
  token: string,
  query?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: "all" | "active" | "inactive";
  },
) {
  return adminRequest<AdminProductListResponse>("/api/v1/admin/products", {
    token,
    query,
  });
}

export function fetchAdminProductDetail(token: string, productId: string) {
  return adminRequest<AdminProductDetail>(`/api/v1/admin/products/${productId}`, {
    token,
  });
}

export function createAdminProduct(token: string, payload: AdminProductPayload) {
  return adminRequest<AdminProductDetail>("/api/v1/admin/products", {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateAdminProduct(
  token: string,
  productId: string,
  payload: AdminProductPayload,
) {
  return adminRequest<AdminProductDetail>(`/api/v1/admin/products/${productId}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export function deleteAdminProduct(token: string, productId: string) {
  return adminRequest<{ success: true }>(`/api/v1/admin/products/${productId}`, {
    method: "DELETE",
    token,
  });
}

export function fetchAdminInventory(
  token: string,
  query?: InventorySearchQuery,
) {
  return adminRequest<InventorySearchResponse>("/api/v1/admin/inventory", {
    token,
    query: query
      ? {
          productId: query.productId,
          variantId: query.variantId,
          sku: query.sku,
        }
      : undefined,
  });
}

export function updateInventoryQuantity(
  token: string,
  inventoryId: string,
  stock: number,
) {
  return adminRequest<InventoryRecord>(`/api/v1/admin/inventory/${inventoryId}`, {
    method: "PATCH",
    token,
    body: { stock },
  });
}
