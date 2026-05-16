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
      <div className="p-14 border border-border-dim rounded-[22px] bg-surface/20 text-center">
        <h2 className="m-0 text-[28px] font-bold tracking-tight">{emptyTitle}</h2>
        <p className="mt-3 mx-auto mb-0 max-w-[480px] text-text-muted leading-relaxed">
          {emptyDescription}
        </p>
        {clearHref ? (
          <div className="mt-6">
            <Link href={clearHref} className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold transition-all hover:-translate-y-0.5 bg-accent text-accent-contrast hover:bg-accent-strong shadow-lg">
              {clearLabel}
            </Link>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
