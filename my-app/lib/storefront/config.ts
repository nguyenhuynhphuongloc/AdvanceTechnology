export type StorefrontNavKey = "home" | "products" | "cart" | "orders";

export type StorefrontNavItem = {
  key: StorefrontNavKey;
  label: string;
  href: string;
};

export type StorefrontBranding = {
  brandName: string;
  logoText: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  categories: Array<{ name: string; value: string }>;
  navItems: StorefrontNavItem[];
};

export const storefrontBranding: StorefrontBranding = {
  brandName: "Advance Technology",
  logoText: "AT",
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
