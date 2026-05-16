import type { ProductCategoryDto } from "./types";

export type CategoryLookup = Map<string, ProductCategoryDto>;

export function buildCategoryLookup(categories: ProductCategoryDto[]) {
  const lookup: CategoryLookup = new Map();

  categories.forEach((category) => {
    lookup.set(category.id, category);
    lookup.set(category.slug, category);
  });

  return lookup;
}

export function getCategoryDisplayName(
  categoryId: string | undefined,
  lookup: CategoryLookup,
) {
  if (!categoryId) {
    return "Catalog";
  }

  return lookup.get(categoryId)?.name ?? categoryId;
}

export function getCategoryDisplaySlug(
  categoryId: string | undefined,
  lookup: CategoryLookup,
) {
  if (!categoryId) {
    return undefined;
  }

  return lookup.get(categoryId)?.slug ?? categoryId;
}
