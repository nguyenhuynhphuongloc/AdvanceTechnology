export interface Product {
    id: string;
    name: string;
    slug: string;
    sku?: string;
    price: number;
    imageUrl?: string;
    category?: string;
}

export type SortOption = "price-asc" | "price-desc" | "relevance" | "trending" | "latest";

export const DEFAULT_SORT: SortOption = "relevance";
