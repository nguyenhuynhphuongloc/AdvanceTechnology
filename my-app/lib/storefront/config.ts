export type StorefrontNavKey = "home" | "products" | "cart" | "orders";

export type StorefrontNavItem = {
  key: StorefrontNavKey;
  label: string;
  href: string;
};

export type StorefrontBranding = {
  brandName: string;
  logoText: string;
  logoImageUrl?: string | null;
  logoPublicId?: string | null;
  description?: string | null;
  contactEmail: string;
  contactPhone: string;
  address: string;
  categories: Array<{ name: string; value: string }>;
  navItems: StorefrontNavItem[];
};

export const storefrontBranding: StorefrontBranding = {
  brandName: "Advance Technology",
  logoText: "AT",
  logoImageUrl: null,
  logoPublicId: null,
  description: null,
  contactEmail: "support@advancetechnology.local",
  contactPhone: "+84 000 000 000",
  address: "Ho Chi Minh City, Vietnam",
  categories: [
    { name: "All", value: "all" },
    { name: "T-Shirts", value: "t-shirts" },
    { name: "Shirts", value: "shirts" },
    { name: "Trousers", value: "trousers" },
    { name: "Jackets", value: "jackets" },
    { name: "Hoodies", value: "hoodies" },
    { name: "Footwear", value: "footwear" },
    { name: "Accessories", value: "accessories" },
  ],
  navItems: [
    { key: "home", label: "Home", href: "/" },
    { key: "products", label: "Products", href: "/product" },
    { key: "orders", label: "Orders", href: "/product/orders" },
  ],
};

export function deriveLogoText(brandName: string) {
  return brandName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "AT";
}
