import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { ShopOrderItem } from './shop-order-item.entity';

export type ShopOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refund_requested'
  | 'refunded';

@Entity('shop_orders')
@Index(['orderId'])
@Index(['shopId'])
@Index(['sellerId'])
@Index(['status'])
export class ShopOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.shopOrders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'shop_id', type: 'uuid' })
  shopId: string;

  @Column({ name: 'seller_id', type: 'uuid' })
  sellerId: string;

  @Column({ type: 'varchar', length: 24, default: 'pending' })
  status: ShopOrderStatus;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  subtotal: string;

  @Column({ name: 'shipping_fee', type: 'decimal', precision: 14, scale: 2, default: 0 })
  shippingFee: string;

  @Column({ name: 'shop_total', type: 'decimal', precision: 14, scale: 2, default: 0 })
  shopTotal: string;

  @Column({ name: 'tracking_number', type: 'varchar', length: 100, nullable: true })
  trackingNumber: string | null;

  @Column({ name: 'shipping_provider', type: 'varchar', length: 50, nullable: true })
  shippingProvider: string | null;

  @Column({
    name: 'estimated_delivery',
    type: 'timestamptz',
    nullable: true,
  })
  estimatedDelivery: Date | null;

  @Column({ name: 'confirmed_at', type: 'timestamptz', nullable: true })
  confirmedAt: Date | null;

  @Column({ name: 'shipped_at', type: 'timestamptz', nullable: true })
  shippedAt: Date | null;

  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt: Date | null;

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'cancel_reason', type: 'varchar', length: 500, nullable: true })
  cancelReason: string | null;

  @OneToMany(() => ShopOrderItem, (item) => item.shopOrder, { cascade: true, eager: true })
  items: ShopOrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
