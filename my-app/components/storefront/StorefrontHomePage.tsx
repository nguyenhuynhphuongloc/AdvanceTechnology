import Link from "next/link";
import { ProductGrid } from "../search/ProductGrid";
import { StorefrontFooter } from "./StorefrontFooter";
import { StorefrontHeader } from "./StorefrontHeader";
import { StorefrontStatusCard } from "./StorefrontStatusCard";
import { fetchProducts } from "../../lib/products/api";
import type { Product } from "../../lib/search/types";
<<<<<<< HEAD
import { getCloudinaryImages } from "../../lib/cloudinary";
=======
import { PRODUCT_LIST_PATH } from "../../lib/products/routes";
>>>>>>> 0a3c8285842cc5a3f8f7438011e53de42fdd368e

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
<<<<<<< HEAD
  try {
    const [productsResponse, cloudinaryImages] = await Promise.all([
      fetchProducts({ limit: 4, sort: "latest" }),
      getCloudinaryImages(8)
    ]);

    const products = productsResponse.items.map(toCardProduct);
=======
  const response = await fetchProducts({ limit: 4, sort: "latest" }).catch(() => null);

  if (response) {
    const products = response.items.map(toCardProduct);
>>>>>>> 0a3c8285842cc5a3f8f7438011e53de42fdd368e

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
                Unified dark catalog experiences backed by Cloudinary assets.
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
                Explore our dynamic product catalog featuring high-performance media delivery. 
                This storefront now pulls live assets directly from Cloudinary.
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

          {/* Cloudinary Gallery Section */}
          {cloudinaryImages.length > 0 && (
            <section style={{ marginTop: 60 }}>
              <div style={{ marginBottom: 24 }}>
                <p className="storefront-kicker">Cloudinary Media</p>
                <h2 style={{ margin: "10px 0 0", fontSize: 32 }}>Featured Assets</h2>
              </div>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", 
                gap: 20 
              }}>
                {cloudinaryImages.map((img) => (
                  <div 
                    key={img.public_id} 
                    className="storefront-panel" 
                    style={{ 
                      overflow: "hidden", 
                      aspectRatio: "1/1",
                      position: "relative",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    <img 
                      src={img.secure_url} 
                      alt={img.public_id} 
                      style={{ 
                        width: "100%", 
                        height: "100%", 
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
                      onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    />
                    <div style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "12px",
                      background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                      fontSize: "12px",
                      color: "white",
                      opacity: 0.8
                    }}>
                      {img.public_id.split('/').pop()}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section style={{ marginTop: 60 }}>
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
<<<<<<< HEAD
  } catch (error) {
    console.error("Home page render error:", error);
    return (
      <div className="storefront-page">
        <ProductCatalogHeader />
        <main className="storefront-container" style={{ paddingTop: 40 }}>
          <StorefrontStatusCard
            title="Storefront unavailable"
            description="The home storefront could not load the live catalog or media right now. Check the API gateway and Cloudinary status."
            actionHref="/products"
            actionLabel="Open catalog"
            tone="error"
          />
        </main>
        <StorefrontFooter />
      </div>
    );
=======
>>>>>>> 0a3c8285842cc5a3f8f7438011e53de42fdd368e
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
