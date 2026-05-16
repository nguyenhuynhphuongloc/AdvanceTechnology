import Link from "next/link";
import { buildProductListHref } from "../../lib/products/routes";
import { storefrontBranding } from "../../lib/storefront/config";
import type { ProductSort } from "../../lib/products/types";

interface ProductCollectionNavProps {
  activeCategory?: string;
  currentSearch?: string;
  currentSort?: string;
}

export function ProductCollectionNav({
  activeCategory,
  currentSearch,
  currentSort,
}: ProductCollectionNavProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {storefrontBranding.categories.map((collection) => {
        const href = buildProductListHref({
          category: collection.value,
          search: currentSearch,
          sort: currentSort as ProductSort | undefined,
        });
        const isActive = (activeCategory ?? "all") === collection.value;

        return (
          <Link
            key={collection.value}
            href={href}
            prefetch
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] transition-all hover:-translate-y-0.5 ${
              isActive
                ? "bg-accent text-accent-contrast shadow-[0_10px_40px_rgba(242,95,76,0.3)]"
                : "border border-border-dim bg-white/5 text-text-muted hover:border-border-strong hover:bg-white/10 hover:text-foreground"
            }`}
          >
            {collection.name}
          </Link>
        );
      })}
    </div>
  );
}
