export interface Product {
    id: string;
    name: string;
    slug: string;
    sku?: string;
    price: number;
    imageUrl?: string;
    category?: string;
}
