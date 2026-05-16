import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/search/ProductGrid";
import { ProductDetailGrid } from "@/components/storefront/ProductDetailGrid";
import ShoppingHeader from "@/components/shopping/ShoppingHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { fetchProductBySlug, fetchProductCategories, fetchRelatedProducts } from "@/lib/products/api";
import { buildCategoryLookup, getCategoryDisplayName, getCategoryDisplaySlug } from "@/lib/products/categories";
import { PRODUCT_LIST_PATH } from "@/lib/products/routes";
import { toStorefrontProduct } from "@/lib/products/storefront";

type PageParams = Promise<{ slug: string }>;

export default async function ProductDetailPage({
  params,
}: {
  params: PageParams;
}) {
  const { slug } = await params;
  const detail = await Promise.all([
    fetchProductBySlug(slug),
    fetchRelatedProducts(slug),
    fetchProductCategories().catch(() => ({ items: [], total: 0 })),
  ]).catch(() => null);

  if (!detail) {
    notFound();
  }

  const [rawProduct, related, categoriesResponse] = detail;
  const categories = buildCategoryLookup(categoriesResponse.items);
  const product = {
    ...rawProduct,
    categoryName: getCategoryDisplayName(rawProduct.categoryId, categories),
    categorySlug: getCategoryDisplaySlug(rawProduct.categoryId, categories),
  };
  const relatedProducts = related.items.map((item) => toStorefrontProduct(item, categories));
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ShoppingHeader searchQuery="" selectedCategory="All" selectedSort="latest" />

        <nav className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-text-soft mb-8 mt-4">
          <Link href={PRODUCT_LIST_PATH} className="hover:text-accent transition-colors">
            Products
          </Link>
          <span className="text-border-strong">/</span>
          <span className="text-text-muted">{product.name}</span>
        </nav>

        <ProductDetailGrid product={product} />

        {/* Related Products */}
        <section className="mt-24 pt-16 border-t border-border-dim">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-accent text-[11px] font-black uppercase tracking-[0.4em]">Recommendation</span>
              <h2 className="text-4xl font-black tracking-tightest mt-2">More from the collection</h2>
            </div>
            <Link 
              href={PRODUCT_LIST_PATH} 
              className="px-6 py-3 rounded-xl bg-surface-strong border border-border-strong text-[11px] font-black uppercase tracking-widest hover:border-accent/40 hover:bg-accent/10 transition-all text-center"
            >
              View Full Catalog
            </Link>
          </div>
          
          <ProductGrid
            products={relatedProducts}
            emptyTitle="No related products yet"
            emptyDescription="This item does not have related catalog links right now."
            clearHref={PRODUCT_LIST_PATH}
            clearLabel="Back to catalog"
          />
        </section>
      </div>

      <StorefrontFooter />
    </main>

  );
}
