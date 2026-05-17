import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Order event log — audit trail of all order status changes.
 * Runtime schema: id=uuid, order_id=uuid, event=varchar, note=text (nullable), occurred_at=timestamptz.
 *
 * 3 rows exist in runtime. Tracks order lifecycle events for marketplace operations.
 */
@Entity({ name: 'order_events' })
export class OrderEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ type: 'varchar' })
  event: string;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ name: 'occurred_at' })
  occurredAt: Date;
}
