"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ProductSort } from "../../lib/products/types";

const sortOptions: Array<{ name: string; value: ProductSort }> = [
  { name: "Latest arrivals", value: "latest" },
  { name: "Price: Low to high", value: "price-asc" },
  { name: "Price: High to low", value: "price-desc" },
  { name: "Name: A-Z", value: "name-asc" },
  { name: "Name: Z-A", value: "name-desc" },
];

export function SortSidebar() {
  const searchParams = useSearchParams();
  const currentSort = (searchParams.get("sort") || "latest") as ProductSort;
  const currentSearch = searchParams.get("search") || searchParams.get("q");
  const currentCategory = searchParams.get("category") || searchParams.get("collection");

  const buildHref = (sortValue: ProductSort) => {
    const params = new URLSearchParams();
    if (currentCategory) {
      params.set("category", currentCategory);
    }
    if (currentSearch) {
      params.set("search", currentSearch);
    }
    if (sortValue !== "latest") {
      params.set("sort", sortValue);
    }

    const qs = params.toString();
    return `/search${qs ? `?${qs}` : ""}`;
  };

  return (
    <aside className="w-56 flex-shrink-0 sticky top-24 self-start flex flex-col gap-4">
      <h3 className="m-0 text-accent-secondary uppercase tracking-[0.14em] text-[11px] font-bold">Sort by</h3>
      <div className="bg-surface/50 border border-border-dim rounded-[22px] p-5 backdrop-blur-md">
        <ul className="list-none p-0 m-0 flex flex-col gap-1">
          {sortOptions.map((option) => {
            const isActive = currentSort === option.value;
            return (
              <li key={option.value}>
                <Link
                  href={buildHref(option.value)}
                  className={[
                    "block py-2 text-sm transition-all duration-200",
                    isActive ? "text-accent font-bold" : "text-text-muted hover:text-foreground hover:translate-x-0.5"
                  ].join(" ")}
                >
                  {option.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
