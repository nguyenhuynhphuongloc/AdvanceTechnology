import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_id', type: 'int' })
  productId: number;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'line_total', type: 'decimal', precision: 12, scale: 2 })
  lineTotal: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;
}
