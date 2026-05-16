import Link from "next/link";
import { ProductGrid } from "../search/ProductGrid";
import { fetchProducts } from "../../lib/products/api";
import { PRODUCT_LIST_PATH } from "../../lib/products/routes";
import type { Product } from "../../lib/search/types";
import { StorefrontFooter } from "./StorefrontFooter";
import { StorefrontHeader } from "./StorefrontHeader";
import { StorefrontStatusCard } from "./StorefrontStatusCard";

function toCardProduct(product: {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  basePrice: number;
  imageUrl: string;
  stock?: number;
}): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    price: product.basePrice,
    imageUrl: product.imageUrl,
    category: product.category,
    stock: product.stock ?? 0,
  };
}

export async function StorefrontHomePage() {
  const productsResponse = await fetchProducts({ limit: 4, sort: "latest" }).catch((error) => {
    console.error("Home page render error:", error);
    return null;
  });

  if (productsResponse) {
    const products = productsResponse.items.map(toCardProduct);

    return (
      <div className="min-h-screen text-foreground selection:bg-accent selection:text-accent-contrast">
        <StorefrontHeader activeNav="home" />
        <main className="max-w-[1280px] mx-auto px-6 pt-10">
          {/* Hero Section: Centered Product Introduction */}
          <section className="relative mt-8 overflow-hidden rounded-[40px] border border-border-dim bg-surface/30 backdrop-blur-3xl p-12 lg:p-24 shadow-premium text-center">
            {/* Visual Accent: Glowing Background Gradient */}
            <div className="absolute -top-40 -left-40 h-[400px] w-[400px] bg-accent/20 rounded-full blur-[120px] opacity-40 animate-pulse" />
            <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] bg-accent-secondary/10 rounded-full blur-[120px] opacity-30" />

            <div className="relative z-10 mx-auto max-w-[880px]">
              <p className="m-0 text-[13px] font-black uppercase tracking-[0.25em] text-accent-secondary mb-6">
                Redefining Innovation
              </p>
              <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-black leading-[0.95] tracking-tighter text-white">
                Intelligence Redefined, <br />
                <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">Powered by You.</span>
              </h1>
              <p className="mt-8 mx-auto max-w-[680px] text-lg md:text-xl leading-relaxed text-text-muted">
                Experience the perfect synergy between high-end hardware and artificial intelligence. 
                Our platform provides more than just components—we offer the foundation to build 
                the future, guided by intelligent insights.
              </p>

              <div className="mt-12 flex flex-wrap justify-center gap-5">
                <Link
                  href="/product/chat"
                  className="inline-flex items-center justify-center rounded-full bg-accent px-10 py-4.5 text-base font-black text-accent-contrast shadow-[0_20px_50px_rgba(242,95,76,0.3)] transition-all hover:scale-105 hover:bg-accent-strong active:scale-95"
                >
                  Chat with AI
                </Link>
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center rounded-full border border-border-dim bg-white/5 px-10 py-4.5 text-base font-black transition-all hover:border-border-strong hover:bg-white/10 active:scale-95"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-[60px] pb-20">
            <div className="flex justify-between gap-4 flex-wrap items-end mb-6">
              <div>
                <p className="m-0 text-accent-secondary uppercase tracking-[0.14em] text-[12px] font-bold">Featured now</p>
                <h2 className="mt-2.5 mb-0 text-[32px] font-bold tracking-tight">Latest catalog arrivals</h2>
              </div>
              <p className="m-0 text-text-muted max-w-[420px] leading-relaxed">
                These cards use the same database-backed product listing contract as the main
                catalog pages.
              </p>
            </div>

            <ProductGrid products={products} />
          </section>
        </main>
        <StorefrontFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground">
      <StorefrontHeader activeNav="home" />
      <main className="max-w-[1200px] mx-auto px-4 pt-10">
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
