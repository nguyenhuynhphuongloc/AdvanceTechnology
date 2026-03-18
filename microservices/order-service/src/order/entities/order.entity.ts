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

  @Column({ type: 'varchar' })
  paymentMethod: string;

  @Column({ type: 'float' })
  totalAmount: number;

  @Column({ type: 'simple-json' })
  items: OrderItemSnapshot[];

  @Column({ type: 'varchar', nullable: true })
  recipientEmail: string | null;

  @Column({ type: 'varchar', nullable: true })
  failureReason: string | null;

  @Column({ type: 'varchar', nullable: true })
  correlationId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
