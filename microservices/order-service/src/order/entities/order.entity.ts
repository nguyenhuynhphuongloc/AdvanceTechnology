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

  @Column({ name: 'total_amount', type: 'float' })
  totalAmount: number;

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
