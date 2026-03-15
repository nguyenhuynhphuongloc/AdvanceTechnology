import { ProductSort } from "../../lib/products/types";

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
        <form action="/products" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {currentSearch ? <input type="hidden" name="search" value={currentSearch} /> : null}
            {currentCategory ? <input type="hidden" name="category" value={currentCategory} /> : null}
            <label htmlFor="sort" style={{ color: "rgba(255,255,255,0.72)", fontSize: 14 }}>
                Sort
            </label>
            <select
                id="sort"
                name="sort"
                defaultValue={currentSort}
                onChange={(event) => event.currentTarget.form?.requestSubmit()}
                style={{
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.04)",
                    color: "white",
                    padding: "10px 14px",
                }}
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
