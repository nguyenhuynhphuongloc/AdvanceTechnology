export interface Product {
    id: string;
    name: string;
    price: number;
    image?: string;
    category?: string;
}

export type SortOption = "price-asc" | "price-desc" | "relevance" | "trending" | "latest";

export const DEFAULT_SORT: SortOption = "relevance";
