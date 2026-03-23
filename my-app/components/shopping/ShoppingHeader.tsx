"use client";

import CartButton from "@/components/shopping/CartButton";
import AccountButton from "@/components/shopping/AccountButton";
import { useAuth } from "@/lib/shopping/auth-context";

type ShoppingHeaderProps = {
  searchQuery: string;
  selectedCategory: string;
  selectedSort: string;
};

export default function ShoppingHeader({
  searchQuery,
  selectedCategory,
  selectedSort,
}: ShoppingHeaderProps) {
  const { user } = useAuth();
  const categoryParam = selectedCategory === "All" ? "" : selectedCategory;

  function navHref(category?: string) {
    const p = new URLSearchParams();
    if (searchQuery) p.set("q", searchQuery);
    if (selectedSort) p.set("sort", selectedSort);
    if (category && category !== "All") p.set("category", category);
    const qs = p.toString();
    return qs ? `/product?${qs}` : "/product";
  }

  return (
    <header className="mb-8 grid grid-cols-1 items-center gap-5 border-b border-white/10 pb-4 lg:grid-cols-[1fr_auto]">
      <div className="flex items-center gap-10">
        <a href="/product" className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/70 text-lg font-bold text-white">
            ▲
          </span>
          <span className="text-2xl font-bold tracking-tight text-white">ACME STORE</span>
        </a>

        <nav className="hidden items-center gap-6 text-2xl text-white/60 md:flex">
          <a
            href={navHref()}
            className={selectedCategory === "All" ? "text-white" : "hover:text-white"}
          >
            All
          </a>
          <a
            href={navHref("Shirts")}
            className={selectedCategory === "Shirts" ? "text-white" : "hover:text-white"}
          >
            Shirts
          </a>
          <a
            href={navHref("Stickers")}
            className={selectedCategory === "Stickers" ? "text-white" : "hover:text-white"}
          >
            Stickers
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {!user && (
          <div className="hidden items-center gap-3 text-sm text-white/75 lg:flex">
            <a href="/product/account?mode=login" className="hover:text-white">
              Đăng nhập
            </a>
            <span className="text-white/25">/</span>
            <a href="/product/account?mode=register" className="hover:text-white">
              Đăng ký
            </a>
          </div>
        )}
        {user && (
          <a href="/product/account" className="hidden text-sm text-white/75 hover:text-white lg:inline">
            Xin chào, {user.name}
          </a>
        )}

        <form action="/product" className="relative w-full lg:w-[620px]">
          <input type="hidden" name="sort" value={selectedSort} />
          {categoryParam && <input type="hidden" name="category" value={categoryParam} />}
          <input
            type="text"
            name="q"
            defaultValue={searchQuery || ""}
            placeholder="Search for products..."
            className="h-[60px] w-full rounded-xl border border-white/15 bg-white/5 px-6 pr-14 text-3xl text-white outline-none placeholder:text-white/45 focus:border-white/30"
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-white/70 hover:text-white"
            aria-label="Search"
          >
            ⌕
          </button>
        </form>

        <AccountButton />
        <CartButton />
      </div>
    </header>
  );
}
