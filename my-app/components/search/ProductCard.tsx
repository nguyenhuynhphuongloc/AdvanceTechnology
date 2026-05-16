import Link from "next/link";
import { Product } from "../../lib/search/types";
import { buildProductDetailHref } from "../../lib/products/routes";
import { ProductImageFrame } from "../ui/ProductImageFrame";

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
      prefetch
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border-dim bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-2xl"
    >
      <ProductImageFrame
        src={imageUrl}
        alt={product.name}
        aspect="portrait"
        className="rounded-none border-0 bg-slate-950/40"
        imageClassName="p-5 group-hover:scale-105"
      />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <p className="m-0 truncate text-[11px] font-bold uppercase tracking-widest text-accent-secondary">
            {product.categoryName || "Catalog"}
          </p>
          <h3 className="mt-2 line-clamp-2 min-h-[44px] text-base font-bold leading-snug text-foreground">
            {product.name}
          </h3>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3">
          <span
            className={[
              "rounded-md border px-2 py-1 text-[10px] font-black uppercase tracking-widest",
              "border-white/10 bg-white/5 text-text-soft",
            ].join(" ")}
          >
            Live availability
          </span>
          <span className="whitespace-nowrap rounded-lg bg-accent px-3 py-2 text-sm font-extrabold text-accent-contrast shadow-lg">
            {formattedPrice}
          </span>
        </div>
      </div>
    </Link>
  );
}
