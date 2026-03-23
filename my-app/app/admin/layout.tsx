import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAdmin } from "@/lib/admin/api";
import {
  ADMIN_INVENTORY_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_PRODUCTS_PATH,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin/constants";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  async function logoutAction() {
    "use server";

    const nextCookieStore = await cookies();
    const token = nextCookieStore.get(ADMIN_SESSION_COOKIE)?.value;

    if (token) {
      try {
        await logoutAdmin(token);
      } catch {
        // Clear the local session even if the upstream logout call fails.
      }
    }

    nextCookieStore.set(ADMIN_SESSION_COOKIE, "", {
      maxAge: 0,
      path: "/",
      sameSite: "lax",
    });

    redirect(ADMIN_LOGIN_PATH);
  }

  if (!sessionToken) {
    return children;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f5f0e8 0%, #efe3d1 45%, #e7d5bc 100%)",
        color: "#1f1a17",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid rgba(31,26,23,0.12)",
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            width: "min(1180px, calc(100% - 32px))",
            margin: "0 auto",
            padding: "18px 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "#8a5a32",
              }}
            >
              Admin Console
            </p>
            <h1 style={{ margin: "6px 0 0", fontSize: 28 }}>
              Catalog and inventory management
            </h1>
          </div>
          <nav style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Link href={ADMIN_PRODUCTS_PATH} style={navLinkStyle}>
              Products
            </Link>
            <Link href={ADMIN_INVENTORY_PATH} style={navLinkStyle}>
              Inventory
            </Link>
            <form action={logoutAction}>
              <button type="submit" style={logoutButtonStyle}>
                Logout
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main
        style={{
          width: "min(1180px, calc(100% - 32px))",
          margin: "0 auto",
          padding: "28px 0 40px",
        }}
      >
        {children}
      </main>
    </div>
  );
}

const navLinkStyle: React.CSSProperties = {
  textDecoration: "none",
  color: "#1f1a17",
  padding: "10px 16px",
  borderRadius: 999,
  background: "rgba(31,26,23,0.06)",
  fontWeight: 600,
};

const logoutButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 999,
  padding: "10px 16px",
  background: "#1f1a17",
  color: "#fff5ec",
  cursor: "pointer",
  fontWeight: 700,
};
