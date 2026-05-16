import { StorefrontFooter } from "@/components/storefront/StorefrontFooter";
import { StorefrontHeader } from "@/components/storefront/StorefrontHeader";

export default function CartLoading() {
  return (
    <div className="storefront-page">
      <StorefrontHeader activeNav="cart" showSearch={false} />
      <main className="storefront-container py-10">
        <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-2xl border border-border-dim bg-white/5" />
            ))}
          </div>
          <div className="h-80 animate-pulse rounded-3xl bg-white" />
        </div>
      </main>
      <StorefrontFooter />
    </div>
  );
}
