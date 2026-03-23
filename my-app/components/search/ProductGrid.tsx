import Link from "next/link";
import { Product } from "../../lib/search/types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
  clearHref?: string;
  clearLabel?: string;
}

export function ProductGrid({
  products,
  emptyTitle = "No products found",
  emptyDescription = "Try adjusting your search or filters.",
  clearHref,
  clearLabel = "Clear filters",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="storefront-message storefront-message-empty">
        <h2 style={{ margin: 0, fontSize: 28 }}>{emptyTitle}</h2>
        <p style={{ margin: "12px auto 0", maxWidth: 480, color: "var(--text-muted)" }}>
          {emptyDescription}
        </p>
        {clearHref ? (
          <div style={{ marginTop: 24 }}>
            <Link href={clearHref} className="storefront-button storefront-button-primary">
              {clearLabel}
            </Link>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
