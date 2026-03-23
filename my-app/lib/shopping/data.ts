export type Category =
  | "Bags"
  | "Drinkware"
  | "Electronics"
  | "Footware"
  | "Headwear"
  | "Hoodies"
  | "Jackets"
  | "Kids"
  | "Pets"
  | "Shirts"
  | "Stickers";

export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  category: Category;
  createdAt: string;
  trendingScore: number;
};

export type SortKey =
  | "relevance"
  | "trending"
  | "latest-desc"
  | "price-asc"
  | "price-desc";

export const categories: Array<"All" | Category> = [
  "All",
  "Bags",
  "Drinkware",
  "Electronics",
  "Footware",
  "Headwear",
  "Hoodies",
  "Jackets",
  "Kids",
  "Pets",
  "Shirts",
  "Stickers",
];

export const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: "relevance", label: "Relevance" },
  { key: "trending", label: "Trending" },
  { key: "latest-desc", label: "Latest arrivals" },
  { key: "price-asc", label: "Price: Low to high" },
  { key: "price-desc", label: "Price: High to low" },
];

export const products: Product[] = [
  {
    id: 1,
    name: "Acme Rainbow Sticker",
    price: 4,
    image: "https://images.unsplash.com/photo-1515462277126-2dd0c162007a?auto=format&fit=crop&w=1200&q=80",
    category: "Stickers",
    createdAt: "2026-01-12",
    trendingScore: 98,
  },
  {
    id: 2,
    name: "Acme Sticker",
    price: 4,
    image: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=1200&q=80",
    category: "Stickers",
    createdAt: "2025-12-21",
    trendingScore: 92,
  },
  {
    id: 3,
    name: "Acme Drawstring Bag",
    price: 12,
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1200&q=80",
    category: "Bags",
    createdAt: "2026-02-01",
    trendingScore: 90,
  },
  {
    id: 4,
    name: "Acme Everyday Tee",
    price: 24,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    category: "Shirts",
    createdAt: "2025-12-03",
    trendingScore: 86,
  },
  {
    id: 5,
    name: "Acme Kids Tee",
    price: 18,
    image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1200&q=80",
    category: "Kids",
    createdAt: "2026-01-26",
    trendingScore: 84,
  },
  {
    id: 6,
    name: "Acme Performance Hoodie",
    price: 62,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80",
    category: "Hoodies",
    createdAt: "2026-02-16",
    trendingScore: 94,
  },
  {
    id: 7,
    name: "Acme Wind Jacket",
    price: 78,
    image: "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=1200&q=80",
    category: "Jackets",
    createdAt: "2026-01-03",
    trendingScore: 88,
  },
  {
    id: 8,
    name: "Acme Trail Cap",
    price: 19,
    image: "https://images.unsplash.com/photo-1529958030586-3aae4ca485ff?auto=format&fit=crop&w=1200&q=80",
    category: "Headwear",
    createdAt: "2026-02-28",
    trendingScore: 79,
  },
  {
    id: 9,
    name: "Acme Ceramic Mug",
    price: 16,
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1200&q=80",
    category: "Drinkware",
    createdAt: "2025-11-25",
    trendingScore: 77,
  },
  {
    id: 10,
    name: "Acme Smart Bottle",
    price: 34,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1200&q=80",
    category: "Drinkware",
    createdAt: "2026-01-17",
    trendingScore: 81,
  },
  {
    id: 11,
    name: "Acme Wireless Charger",
    price: 45,
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=1200&q=80",
    category: "Electronics",
    createdAt: "2026-02-13",
    trendingScore: 87,
  },
  {
    id: 12,
    name: "Acme Wireless Earbuds",
    price: 69,
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1200&q=80",
    category: "Electronics",
    createdAt: "2025-12-30",
    trendingScore: 91,
  },
  {
    id: 13,
    name: "Acme Running Shoes",
    price: 89,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
    category: "Footware",
    createdAt: "2026-03-02",
    trendingScore: 89,
  },
  {
    id: 14,
    name: "Acme Slippers",
    price: 22,
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80",
    category: "Footware",
    createdAt: "2025-11-10",
    trendingScore: 70,
  },
  {
    id: 15,
    name: "Acme Pet Bowl",
    price: 21,
    image: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=1200&q=80",
    category: "Pets",
    createdAt: "2026-02-07",
    trendingScore: 74,
  },
  {
    id: 16,
    name: "Acme Pet Hoodie",
    price: 29,
    image: "https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&w=1200&q=80",
    category: "Pets",
    createdAt: "2026-01-29",
    trendingScore: 83,
  },
  {
    id: 17,
    name: "Acme Laptop Sleeve",
    price: 36,
    image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    category: "Bags",
    createdAt: "2025-12-13",
    trendingScore: 82,
  },
  {
    id: 18,
    name: "Acme Varsity Jacket",
    price: 92,
    image: "https://images.unsplash.com/photo-1548883354-94bcfe321cbb?auto=format&fit=crop&w=1200&q=80",
    category: "Jackets",
    createdAt: "2026-03-05",
    trendingScore: 93,
  },
];
