/**
 * Converts a string to a URL-safe slug with proper Vietnamese Unicode handling.
 * - Strips diacritics (e.g., ấ → a, ử → u)
 * - Converts đ → d and Đ → D
 * - Lowercases and replaces spaces with hyphens
 * - Removes all characters that are not alphanumeric, spaces, or hyphens
 */
export function slugifyVietnamese(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generates a slug from text, falling back to a random suffix if empty.
 * Use this for auto-generating slugs from names.
 */
export function autoSlugify(input: string): string {
  const slug = slugifyVietnamese(input);
  return slug || `item-${Date.now().toString(36)}`;
}
