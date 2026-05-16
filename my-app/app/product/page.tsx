import { CatalogPagination } from "@/components/products/CatalogPagination";
import { ProductGrid } from "@/components/search/ProductGrid";
import ShoppingHeader from "@/components/shopping/ShoppingHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { StorefrontStatusCard } from "@/components/storefront/StorefrontStatusCard";
import { fetchCatalogPage } from "@/lib/products/catalog";
import { PRODUCT_LIST_PATH } from "@/lib/products/routes";
import { ProductCollectionNav } from "@/components/products/ProductCollectionNav";
import { ProductSortSelect } from "@/components/products/ProductSortSelect";
import { storefrontBranding } from "@/lib/storefront/config";

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
    const { params, products, response, categories } = catalogPage;
    const selectedCategory = params.category ?? "all";
    const selectedSort = params.sort;

    return (
      <div className="min-h-screen text-foreground selection:bg-accent selection:text-accent-contrast">
        <ShoppingHeader
          searchQuery={params.search ?? ""}
          selectedCategory={toHeaderCategory(params.category)}
          selectedSort={selectedSort}
        />

        <main className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <section className="mb-8 mt-10 grid gap-6 border-b border-border-dim pb-8 lg:grid-cols-[260px_minmax(0,1fr)_260px]">
            <aside className="rounded-2xl border border-border-dim bg-surface/40 p-4">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-soft">
                Filters
              </p>
              <div className="grid gap-3">
                {["Price range", "Color", "Size", "Branch", "Availability"].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    disabled
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-sm font-semibold text-text-soft"
                  >
                    <span>{filter}</span>
                    <span className="text-[10px] uppercase tracking-widest">API pending</span>
                  </button>
                ))}
              </div>
            </aside>

            <div className="min-w-0">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-soft">
                Browse Categories
              </p>
              <div className="mb-4 flex flex-wrap gap-2 lg:hidden">
                {(categories.length > 0
                  ? categories.slice(0, 4).map((category) => ({ value: category.id, name: category.name }))
                  : storefrontBranding.categories.slice(1, 5)
                ).map((category) => (
                  <span
                    key={category.value}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-text-soft"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
              <ProductCollectionNav
                activeCategory={selectedCategory}
                currentSearch={params.search}
                currentSort={selectedSort}
                categories={categories}
              />
              <p className="mt-5 text-sm text-text-muted">
                {response.total} product{response.total === 1 ? "" : "s"} found
                {params.search ? ` for "${params.search}"` : ""}.
              </p>
            </div>
            
            <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-soft">
                Organize By
              </p>
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

