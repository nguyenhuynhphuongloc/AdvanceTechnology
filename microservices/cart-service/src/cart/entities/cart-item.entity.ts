import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Legacy cart_items table — one row per item in a cart.
 * Runtime schema: id=uuid, cart_id=uuid, variant_id=uuid, quantity=int,
 * unit_price_snapshot=numeric, added_at=timestamptz.
 *
 * NOTE: The price and product name are NOT stored per-row in this table.
 * Instead, unit_price_snapshot captures the price at time of addition.
 * The cart_state table (JSON-based CartItemSnapshot) is the current primary cart implementation.
 * This CartItem entity is kept for backwards compatibility with existing rows.
 *
 * NOTE: Reverse @ManyToOne relation to Cart is NOT defined because the runtime
 * carts table has no `items` column. The cart_id column exists and is indexed,
 * but TypeORM does not manage it as a relation.
 */
@Entity('cart_items')
@Index('idx_cart_items_cart_id', ['cartId'])
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cart_id', type: 'uuid' })
  cartId: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @Column({ name: 'unit_price_snapshot', type: 'numeric', precision: 12, scale: 2 })
  unitPriceSnapshot: string;

  @Column({ type: 'int' })
  quantity: number;

  @CreateDateColumn({ name: 'added_at' })
  addedAt: Date;
}
