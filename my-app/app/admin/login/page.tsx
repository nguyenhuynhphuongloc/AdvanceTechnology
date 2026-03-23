"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/lib/admin/api";
import { ADMIN_PRODUCTS_PATH } from "@/lib/admin/constants";
import { setAdminSessionToken } from "@/lib/admin/session";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await loginAdmin(email, password);
      setAdminSessionToken(response.accessToken);
      router.replace(ADMIN_PRODUCTS_PATH);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to start the admin session.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px 16px",
        background:
          "radial-gradient(circle at top, rgba(212,133,69,0.24), transparent 34%), linear-gradient(180deg, #1e140f 0%, #342118 100%)",
      }}
    >
      <section
        style={{
          width: "min(440px, 100%)",
          borderRadius: 28,
          padding: 32,
          background: "rgba(255, 247, 238, 0.94)",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.24)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#8a5a32",
          }}
        >
          Admin access
        </p>
        <h1 style={{ margin: "10px 0 12px", fontSize: 32, color: "#201811" }}>
          Sign in to manage products and stock
        </h1>
        <p style={{ margin: "0 0 24px", color: "#594636", lineHeight: 1.6 }}>
          This console talks only to the existing API gateway. Use an admin account
          issued by the authentication service.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <label style={labelStyle}>
            <span>Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={inputStyle}
              placeholder="admin@example.com"
            />
          </label>

          <label style={labelStyle}>
            <span>Password</span>
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={inputStyle}
              placeholder="••••••••"
            />
          </label>

          {error ? (
            <p
              style={{
                margin: 0,
                padding: "12px 14px",
                borderRadius: 14,
                background: "rgba(168, 42, 42, 0.12)",
                color: "#8c1d18",
              }}
            >
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={submitting} style={submitButtonStyle}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  color: "#3c2c1f",
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: "1px solid rgba(60,44,31,0.16)",
  background: "white",
};

const submitButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 16,
  padding: "14px 18px",
  background: "#201811",
  color: "#fff5ec",
  cursor: "pointer",
  fontWeight: 700,
};
