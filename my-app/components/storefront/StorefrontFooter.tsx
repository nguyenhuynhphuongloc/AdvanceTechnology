import Link from "next/link";

export function StorefrontFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "rgba(6, 9, 14, 0.82)",
        marginTop: 64,
      }}
    >
      <div
        className="storefront-container"
        style={{
          padding: "24px 0 40px",
          display: "flex",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <p className="storefront-kicker">Advance Technology</p>
          <p style={{ margin: "8px 0 0", color: "var(--text-muted)", maxWidth: 420 }}>
            Dark storefront routes backed by the existing API gateway and product catalog services.
          </p>
        </div>

        <nav className="storefront-link-list">
          <Link href="/" className="storefront-button storefront-button-secondary">
            Home
          </Link>
          <Link href="/products" className="storefront-button storefront-button-secondary">
            Products
          </Link>
          <Link href="/search" className="storefront-button storefront-button-secondary">
            Search
          </Link>
        </nav>
      </div>
    </footer>
  );
}
