import Link from "next/link";
import { ProductGrid } from "../search/ProductGrid";
import { StorefrontFooter } from "./StorefrontFooter";
import { StorefrontHeader } from "./StorefrontHeader";
import { StorefrontStatusCard } from "./StorefrontStatusCard";
import { fetchProducts } from "../../lib/products/api";
import type { Product } from "../../lib/search/types";
import { PRODUCT_LIST_PATH } from "../../lib/products/routes";

function toCardProduct(product: {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  basePrice: number;
  imageUrl: string;
}): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    price: product.basePrice,
    imageUrl: product.imageUrl,
    category: product.category,
  };
}

export async function StorefrontHomePage() {
  const response = await fetchProducts({ limit: 4, sort: "latest" }).catch(() => null);

  if (response) {
    const products = response.items.map(toCardProduct);

    return (
      <div className="storefront-page">
        <StorefrontHeader activeNav="home" />
        <main className="storefront-container" style={{ padding: "40px 0 0" }}>
          <section
            className="storefront-card"
            style={{
              padding: 32,
              display: "grid",
              gap: 28,
              background:
                "radial-gradient(circle at top left, rgba(242, 95, 76, 0.2), transparent 28%), rgba(255, 255, 255, 0.05)",
            }}
          >
            <div style={{ maxWidth: 760 }}>
              <p className="storefront-kicker">Advance Technology storefront</p>
              <h1
                style={{
                  margin: "12px 0 16px",
                  fontSize: "clamp(2.8rem, 7vw, 5.2rem)",
                  lineHeight: 0.94,
                }}
              >
                Unified dark catalog experiences backed by the live product database.
              </h1>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-muted)",
                  fontSize: 18,
                  lineHeight: 1.75,
                  maxWidth: 620,
                }}
              >
                Browse premium product discovery routes that now share the same storefront language and
                pull catalog data through the existing API gateway and product-service.
              </p>
            </div>

            <div className="storefront-link-list">
              <Link href={PRODUCT_LIST_PATH} className="storefront-button storefront-button-primary">
                Browse Products
              </Link>
              <Link href="/search" className="storefront-button storefront-button-secondary">
                Search
              </Link>
            </div>
          </section>

          <section style={{ marginTop: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "end", marginBottom: 20 }}>
              <div>
                <p className="storefront-kicker">Featured now</p>
                <h2 style={{ margin: "10px 0 0", fontSize: 32 }}>Latest catalog arrivals</h2>
              </div>
              <p style={{ margin: 0, color: "var(--text-muted)", maxWidth: 420 }}>
                These cards use the same database-backed product listing contract as the main catalog pages.
              </p>
            </div>

            <ProductGrid products={products} />
          </section>
        </main>
        <StorefrontFooter />
      </div>
    );
  }

  return (
    <div className="storefront-page">
      <StorefrontHeader activeNav="home" />
      <main className="storefront-container" style={{ paddingTop: 40 }}>
        <StorefrontStatusCard
          title="Storefront unavailable"
          description="The home storefront could not load the live catalog right now. Check the API gateway and product-service, then try again."
          actionHref={PRODUCT_LIST_PATH}
          actionLabel="Open catalog"
          tone="error"
        />
      </main>
      <StorefrontFooter />
    </div>
  );
}
