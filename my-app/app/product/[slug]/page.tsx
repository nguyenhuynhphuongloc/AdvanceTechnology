import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/search/ProductGrid";
import { AddToCartPanel } from "@/components/storefront/AddToCartPanel";
import ShoppingHeader from "@/components/shopping/ShoppingHeader";
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { fetchProductBySlug, fetchRelatedProducts } from "@/lib/products/api";
import { PRODUCT_LIST_PATH } from "@/lib/products/routes";
import { toStorefrontProduct } from "@/lib/products/storefront";

type PageParams = Promise<{ slug: string }>;

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default async function ProductDetailPage({
  params,
}: {
  params: PageParams;
}) {
  const { slug } = await params;
  const detail = await Promise.all([
    fetchProductBySlug(slug),
    fetchRelatedProducts(slug),
  ]).catch(() => null);

  if (!detail) {
    notFound();
  }

  const [product, related] = detail;
  const relatedProducts = related.items.map(toStorefrontProduct);
  const gallery = [product.mainImage, ...product.galleryImages];

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

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Product Images */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="rounded-2xl overflow-hidden aspect-[4/5] bg-surface-muted border border-border-dim group relative">
              <img
                src={product.mainImage.imageUrl}
                alt={product.mainImage.altText || product.name}
                className="w-100 h-100 object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((image) => (
                <div
                  key={image.id}
                  className={`rounded-xl overflow-hidden aspect-square border transition-all duration-300 cursor-pointer hover:border-accent/50 ${
                    image.isMain
                      ? "border-accent ring-1 ring-accent/30"
                      : "border-border-dim bg-surface-muted"
                  }`}
                >
                  <img
                    src={image.imageUrl}
                    alt={image.altText || product.name}
                    className="w-100 h-100 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-accent text-[11px] font-black uppercase tracking-[0.3em]">
                  {product.category}
                </span>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-foreground">
                  {product.name}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-soft">Variants</span>
                  <span className="text-sm font-bold text-text-muted">{product.variants.length}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-border-strong hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-soft">Sizes</span>
                  <span className="text-sm font-bold text-text-muted">{product.availableSizes.length}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-border-strong hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-soft">Colors</span>
                  <span className="text-sm font-bold text-text-muted">{product.availableColors.length}</span>
                </div>
              </div>

              {product.productionDate && (
                <div className="flex items-center mt-1">
                  <span className="px-2.5 py-1 rounded bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider border border-accent/20">
                    Release: {product.productionDate}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl md:text-6xl font-black tracking-tightest text-foreground">
                  {formatPrice(product.basePrice)}
                </span>
                {product.variants.length > 1 && (
                  <span className="text-text-soft text-sm font-bold uppercase tracking-widest italic">Starting from</span>
                )}
              </div>
              
              <p className="text-text-muted/90 text-lg leading-relaxed font-medium max-w-2xl border-l-2 border-accent/30 pl-6 py-2">
                {product.description}
              </p>
            </div>

            <div className="bg-surface-strong/30 rounded-3xl p-8 border border-border-dim backdrop-blur-sm">
              <AddToCartPanel product={product} />
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-border-dim pb-4">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-text-soft">
                  Variant catalog
                </h2>
                <div className="px-2 py-0.5 rounded-full bg-surface-strong text-[9px] font-black text-text-muted uppercase tracking-widest border border-border-strong">
                  {product.variants.length} SKU Available
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="group relative flex justify-between items-center gap-4 p-5 rounded-2xl bg-surface-muted/40 border border-border-dim transition-all duration-500 hover:border-accent/40 hover:bg-surface-strong/60 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center border border-border-dim font-black text-sm text-accent group-hover:scale-110 transition-transform">
                        {variant.size}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-base text-foreground group-hover:text-accent transition-colors">
                          {variant.color}
                        </span>
                        <span className="text-[10px] font-bold text-text-soft uppercase tracking-widest">
                          ID: {variant.sku.split('-').pop()}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-xl text-foreground tabular-nums">
                      {formatPrice(variant.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

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
