"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { storefrontBranding } from "@/lib/storefront/config";
import type { ProductCategoryDto } from "@/lib/products/types";

export function CollectionsSidebar({ categories }: { categories?: ProductCategoryDto[] }) {
  const searchParams = useSearchParams();
  const currentCategory =
    searchParams.get("category")?.toLowerCase() ||
    searchParams.get("collection")?.toLowerCase() ||
    "all";
  const currentSearch = searchParams.get("search") || searchParams.get("q");
  const currentSort = searchParams.get("sort");
  const collections =
    categories && categories.length > 0
      ? [
          { value: "all", name: "All" },
          ...categories.map((category) => ({ value: category.id, name: category.name })),
        ]
      : storefrontBranding.categories;

  const buildHref = (categoryValue: string) => {
    const params = new URLSearchParams();
    if (categoryValue !== "all") {
      params.set("category", categoryValue);
    }
    if (currentSearch) {
      params.set("search", currentSearch);
    }
    if (currentSort) {
      params.set("sort", currentSort);
    }

    const qs = params.toString();
    return `/search${qs ? `?${qs}` : ""}`;
  };

  return (
    <aside className="w-56 flex-shrink-0 sticky top-24 self-start flex flex-col gap-4">
      <h3 className="m-0 text-accent-secondary uppercase tracking-[0.14em] text-[11px] font-bold">Collections</h3>
      <div className="bg-surface/50 border border-border-dim rounded-[22px] p-5 backdrop-blur-md">
        <ul className="list-none p-0 m-0 flex flex-col gap-1">
          {collections.map((collection) => {
            const isActive = currentCategory === collection.value;
            return (
              <li key={collection.value}>
                <Link
                  href={buildHref(collection.value)}
                  className={[
                    "block py-2 text-sm transition-all duration-200",
                    isActive ? "text-accent font-bold" : "text-text-muted hover:text-foreground hover:translate-x-0.5"
                  ].join(" ")}
                >
                  {collection.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
