"use client";

import { useMemo, useState } from "react";
import {
  fetchAdminUsers,
  updateAdminUserProfile,
} from "@/lib/admin/api";
import { getAdminSessionToken } from "@/lib/admin/session";
import type { AdminUserAccount } from "@/lib/admin/types";

type ViewMode = "overview" | "products" | "orders" | "inventory" | "users";

const stats = [
  { label: "Total Users", value: 1248 },
  { label: "Active Orders", value: 57 },
  { label: "Inventory SKU", value: 6480 },
  { label: "Revenue (USD)", value: 120304 },
];

const productRows = [
  { id: "P001", name: "Classic Jacket", stock: 12, price: 79.99 },
  { id: "P002", name: "Sport Sneakers", stock: 6, price: 54.99 },
  { id: "P003", name: "Smart Watch", stock: 20, price: 119.99 },
];

const orderRows = [
  { id: "O1001", customer: "Alice", total: 199.98, status: "Completed" },
  { id: "O1002", customer: "Bob", total: 54.99, status: "Pending" },
  { id: "O1003", customer: "Cindy", total: 79.99, status: "Cancelled" },
];

const inventoryRows = [
  { id: "I001", item: "Classic Jacket", quantity: 12 },
  { id: "I002", item: "Sport Sneakers", quantity: 6 },
  { id: "I003", item: "Smart Watch", quantity: 20 },
];

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<ViewMode>("overview");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AdminUserAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [userError, setUserError] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setUserError("");

    try {
      const token = getAdminSessionToken();
      if (!token) {
        setUserError("No admin session found.");
        return;
      }
      const response = await fetchAdminUsers(token);
      setUsers(response.items);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUserError("Khong the tai danh sach khach hang tu database.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return productRows;
    return productRows.filter((item) => item.id.toLowerCase().includes(q) || item.name.toLowerCase().includes(q));
  }, [search]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orderRows;
    return orderRows.filter((item) => item.id.toLowerCase().includes(q) || item.customer.toLowerCase().includes(q));
  }, [search]);

  const filteredInventory = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inventoryRows;
    return inventoryRows.filter((item) => item.id.toLowerCase().includes(q) || item.item.toLowerCase().includes(q));
  }, [search]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((item) => item.id.toString().includes(q) || item.name.toLowerCase().includes(q) || item.email.toLowerCase().includes(q));
  }, [search, users]);

  const startEditingUser = (user: AdminUserAccount) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setSaveMessage("");
    setUserError("");
  };

  const cancelEditingUser = () => {
    setEditingUserId(null);
    setEditName("");
    setEditEmail("");
    setSaveLoading(false);
    setSaveMessage("");
  };

  const saveUserProfile = async () => {
    if (editingUserId === null) {
      return;
    }

    setSaveLoading(true);
    setSaveMessage("");
    setUserError("");

    try {
      const token = getAdminSessionToken();
      if (!token) {
        setUserError("No admin session found.");
        return;
      }
      const response = await updateAdminUserProfile(editingUserId, {
        name: editName,
        email: editEmail,
      }, token);

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === editingUserId ? response.user : user,
        ),
      );
      setSaveMessage("Da cap nhat thong tin khach hang.");
      setEditingUserId(null);
    } catch (err) {
      console.error("Failed to update user profile:", err);
      setUserError("Khong the cap nhat profile khach hang.");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f8f8f8", color: "#111", fontFamily: "Inter, sans-serif" }}>
      <div style={{ display: "flex", maxWidth: 1300, margin: "0 auto" }}>
        <aside style={{ width: 240, minHeight: "100vh", borderRight: "1px solid #ddd", background: "#fff", padding: 20 }}>
          <h2 style={{ margin: 0, marginBottom: 24, fontSize: 22, fontWeight: 800 }}>Admin</h2>
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
                onClick={async () => {
                  setActiveView(item.key as ViewMode);
                  setSearch("");

                  if (item.key === "users") {
                    await loadUsers();
                  }
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
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <p style={{ margin: "4px 0 0", color: "#555" }}>Use the left menu to manage data.</p>
            </div>
          </header>

          <div style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by id or name..."
              style={{ flex: 1, border: "1px solid #ccc", borderRadius: 8, padding: "10px 12px", color: "#111" }}
            />
            <button
              style={{ border: "1px solid #111", borderRadius: 8, background: "#111", color: "#fff", padding: "10px 16px", cursor: "pointer" }}
              onClick={() => setSearch("")}
            >
              Clear
            </button>
          </div>

          {activeView === "overview" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
                {stats.map((stat) => (
                  <article key={stat.label} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, background: "#fff" }}>
                    <p style={{ margin: 0, color: "#666", fontSize: 12 }}>{stat.label}</p>
                    <p style={{ margin: "8px 0 0", fontSize: 24, fontWeight: 700 }}>{stat.value}</p>
                  </article>
                ))}
              </div>

              <div style={{ border: "1px solid #ddd", borderRadius: 8, background: "#fff", padding: 16 }}>
                <h2 style={{ margin: "0 0 12px" }}>Recent Activity</h2>
                <ul style={{ margin: 0, paddingLeft: 18, color: "#444" }}>
                  <li>Created order O1001 for Alice</li>
                  <li>Updated product P003 inventory</li>
                  <li>New user Bob registered</li>
                </ul>
              </div>
            </>
          )}

          {activeView === "products" && (
            <div style={{ border: "1px solid #ddd", borderRadius: 8, background: "#fff", padding: 16 }}>
              <h2 style={{ margin: "0 0 12px" }}>Products</h2>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>ID</th>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Name</th>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Stock</th>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Price</th>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{product.id}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{product.name}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{product.stock}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>${product.price.toFixed(2)}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                        <button style={{ border: "1px solid #111", padding: "6px 10px", borderRadius: 6, background: "#fff", cursor: "pointer" }}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeView === "orders" && (
            <div style={{ border: "1px solid #ddd", borderRadius: 8, background: "#fff", padding: 16 }}>
              <h2 style={{ margin: "0 0 12px" }}>Orders</h2>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>ID</th>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Customer</th>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Total</th>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{order.id}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{order.customer}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>${order.total.toFixed(2)}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeView === "inventory" && (
            <div style={dashboardStyles.card}>
              <h2 style={{ margin: "0 0 12px" }}>Inventory</h2>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>ID</th>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Item</th>
                    <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id}>
                      <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{item.id}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{item.item}</td>
                      <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeView === "users" && (
            <div style={{ border: "1px solid #ddd", borderRadius: 8, background: "#fff", padding: 16 }}>
              <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <h2 style={{ margin: 0 }}>Users</h2>
                <button
                  onClick={loadUsers}
                  style={{ border: "1px solid #111", borderRadius: 8, background: "#fff", color: "#111", cursor: "pointer", padding: "8px 12px" }}
                >
                  Refresh
                </button>
              </div>

              {editingUserId !== null && (
                <div
                  style={{
                    background: "#f8f8f8",
                    border: "1px solid #ddd",
                    borderRadius: 10,
                    display: "grid",
                    gap: 12,
                    marginBottom: 16,
                    padding: 16,
                  }}
                >
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", margin: "0 0 4px", textTransform: "uppercase" }}>
                      Edit Customer Profile
                    </p>
                    <p style={{ color: "#666", margin: 0 }}>
                      Cap nhat thong tin khach hang dang duoc chon.
                    </p>
                  </div>

                  <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                    <label style={{ display: "grid", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Full name</span>
                      <input
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        placeholder="Customer name"
                        style={{ border: "1px solid #ccc", borderRadius: 8, color: "#111", padding: "10px 12px" }}
                      />
                    </label>

                    <label style={{ display: "grid", gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Email</span>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(event) => setEditEmail(event.target.value)}
                        placeholder="customer@example.com"
                        style={{ border: "1px solid #ccc", borderRadius: 8, color: "#111", padding: "10px 12px" }}
                      />
                    </label>
                  </div>

                  <div style={{ alignItems: "center", display: "flex", gap: 10 }}>
                    <button
                      onClick={saveUserProfile}
                      disabled={saveLoading}
                      style={{ background: "#111", border: "1px solid #111", borderRadius: 8, color: "#fff", cursor: "pointer", padding: "10px 14px" }}
                    >
                      {saveLoading ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={cancelEditingUser}
                      disabled={saveLoading}
                      style={{ background: "#fff", border: "1px solid #ccc", borderRadius: 8, color: "#111", cursor: "pointer", padding: "10px 14px" }}
                    >
                      Cancel
                    </button>
                    {saveMessage ? <span style={{ color: "#027a48", fontSize: 14 }}>{saveMessage}</span> : null}
                  </div>
                </div>
              )}

              {loading ? (
                <p>Loading users...</p>
              ) : userError ? (
                <p style={{ color: "#b42318" }}>{userError}</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>ID</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Name</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Email</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Role</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Created</th>
                      <th style={{ textAlign: "left", padding: 10, borderBottom: "1px solid #ddd" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{user.id}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{user.name}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{user.email}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>{user.role}</td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                          {new Date(user.createdAt).toLocaleString()}
                        </td>
                        <td style={{ padding: 10, borderBottom: "1px solid #eee" }}>
                          <button
                            onClick={() => startEditingUser(user)}
                            style={{ background: "#fff", border: "1px solid #111", borderRadius: 6, color: "#111", cursor: "pointer", padding: "6px 10px" }}
                          >
                            Edit
                          </button>
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
