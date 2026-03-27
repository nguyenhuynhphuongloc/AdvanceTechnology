export type StorefrontNavKey = "home" | "products" | "cart";

export type StorefrontNavItem = {
  key: StorefrontNavKey;
  label: string;
  href: string;
};

export type StorefrontBranding = {
  brandName: string;
  logoText: string;
  navItems: StorefrontNavItem[];
};

export const storefrontBranding: StorefrontBranding = {
  brandName: "Advance Technology",
  logoText: "AT",
  navItems: [
    { key: "home", label: "Home", href: "/" },
    { key: "products", label: "Products", href: "/product" },
  ],
};
