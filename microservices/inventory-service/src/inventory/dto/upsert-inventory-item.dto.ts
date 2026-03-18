export class UpsertInventoryItemDto {
  productId?: string;
  variantId: string;
  sku?: string;
  stock: number;
}
