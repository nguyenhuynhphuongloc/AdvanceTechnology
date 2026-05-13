"use client";

import Link from "next/link";
import { useEffect, useMemo, useReducer, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchAdminInventory,
  fetchAdminOrders,
  fetchAdminProducts,
  fetchAdminUsers,
  isAdminApiError,
  isAdminUnauthorizedError,
  logoutAdmin,
} from "@/lib/admin/api";
import { ADMIN_LOGIN_PATH, ADMIN_PRODUCTS_PATH } from "@/lib/admin/constants";
import { clearAdminSessionToken } from "@/lib/admin/session";
import type {
  AdminOrderRecord,
  AdminProductCard,
  AdminUserAccount,
  InventoryRecord,
} from "@/lib/admin/types";
import { useAdminSession } from "./AdminSessionGate";

type ViewMode = "overview" | "products" | "orders" | "inventory" | "users";

type LoadableState<T> = {
  status: "loading" | "success" | "error";
  data: T;
  error: string | null;
};

type LoadableAction<T> =
  | { type: "loading" }
  | { type: "success"; data: T[] }
  | { type: "error"; error: string };

function loadableReducer<T>(
  state: LoadableState<T[]>,
  action: LoadableAction<T>,
): LoadableState<T[]> {
  switch (action.type) {
    case "loading":
      return { status: "loading", data: [], error: null };
    case "success":
      return { status: "success", data: action.data, error: null };
    case "error":
      return { status: "error", data: [], error: action.error };
    default:
      return state;
  }
}

function createLoadableState<T>(data: T): LoadableState<T> {
  return {
    status: "loading",
    data,
    error: null,
  };
}

