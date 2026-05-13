"use client";

import { ProductSort } from "../../lib/products/types";
import { PRODUCT_LIST_PATH } from "../../lib/products/routes";

const sortOptions: Array<{ value: ProductSort; label: string }> = [
  { value: "latest", label: "Latest Arrivals" },
  { value: "price-asc", label: "Price: Low to high" },
  { value: "price-desc", label: "Price: High to low" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
];

interface ProductSortSelectProps {
  currentSort: ProductSort;
  currentSearch?: string;
  currentCategory?: string;
}

export function ProductSortSelect({
  currentSort,
  currentSearch,
  currentCategory,
}: ProductSortSelectProps) {
  return (
    <form action={PRODUCT_LIST_PATH} className="flex items-center gap-4">
      {currentSearch ? <input type="hidden" name="search" value={currentSearch} /> : null}
      {currentCategory ? <input type="hidden" name="category" value={currentCategory} /> : null}
      
      <div className="relative group">
        <select
          id="sort"
          name="sort"
          defaultValue={currentSort}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
          className="appearance-none rounded-full border border-border-dim bg-white/5 py-2.5 pl-6 pr-14 text-xs font-black uppercase tracking-widest text-text-muted outline-none transition-all cursor-pointer hover:border-border-strong hover:bg-white/10 hover:text-foreground focus:border-accent/60 min-w-[220px]"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-black text-foreground">
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-soft transition-colors group-hover:text-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
    </form>
  );
}
