import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";

export default function CheckoutLoading() {
  return (
    <div className="storefront-page bg-black text-white">
      <StorefrontHeader showSearch={false} />
      <main className="storefront-container py-12">
        <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-[520px] animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900/60" />
          <div className="h-72 animate-pulse rounded-3xl border border-zinc-800 bg-zinc-900/60" />
        </div>
      </main>
      <StorefrontFooter />
    </div>
  );
}
