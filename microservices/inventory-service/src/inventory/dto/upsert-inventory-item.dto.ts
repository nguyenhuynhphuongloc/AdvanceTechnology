export class UpsertInventoryItemDto {
  productId?: string;
  variantId: string;
  branchId?: string;
  sku?: string;
  stock: number;
}
