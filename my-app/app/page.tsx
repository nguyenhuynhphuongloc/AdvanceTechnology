import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "48px 24px",
        background:
          "radial-gradient(circle at top, rgba(242,95,76,0.28), transparent 34%), linear-gradient(180deg, #0c1621 0%, #15111d 100%)",
        color: "white",
      }}
    >
      <section
        style={{
          width: "min(960px, 100%)",
          borderRadius: 32,
          padding: "48px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.28)",
        }}
      >
        <p style={{ margin: "0 0 12px", color: "#f8cba6", textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 12 }}>
          Advance Technology storefront
        </p>
        <h1 style={{ margin: "0 0 16px", fontSize: "clamp(2.8rem, 7vw, 5.4rem)", lineHeight: 0.95, maxWidth: 720 }}>
          Product catalog pages now route through the API gateway.
        </h1>
        <p style={{ margin: "0 0 28px", maxWidth: 620, color: "rgba(255,255,255,0.74)", fontSize: 18, lineHeight: 1.7 }}>
          Browse live product cards on the catalog page, then drill into slug-based detail pages with gallery media,
          variant options, and related products from `product-service`.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link
            href="/products"
            style={{
              textDecoration: "none",
              background: "#f25f4c",
              color: "#111",
              padding: "14px 22px",
              borderRadius: 999,
              fontWeight: 700,
            }}
          >
            Open products
          </Link>
          <Link
            href="/search"
            style={{
              textDecoration: "none",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              padding: "14px 22px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Keep mock search
          </Link>
        </div>
      </section>
    </main>
  );
}
