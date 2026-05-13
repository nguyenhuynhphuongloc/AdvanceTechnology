import { CatalogPagination } from "@/components/products/CatalogPagination";
import { ProductGrid } from "@/components/search/ProductGrid";
import ShoppingHeader from "@/components/shopping/ShoppingHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { StorefrontStatusCard } from "@/components/storefront/StorefrontStatusCard";
import { fetchCatalogPage } from "@/lib/products/catalog";
import { PRODUCT_LIST_PATH } from "@/lib/products/routes";
import { ProductCollectionNav } from "@/components/products/ProductCollectionNav";
import { ProductSortSelect } from "@/components/products/ProductSortSelect";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toHeaderCategory(category?: string) {
  return category ? `${category.charAt(0).toUpperCase()}${category.slice(1)}` : "All";
}

export default async function ProductPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const rawParams = (await searchParams) ?? {};
  const catalogPage = await fetchCatalogPage(rawParams, { limit: 12 }).catch(() => null);

  if (catalogPage) {
    const { params, products, response } = catalogPage;
    const selectedCategory = params.category ?? "all";
    const selectedSort = params.sort;

    return (
      <div className="min-h-screen text-foreground selection:bg-accent selection:text-accent-contrast">
        <ShoppingHeader
          searchQuery={params.search ?? ""}
          selectedCategory={toHeaderCategory(params.category)}
          selectedSort={selectedSort}
        />

        <main className="mx-auto max-w-[1280px] px-6">
          {/* Unified Toolbar: Filtering & Sorting */}
          <section className="mt-10 mb-8 flex flex-col items-start justify-between gap-x-12 gap-y-6 border-b border-border-dim pb-8 md:flex-row md:items-end">
            <div className="flex-1 overflow-hidden w-full">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-soft">Browse Categories</p>
              <ProductCollectionNav
                activeCategory={selectedCategory}
                currentSearch={params.search}
                currentSort={selectedSort}
              />
            </div>
            
            <div className="flex shrink-0 flex-col items-start gap-2 w-full md:w-auto md:items-end">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-soft">Organize By</p>
              <div className="flex items-center gap-6">
                <ProductSortSelect
                  currentSort={selectedSort}
                  currentSearch={params.search}
                  currentCategory={params.category}
                />
              </div>
            </div>
          </section>

          {/* Results Grid */}
          <section className="pb-32">
            <ProductGrid
              products={products}
              emptyTitle="No items match your query"
              emptyDescription="Adjust your filters or try a different search term to explore the catalog."
              clearHref={PRODUCT_LIST_PATH}
            />

            <div className="mt-20 flex justify-center border-t border-border-dim pt-12">
              <CatalogPagination
                basePath={PRODUCT_LIST_PATH}
                page={response.page}
                limit={response.limit}
                total={response.total}
                query={{
                  search: params.search,
                  category: params.category,
                  sort: selectedSort !== "latest" ? selectedSort : undefined,
                }}
              />
            </div>
          </section>
        </main>

        <StorefrontFooter />
      </div>
    );
  }

  const rawSearch = Array.isArray(rawParams.search) ? rawParams.search[0] : rawParams.search;

  return (
    <div className="min-h-screen text-foreground">
      <ShoppingHeader
        searchQuery={rawSearch ?? ""}
        selectedCategory="All"
        selectedSort="latest"
      />
      <main className="mx-auto max-w-[1280px] px-6 pt-20">
        <StorefrontStatusCard
          title="Catalog Sync Error"
          description="We encountered an issue synchronizing with the live catalog service. Please ensure the API gateway and product-service is online."
          actionHref="/"
          actionLabel="Return Home"
          tone="error"
        />
      </main>
      <StorefrontFooter />
    </div>
  );
}

