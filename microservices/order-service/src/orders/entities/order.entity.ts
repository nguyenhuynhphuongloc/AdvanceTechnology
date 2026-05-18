import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ShopOrder } from './shop-order.entity';

export type OrderStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'paid'
  | 'processing'
  | 'partially_shipped'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

export type PaymentMethodType = 'cod' | 'stripe' | 'vnpay' | 'momo';

@Entity('orders')
@Index(['authUserId'])
@Index(['status'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'auth_user_id', type: 'uuid' })
  authUserId: string;

  @Column({ name: 'user_address_id', type: 'uuid', nullable: true })
  userAddressId: string | null;

  @Column({ name: 'order_number', type: 'varchar', length: 32, unique: true, nullable: true })
  orderNumber: string | null;

  @Column({ type: 'varchar', length: 24, default: 'pending' })
  status: OrderStatus;

  @Column({ name: 'payment_status', type: 'varchar', length: 24, default: 'pending' })
  paymentStatus: PaymentStatus;

  @Column({ name: 'payment_method', type: 'varchar', length: 16, default: 'cod' })
  paymentMethod: PaymentMethodType;

  @Column({ name: 'shipping_address_snapshot', type: 'jsonb', default: {} })
  shippingAddressSnapshot: ShippingAddressSnapshot;

  @Column({ type: 'decimal', precision: 14, scale: 2, default: 0 })
  subtotal: string;

  @Column({ name: 'shipping_fee', type: 'decimal', precision: 14, scale: 2, default: 0 })
  shippingFee: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 14, scale: 2, default: 0 })
  totalAmount: string;

  @Column({ type: 'varchar', length: 8, default: 'VND' })
  currency: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  note: string | null;

  @Column({ name: 'recipient_email', type: 'varchar', length: 255, nullable: true })
  recipientEmail: string | null;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string | null;

  @Column({ name: 'correlation_id', type: 'varchar', length: 100, nullable: true })
  correlationId: string | null;

  @Column({ type: 'jsonb', default: [] })
  items: OrderItemSnapshot[];

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'cancel_reason', type: 'varchar', length: 500, nullable: true })
  cancelReason: string | null;

  @OneToMany(() => ShopOrder, (shopOrder) => shopOrder.order, { cascade: true, eager: false })
  shopOrders: ShopOrder[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export interface ShippingAddressSnapshot {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
}

export interface OrderItemSnapshot {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  imageUrl: string;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
}
