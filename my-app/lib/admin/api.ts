import type {
  AdminLoginResponse,
  AdminCategory,
  AdminCategoryListResponse,
  AdminCategoryPayload,
  AdminMediaListResponse,
  AdminMediaUploadResponse,
  AdminBranch,
  AdminBranchListResponse,
  AdminBranchPayload,
  AdminCartListResponse,
  AdminCartRecord,
  AdminLogListResponse,
  AdminLogRecord,
  AdminNotificationListResponse,
  AdminNotificationRecord,
  AdminOrderListResponse,
  AdminPaymentListResponse,
  AdminPaymentRecord,
  AdminProductDetail,
  AdminProductListResponse,
  AdminProductPayload,
  AdminStoreSettings,
  AdminStoreSettingsPayload,
  AdminUploadedProductImage,
  AdminUserListResponse,
  AdminUserAccount,
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

export function isAdminApiError(error: unknown): error is AdminApiError {
  return error instanceof AdminApiError;
}

export function isAdminUnauthorizedError(error: unknown) {
  return error instanceof AdminApiError && error.status === 401;
}

function getAdminApiBaseUrl() {
  if (typeof window === "undefined") {
    return process.env.API_GATEWAY_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
  }

  return process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_GATEWAY_URL || "http://localhost:3000";
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
  const isFormData = typeof FormData !== "undefined" && options?.body instanceof FormData;
  const response = await fetch(buildAdminUrl(path, options?.query), {
    method: options?.method ?? "GET",
    cache: "no-store",
    headers: {
      ...(options?.body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: isFormData
      ? (options.body as FormData)
      : options?.body
        ? JSON.stringify(options.body)
        : undefined,
  });

  if (!response.ok) {
    throw new AdminApiError(await parseErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
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

export function fetchAdminCategories(token: string, query?: { search?: string }) {
  return adminRequest<AdminCategoryListResponse>("/api/v1/admin/categories", {
    token,
    query,
  });
}

export function createAdminCategory(token: string, payload: AdminCategoryPayload) {
  return adminRequest<AdminCategory>("/api/v1/admin/categories", {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateAdminCategory(
  token: string,
  categoryId: string,
  payload: AdminCategoryPayload,
) {
  return adminRequest<AdminCategory>(`/api/v1/admin/categories/${categoryId}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export function deleteAdminCategory(token: string, categoryId: string) {
  return adminRequest<{ success: true }>(`/api/v1/admin/categories/${categoryId}`, {
    method: "DELETE",
    token,
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

export function uploadAdminProductImage(file: File, token?: string | null) {
  const formData = new FormData();
  formData.append("file", file);

  return adminRequest<AdminUploadedProductImage>("/api/v1/admin/products/upload-image", {
    method: "POST",
    token,
    body: formData,
  });
}

export function fetchAdminMediaAssets(token: string) {
  return adminRequest<AdminMediaListResponse>("/api/v1/admin/products/media", {
    token,
  });
}

export function uploadAdminMediaAsset(file: File, token: string) {
  const formData = new FormData();
  formData.append("file", file);

  return adminRequest<AdminMediaUploadResponse>("/api/v1/admin/products/media/upload", {
    method: "POST",
    token,
    body: formData,
  });
}

export function deleteAdminMediaAsset(token: string, publicId: string) {
  return adminRequest<{ success: true }>("/api/v1/admin/products/media", {
    method: "DELETE",
    token,
    query: { publicId },
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

export function fetchAdminOrders(token: string) {
  return adminRequest<AdminOrderListResponse>("/api/v1/admin/orders", {
    token,
  }).then((response) => ({
    ...response,
    items: response.items.map((item) => ({
      ...item,
      totalAmount: Number(item.totalAmount),
      items: item.items.map((orderItem) => ({
        ...orderItem,
        quantity: Number(orderItem.quantity),
        unitPrice: Number(orderItem.unitPrice),
      })),
    })),
  }));
}

export function fetchAdminUsers(token: string) {
  return adminRequest<AdminUserListResponse>("/api/v1/admin/users", {
    token,
  });
}

export function fetchAdminPayments(
  token: string,
  query?: { search?: string; status?: string; orderId?: string },
) {
  return adminRequest<AdminPaymentListResponse>("/api/v1/admin/payments", {
    token,
    query,
  });
}

export function fetchAdminPaymentDetail(token: string, paymentId: string) {
  return adminRequest<AdminPaymentRecord>(`/api/v1/admin/payments/${paymentId}`, {
    token,
  });
}

export function fetchAdminCarts(
  token: string,
  query?: { search?: string; userId?: string; guestToken?: string },
) {
  return adminRequest<AdminCartListResponse>("/api/v1/admin/carts", {
    token,
    query,
  });
}

export function fetchAdminCartDetail(token: string, cartId: string) {
  return adminRequest<AdminCartRecord>(`/api/v1/admin/carts/${cartId}`, {
    token,
  });
}

export function fetchAdminBranches(token: string) {
  return adminRequest<AdminBranch[]>("/api/v1/admin/branches", {
    token,
  }).then((items) => ({
    items,
    total: items.length,
  }) satisfies AdminBranchListResponse);
}

export function createAdminBranch(token: string, payload: AdminBranchPayload) {
  return adminRequest<AdminBranch>("/api/v1/admin/branches", {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateAdminBranch(token: string, branchId: string, payload: AdminBranchPayload) {
  return adminRequest<AdminBranch>(`/api/v1/admin/branches/${branchId}`, {
    method: "PATCH",
    token,
    body: payload,
  });
}

export function deleteAdminBranch(token: string, branchId: string) {
  return adminRequest<void>(`/api/v1/admin/branches/${branchId}`, {
    method: "DELETE",
    token,
  });
}

export function fetchAdminStoreSettings(token: string) {
  return adminRequest<AdminStoreSettings>("/api/v1/admin/store-settings", {
    token,
  });
}

export function updateAdminStoreSettings(token: string, payload: AdminStoreSettingsPayload) {
  return adminRequest<AdminStoreSettings>("/api/v1/admin/store-settings", {
    method: "PATCH",
    token,
    body: payload,
  });
}

export function fetchAdminNotifications(
  token: string,
  query?: { search?: string; type?: string; status?: string },
) {
  return adminRequest<AdminNotificationListResponse>("/api/v1/admin/notifications", {
    token,
    query,
  });
}

export function fetchAdminNotificationDetail(token: string, notificationId: string) {
  return adminRequest<AdminNotificationRecord>(`/api/v1/admin/notifications/${notificationId}`, {
    token,
  });
}

export function fetchAdminLogs(
  token: string,
  query?: { search?: string; level?: string; source?: string },
) {
  return adminRequest<AdminLogListResponse>("/api/v1/admin/logs", {
    token,
    query,
  });
}

export function fetchAdminLogDetail(token: string, logId: string) {
  return adminRequest<AdminLogRecord>(`/api/v1/admin/logs/${logId}`, {
    token,
  });
}

export function updateAdminUserProfile(
  userId: string,
  payload: { name: string; email: string },
  token: string,
) {
  return adminRequest<{ user: AdminUserAccount }>(`/api/v1/admin/users/${userId}`, {
    method: "PATCH",
    token,
    body: payload,
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
