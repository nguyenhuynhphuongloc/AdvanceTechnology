import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/search/ProductGrid";
import { AddToCartPanel } from "@/components/storefront/AddToCartPanel";
import ShoppingHeader from "@/components/shopping/ShoppingHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { fetchProductBySlug, fetchRelatedProducts } from "@/lib/products/api";
import { PRODUCT_LIST_PATH } from "@/lib/products/routes";
import { toStorefrontProduct } from "@/lib/products/storefront";

type PageParams = Promise<{ slug: string }>;

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default async function ProductDetailPage({
  params,
}: {
  params: PageParams;
}) {
  const { slug } = await params;
  const detail = await Promise.all([
    fetchProductBySlug(slug),
    fetchRelatedProducts(slug),
  ]).catch(() => null);

  if (!detail) {
    notFound();
  }

  const [product, related] = detail;
  const relatedProducts = related.items.map(toStorefrontProduct);
  const gallery = [product.mainImage, ...product.galleryImages];

  return (
    <main className="storefront-page storefront-product-page">
      <div className="storefront-product-shell">
        <ShoppingHeader searchQuery="" selectedCategory="All" selectedSort="latest" />

        <nav className="storefront-product-breadcrumb">
          <Link href={PRODUCT_LIST_PATH} style={{ color: "inherit", textDecoration: "none" }}>
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

          <div className="storefront-card storefront-product-detail-card">
            <div style={{ display: "grid", gap: 8 }}>
              <p className="storefront-kicker">{product.category}</p>
              <h1 style={{ margin: 0, fontSize: "clamp(2.2rem, 4vw, 3.8rem)", lineHeight: 1 }}>
                {product.name}
              </h1>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  color: "var(--text-muted)",
                  fontSize: 14,
                }}
              >
                <span>{product.variants.length} variants</span>
                <span>{product.availableSizes.length} sizes</span>
                <span>{product.availableColors.length} colors</span>
              </div>
            </div>

            <div style={{ fontSize: 34, fontWeight: 700 }}>
              {product.variants.length > 1 ? `From ${formatPrice(product.basePrice)}` : formatPrice(product.basePrice)}
            </div>

            <p style={{ margin: 0, color: "var(--text-muted)", lineHeight: 1.7 }}>
              {product.description}
            </p>

            <AddToCartPanel product={product} />

            <div>
              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: 14,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--text-soft)",
                }}
              >
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
                      <div style={{ fontWeight: 600 }}>
                        {variant.color} / {variant.size}
                      </div>
                      <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{variant.sku}</div>
                    </div>
                    <div style={{ fontWeight: 600 }}>{formatPrice(variant.price)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="storefront-product-related">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "end",
              marginBottom: 18,
            }}
          >
            <div>
              <p className="storefront-kicker">Related</p>
              <h2 style={{ margin: "10px 0 0", fontSize: 28 }}>More from the catalog</h2>
            </div>
          </div>
          <ProductGrid
            products={relatedProducts}
            emptyTitle="No related products yet"
            emptyDescription="This item does not have related catalog links right now."
            clearHref={PRODUCT_LIST_PATH}
            clearLabel="Back to catalog"
          />
        </section>
      </div>

      <StorefrontFooter />
    </main>
  );
}
