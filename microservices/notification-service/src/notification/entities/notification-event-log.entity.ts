import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Event-based notification log — raw events before template rendering.
 * Runtime schema: id=uuid, order_id=varchar, type=varchar, recipient=varchar (nullable),
 * status=varchar, message=text (nullable), created_at.
 */
@Entity({ name: 'notification_event_logs' })
export class NotificationEventLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id', type: 'varchar' })
  orderId: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'varchar', nullable: true })
  recipient: string | null;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
