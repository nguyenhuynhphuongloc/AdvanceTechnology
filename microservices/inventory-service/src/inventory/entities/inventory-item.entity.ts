import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'inventory_items' })
export class InventoryItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'variant_id', type: 'varchar', unique: true })
  variantId: string;

  @Column({ name: 'product_id', type: 'varchar', nullable: true })
  productId: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  sku: string | null;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'reserved_stock', type: 'int', default: 0 })
  reservedStock: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
