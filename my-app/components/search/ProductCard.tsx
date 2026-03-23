import Link from "next/link";
import { Product } from "../../lib/search/types";

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
      href={`/products/${product.slug}`}
      className="storefront-product-card"
    >
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
          <span
            style={{
              background: "var(--accent)",
              color: "var(--accent-contrast)",
              padding: "6px 10px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {formattedPrice}
          </span>
        </div>
      </div>
    </Link>
  );
}