function SectionState({
  title,
  description,
  tone = "neutral",
}: {
  title: string;
  description: string;
  tone?: "neutral" | "error";
}) {
  return (
    <div
      style={{
        border: `1px solid ${tone === "error" ? "#fecaca" : "#ddd"}`,
        borderRadius: 8,
        background: tone === "error" ? "#fff1f2" : "#fff",
        padding: 16,
      }}
    >
      <h2 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 700 }}>{title}</h2>
      <p style={{ margin: 0, color: "#444", lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getProductSearchFields(product: AdminProductCard): string[] {
  return [
    product.id,
    product.name,
    product.slug,
    product.sku,
    product.category,
    product.isActive ? "active" : "inactive",
  ].filter(Boolean);
}

function getInventorySearchFields(item: InventoryRecord): string[] {
  return [
    item.id,
    item.productId ?? "",
    item.variantId,
    item.sku ?? "",
    item.status,
  ];
}

function getOrderSearchFields(order: AdminOrderRecord): string[] {
  return [
    order.id,
    order.status,
    order.paymentMethod,
    order.recipientEmail ?? "",
    order.failureReason ?? "",
  ];
}

function getUserSearchFields(user: AdminUserAccount): string[] {
  return [
    user.id,
    user.email,
    user.role,
    user.isActive ? "active" : "inactive",
  ];
}

function SearchBox({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) {
  return (
    <div style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search admin data..."
        style={{
          flex: 1,
          border: "1px solid #ccc",
          borderRadius: 8,
          padding: "10px 12px",
          color: "#111",
        }}
      />
      <button
        style={{
          border: "1px solid #111",
          borderRadius: 8,
          background: "#111",
          color: "#fff",
          padding: "10px 16px",
          cursor: "pointer",
        }}
        onClick={() => setSearch("")}
      >
        Clear
      </button>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { token, user } = useAdminSession();
  const [activeView, setActiveView] = useState<ViewMode>("overview");
  const [search, setSearch] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [productsState, dispatchProducts] = useReducer(
    loadableReducer<AdminProductCard>,
    createLoadableState([]),
  );
  const [inventoryState, dispatchInventory] = useReducer(
    loadableReducer<InventoryRecord>,
    createLoadableState([]),
  );
  const [ordersState, dispatchOrders] = useReducer(
    loadableReducer<AdminOrderRecord>,
    createLoadableState([]),
  );
  const [usersState, dispatchUsers] = useReducer(
    loadableReducer<AdminUserAccount>,
    createLoadableState([]),
  );

  useEffect(() => {
    let cancelled = false;

    const handleUnauthorized = () => {
      clearAdminSessionToken();
      router.replace(ADMIN_LOGIN_PATH);
      router.refresh();
    };

    const resolveState = <T,>(
      result: PromiseSettledResult<{ items: T[] }>,
      dispatch: (action: LoadableAction<T>) => void,
      fallbackMessage: string,
    ) => {
      if (result.status === "fulfilled") {
        dispatch({ type: "success", data: result.value.items });
        return;
      }

      const error = result.reason;
      if (isAdminUnauthorizedError(error)) {
        handleUnauthorized();
        return;
      }

      dispatch({
        type: "error",
        error: isAdminApiError(error) ? error.message : fallbackMessage,
      });
    };

    dispatchProducts({ type: "loading" });
    dispatchInventory({ type: "loading" });
    dispatchOrders({ type: "loading" });
    dispatchUsers({ type: "loading" });

    Promise.allSettled([
      fetchAdminProducts(token, { limit: 50, status: "all" }),
      fetchAdminInventory(token),
      fetchAdminOrders(token),
      fetchAdminUsers(token),
    ]).then((results) => {
      if (cancelled) {
        return;
      }

      resolveState(results[0], dispatchProducts, "Could not load products from the admin API.");
      resolveState(results[1], dispatchInventory, "Could not load inventory from the admin API.");
      resolveState(results[2], dispatchOrders, "Could not load orders from the admin API.");
      resolveState(results[3], dispatchUsers, "Could not load users from the admin API.");
    });

    return () => {
      cancelled = true;
    };
  }, [router, token]);

  const query = search.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    if (!query) {
      return productsState.data;
    }

    return productsState.data.filter((product) =>
      getProductSearchFields(product).some((field) => field.toLowerCase().includes(query)),
    );
  }, [productsState.data, query]);

  const filteredInventory = useMemo(() => {
    if (!query) {
      return inventoryState.data;
    }

    return inventoryState.data.filter((item) =>
      getInventorySearchFields(item).some((field) => field.toLowerCase().includes(query)),
    );
  }, [inventoryState.data, query]);

  const filteredOrders = useMemo(() => {
    if (!query) {
      return ordersState.data;
    }

    return ordersState.data.filter((order) =>
      getOrderSearchFields(order).some((field) => field.toLowerCase().includes(query)),
    );
  }, [ordersState.data, query]);

  const filteredUsers = useMemo(() => {
    if (!query) {
      return usersState.data;
    }

    return usersState.data.filter((user) =>
      getUserSearchFields(user).some((field) => field.toLowerCase().includes(query)),
    );
  }, [usersState.data, query]);

  const overviewStats = useMemo(
    () => [
      {
        label: "Total Products",
        value: productsState.status === "success" ? String(productsState.data.length) : "--",
      },
      {
        label: "Inventory Records",
        value: inventoryState.status === "success" ? String(inventoryState.data.length) : "--",
      },
      {
        label: "Orders",
        value: ordersState.status === "success" ? String(ordersState.data.length) : "--",
      },
      {
        label: "Users",
        value: usersState.status === "success" ? String(usersState.data.length) : "--",
      },
      {
        label: "Low Stock Items",
        value:
          inventoryState.status === "success"
            ? String(inventoryState.data.filter((item) => item.status === "low-stock").length)
            : "--",
      },
      {
        label: "Active Accounts",
        value:
          usersState.status === "success"
            ? String(usersState.data.filter((item) => item.isActive).length)
            : "--",
      },
    ],
    [inventoryState, ordersState, productsState, usersState],
  );

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logoutAdmin(token);
    } catch {
      // Clear the client session even if the remote logout call fails.
    } finally {
      clearAdminSessionToken();
      router.replace(ADMIN_LOGIN_PATH);
      router.refresh();
    }
  }


  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8f8f8",
        color: "#111",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ display: "flex", maxWidth: 1300, margin: "0 auto" }}>
        <aside
          style={{
            width: 240,
            minHeight: "100vh",
            borderRight: "1px solid #ddd",
            background: "#fff",
            padding: 20,
          }}
        >
          <h2 style={{ margin: 0, marginBottom: 8, fontSize: 22, fontWeight: 800 }}>
            Admin
          </h2>
          <p style={{ margin: "0 0 20px", color: "#666", fontSize: 13 }}>{user.email}</p>
          <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { key: "overview", label: "Overview" },
              { key: "products", label: "Products" },
              { key: "orders", label: "Orders" },
              { key: "inventory", label: "Inventory" },
              { key: "users", label: "Users" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveView(item.key as ViewMode);
                  setSearch("");
                }}
                style={{
                  textAlign: "left",
                  border: "none",
                  background: activeView === item.key ? "#111" : "transparent",
                  color: activeView === item.key ? "#fff" : "#111",
                  padding: "10px 14px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <section style={{ flex: 1, padding: 24 }}>
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
              gap: 12,
            }}
          >
            <div>
              <p style={{ margin: 0, color: "#555" }}>
                All admin sections now read real data through the gateway-backed admin APIs.
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={{
                border: "1px solid #111",
                borderRadius: 8,
                background: "#fff",
                color: "#111",
                padding: "10px 16px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </button>
          </header>

          <SearchBox search={search} setSearch={setSearch} />

          {activeView === "overview" && (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                {overviewStats.map((stat) => (
                  <article
                    key={stat.label}
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      padding: 16,
                      background: "#fff",
                    }}
                  >
                    <p style={{ margin: 0, color: "#666", fontSize: 12 }}>{stat.label}</p>
                    <p style={{ margin: "8px 0 0", fontSize: 24, fontWeight: 700 }}>
                      {stat.value}
                    </p>
                  </article>
                ))}
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 16,
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                }}
              >
                <SectionState
                  title="Products data source"
                  description={
                    productsState.status === "loading"
                      ? "Loading real product data from /api/v1/admin/products..."
                      : productsState.status === "error"
                        ? productsState.error ?? "Could not load the products section."
                        : `${productsState.data.length} product records loaded from the admin products API.`
                  }
                  tone={productsState.status === "error" ? "error" : "neutral"}
                />
                <SectionState
                  title="Inventory data source"
                  description={
                    inventoryState.status === "loading"
                      ? "Loading real inventory data from /api/v1/admin/inventory..."
                      : inventoryState.status === "error"
                        ? inventoryState.error ?? "Could not load the inventory section."
                        : `${inventoryState.data.length} inventory records loaded from the admin inventory API.`
                  }
                  tone={inventoryState.status === "error" ? "error" : "neutral"}
                />
                <SectionState
                  title="Orders data source"
                  description={
                    ordersState.status === "loading"
                      ? "Loading real order data from /api/v1/admin/orders..."
                      : ordersState.status === "error"
                        ? ordersState.error ?? "Could not load the orders section."
                        : `${ordersState.data.length} order records loaded from the admin orders API.`
                  }
                  tone={ordersState.status === "error" ? "error" : "neutral"}
                />
                <SectionState
                  title="Users data source"
                  description={
                    usersState.status === "loading"
                      ? "Loading real account data from /api/v1/admin/users..."
                      : usersState.status === "error"
                        ? usersState.error ?? "Could not load the users section."
                        : `${usersState.data.length} user accounts loaded from the admin users API.`
                  }
                  tone={usersState.status === "error" ? "error" : "neutral"}
                />
              </div>
            </>
          )}

          {activeView === "products" && (
            <div style={{ border: "1px solid #ddd", borderRadius: 8, background: "#fff", padding: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                  flexWrap: "wrap",
                }}
              >
                <h2 style={{ margin: 0 }}>Products</h2>
                <Link
                  href={ADMIN_PRODUCTS_PATH}
                  style={{
                    border: "1px solid #111",
                    borderRadius: 8,
                    background: "#111",
                    color: "#fff",
                    padding: "10px 16px",
                    textDecoration: "none",
                    fontWeight: 700,
                  }}
                >
                  Add product
                </Link>
              </div>

              {productsState.status === "loading" && (
                <SectionState
                  title="Loading products"
                  description="Fetching product rows from the real admin products API."
                />
              )}

              {productsState.status === "error" && (
                <SectionState
                  title="Products unavailable"
                  description={productsState.error ?? "Could not load products."}
                  tone="error"
                />
              )}

              {productsState.status === "success" && filteredProducts.length === 0 && (
                <SectionState
                  title="No products found"
                  description={
                    productsState.data.length === 0
                      ? "No products exist yet. Add the first product to start managing the catalog."
                      : "No products match the current search."
                  }
                />
              )}

              {productsState.status === "success" && filteredProducts.length > 0 && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>ID</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Name</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Category</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Price</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{product.id}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                          <div style={{ fontWeight: 600 }}>{product.name}</div>
                          <div style={{ color: "#666", fontSize: 13 }}>{product.sku}</div>
                        </td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{product.category}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                          ${product.basePrice.toFixed(2)}
                        </td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                          {product.isActive ? "Active" : "Inactive"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeView === "orders" && (
            <div style={{ border: "1px solid #ddd", borderRadius: 8, background: "#fff", padding: 16 }}>
              <h2 style={{ margin: "0 0 12px" }}>Orders</h2>

              {ordersState.status === "loading" && (
                <SectionState
                  title="Loading orders"
                  description="Fetching order rows from the real admin orders API."
                />
              )}

              {ordersState.status === "error" && (
                <SectionState
                  title="Orders unavailable"
                  description={ordersState.error ?? "Could not load orders."}
                  tone="error"
                />
              )}

              {ordersState.status === "success" && filteredOrders.length === 0 && (
                <SectionState
                  title="No orders found"
                  description={
                    ordersState.data.length === 0
                      ? "No orders have been created yet."
                      : "No orders match the current search."
                  }
                />
              )}

              {ordersState.status === "success" && filteredOrders.length > 0 && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>ID</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Status</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Payment</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Recipient</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Items</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Total</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{order.id}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{order.status}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{order.paymentMethod}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                          {order.recipientEmail ?? "--"}
                        </td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{order.items.length}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                          ${order.totalAmount.toFixed(2)}
                        </td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeView === "inventory" && (
            <div style={{ border: "1px solid #ddd", borderRadius: 8, background: "#fff", padding: 16 }}>
              <h2 style={{ margin: "0 0 12px" }}>Inventory</h2>

              {inventoryState.status === "loading" && (
                <SectionState
                  title="Loading inventory"
                  description="Fetching inventory rows from the real admin inventory API."
                />
              )}

              {inventoryState.status === "error" && (
                <SectionState
                  title="Inventory unavailable"
                  description={inventoryState.error ?? "Could not load inventory."}
                  tone="error"
                />
              )}

              {inventoryState.status === "success" && filteredInventory.length === 0 && (
                <SectionState
                  title="No inventory found"
                  description={
                    inventoryState.data.length === 0
                      ? "No inventory records exist yet. Add products or create stock records first."
                      : "No inventory records match the current search."
                  }
                />
              )}

              {inventoryState.status === "success" && filteredInventory.length > 0 && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Record</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>SKU</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Variant</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Stock</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Reserved</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Available</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => (
                      <tr key={item.id}>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{item.id}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{item.sku ?? "--"}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{item.variantId}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{item.stock}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{item.reservedStock}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{item.availableStock}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeView === "users" && (
            <div style={{ border: "1px solid #ddd", borderRadius: 8, background: "#fff", padding: 16 }}>
              <h2 style={{ margin: "0 0 12px" }}>Users</h2>

              {usersState.status === "loading" && (
                <SectionState
                  title="Loading users"
                  description="Fetching user accounts from the real admin users API."
                />
              )}

              {usersState.status === "error" && (
                <SectionState
                  title="Users unavailable"
                  description={usersState.error ?? "Could not load users."}
                  tone="error"
                />
              )}

              {usersState.status === "success" && filteredUsers.length === 0 && (
                <SectionState
                  title="No users found"
                  description={
                    usersState.data.length === 0
                      ? "No user accounts exist yet."
                      : "No users match the current search."
                  }
                />
              )}

              {usersState.status === "success" && filteredUsers.length > 0 && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>ID</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Email</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Role</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Status</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((account) => (
                      <tr key={account.id}>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{account.id}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{account.email}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{account.role}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                          {account.isActive ? "Active" : "Inactive"}
                        </td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                          {formatDate(account.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
