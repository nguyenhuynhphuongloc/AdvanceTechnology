import ShoppingHeader from "@/components/shopping/ShoppingHeader";
import ProductList from "@/components/shopping/ProductList";
import {
	categories,
	products as localProducts,
	sortOptions,
	type Product,
	type SortKey,
} from "@/lib/shopping/data";
import { fetchProducts } from "@/lib/products/api";
import { ProductSort } from "@/lib/products/types";

type SearchParams = {
	q?: string;
	sort?: string;
	category?: string;
};

function getSortKey(value: string | undefined): SortKey {
	const matched = sortOptions.find((option) => option.key === value);
	return matched ? matched.key : "relevance";
}

function filterAndSortProducts(
	items: Product[],
	query: string,
	selectedCategory: string,
	selectedSort: SortKey,
) {
	const normalizedQuery = query.trim().toLowerCase();

	const filtered = items.filter((item) => {
		const byCategory = selectedCategory === "All" || item.category === selectedCategory;
		const byQuery =
			normalizedQuery.length === 0 ||
			item.name.toLowerCase().includes(normalizedQuery) ||
			item.category.toLowerCase().includes(normalizedQuery);

		return byCategory && byQuery;
	});

	const relevanceScore = (item: Product) => {
		if (!normalizedQuery) return 0;
		const name = item.name.toLowerCase();
		const category = item.category.toLowerCase();
		const exactName = name === normalizedQuery ? 100 : 0;
		const startsWith = name.startsWith(normalizedQuery) ? 50 : 0;
		const nameContains = name.includes(normalizedQuery) ? 25 : 0;
		const categoryContains = category.includes(normalizedQuery) ? 10 : 0;

		return exactName + startsWith + nameContains + categoryContains + item.trendingScore / 10;
	};

	return [...filtered].sort((first, second) => {
		switch (selectedSort) {
			case "price-asc":
				return first.price - second.price;
			case "price-desc":
				return second.price - first.price;
			case "latest-desc":
				return Date.parse(second.createdAt) - Date.parse(first.createdAt);
			case "trending":
				return second.trendingScore - first.trendingScore;
			default:
				return relevanceScore(second) - relevanceScore(first);
		}
	});
}

function buildHref(query: string, sort: SortKey, category?: string) {
	const params = new URLSearchParams();

	if (query) params.set("q", query);
	if (sort) params.set("sort", sort);
	if (category && category !== "All") params.set("category", category);

	const queryString = params.toString();
	return queryString ? `/product?${queryString}` : "/product";
}

function toNumericId(value: string) {
	let hash = 0;
	for (let index = 0; index < value.length; index += 1) {
		hash = (hash * 31 + value.charCodeAt(index)) | 0;
	}

	return Math.abs(hash) + 1;
}

function mapSortToApiSort(sort: SortKey): ProductSort {
	switch (sort) {
		case "price-asc":
			return "price-asc";
		case "price-desc":
			return "price-desc";
		default:
			return "latest";
	}
}

async function getShoppingProducts(query: string, category: string, sort: SortKey): Promise<Product[]> {
	const selectedCategory = category === "All" ? undefined : category;
	try {
		const response = await fetchProducts({
			page: 1,
			limit: 60,
			search: query || undefined,
			category: selectedCategory,
			sort: mapSortToApiSort(sort),
		});

		return response.items.map((item) => ({
			id: toNumericId(item.id),
			name: item.name,
			price: item.basePrice,
			image: item.imageUrl,
			category: item.category as Product["category"],
			createdAt: new Date().toISOString(),
			trendingScore: 0,
		}));
	} catch {
		return localProducts;
	}
}

export default async function ProductPage({
	searchParams,
}: {
	searchParams?: Promise<SearchParams>;
}) {
	const params = (await searchParams) ?? {};
	const searchQuery = params.q?.trim() ?? "";
	const selectedSort = getSortKey(params.sort);
	const selectedCategory =
		categories.find((category) => category === params.category) ?? "All";
	const apiProducts = await getShoppingProducts(searchQuery, selectedCategory, selectedSort);

	const filteredProducts = filterAndSortProducts(apiProducts, searchQuery, selectedCategory, selectedSort);

	const titleQuery = searchQuery.length > 0 ? `"${searchQuery}"` : "all products";

	return (
		<main className="min-h-screen bg-[#0b0b0b] p-6 lg:p-8 text-white">
			<div className="mx-auto max-w-[1700px]">
				<ShoppingHeader
					searchQuery={searchQuery}
					selectedCategory={selectedCategory}
					selectedSort={selectedSort}
				/>

				<div className="grid grid-cols-1 gap-8 lg:grid-cols-[190px_minmax(0,1fr)_220px]">
					<aside>
						<p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/50">Collections</p>
						<nav className="space-y-0.5 text-sm text-white/70">
							{categories.map((category) => {
								const isActive = category === selectedCategory;

								return (
									<a
										key={category}
										href={buildHref(searchQuery, selectedSort, category)}
										className={[
											"block w-fit border-b border-transparent py-0.5 leading-5",
											isActive ? "font-semibold border-white text-white" : "hover:border-white/30 hover:text-white",
										].join(" ")}
									>
										{category}
									</a>
								);
							})}
						</nav>
					</aside>

					<section>
						{searchQuery.length > 0 && (
							<h1 className="mb-5 text-5xl font-medium tracking-tight text-white">
								Showing {filteredProducts.length} results for "{searchQuery}"
							</h1>
						)}
						{searchQuery.length === 0 && (
							<h1 className="mb-5 text-xl font-medium tracking-tight text-white">
								Showing {filteredProducts.length} results for {titleQuery}
							</h1>
						)}
						<ProductList products={filteredProducts} />
					</section>

					<aside>
						<p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/50">Sort by</p>
						<nav className="space-y-0.5 text-sm text-white/70">
							{sortOptions.map((option) => {
								const isActive = option.key === selectedSort;

								return (
									<a
										key={option.key}
										href={buildHref(searchQuery, option.key, selectedCategory)}
										className={[
											"block w-fit border-b border-transparent py-0.5 leading-5",
											isActive ? "font-semibold border-white text-white" : "hover:border-white/30 hover:text-white",
										].join(" ")}
									>
										{option.label}
									</a>
								);
							})}
						</nav>
					</aside>
				</div>
			</div>
		</main>
	);
}
