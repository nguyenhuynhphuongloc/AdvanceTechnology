import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface OrderItemSnapshot {
  variantId: string;
  quantity: number;
  unitPrice: number;
}

@Entity({ name: 'orders' })
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ name: 'payment_method', type: 'varchar' })
  paymentMethod: string;

  @Column({ name: 'subtotal', type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ name: 'shipping_fee', type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingFee: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ name: 'is_guest', type: 'boolean', default: false })
  isGuest: boolean;

  @Column({ name: 'auth_user_id', type: 'uuid', nullable: true })
  authUserId: string | null;

  @Column({ name: 'user_address_id', type: 'uuid', nullable: true })
  userAddressId: string | null;

  @Column({ name: 'shipping_address_snapshot', type: 'jsonb', default: {} })
  shippingAddressSnapshot: any;

  @Column({ type: 'simple-json' })
  items: OrderItemSnapshot[];

  @Column({ name: 'recipient_email', type: 'varchar', nullable: true })
  recipientEmail: string | null;

  @Column({ name: 'failure_reason', type: 'varchar', nullable: true })
  failureReason: string | null;

  @Column({ name: 'correlation_id', type: 'varchar', nullable: true })
  correlationId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
