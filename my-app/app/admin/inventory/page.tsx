"use client";

import { useEffect, useState } from "react";
import {
  fetchAdminInventory,
  updateInventoryQuantity,
} from "@/lib/admin/api";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/constants";
import { clearAdminSessionToken, getAdminSessionToken } from "@/lib/admin/session";
import type { InventoryRecord } from "@/lib/admin/types";

export default function AdminInventoryPage() {
  const [token, setToken] = useState<string | null>(null);
  const [records, setRecords] = useState<InventoryRecord[]>([]);
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [sku, setSku] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const sessionToken = getAdminSessionToken();
    if (!sessionToken) {
      clearAdminSessionToken();
      window.location.href = ADMIN_LOGIN_PATH;
      return;
    }

    setToken(sessionToken);
  }, []);

  useEffect(() => {
    if (token) {
      void loadInventory(token);
    }
  }, [token]);

  async function loadInventory(sessionToken: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchAdminInventory(sessionToken, {
        productId: productId || undefined,
        variantId: variantId || undefined,
        sku: sku || undefined,
      });
      setRecords(response.items);
      setDrafts(Object.fromEntries(response.items.map((item) => [item.id, String(item.stock)])));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load inventory.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(itemId: string) {
    if (!token) {
      return;
    }

    setSavingId(itemId);
    setError(null);
    setNotice(null);

    try {
      const updated = await updateInventoryQuantity(token, itemId, Number(drafts[itemId] ?? "0"));
      setRecords((current) => current.map((item) => (item.id === itemId ? updated : item)));
      setDrafts((current) => ({ ...current, [itemId]: String(updated.stock) }));
      setNotice(`Inventory record ${itemId} updated.`);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update inventory.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section style={{ display: "grid", gap: 24 }}>
      <div style={heroCardStyle}>
        <p style={eyebrowStyle}>Admin inventory</p>
        <h2 style={{ margin: "8px 0 10px", fontSize: 32 }}>
          Inspect inventory by product, variant, or SKU and adjust stock
        </h2>
        <p style={{ margin: 0, color: "#5d4a3a", lineHeight: 1.7 }}>
          Inventory stays owned by `inventory-service`. This console only queries and updates
          stock through the protected gateway routes.
        </p>
      </div>

      <section style={panelStyle}>
        <div style={filterGridStyle}>
          <label style={fieldStyle}>
            <span>Product ID</span>
            <input value={productId} onChange={(event) => setProductId(event.target.value)} style={inputStyle} />
          </label>
          <label style={fieldStyle}>
            <span>Variant ID</span>
            <input value={variantId} onChange={(event) => setVariantId(event.target.value)} style={inputStyle} />
          </label>
          <label style={fieldStyle}>
            <span>SKU</span>
            <input value={sku} onChange={(event) => setSku(event.target.value)} style={inputStyle} />
          </label>
          <button type="button" onClick={() => void loadInventory(token!)} style={primaryButtonStyle}>
            Search inventory
          </button>
        </div>
      </section>

      {error ? <p style={errorStyle}>{error}</p> : null}
      {notice ? <p style={noticeStyle}>{notice}</p> : null}

      <section style={panelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h3 style={{ margin: 0, fontSize: 22 }}>Stock records</h3>
          <span style={{ color: "#7a6756" }}>{loading ? "Loading..." : `${records.length} records`}</span>
        </div>

        <div style={{ display: "grid", gap: 14, marginTop: 20 }}>
          {records.map((item) => (
            <article key={item.id} style={recordStyle}>
              <div style={{ display: "grid", gap: 6 }}>
                <strong>{item.sku || item.variantId}</strong>
                <span style={metaStyle}>Product: {item.productId || "n/a"}</span>
                <span style={metaStyle}>Variant: {item.variantId}</span>
                <span style={metaStyle}>Reserved: {item.reservedStock}</span>
                <span style={metaStyle}>Available: {item.availableStock}</span>
              </div>

              <div style={{ display: "grid", gap: 10, justifyItems: "end" }}>
                <span
                  style={{
                    ...statusPillStyle,
                    background:
                      item.status === "out-of-stock"
                        ? "rgba(168,42,42,0.12)"
                        : item.status === "low-stock"
                          ? "rgba(196,127,39,0.16)"
                          : "rgba(61,122,84,0.12)",
                    color:
                      item.status === "out-of-stock"
                        ? "#8c1d18"
                        : item.status === "low-stock"
                          ? "#8a5a12"
                          : "#21552f",
                  }}
                >
                  {item.status}
                </span>
                <label style={fieldStyle}>
                  <span>Stock</span>
                  <input
                    type="number"
                    min="0"
                    value={drafts[item.id] ?? String(item.stock)}
                    onChange={(event) =>
                      setDrafts((current) => ({ ...current, [item.id]: event.target.value }))
                    }
                    style={{ ...inputStyle, minWidth: 140 }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void handleUpdate(item.id)}
                  disabled={savingId === item.id}
                  style={primaryButtonStyle}
                >
                  {savingId === item.id ? "Updating..." : "Update stock"}
                </button>
              </div>
            </article>
          ))}

          {!loading && records.length === 0 ? (
            <p style={{ margin: 0, color: "#7a6756" }}>No inventory records matched the current filters.</p>
          ) : null}
        </div>
      </section>
    </section>
  );
}

const heroCardStyle: React.CSSProperties = {
  borderRadius: 28,
  padding: 28,
  background: "rgba(255, 249, 242, 0.9)",
  border: "1px solid rgba(31,26,23,0.08)",
  boxShadow: "0 16px 40px rgba(60,44,31,0.08)",
};

const panelStyle: React.CSSProperties = {
  borderRadius: 24,
  padding: 24,
  background: "rgba(255, 252, 247, 0.94)",
  border: "1px solid rgba(31,26,23,0.08)",
  boxShadow: "0 12px 30px rgba(60,44,31,0.06)",
};

const filterGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
  alignItems: "end",
};

const fieldStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  color: "#382b22",
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(31,26,23,0.12)",
  background: "white",
};

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 16,
  padding: "12px 18px",
  background: "#201811",
  color: "#fff5ec",
  cursor: "pointer",
  fontWeight: 700,
};

const recordStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: 16,
  padding: 18,
  borderRadius: 20,
  border: "1px solid rgba(31,26,23,0.08)",
  background: "rgba(255,255,255,0.8)",
};

const metaStyle: React.CSSProperties = {
  color: "#6e5845",
};

const statusPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 12px",
  borderRadius: 999,
  textTransform: "capitalize",
  fontWeight: 700,
};

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#8a5a32",
};

const errorStyle: React.CSSProperties = {
  margin: 0,
  padding: "14px 16px",
  borderRadius: 16,
  background: "rgba(168, 42, 42, 0.12)",
  color: "#8c1d18",
};

const noticeStyle: React.CSSProperties = {
  margin: 0,
  padding: "14px 16px",
  borderRadius: 16,
  background: "rgba(61, 122, 84, 0.12)",
  color: "#21552f",
};
