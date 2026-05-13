"use client";

import Link from "next/link";
import AccountButton from "@/components/shopping/AccountButton";
import CartButton from "@/components/shopping/CartButton";
import { useAuth } from "@/lib/shopping/auth-context";
import { buildProductListHref, PRODUCT_LIST_PATH } from "@/lib/products/routes";
import type { ProductSort } from "@/lib/products/types";
import { storefrontBranding, type StorefrontNavKey } from "@/lib/storefront/config";

type StorefrontHeaderProps = {
  activeNav?: StorefrontNavKey;
  searchQuery?: string;
  searchAction?: string;
  selectedCategory?: string;
  selectedSort?: ProductSort;
  showSearch?: boolean;
};

export function StorefrontHeader({
  activeNav,
  searchQuery = "",
  searchAction = PRODUCT_LIST_PATH,
  selectedCategory,
  selectedSort = "latest",
  showSearch = true,
}: StorefrontHeaderProps) {
  const { user } = useAuth();

  const categoryValue =
    selectedCategory && selectedCategory.toLowerCase() !== "all"
      ? selectedCategory.toLowerCase()
      : undefined;

  const productsHref = buildProductListHref({
    search: searchAction === PRODUCT_LIST_PATH ? searchQuery || undefined : undefined,
    sort: searchAction === PRODUCT_LIST_PATH ? selectedSort : undefined,
    category: searchAction === PRODUCT_LIST_PATH ? categoryValue : undefined,
  });

  return (
    <header className="sticky top-0 z-30 border-b border-border-dim backdrop-blur-xl bg-background/80">
      <div className="max-w-[1200px] mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/" className="flex items-center gap-3 no-underline group" aria-label={`${storefrontBranding.brandName} home`}>
            <span className="w-10 h-10 flex items-center justify-center rounded-[14px] border border-border-strong bg-surface-strong font-extrabold tracking-widest text-foreground transition-transform group-hover:scale-105">
              {storefrontBranding.logoText}
            </span>
            <span className="text-xl font-extrabold tracking-wider">{storefrontBranding.brandName}</span>
          </Link>
 
          <nav className="flex gap-2 flex-wrap" aria-label="Primary">
            {storefrontBranding.navItems.map((item) => {
              const href = item.key === "products" ? productsHref : item.href;
              const isActive = activeNav === item.key;
 
              return (
                <Link
                  key={item.key}
                  href={href}
                  className={[
                    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-bold transition-all hover:-translate-y-0.5",
                    isActive 
                      ? "bg-accent text-accent-contrast hover:bg-accent-strong shadow-[0_0_20px_rgba(242,95,76,0.3)]" 
                      : "bg-white/5 border border-border-dim text-foreground hover:border-border-strong hover:bg-white/10",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
 
        <div className="flex items-center justify-end gap-3 flex-1 min-w-[320px] flex-wrap md:flex-nowrap">
          {showSearch ? (
            <form action={searchAction} className="flex gap-2 flex-1 max-w-[520px]">
              {searchAction === PRODUCT_LIST_PATH && selectedSort !== "latest" ? (
                <input type="hidden" name="sort" value={selectedSort} />
              ) : null}
              {searchAction === PRODUCT_LIST_PATH && categoryValue ? (
                <input type="hidden" name="category" value={categoryValue} />
              ) : null}
              <input
                type="search"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search products"
                className="w-full rounded-full border border-border-dim bg-white/5 px-4 py-2 text-foreground outline-none focus:border-accent/60 focus:ring-4 focus:ring-accent/10 placeholder:text-text-soft transition-all"
                aria-label="Search products"
              />
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 font-bold transition-all hover:-translate-y-0.5 bg-white/5 border border-border-dim text-foreground hover:border-border-strong hover:bg-white/10">
                Search
              </button>
            </form>
          ) : null}
 
          {!user ? (
            <div className="flex items-center gap-2 text-text-muted text-sm px-2">
              <Link href="/login" className="transition-colors hover:text-foreground no-underline">
                Login
              </Link>
              <span className="text-text-soft">/</span>
              <Link href="/register" className="transition-colors hover:text-foreground no-underline">
                Register
              </Link>
            </div>
          ) : (
            <Link href="/product/account" className="transition-colors hover:text-foreground no-underline text-text-muted">
              Hello, {user.name}
            </Link>
          )}
 
          <AccountButton />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
