import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCatalogHeader } from "../../../components/products/ProductCatalogHeader";
import { ProductGrid } from "../../../components/search/ProductGrid";
import { StorefrontFooter } from "../../../components/storefront/StorefrontFooter";
import { fetchProductBySlug, fetchRelatedProducts } from "../../../lib/products/api";
import { toStorefrontProduct } from "../../../lib/products/storefront";

type PageParams = Promise<{ slug: string }>;

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default async function ProductDetailPage({
  params,
}: {
  params: PageParams;
}) {
  const { slug } = await params;

  try {
    const product = await fetchProductBySlug(slug);
    const related = await fetchRelatedProducts(slug);
    const relatedProducts = related.items.map(toStorefrontProduct);
    const gallery = [product.mainImage, ...product.galleryImages];

    return (
      <div className="storefront-page">
        <ProductCatalogHeader />
        <main className="storefront-container" style={{ padding: "36px 0 0" }}>
          <nav
            style={{
              marginBottom: 24,
              display: "flex",
              gap: 8,
              color: "var(--text-muted)",
              fontSize: 14,
            }}
          >
            <Link href="/products" style={{ color: "inherit", textDecoration: "none" }}>
              Products
            </Link>
            <span>/</span>
            <span>{product.name}</span>
          </nav>

          <section className="product-detail-grid">
            <div className="storefront-card" style={{ padding: 24 }}>
              <div
                style={{
                  borderRadius: 22,
                  overflow: "hidden",
                  aspectRatio: "4 / 5",
                  marginBottom: 16,
                  background: "#111",
                }}
              >
                <img
                  src={product.mainImage.imageUrl}
                  alt={product.mainImage.altText || product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                  gap: 12,
                }}
              >
                {gallery.map((image) => (
                  <div
                    key={image.id}
                    style={{
                      borderRadius: 18,
                      overflow: "hidden",
                      border: image.isMain
                        ? "1px solid rgba(242, 95, 76, 0.8)"
                        : "1px solid var(--border)",
                      background: "#111",
                      aspectRatio: "1 / 1",
                    }}
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.altText || product.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div
              className="storefront-card"
              style={{
                padding: 28,
                display: "grid",
                gap: 24,
                alignSelf: "start",
              }}
            >
              <div style={{ display: "grid", gap: 8 }}>
                <p className="storefront-kicker">{product.category}</p>
                <h1 style={{ margin: 0, fontSize: "clamp(2.2rem, 4vw, 3.8rem)", lineHeight: 1 }}>
                  {product.name}
                </h1>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", color: "var(--text-muted)", fontSize: 14 }}>
                  <span>SKU {product.sku}</span>
                  <span>{product.variants.length} variants</span>
                </div>
              </div>

              <div style={{ fontSize: 34, fontWeight: 700 }}>{formatPrice(product.basePrice)}</div>

              <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7 }}>{product.description}</p>

              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <h2 style={{ margin: "0 0 10px", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-soft)" }}>
                    Available sizes
                  </h2>
                  <div className="storefront-link-list">
                    {product.availableSizes.map((size) => (
                      <span key={size} className="storefront-button storefront-button-secondary">
                        {size}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 style={{ margin: "0 0 10px", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-soft)" }}>
                    Available colors
                  </h2>
                  <div className="storefront-link-list">
                    {product.availableColors.map((color) => (
                      <span key={color} className="storefront-button storefront-button-secondary">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h2 style={{ margin: "0 0 10px", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-soft)" }}>
                  Variant catalog
                </h2>
                <div style={{ display: "grid", gap: 10 }}>
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="storefront-panel"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                        padding: "14px 16px",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{variant.color} / {variant.size}</div>
                        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{variant.sku}</div>
                      </div>
                      <div style={{ fontWeight: 600 }}>{formatPrice(variant.price)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section style={{ marginTop: 48 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "end", marginBottom: 18 }}>
              <div>
                <p className="storefront-kicker">Related</p>
                <h2 style={{ margin: "10px 0 0", fontSize: 28 }}>More from the catalog</h2>
              </div>
            </div>
            <ProductGrid
              products={relatedProducts}
              emptyTitle="No related products yet"
              emptyDescription="This item does not have related catalog links right now."
              clearHref="/products"
              clearLabel="Back to catalog"
            />
          </section>
        </main>
        <StorefrontFooter />
      </div>
    );
  } catch {
    notFound();
  }
}
