import Link from "next/link";
import { Product } from "../../lib/search/types";
import { buildProductDetailHref } from "../../lib/products/routes";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(product.price);

  const imageUrl = product.imageUrl || `https://picsum.photos/seed/${product.slug}/800/800`;

  return (
    <Link
      href={buildProductDetailHref(product.slug)}
      className="storefront-product-card"
    >
      <span className="storefront-product-card-badge">View details</span>

      <img
        src={imageUrl}
        alt={product.name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "transform 0.45s ease",
        }}
        className="storefront-product-card-image"
      />

      <div
        style={{
          position: "absolute",
          inset: "auto 0 0 0",
          padding: 16,
          background:
            "linear-gradient(180deg, rgba(8, 11, 17, 0) 0%, rgba(8, 11, 17, 0.8) 48%, rgba(8, 11, 17, 0.96) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "end",
          }}
        >
          <div>
            <p style={{ margin: 0, color: "var(--accent-secondary)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              {product.category || "Catalog"}
            </p>
            <h3 style={{ margin: "8px 0 0", color: "var(--foreground)", fontSize: 18, lineHeight: 1.2 }}>
              {product.name}
            </h3>
          </div>
          <div className="storefront-product-card-price-group">
            <span className="storefront-product-card-price">{formattedPrice}</span>
            <span className="storefront-product-card-cta">Tap to open</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
