import Link from "next/link";

interface ProductCatalogHeaderProps {
  search?: string;
  actionPath?: string;
}

export function ProductCatalogHeader({
  search = "",
  actionPath = "/products",
}: ProductCatalogHeaderProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        backdropFilter: "blur(18px)",
        background: "rgba(8, 11, 17, 0.82)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        className="storefront-container"
        style={{
          padding: "18px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <Link
            href="/"
            style={{
              color: "var(--foreground)",
              textDecoration: "none",
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "0.08em",
            }}
          >
            ADVENCE TECH
          </Link>

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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 10,
            flex: "1 1 360px",
            flexWrap: "wrap",
          }}
        >
          <form
            action={actionPath}
            style={{
              display: "flex",
              gap: 10,
              flex: "1 1 320px",
              maxWidth: 520,
            }}
          >
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Search jackets, denim, knitwear..."
              className="storefront-field"
            />
            <button type="submit" className="storefront-button storefront-button-primary">
              Search
            </button>
          </form>

          <Link href="/product/account?mode=login" className="storefront-button storefront-button-secondary">
            Login
          </Link>
          <Link href="/product/account?mode=register" className="storefront-button storefront-button-primary">
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}
