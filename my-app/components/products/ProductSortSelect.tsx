"use client";

import { ProductSort } from "../../lib/products/types";
import { PRODUCT_LIST_PATH } from "../../lib/products/routes";

const sortOptions: Array<{ value: ProductSort; label: string }> = [
  { value: "latest", label: "Latest" },
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
    <form action={PRODUCT_LIST_PATH} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
      {currentSearch ? <input type="hidden" name="search" value={currentSearch} /> : null}
      {currentCategory ? <input type="hidden" name="category" value={currentCategory} /> : null}
      <label htmlFor="sort" style={{ color: "var(--text-muted)", fontSize: 14 }}>
        Sort
      </label>
      <select
        id="sort"
        name="sort"
        defaultValue={currentSort}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="storefront-select"
        style={{ width: 220 }}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value} style={{ color: "#111" }}>
            {option.label}
          </option>
        ))}
      </select>
    </form>
  );
}
