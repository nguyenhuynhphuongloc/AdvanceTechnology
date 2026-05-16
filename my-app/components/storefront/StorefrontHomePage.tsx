import Link from "next/link";
import { ProductGrid } from "../search/ProductGrid";
import { fetchProductCategories, fetchProducts } from "../../lib/products/api";
import { buildCategoryLookup } from "../../lib/products/categories";
import { buildProductListHref, PRODUCT_LIST_PATH } from "../../lib/products/routes";
import type { Product } from "../../lib/search/types";
import { fetchStorefrontBranding } from "../../lib/storefront/api";
import { StorefrontFooter } from "./StorefrontFooter";
import { StorefrontHeader } from "./StorefrontHeader";
import { StorefrontStatusCard } from "./StorefrontStatusCard";

function toCardProduct(product: {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId?: string;
  basePrice: number;
  imageUrl: string;
}, categories: ReturnType<typeof buildCategoryLookup>): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    price: product.basePrice,
    imageUrl: product.imageUrl,
    categoryId: product.categoryId,
    categoryName: categories.get(product.categoryId ?? "")?.name ?? product.categoryId,
    categorySlug: categories.get(product.categoryId ?? "")?.slug ?? product.categoryId,
  };
}

export async function StorefrontHomePage() {
  const [featuredResponse, newArrivalsResponse, categoriesResponse, branding] = await Promise.all([
    fetchProducts({ limit: 8, sort: "latest" }).catch((error) => {
      console.error("Home featured render error:", error);
      return null;
    }),
    fetchProducts({ limit: 4, sort: "price-desc" }).catch(() => null),
    fetchProductCategories().catch(() => ({ items: [], total: 0 })),
    fetchStorefrontBranding(),
  ]);

  if (featuredResponse) {
    const categoryLookup = buildCategoryLookup(categoriesResponse.items);
    const featuredProducts = featuredResponse.items.slice(0, 4).map((product) => toCardProduct(product, categoryLookup));
    const newArrivalProducts =
      newArrivalsResponse?.items.map((product) => toCardProduct(product, categoryLookup)) ??
      featuredResponse.items.slice(4, 8).map((product) => toCardProduct(product, categoryLookup));

    return (
      <div className="min-h-screen text-foreground selection:bg-accent selection:text-accent-contrast">
        <StorefrontHeader activeNav="home" />
        <main className="mx-auto max-w-[1280px] px-4 pt-8 sm:px-6">
          <section className="grid gap-8 rounded-3xl border border-border-dim bg-surface/30 p-6 shadow-premium backdrop-blur md:grid-cols-[minmax(0,1fr)_380px] md:p-10 lg:p-12">
            <div className="flex min-w-0 flex-col justify-center">
              <p className="m-0 mb-4 text-[12px] font-black uppercase tracking-[0.22em] text-accent-secondary">
                {branding.brandName}
              </p>
              <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Shop reliable hardware with fast catalog discovery.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
                Browse live inventory, compare variants, and move from product detail to checkout without losing context.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={PRODUCT_LIST_PATH}
                  prefetch
                  className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-black text-accent-contrast shadow-[0_20px_50px_rgba(242,95,76,0.22)] transition hover:bg-accent-strong"
                >
                  Shop catalog
                </Link>
                <Link
                  href="/product/cart"
                  prefetch
                  className="inline-flex items-center justify-center rounded-xl border border-border-dim bg-white/5 px-5 py-3 text-sm font-black transition hover:border-border-strong hover:bg-white/10"
                >
                  View cart
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-border-dim bg-black/20 p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-text-soft">
                Categories
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {(categoriesResponse.items.length > 0
                  ? categoriesResponse.items.slice(0, 6).map((category) => ({
                      value: category.id,
                      name: category.name,
                    }))
                  : branding.categories.slice(1, 7)
                ).map((category) => (
                  <Link
                    key={category.value}
                    href={buildProductListHref({ category: category.value })}
                    prefetch
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-bold text-text-muted transition hover:border-accent/40 hover:text-white"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-12">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="m-0 text-[12px] font-bold uppercase tracking-[0.14em] text-accent-secondary">
                  Featured now
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">Latest arrivals</h2>
              </div>
              <Link
                href={PRODUCT_LIST_PATH}
                prefetch
                className="text-sm font-bold text-accent hover:text-accent-strong"
              >
                View all products
              </Link>
            </div>
            <ProductGrid products={featuredProducts} />
          </section>

          <section className="mt-14 pb-20">
            <div className="mb-6">
              <p className="m-0 text-[12px] font-bold uppercase tracking-[0.14em] text-accent-secondary">
                New arrivals
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Fresh catalog updates</h2>
            </div>
            <ProductGrid
              products={newArrivalProducts}
              emptyTitle="No new arrivals yet"
              emptyDescription="Create active products in Admin to populate this storefront section."
            />
          </section>
        </main>
        <StorefrontFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground">
      <StorefrontHeader activeNav="home" />
      <main className="mx-auto max-w-[1200px] px-4 pt-10">
        <StorefrontStatusCard
          title="Storefront unavailable"
          description="The home storefront could not load the live catalog right now. Check the API gateway and product-service status."
          actionHref={PRODUCT_LIST_PATH}
          actionLabel="Open catalog"
          tone="error"
        />
      </main>
      <StorefrontFooter />
    </div>
  );
}
