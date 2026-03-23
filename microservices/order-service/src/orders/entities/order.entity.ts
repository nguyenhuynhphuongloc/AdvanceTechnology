import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: OrderStatus;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount: string;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 120, nullable: true })
  idempotencyKey?: string | null;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
    orphanedRowAction: 'delete',
  })
  items: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
