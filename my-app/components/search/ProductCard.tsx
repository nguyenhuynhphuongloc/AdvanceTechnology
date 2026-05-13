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
      className="relative block aspect-[4/5] bg-surface border border-border-dim rounded-xl overflow-hidden cursor-pointer transition-all duration-300 shadow-xl hover:-translate-y-1 hover:border-accent/40 hover:shadow-2xl group"
    >
      <img
        src={imageUrl}
        alt={product.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-[#080b11] via-[#080b11]/90 to-transparent pt-12">
        <div className="flex justify-between gap-3 items-end">
          <div className="min-w-0">
            <p className="m-0 text-accent-secondary text-[12px] uppercase tracking-widest font-bold truncate">
              {product.category || "Catalog"}
            </p>
            <h3 className="mt-2 mb-0 text-foreground text-[18px] leading-tight font-bold truncate">
              {product.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-[10px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md border border-white/5">
              SL: {product.stock ?? 0}
            </span>
            <span className="bg-accent text-accent-contrast px-3 py-1.5 rounded-full text-[13px] font-extrabold whitespace-nowrap shadow-lg border border-white/10">
              {formattedPrice}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
