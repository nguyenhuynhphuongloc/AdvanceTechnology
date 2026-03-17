import CartButton from "@/components/shopping/CartButton";
import AccountButton from "@/components/shopping/AccountButton";

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
  const categoryParam = selectedCategory === "All" ? "" : selectedCategory;

  function navHref(category?: string) {
    const p = new URLSearchParams();
    if (searchQuery) p.set("q", searchQuery);
    if (selectedSort) p.set("sort", selectedSort);
    if (category && category !== "All") p.set("category", category);
    const qs = p.toString();
    return qs ? `/shopping?${qs}` : "/shopping";
  }

  return (
    <header className="mb-8 grid grid-cols-1 items-center gap-5 lg:grid-cols-[1fr_auto]">
      <div className="flex items-center gap-10">
        <a href="/shopping" className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-black/10 text-lg font-bold text-black">
            ▲
          </span>
          <span className="text-2xl font-bold tracking-tight text-black">ACME STORE</span>
        </a>

        <nav className="hidden items-center gap-6 text-2xl text-black/60 md:flex">
          <a
            href={navHref()}
            className={selectedCategory === "All" ? "text-black" : "hover:text-black"}
          >
            All
          </a>
          <a
            href={navHref("Shirts")}
            className={selectedCategory === "Shirts" ? "text-black" : "hover:text-black"}
          >
            Shirts
          </a>
          <a
            href={navHref("Stickers")}
            className={selectedCategory === "Stickers" ? "text-black" : "hover:text-black"}
          >
            Stickers
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <form action="/shopping" className="relative w-full lg:w-[620px]">
          <input type="hidden" name="sort" value={selectedSort} />
          {categoryParam && <input type="hidden" name="category" value={categoryParam} />}
          <input
            type="text"
            name="q"
            defaultValue={searchQuery || ""}
            placeholder="Search products"
            className="h-[60px] w-full rounded-2xl border border-black/20 bg-white px-6 pr-14 text-3xl text-black outline-none focus:border-black/40"
          />
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-black/70 hover:text-black"
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
