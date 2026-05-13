import Link from "next/link";
import { PRODUCT_LIST_PATH } from "../../lib/products/routes";
import { storefrontBranding } from "../../lib/storefront/config";

export function StorefrontFooter() {
  return (
    <footer className="border-t border-border-dim bg-[#06090e]/82 mt-16">
      <div className="max-w-[1200px] mx-auto px-4 py-6 md:py-10 flex justify-between gap-6 flex-wrap items-center">
        <div>
          <p className="m-0 text-accent-secondary uppercase tracking-[0.14em] text-[12px] font-bold">
            {storefrontBranding.brandName}
          </p>
          <p className="mt-2 mb-0 text-text-muted max-w-[420px] leading-relaxed">
            Unified dark storefront routes backed by the existing API gateway and product catalog services.
          </p>
        </div>

        <nav className="flex gap-2.5 flex-wrap">
          <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all hover:-translate-y-0.5 bg-white/5 border border-border-dim text-foreground hover:border-border-strong hover:bg-white/10">Home</Link>
          <Link href={PRODUCT_LIST_PATH} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all hover:-translate-y-0.5 bg-white/5 border border-border-dim text-foreground hover:border-border-strong hover:bg-white/10">Products</Link>
          <Link href="/product/cart" className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all hover:-translate-y-0.5 bg-white/5 border border-border-dim text-foreground hover:border-border-strong hover:bg-white/10">Cart</Link>
          <Link href="/seller/register" className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all hover:-translate-y-0.5 bg-white text-black hover:bg-zinc-200">Sell on Market</Link>
        </nav>
      </div>
    </footer>
  );
}
