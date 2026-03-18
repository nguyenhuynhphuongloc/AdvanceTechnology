import { ProductDetailDto, ProductListResponse, ProductSort, RelatedProductsResponse } from "./types";

const API_BASE_URL =
    process.env.API_GATEWAY_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:3000";

type QueryValue = string | number | undefined;

function buildUrl(path: string, query?: Record<string, QueryValue>) {
    const url = new URL(path, API_BASE_URL);

    if (query) {
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== "") {
                url.searchParams.set(key, String(value));
            }
        });
    }

    return url.toString();
}

async function fetchJson<T>(path: string, query?: Record<string, QueryValue>): Promise<T> {
    const url = buildUrl(path, query);
    let response: Response;

    try {
        response = await fetch(url, {
            cache: "no-store",
            next: { revalidate: 0 },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown fetch error";
        throw new Error(`Failed to reach catalog API at ${url}: ${message}`);
    }

    if (!response.ok) {
        throw new Error(`Catalog API request to ${url} failed with status ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export async function fetchProducts(params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: ProductSort;
}) {
    return fetchJson<ProductListResponse>("/api/v1/products", params);
}

export async function fetchProductBySlug(slug: string) {
    return fetchJson<ProductDetailDto>(`/api/v1/products/${slug}`);
}

export async function fetchRelatedProducts(slug: string) {
    return fetchJson<RelatedProductsResponse>(`/api/v1/products/${slug}/related`);
}
