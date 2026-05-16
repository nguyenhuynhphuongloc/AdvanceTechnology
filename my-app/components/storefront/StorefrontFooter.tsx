import Link from "next/link";
import { PRODUCT_LIST_PATH } from "../../lib/products/routes";
import { fetchStorefrontBranding } from "../../lib/storefront/api";

export async function StorefrontFooter() {
  const branding = await fetchStorefrontBranding();

  return (
    <footer className="mt-16 border-t border-border-dim bg-[#06090e]/82">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-6 px-4 py-6 md:py-10">
        <div>
          <p className="m-0 text-[12px] font-bold uppercase tracking-[0.14em] text-accent-secondary">
            {branding.brandName}
          </p>
          <p className="mb-0 mt-2 max-w-[420px] leading-relaxed text-text-muted">
            {branding.address} · {branding.contactPhone} · {branding.contactEmail}
          </p>
        </div>

        <nav className="flex flex-wrap gap-2.5">
          <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-full border border-border-dim bg-white/5 px-5 py-2 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-border-strong hover:bg-white/10">Home</Link>
          <Link href={PRODUCT_LIST_PATH} className="inline-flex items-center justify-center gap-2 rounded-full border border-border-dim bg-white/5 px-5 py-2 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-border-strong hover:bg-white/10">Products</Link>
          <Link href="/product/cart" className="inline-flex items-center justify-center gap-2 rounded-full border border-border-dim bg-white/5 px-5 py-2 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5 hover:border-border-strong hover:bg-white/10">Cart</Link>
          <Link href="/seller/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition-all hover:-translate-y-0.5 hover:bg-zinc-200">Sell on Market</Link>
        </nav>
      </div>
    </footer>
  );
}
