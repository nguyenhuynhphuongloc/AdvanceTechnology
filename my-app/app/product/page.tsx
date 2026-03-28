import Link from "next/link";
import { CatalogPagination } from "@/components/products/CatalogPagination";
import { ProductGrid } from "@/components/search/ProductGrid";
import ShoppingHeader from "@/components/shopping/ShoppingHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { StorefrontStatusCard } from "@/components/storefront/StorefrontStatusCard";
import { fetchCatalogPage } from "@/lib/products/catalog";
import { buildProductListHref, PRODUCT_LIST_PATH } from "@/lib/products/routes";
import type { ProductSort } from "@/lib/products/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const collectionLinks = [
  { label: "All", value: "all" },
  { label: "Shirts", value: "shirts" },
  { label: "Jackets", value: "jackets" },
  { label: "Hoodies", value: "hoodies" },
  { label: "Stickers", value: "stickers" },
];

const sortOptions: Array<{ label: string; value: ProductSort }> = [
  { label: "Latest arrivals", value: "latest" },
  { label: "Price: Low to high", value: "price-asc" },
  { label: "Price: High to low", value: "price-desc" },
  { label: "Name: A-Z", value: "name-asc" },
  { label: "Name: Z-A", value: "name-desc" },
];

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
    const resultLabel = params.search
      ? `${response.total} results for "${params.search}"`
      : `${response.total} products in the live catalog`;

    return (
      <main className="storefront-page storefront-product-page">
        <div className="storefront-product-shell">
          <ShoppingHeader
            searchQuery={params.search ?? ""}
            selectedCategory={toHeaderCategory(params.category)}
            selectedSort={selectedSort}
          />

          <section className="storefront-product-hero">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
              Live product catalog
            </p>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-[760px]">
                <h1 className="text-4xl font-medium tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Browse products from the real storefront catalog.
                </h1>
                <p className="mt-3 max-w-[620px] text-base leading-7 text-white/60 sm:text-lg">
                  The canonical storefront route now keeps the `product` page design while using the
                  same gateway-backed catalog data, sorting, filtering, and detail navigation as the
                  existing live product APIs.
                </p>
              </div>
              <p className="text-sm text-white/55">{resultLabel}</p>
            </div>
          </section>

          <div className="storefront-product-layout">
            <aside className="storefront-filter-column">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/50">
                Collections
              </p>
              <nav className="space-y-0.5 text-sm text-white/70">
                {collectionLinks.map((collection) => {
                  const isActive = selectedCategory === collection.value;

                  return (
                    <Link
                      key={collection.value}
                      href={buildProductListHref({
                        search: params.search,
                        sort: selectedSort,
                        category: collection.value,
                      })}
                      className={[
                        "block w-fit border-b border-transparent py-0.5 leading-5",
                        isActive
                          ? "border-white font-semibold text-white"
                          : "hover:border-white/30 hover:text-white",
                      ].join(" ")}
                    >
                      {collection.label}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            <section className="storefront-product-results">
              <ProductGrid
                products={products}
                emptyTitle="No products found"
                emptyDescription="Try a different search term or category to load items from the live catalog."
                clearHref={PRODUCT_LIST_PATH}
              />

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
            </section>

            <aside className="storefront-filter-column">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/50">
                Sort by
              </p>
              <nav className="space-y-0.5 text-sm text-white/70">
                {sortOptions.map((option) => {
                  const isActive = option.value === selectedSort;

                  return (
                    <Link
                      key={option.value}
                      href={buildProductListHref({
                        search: params.search,
                        category: params.category,
                        sort: option.value,
                      })}
                      className={[
                        "block w-fit border-b border-transparent py-0.5 leading-5",
                        isActive
                          ? "border-white font-semibold text-white"
                          : "hover:border-white/30 hover:text-white",
                      ].join(" ")}
                    >
                      {option.label}
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        </div>

        <StorefrontFooter />
      </main>
    );
  }

  const rawSearch = Array.isArray(rawParams.search) ? rawParams.search[0] : rawParams.search;

  return (
    <main className="storefront-page storefront-product-page">
      <div className="storefront-product-shell">
        <ShoppingHeader
          searchQuery={rawSearch ?? ""}
          selectedCategory="All"
          selectedSort="latest"
        />
        <div className="pt-6">
          <StorefrontStatusCard
            title="Catalog unavailable"
            description="The product page could not load the live catalog from the API gateway. Verify the gateway and product-service are running, then try again."
            actionHref="/"
            actionLabel="Back home"
            tone="error"
          />
        </div>
      </div>

      <StorefrontFooter />
    </main>
  );
}
