import { Product, SortOption, DEFAULT_SORT } from "./types";

export function getValidSortOption(sortQuery: string | null): SortOption {
    const validSorts: SortOption[] = ["price-asc", "price-desc", "relevance", "trending", "latest"];
    if (sortQuery && validSorts.includes(sortQuery as SortOption)) {
        return sortQuery as SortOption;
    }
    return DEFAULT_SORT;
}

export function filterAndSortProducts(products: Product[], query: string, sort: SortOption, collection?: string | null): Product[] {
    let result = [...products];

    // Filter by collection
    if (collection && collection.toLowerCase() !== "all") {
        const lowerCollection = collection.toLowerCase();
        result = result.filter(product =>
            product.category?.toLowerCase() === lowerCollection
        );
    }

    // Filter by query
    if (query) {
        const lowerQuery = query.toLowerCase();
        result = result.filter(product =>
            product.name.toLowerCase().includes(lowerQuery)
        );
    }

    // Sort by price or other criteria
    result.sort((a, b) => {
        if (sort === "price-asc") {
            return a.price - b.price;
        } else if (sort === "price-desc") {
            return b.price - a.price;
        } else {
            // Keep original order for relevance/trending/latest in mock data
            return 0;
        }
    });

    return result;
}
