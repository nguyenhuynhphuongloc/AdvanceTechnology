import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity({ name: 'inventory_items' })
@Index(['variantId', 'branchId'], { unique: true })
export class InventoryItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'variant_id', type: 'varchar' })
  variantId: string;

  @Column({ name: 'branch_id', type: 'varchar', nullable: true })
  branchId: string | null;

  @Column({ name: 'product_id', type: 'varchar', nullable: true })
  productId: string | null;

  @Column({ type: 'varchar', nullable: true })
  sku: string | null;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'reserved_stock', type: 'int', default: 0 })
  reservedStock: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
