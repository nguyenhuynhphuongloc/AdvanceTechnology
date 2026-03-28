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
    <header className="storefront-header">
      <div className="storefront-container storefront-header-inner">
        <div className="storefront-brand-block">
          <Link href="/" className="storefront-brand-mark" aria-label={`${storefrontBranding.brandName} home`}>
            <span className="storefront-brand-logo">{storefrontBranding.logoText}</span>
            <span className="storefront-brand-name">{storefrontBranding.brandName}</span>
          </Link>

          <nav className="storefront-primary-nav" aria-label="Primary">
            {storefrontBranding.navItems.map((item) => {
              const href = item.key === "products" ? productsHref : item.href;
              const isActive = activeNav === item.key;

              return (
                <Link
                  key={item.key}
                  href={href}
                  className={[
                    "storefront-button",
                    isActive ? "storefront-button-primary" : "storefront-button-secondary",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="storefront-header-actions">
          {showSearch ? (
            <form action={searchAction} className="storefront-header-search">
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
                className="storefront-field"
                aria-label="Search products"
              />
              <button type="submit" className="storefront-button storefront-button-secondary">
                Search
              </button>
            </form>
          ) : null}

          {!user ? (
            <div className="storefront-account-links">
              <Link href="/login" className="storefront-inline-link">
                Login
              </Link>
              <span className="storefront-divider">/</span>
              <Link href="/register" className="storefront-inline-link">
                Register
              </Link>
            </div>
          ) : (
            <Link href="/product/account" className="storefront-inline-link">
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
