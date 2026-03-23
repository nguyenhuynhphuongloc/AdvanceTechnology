import { ProductCatalogHeader } from "../products/ProductCatalogHeader";
import { StorefrontFooter } from "./StorefrontFooter";

export function StorefrontLoadingPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="storefront-page">
      <ProductCatalogHeader />
      <main className="storefront-container" style={{ padding: "40px 0 0" }}>
        <section className="storefront-card" style={{ padding: 28, display: "grid", gap: 18 }}>
          <p className="storefront-kicker">Loading</p>
          <div
            style={{
              width: "min(480px, 100%)",
              height: 28,
              borderRadius: 999,
              background: "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.16), rgba(255,255,255,0.06))",
            }}
          />
          <p style={{ margin: 0, color: "var(--text-muted)", maxWidth: 620, lineHeight: 1.7 }}>
            {description}
          </p>

          <div
            aria-label={title}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 18,
            }}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="storefront-card" style={{ padding: 16, display: "grid", gap: 14 }}>
                <div
                  style={{
                    borderRadius: 18,
                    aspectRatio: "4 / 5",
                    background: "rgba(255, 255, 255, 0.06)",
                  }}
                />
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ height: 16, borderRadius: 999, background: "rgba(255, 255, 255, 0.08)" }} />
                  <div style={{ width: "72%", height: 12, borderRadius: 999, background: "rgba(255, 255, 255, 0.06)" }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <StorefrontFooter />
    </div>
  );
}
