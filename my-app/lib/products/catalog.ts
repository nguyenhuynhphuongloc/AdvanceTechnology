import { fetchProductCategories, fetchProducts } from "./api";
import { buildCategoryLookup } from "./categories";
import { normalizeSearchQuery, toStorefrontProduct } from "./storefront";

type RawSearchParams = Record<string, string | string[] | undefined>;

export async function fetchCatalogPage(
  rawSearchParams: RawSearchParams,
  options?: { limit?: number },
) {
  const params = normalizeSearchQuery(rawSearchParams);
  try {
    const [response, categoriesResponse] = await Promise.all([
      fetchProducts({
        page: params.page,
        limit: options?.limit ?? 12,
        search: params.search,
        category: params.category,
        sort: params.sort,
      }),
      fetchProductCategories().catch(() => ({ items: [], total: 0 })),
    ]);
    const categories = buildCategoryLookup(categoriesResponse.items);

    return {
      params,
      response,
      categories: categoriesResponse.items,
      products: response.items.map((product) => toStorefrontProduct(product, categories)),
    };
  } catch {
    return {
      params,
      response: { items: [], total: 0, page: params.page, limit: options?.limit ?? 12, pages: 0 },
      categories: [],
      products: [],
    };
  }
}
