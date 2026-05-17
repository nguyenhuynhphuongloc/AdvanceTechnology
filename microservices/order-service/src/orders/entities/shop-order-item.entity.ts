import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ShopOrder } from './shop-order.entity';

@Entity('shop_order_items')
export class ShopOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'shop_order_id', type: 'uuid' })
  shopOrderId: string;

  @ManyToOne(() => ShopOrder, (shopOrder) => shopOrder.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_order_id' })
  shopOrder: ShopOrder;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @Column({ name: 'product_name_snapshot', type: 'varchar', length: 255 })
  productNameSnapshot: string;

  @Column({ name: 'variant_name_snapshot', type: 'varchar', length: 255 })
  variantNameSnapshot: string;

  @Column({ name: 'sku_snapshot', type: 'varchar', length: 100 })
  skuSnapshot: string;

  @Column({ name: 'image_url_snapshot', type: 'varchar', length: 500 })
  imageUrlSnapshot: string;

  @Column({ name: 'shop_name_snapshot', type: 'varchar', length: 255 })
  shopNameSnapshot: string;

  @Column({ name: 'unit_price', type: 'decimal', precision: 14, scale: 2 })
  unitPrice: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'line_total', type: 'decimal', precision: 14, scale: 2 })
  lineTotal: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
